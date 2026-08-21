from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_ingest import router as ingest_router
from app.api.routes_process import router as process_router
from app.core.config import (
    APP_NAME,
    APP_VERSION,
)
from app.core.logging import setup_logging
from app.services.db import init_db


setup_logging()

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=(
        "AI-powered industrial product "
        "intelligence and catalog enrichment system."
    ),
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex="https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():

    init_db()


app.include_router(
    ingest_router
)

app.include_router(
    process_router
)


@app.get("/")
def root():

    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "status": "running",
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }
