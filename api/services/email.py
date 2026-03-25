import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from api.config import get_settings

logger = logging.getLogger(__name__)


async def send_password_reset_email(to_email: str, reset_url: str) -> None:
    """Send a password reset email with a link to reset the password."""
    settings = get_settings()

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Calendar App - Reset Your Password"
    msg["From"] = settings.smtp_email
    msg["To"] = to_email

    plain_text = (
        "Reset Your Password\n\n"
        "Click the link below to reset your Calendar App password:\n\n"
        f"{reset_url}\n\n"
        "This link expires in 1 hour.\n\n"
        "If you didn't request this, you can safely ignore this email."
    )

    html_content = f"""\
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="x-apple-disable-message-reformatting"></head>
<body style="margin:0; padding:20px; font-family:Arial, sans-serif; background-color:#f5f5f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; margin:0 auto; background:#ffffff; border-radius:8px; padding:32px;">
<tr><td>
<h2 style="margin:0 0 16px 0; color:#333;">Reset Your Password</h2>
<p style="color:#555; line-height:1.5;">Click the button below to reset your Calendar App password:</p>
<p style="text-align:center; margin:24px 0;">
<a href="{reset_url}" target="_blank" style="display:inline-block; padding:12px 24px; background-color:#4f46e5; color:#ffffff; text-decoration:none; border-radius:6px; font-weight:bold;">Reset Password</a>
</p>
<p style="color:#888; font-size:13px;">If the button doesn't work, copy and paste this link:<br><a href="{reset_url}" target="_blank" style="color:#4f46e5;">{reset_url}</a></p>
<p style="color:#888; font-size:13px; margin-top:24px;">This link expires in 1 hour.</p>
</td></tr></table></body></html>"""

    msg.attach(MIMEText(plain_text, "plain", _charset="utf-8"))
    msg.attach(MIMEText(html_content, "html", _charset="utf-8"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_email, settings.smtp_app_password)
            server.sendmail(settings.smtp_email, to_email, msg.as_string())
        logger.info("Password reset email sent to %s", to_email)
    except Exception:
        logger.exception("Failed to send password reset email to %s", to_email)
        raise
