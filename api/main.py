from contextlib import asynccontextmanager

from beanie import init_beanie
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from api.config import settings
from api.routes import auth, weeks
from api.schemas.orm.week import Week


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize MongoDB connection
    client = AsyncIOMotorClient(settings.mongodb_url)
    await init_beanie(
        database=client[settings.mongodb_db_name],
        document_models=[Week],
    )
    yield
    # Shutdown: Close MongoDB connection
    client.close()


app = FastAPI(
    title="Family Calendar API",
    description="API for managing family weekend planning",
    version="0.1.0",
    lifespan=lifespan,
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


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "api.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True,
    )
