from google import genai
from google.genai import types

from app.config import get_settings

settings = get_settings()

_client = genai.Client(api_key=settings.GEMINI_API_KEY)

_RESPONSE_SCHEMA = types.Schema(
    type=types.Type.ARRAY,
    items=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "type":    types.Schema(type=types.Type.STRING, enum=["success", "warning", "tip"]),
            "title":   types.Schema(type=types.Type.STRING),
            "message": types.Schema(type=types.Type.STRING),
        },
        required=["type", "title", "message"],
    ),
)

_PROMPT = """\
You are a medical ergonomics coach. Analyse the posture session stats and return 3-5 insights.

Session stats:
- Duration: {duration_seconds}s
- Average posture score: {avg_posture_score}/100
- Good posture: {good_posture_percent}%
- Total alerts fired: {total_alerts}
- Neck angle issues: {neck_alerts}
- Shoulder issues: {shoulder_alerts}
- Spine issues: {spine_alerts}
- Break reminder alerts: {break_alerts}
"""


async def generate_insights(session_stats: dict) -> list[dict]:
    response = await _client.aio.models.generate_content(
        model="gemini-1.5-flash",
        contents=_PROMPT.format(**session_stats),
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=_RESPONSE_SCHEMA,
        ),
    )
    return response.parsed