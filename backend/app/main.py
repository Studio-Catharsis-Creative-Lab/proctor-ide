from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import init_db
from app.routers import (
    activities,
    auth,
    collaboration,
    execution,
    invitations,
    tracking,
    workspace,
)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="ProctorIDE API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(invitations.router, prefix="/api")
app.include_router(activities.router, prefix="/api")
app.include_router(workspace.router, prefix="/api")
app.include_router(execution.router, prefix="/api")
app.include_router(tracking.router, prefix="/api")
app.include_router(collaboration.router, prefix="/api")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
