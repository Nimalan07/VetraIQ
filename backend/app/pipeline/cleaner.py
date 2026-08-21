import re

PLACEHOLDERS = {
    "-- unbranded --",
    "-- no unilog brand --",
    "-- no dib brand --",
    "none",
    "null",
    "not available",
    "n/a",
    "na",
    "nan",
    "<na>",
    "unknown",
    "",
}

def clean_placeholder(val: str) -> str:
    """
    Clean placeholder values to empty strings.
    """
    if not val:
        return ""
    val_str = str(val).strip()
    if val_str.lower() in PLACEHOLDERS:
        return ""
    return val_str

def normalize_text_spaces(text: str) -> str:
    """
    Remove excess spaces and control chars.
    """
    if not text:
        return ""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()
