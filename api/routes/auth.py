import secrets
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from api.config import get_settings
from api.schemas.dto.auth import (
    AgentTokenRequest,
    AgentTokenResponse,
    GoogleLoginRequest,
    MessageResponse,
    PasswordResetConfirm,
    PasswordResetRequest,
    RegisterRequest,
    UserLogin,
    TokenResponse,
    UserResponse,
)
from api.schemas.orm.password_reset import PasswordResetToken
from api.schemas.orm.user import User
from api.services.email import send_password_reset_email
from api.utils.auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest):
    """Register a new user account."""
    existing = await User.find_one(User.email == request.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    now = datetime.now(timezone.utc)
    user = User(
        username=request.email,  # Use email as username for backwards compatibility
        email=request.email,
        display_name=request.name,
        hashed_password=hash_password(request.password),
        created_at=now,
        updated_at=now,
    )
    await user.insert()

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    """Login with email and password."""
    user = await User.find_one(User.email == data.email)
    if not user or not user.hashed_password or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    """Get current user info."""
    return UserResponse(id=str(user.id), name=user.display_name or user.username, email=user.email)


@router.post("/agent-token", response_model=AgentTokenResponse)
async def agent_token(data: AgentTokenRequest):
    """Create a long-lived JWT for AI agent access."""
    user = await User.find_one(User.email == data.email)
    if not user or not user.hashed_password or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(
        subject=str(user.id),
        expires_delta=timedelta(days=data.expires_in_days),
    )
    return AgentTokenResponse(
        access_token=token,
        expires_in_days=data.expires_in_days,
    )


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(data: PasswordResetRequest):
    """Request a password reset email."""
    settings = get_settings()
    message = "If an account with that email exists, a reset link has been sent."

    user = await User.find_one(User.email == data.email)
    if not user:
        return MessageResponse(message=message)

    # Invalidate any existing tokens for this user
    await PasswordResetToken.find(
        PasswordResetToken.user_id == str(user.id),
        PasswordResetToken.used_at == None,  # noqa: E711
    ).update_many({"$set": {"used_at": datetime.now(timezone.utc)}})

    # Create new token
    now = datetime.now(timezone.utc)
    token = secrets.token_urlsafe(32)
    reset_token = PasswordResetToken(
        token=token,
        user_id=str(user.id),
        expires_at=now + timedelta(minutes=settings.password_reset_expire_minutes),
        created_at=now,
    )
    await reset_token.insert()

    reset_url = f"{settings.frontend_base_url}/reset-password/{token}"
    try:
        await send_password_reset_email(user.email, reset_url)
    except Exception:
        pass  # Always return same message

    return MessageResponse(message=message)


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(data: PasswordResetConfirm):
    """Reset password using a valid token."""
    now = datetime.now(timezone.utc)

    reset_token = await PasswordResetToken.find_one(
        PasswordResetToken.token == data.token,
        PasswordResetToken.used_at == None,  # noqa: E711
        PasswordResetToken.expires_at > now,
    )

    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    user = await User.get(reset_token.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    # Update password
    user.hashed_password = hash_password(data.new_password)
    user.updated_at = now
    await user.save()

    # Mark token as used
    reset_token.used_at = now
    await reset_token.save()

    return MessageResponse(message="Password has been reset successfully.")


@router.post("/google", response_model=TokenResponse)
async def google_login(data: GoogleLoginRequest):
    """Login or register via Google OAuth."""
    settings = get_settings()
    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google login not configured",
        )

    try:
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as google_requests
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google auth library not installed",
        )

    try:
        idinfo = google_id_token.verify_oauth2_token(
            data.id_token, google_requests.Request(), settings.google_client_id
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )

    sub = idinfo.get("sub")
    email = idinfo.get("email")
    email_verified = idinfo.get("email_verified", False)
    name = idinfo.get("name") or (email.split("@")[0] if email else None)

    if not sub or not email or not email_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google token missing required claims",
        )

    user = await User.find_one(User.google_sub == sub)

    if not user:
        user = await User.find_one(User.email == email)
        if user:
            user.google_sub = sub
            user.email_verified = True
            await user.save()
        else:
            now = datetime.now(timezone.utc)
            user = User(
                email=email,
                username=email,
                display_name=name,
                hashed_password=None,
                google_sub=sub,
                email_verified=True,
                created_at=now,
                updated_at=now,
            )
            await user.insert()

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token)
