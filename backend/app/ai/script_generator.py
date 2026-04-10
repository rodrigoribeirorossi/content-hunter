"""
Script Generator — uses Ollama (local AI) to produce full video scripts
for a given topic and niche.
"""

from __future__ import annotations

import json
import logging
import os

import httpx

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")


def generate_script(topic: str, niche: str = "general", platform: str = "youtube") -> dict:
    """
    Generate a complete video script for the given topic using Ollama.

    Parameters
    ----------
    topic : str
        The video topic or trend title.
    niche : str
        Content niche (e.g. "football curiosities", "tech reviews").
    platform : str
        Target platform: "youtube", "tiktok", or "reels".

    Returns
    -------
    dict with keys:
        - title                : str
        - hook                 : str  (first ~3 seconds)
        - script_body          : str  (full 60-90 s script)
        - thumbnail_suggestion : str
        - hashtags             : list[str]
        - estimated_duration   : str
    """
    prompt = f"""You are a professional video script writer specializing in short-form content (Shorts, Reels, TikTok).

Write a complete video script for the following:
- Topic: {topic}
- Niche: {niche}
- Platform: {platform}

Return ONLY a valid JSON object (no explanation, no markdown code blocks) with this exact structure:
{{
  "title": "Catchy video title here",
  "hook": "First 3 seconds hook that grabs attention immediately",
  "script_body": "Full narration script for a 60-90 second video. Include natural pauses with [PAUSE] and emphasis with [EMPHASIS: word].",
  "thumbnail_suggestion": "Bold text suggestion for the thumbnail image",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
  "estimated_duration": "60-90s"
}}"""

    try:
        response = httpx.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
            timeout=120.0,
        )
        response.raise_for_status()
        raw_text = response.json().get("response", "")
        return _parse_json_response(raw_text)
    except httpx.ConnectError:
        logger.error(
            "Cannot connect to Ollama at %s. Make sure Ollama is running: `ollama serve`",
            OLLAMA_BASE_URL,
        )
    except Exception as exc:
        logger.exception("Error calling Ollama for script generation: %s", exc)

    return _empty_script(topic)


def _parse_json_response(text: str) -> dict:
    """Extract and parse a JSON object from the model's raw text output."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    try:
        data = json.loads(text)
        return {
            "title": data.get("title", ""),
            "hook": data.get("hook", ""),
            "script_body": data.get("script_body", ""),
            "thumbnail_suggestion": data.get("thumbnail_suggestion", ""),
            "hashtags": data.get("hashtags", []),
            "estimated_duration": data.get("estimated_duration", "60-90s"),
        }
    except (json.JSONDecodeError, ValueError) as exc:
        logger.warning("Could not parse Ollama JSON response: %s — raw: %s", exc, text[:200])
        return _empty_script("")


def _empty_script(topic: str) -> dict:
    return {
        "title": topic,
        "hook": "",
        "script_body": "",
        "thumbnail_suggestion": "",
        "hashtags": [],
        "estimated_duration": "60-90s",
    }
