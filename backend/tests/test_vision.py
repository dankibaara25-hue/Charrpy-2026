"""Backend tests for POST /api/vision/verify-object (Gemini 2.5 Flash)."""

import base64
import os
from pathlib import Path

import pytest
import requests

BASE_URL = os.environ["EXPO_PUBLIC_BACKEND_URL"].rstrip("/") if os.environ.get("EXPO_PUBLIC_BACKEND_URL") else "https://wake-up-challenge-5.preview.emergentagent.com"
VERIFY_URL = f"{BASE_URL}/api/vision/verify-object"

AVATAR_PATH = Path("/app/frontend/assets/images/avatars/01.png")


@pytest.fixture(scope="module")
def avatar_b64() -> str:
    assert AVATAR_PATH.exists(), f"missing avatar PNG at {AVATAR_PATH}"
    raw = AVATAR_PATH.read_bytes()
    return base64.b64encode(raw).decode("ascii")


@pytest.fixture
def session() -> requests.Session:
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- match case --------------------------------------------------------
def test_verify_object_match_cartoon_avatar(session, avatar_b64):
    r = session.post(
        VERIFY_URL,
        json={"image_base64": avatar_b64, "target_object": "a cartoon avatar"},
        timeout=60,
    )
    assert r.status_code == 200, r.text
    data = r.json()
    assert set(data.keys()) >= {"match", "confidence", "reasoning"}
    assert isinstance(data["match"], bool)
    assert isinstance(data["confidence"], (int, float))
    assert 0.0 <= data["confidence"] <= 1.0
    assert data["match"] is True, f"expected match=True, got {data}"
    assert data["confidence"] > 0.5, f"expected confidence>0.5, got {data}"


# --- no-match case -----------------------------------------------------
def test_verify_object_no_match_water_glass(session, avatar_b64):
    r = session.post(
        VERIFY_URL,
        json={"image_base64": avatar_b64, "target_object": "a glass of water"},
        timeout=60,
    )
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["match"] is False, f"expected match=False, got {data}"


# --- bad payload: empty image -----------------------------------------
def test_verify_object_empty_image(session):
    r = session.post(
        VERIFY_URL,
        json={"image_base64": "", "target_object": "anything"},
        timeout=30,
    )
    assert r.status_code in (400, 422), r.text


# --- bad payload: missing target --------------------------------------
def test_verify_object_missing_target(session, avatar_b64):
    r = session.post(
        VERIFY_URL,
        json={"image_base64": avatar_b64},
        timeout=30,
    )
    assert r.status_code in (400, 422), r.text


# --- bad payload: empty target ----------------------------------------
def test_verify_object_empty_target(session, avatar_b64):
    r = session.post(
        VERIFY_URL,
        json={"image_base64": avatar_b64, "target_object": ""},
        timeout=30,
    )
    assert r.status_code in (400, 422), r.text


# --- malformed base64 -------------------------------------------------
def test_verify_object_malformed_b64(session):
    r = session.post(
        VERIFY_URL,
        json={"image_base64": "!!!not base64!!!", "target_object": "a glass of water"},
        timeout=30,
    )
    assert r.status_code == 400, r.text
