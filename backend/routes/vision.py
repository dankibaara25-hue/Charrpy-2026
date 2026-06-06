"""Vision verification endpoint — used by the photo wake-up challenge.

The /api/vision/verify-object endpoint accepts a base64-encoded JPEG/PNG
captured from the device camera plus the target object label the user was
asked to find (e.g. "a glass of water"). It asks Gemini 2.5 Flash to decide
whether the photo actually contains that object and returns a structured
yes/no answer with a confidence score and short reasoning.

We pick Gemini 2.5 Flash because:
  • Latency — users are standing in front of an alarm; sub-second is critical.
  • Multimodal — supports base64 image input.
  • Cost — the cheapest vision-capable model in the catalog.
"""

from __future__ import annotations

import base64
import json
import logging
import os
import re
import uuid
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from emergentintegrations.llm.chat import (
    ImageContent,
    LlmChat,
    UserMessage,
)

router = APIRouter(prefix="/api/vision", tags=["vision"])
logger = logging.getLogger(__name__)

# ----- Request / response models ----------------------------------------

class VerifyObjectRequest(BaseModel):
    image_base64: str = Field(
        ...,
        description=(
            "Base64-encoded JPEG/PNG image bytes (no data: URL prefix). "
            "Will be re-validated server-side."
        ),
    )
    target_object: str = Field(
        ...,
        description="Human label of the object the user was asked to capture",
        examples=["a glass of water", "the fridge"],
    )
    target_id: Optional[str] = Field(default=None, description="Optional id alias")


class VerifyObjectResponse(BaseModel):
    match: bool
    confidence: float = Field(ge=0, le=1)
    reasoning: str


# ----- Helpers ----------------------------------------------------------

_DATA_URL_PREFIX = re.compile(r"^data:image/[a-zA-Z0-9.+-]+;base64,")


def _strip_data_url(b64: str) -> str:
    return _DATA_URL_PREFIX.sub("", b64, count=1).strip()


def _sanitize_b64(b64: str) -> str:
    """Drop optional data: URL prefix, strip whitespace + newlines, ensure
    the payload still looks like base64."""
    cleaned = _strip_data_url(b64)
    cleaned = "".join(cleaned.split())
    if not cleaned:
        raise HTTPException(status_code=400, detail="image_base64 is empty")
    try:
        # Validate it actually decodes — but don't keep the raw bytes around;
        # emergentintegrations expects the b64 string.
        base64.b64decode(cleaned[:64], validate=True)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=400, detail=f"image_base64 is not valid base64: {exc}"
        ) from None
    return cleaned


def _build_prompt(target: str) -> str:
    return (
        "You are a vision verifier for an alarm-clock app. The user was told "
        f"to wake up and photograph **{target}**. Decide whether the attached "
        "photo actually contains that object as the main subject.\n\n"
        "Be lenient with framing, lighting, angle, and quality — the user "
        "just woke up. But reject the photo if it's a blank wall, a ceiling, "
        "a totally unrelated object, a hand covering the lens, or a black "
        "frame.\n\n"
        "Respond ONLY with a JSON object on a single line, no markdown:\n"
        '{"match": true|false, "confidence": 0.0..1.0, "reasoning": "<one short sentence>"}'
    )


def _parse_llm_json(raw: str) -> VerifyObjectResponse:
    """Pull the first JSON object out of the LLM response. Some models like
    to wrap JSON in ```json fences — handle that too."""
    cleaned = raw.strip()
    # Strip markdown code fence if present.
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    match = re.search(r"\{.*?\}", cleaned, re.DOTALL)
    if not match:
        raise ValueError("no JSON object in LLM response")
    obj = json.loads(match.group(0))
    return VerifyObjectResponse(
        match=bool(obj.get("match", False)),
        confidence=float(obj.get("confidence", 0)),
        reasoning=str(obj.get("reasoning", "")),
    )


# ----- Route ------------------------------------------------------------

@router.post("/verify-object", response_model=VerifyObjectResponse)
async def verify_object(payload: VerifyObjectRequest) -> VerifyObjectResponse:
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="EMERGENT_LLM_KEY is not configured on the server",
        )

    image_b64 = _sanitize_b64(payload.image_base64)
    target = (payload.target_object or "").strip()
    if not target:
        raise HTTPException(status_code=400, detail="target_object is required")

    chat = LlmChat(
        api_key=api_key,
        session_id=f"vision-{uuid.uuid4()}",
        system_message=(
            "You verify whether a photo contains a specified household object. "
            "You always respond with a single JSON object."
        ),
    ).with_model("gemini", "gemini-2.5-flash")

    message = UserMessage(
        text=_build_prompt(target),
        file_contents=[ImageContent(image_base64=image_b64)],
    )

    try:
        raw = await chat.send_message(message)
    except Exception as exc:  # noqa: BLE001
        logger.exception("[vision] LLM call failed")
        raise HTTPException(status_code=502, detail=f"LLM error: {exc}") from None

    raw_text = raw if isinstance(raw, str) else getattr(raw, "content", str(raw))
    try:
        return _parse_llm_json(raw_text)
    except Exception:  # noqa: BLE001
        logger.warning("[vision] could not parse LLM JSON: %s", raw_text[:300])
        # If the LLM didn't give parseable JSON, be permissive — wake-ups
        # shouldn't get stuck because the model misbehaved. Treat as no-match
        # with low confidence so the client can decide to retry.
        return VerifyObjectResponse(
            match=False,
            confidence=0.0,
            reasoning="Vision model returned an unparseable response — please retry.",
        )
