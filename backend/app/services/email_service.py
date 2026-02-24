import httpx

from app.config import get_settings

settings = get_settings()


async def send_password_reset(to: str, reset_url: str) -> None:
    async with httpx.AsyncClient() as client:
        r = await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={
                "from": "PostureAI <onboarding@resend.dev>",
                "to": to,
                "subject": "Reset your password",
                "html": f'<a href="{reset_url}">Reset password</a>',
                "headers": {"X-Entity-Ref-ID": ""},  # disables open tracking
                "tags": [],
                "click_tracking": False,
            },
           
        )
        r.raise_for_status()
