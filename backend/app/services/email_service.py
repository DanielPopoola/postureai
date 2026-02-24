import httpx

from app.config import get_settings

settings = get_settings()


async def send_password_reset(to: str, reset_url: str) -> None:
    async with httpx.AsyncClient() as client:
        r = await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={
                "from": f"{settings.SENDER_EMAIL}",
                "to": to,
                "subject": "Reset your password",
                "html": f'<a href="{reset_url}">Reset password</a>',
            },
        )
        r.raise_for_status()
