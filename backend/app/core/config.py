import os

from dotenv import load_dotenv

load_dotenv()


GROQ_API_KEY = os.getenv("GROQ_API_KEY")

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")

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

