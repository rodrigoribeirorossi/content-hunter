"""
Trend Analyzer — uses Ollama (local AI) to analyze raw trend data and return
structured insights: suggested_topics, relevance_score, why_it_works, best_platform.
"""

from __future__ import annotations

import json
import logging
import os

import httpx

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")


def analyze_trends(raw_trends: list[dict]) -> dict:
    """
    Send raw trend data to Ollama and receive structured analysis.

    Parameters
    ----------
    raw_trends : list[dict]
        List of trend dicts (title, platform, score, tags, etc.)

    Returns
    -------
    dict with keys:
        - suggested_topics : list[str]
        - relevance_score  : int (0–100)
        - why_it_works     : str
        - best_platform    : str
    """
    if not raw_trends:
        return _empty_analysis()

    # Build a concise summary to stay within the model context window
    trend_summary = "\n".join(
        f"- [{t.get('platform','?')}] {t.get('title','?')} (score: {t.get('score', 0)})"
        for t in raw_trends[:15]
    )

    prompt = f"""You are a content strategy expert. Analyze the following trending topics and return ONLY a valid JSON object (no explanation, no markdown code blocks).

Trending topics:
{trend_summary}

Return this exact JSON structure:
{{
  "suggested_topics": ["topic1", "topic2", "topic3"],
  "relevance_score": 85,
  "why_it_works": "Brief explanation of why these trends are relevant right now.",
  "best_platform": "youtube"
}}"""

    try:
        response = httpx.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
            timeout=60.0,
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
        logger.exception("Error calling Ollama for trend analysis: %s", exc)

    return _empty_analysis()


def _parse_json_response(text: str) -> dict:
    """Extract and parse a JSON object from the model's raw text output."""
    # Strip any markdown fences the model may add despite instructions
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    try:
        data = json.loads(text)
        return {
            "suggested_topics": data.get("suggested_topics", []),
            "relevance_score": int(data.get("relevance_score", 50)),
            "why_it_works": data.get("why_it_works", ""),
            "best_platform": data.get("best_platform", "youtube"),
        }
    except (json.JSONDecodeError, ValueError) as exc:
        logger.warning("Could not parse Ollama JSON response: %s — raw: %s", exc, text[:200])
        return _empty_analysis()


def _empty_analysis() -> dict:
    return {
        "suggested_topics": [],
        "relevance_score": 0,
        "why_it_works": "",
        "best_platform": "youtube",
    }
