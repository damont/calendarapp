import logging
from contextlib import asynccontextmanager

from beanie import init_beanie
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from api.config import get_settings
from api.routes import auth, settings, weeks
from api.schemas.orm.password_reset import PasswordResetToken
from api.schemas.orm.user import User
from api.schemas.orm.week import Week

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_url)
    await init_beanie(
        database=client[settings.mongodb_db_name],
        document_models=[User, Week, PasswordResetToken],
    )
    logger.info("Connected to MongoDB: %s", settings.mongodb_db_name)
    yield
    client.close()


app = FastAPI(
    title="Family Calendar API",
    description="API for managing family weekend planning",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/api/agent",
    openapi_url="/api/openapi.json",
    redoc_url=None,
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(weeks.router, prefix="/api")
app.include_router(settings.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/api/schema")
async def get_schema():
    """Convenience endpoint returning the OpenAPI schema."""
    return app.openapi()


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "api.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True,
    )
