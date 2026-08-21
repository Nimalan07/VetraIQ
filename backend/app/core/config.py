import os

from dotenv import load_dotenv

load_dotenv()


GROQ_API_KEY = os.getenv("GROQ_API_KEY")

DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./products.db"
)

APP_NAME = os.getenv(
    "APP_NAME",
    "UniHack Product Intelligence"
)

APP_VERSION = os.getenv(
    "APP_VERSION",
    "1.0.0"
)


if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY is not configured.")
