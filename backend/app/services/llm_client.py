import logging
from typing import Optional

from groq import Groq

from app.core.config import GROQ_API_KEY


logger = logging.getLogger(__name__)


DEFAULT_MODEL = "openai/gpt-oss-20b"


_client: Optional[Groq] = None

if GROQ_API_KEY:
    _client = Groq(
        api_key=GROQ_API_KEY
    )


def call_llm(
    prompt: str,
    model: str = DEFAULT_MODEL,
) -> str:
    """
    Central LLM gateway.

    No other application file should import
    the Groq SDK directly.
    """

    if _client is None:
        raise RuntimeError(
            "GROQ_API_KEY is not configured."
        )

    if not prompt.strip():
        raise ValueError(
            "Prompt cannot be empty."
        )

    logger.info(
        "Calling Groq model: %s",
        model,
    )

    import re
    import time

    max_retries = 6
    retry_delay = 10.0

    for attempt in range(max_retries):
        try:
            response = _client.chat.completions.create(
                model=model,
                messages=[
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
                response_format={
                    "type": "json_object"
                },
                temperature=0,
            )

            content = response.choices[0].message.content

            if not content:
                raise RuntimeError(
                    "Groq returned an empty response."
                )

            # Strip <think>...</think> block
            content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()

            # Strip markdown code blocks
            content = re.sub(r"^```(?:json)?\s*\n", "", content, flags=re.IGNORECASE)
            content = re.sub(r"\n\s*```$", "", content)
            content = content.strip()

            return content

        except Exception as exc:
            err_msg = str(exc).lower()
            if ("429" in err_msg or "rate limit" in err_msg) and attempt < max_retries - 1:
                logger.warning(
                    "Groq rate limit hit. Retrying in %s seconds... (Attempt %s/%s)",
                    retry_delay,
                    attempt + 1,
                    max_retries,
                )
                time.sleep(retry_delay)
            else:
                raise exc


def call_llm_text(
    prompt: str,
    system_instruction: str = "You are a professional industrial product data cataloger.",
    model: str = DEFAULT_MODEL,
) -> str:
    """
    Central LLM gateway for text-based outputs (e.g. Markdown generation).
    """
    if _client is None:
        raise RuntimeError(
            "GROQ_API_KEY is not configured."
        )

    if not prompt.strip():
        raise ValueError(
            "Prompt cannot be empty."
        )

    logger.info(
        "Calling Groq model (text mode): %s",
        model,
    )

    import re
    import time

    max_retries = 6
    retry_delay = 10.0

    for attempt in range(max_retries):
        try:
            response = _client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": system_instruction,
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                temperature=0.2,
            )

            content = response.choices[0].message.content

            if not content:
                raise RuntimeError(
                    "Groq returned an empty response."
                )

            # Strip <think>...</think> block
            content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
            return content

        except Exception as exc:
            err_msg = str(exc).lower()
            if ("429" in err_msg or "rate limit" in err_msg) and attempt < max_retries - 1:
                logger.warning(
                    "Groq rate limit hit. Retrying in %s seconds... (Attempt %s/%s)",
                    retry_delay,
                    attempt + 1,
                    max_retries,
                )
                time.sleep(retry_delay)
            else:
                raise exc

