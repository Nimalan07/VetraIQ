import logging
import re
import httpx
from app.core.config import OLLAMA_HOST, OLLAMA_MODEL

logger = logging.getLogger(__name__)


def call_llm(
    prompt: str,
    model: str = OLLAMA_MODEL,
) -> str:
    """
    Central LLM gateway using local Ollama (JSON Mode).
    """
    if not prompt.strip():
        raise ValueError(
            "Prompt cannot be empty."
        )

    logger.info(
        "Calling Ollama (JSON mode) at %s with model: %s",
        OLLAMA_HOST,
        model,
    )

    url = f"{OLLAMA_HOST.rstrip('/')}/api/chat"
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a precise industrial "
                    "product data extraction engine. "
                    "You must output a valid JSON object. "
                    "Do not include any conversational text or markdown code blocks."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        "format": "json",
        "stream": False,
        "options": {
            "temperature": 0.0
        }
    }

    try:
        response = httpx.post(url, json=payload, timeout=90.0)
        response.raise_for_status()
        data = response.json()
        content = data.get("message", {}).get("content", "")

        if not content:
            raise RuntimeError(
                "Ollama returned an empty response."
            )

        # Strip <think>...</think> block
        content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()

        # Strip markdown code blocks
        content = re.sub(r"^```(?:json)?\s*\n", "", content, flags=re.IGNORECASE)
        content = re.sub(r"\n\s*```$", "", content)
        return content.strip()

    except Exception as exc:
        logger.error("Ollama API call failed: %s", exc)
        raise RuntimeError(f"Ollama API call failed: {exc}")


def call_llm_text(
    prompt: str,
    system_instruction: str = "You are a professional industrial product data cataloger.",
    model: str = OLLAMA_MODEL,
) -> str:
    """
    Central LLM gateway using local Ollama (Text Mode).
    """
    if not prompt.strip():
        raise ValueError(
            "Prompt cannot be empty."
        )

    logger.info(
        "Calling Ollama (Text mode) at %s with model: %s",
        OLLAMA_HOST,
        model,
    )

    url = f"{OLLAMA_HOST.rstrip('/')}/api/chat"
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": system_instruction,
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        "stream": False,
        "options": {
            "temperature": 0.2
        }
    }

    try:
        response = httpx.post(url, json=payload, timeout=90.0)
        response.raise_for_status()
        data = response.json()
        content = data.get("message", {}).get("content", "")

        if not content:
            raise RuntimeError(
                "Ollama returned an empty response."
            )

        # Strip <think>...</think> block
        content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
        return content.strip()

    except Exception as exc:
        logger.error("Ollama API call failed: %s", exc)
        raise RuntimeError(f"Ollama API call failed: {exc}")
