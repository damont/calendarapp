from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from api.schemas.dto.auth import LoginRequest, LoginResponse
from api.services import auth as auth_service
from api.utils.auth import decode_access_token

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Login with the app password."""
    token = auth_service.authenticate(request.password)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
        )
    return LoginResponse(access_token=token)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Dependency to validate JWT token."""
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload
