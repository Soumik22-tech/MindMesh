"""
MindMesh AI FastAPI Server
Production-ready server for Render.com deployment.
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from mindmesh.core.debate import DebateSession


class DebateRequest(BaseModel):
    query: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("MindMesh AI API starting up...")
    yield
    print("MindMesh AI API shutting down.")


app = FastAPI(
    title="MindMesh AI API",
    description="Multi-agent AI debate engine",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",
        "https://mindmeshai.dev",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "project": "MindMesh AI",
        "version": "1.0.0",
        "author": "Soumik22-tech",
        "github": "https://github.com/Soumik22-tech/MindMesh",
        "agents": 4,
        "models": {
            "proposer": "llama-3.3-70b via Groq",
            "challenger": "gemma-3-27b via Google",
            "arbitrator": "qwen-3-235b via Cerebras",
            "synthesizer": "gemini-2.5-flash via Google"
        }
    }


@app.get("/ping")
async def ping():
    return {"pong": True}


@app.post("/debate")
async def debate(request: DebateRequest):
    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    try:
        import asyncio
        loop = asyncio.get_event_loop()
        session = DebateSession()
        # Run synchronous debate in a thread pool so we don't block the event loop
        result = await loop.run_in_executor(None, session.run, query)
        return result.to_dict()
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
