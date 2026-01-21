"""
NotebookLM Bridge Server for BTC Wheel
======================================

This server provides an HTTP API to interact with NotebookLM MCP,
allowing the BTC Wheel app to query knowledge without expensive AI calls.

Run with: python server.py
API will be available at http://localhost:8787
"""

import json
import os
import asyncio
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import uvicorn

# Auth file location
AUTH_FILE = Path.home() / ".notebooklm-mcp" / "auth.json"

# NotebookLM API endpoints
NOTEBOOKLM_API_BASE = "https://notebooklm.google.com"

app = FastAPI(
    title="BTC Wheel NotebookLM Bridge",
    description="Bridge API for NotebookLM integration",
    version="1.0.0"
)

# CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Relaxed for deployment, can be restricted later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    """Request model for querying NotebookLM"""
    question: str
    notebook_id: Optional[str] = None  # If None, uses the first available notebook


class QueryResponse(BaseModel):
    """Response model for NotebookLM answers"""
    answer: str
    sources: list[dict] = []
    notebook_id: str
    success: bool
    error: Optional[str] = None


class NotebookInfo(BaseModel):
    """Notebook information"""
    id: str
    title: str
    source_count: int


def load_auth() -> dict:
    """Load authentication tokens from environment or cache"""
    # 1. Check environment variable (Best for Cloud/Railway)
    env_auth = os.environ.get("NOTEBOOKLM_AUTH_JSON")
    if env_auth:
        try:
            return json.loads(env_auth)
        except Exception as e:
            print(f"Error parsing NOTEBOOKLM_AUTH_JSON env: {e}")

    # 2. Fallback to local file
    if not AUTH_FILE.exists():
        raise HTTPException(
            status_code=401,
            detail="NotebookLM not authenticated. Set NOTEBOOKLM_AUTH_JSON env or run 'notebooklm-mcp-auth' locally."
        )
    
    with open(AUTH_FILE, 'r') as f:
        return json.load(f)


def get_cookies_header(auth: dict) -> str:
    """Build Cookie header from auth data"""
    cookies = auth.get('cookies', {})
    return "; ".join([f"{k}={v}" for k, v in cookies.items()])


def get_headers(auth: dict) -> dict:
    """Build headers for NotebookLM API requests"""
    return {
        "Content-Type": "application/json",
        "Cookie": get_cookies_header(auth),
        "X-Goog-Csrf-Token": auth.get('csrf_token', ''),
        "Origin": NOTEBOOKLM_API_BASE,
        "Referer": f"{NOTEBOOKLM_API_BASE}/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }


# Cache for notebook list
_notebooks_cache: list[dict] = []
_cache_timestamp: float = 0


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "BTC Wheel NotebookLM Bridge",
        "status": "running",
        "authenticated": AUTH_FILE.exists()
    }


@app.get("/notebooks", response_model=list[NotebookInfo])
async def list_notebooks():
    """List all available notebooks"""
    global _notebooks_cache, _cache_timestamp
    
    auth = load_auth()
    headers = get_headers(auth)
    
    async with httpx.AsyncClient() as client:
        try:
            # NotebookLM uses a specific API endpoint for listing notebooks
            response = await client.post(
                f"{NOTEBOOKLM_API_BASE}/api/notebook/list",
                headers=headers,
                json={},
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"NotebookLM API error: {response.text[:200]}"
                )
            
            data = response.json()
            notebooks = []
            
            # Parse notebook list from response
            for nb in data.get('notebooks', data.get('result', [])):
                if isinstance(nb, dict):
                    notebooks.append(NotebookInfo(
                        id=nb.get('id', nb.get('projectId', '')),
                        title=nb.get('title', nb.get('name', 'Untitled')),
                        source_count=len(nb.get('sources', []))
                    ))
            
            _notebooks_cache = notebooks
            return notebooks
            
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")


@app.post("/query", response_model=QueryResponse)
async def query_notebook(request: QueryRequest):
    """
    Query NotebookLM with a question and get an answer.
    
    This is the main endpoint used by the BTC Wheel chat.
    """
    auth = load_auth()
    headers = get_headers(auth)
    
    # If no notebook specified, try to get the first one
    notebook_id = request.notebook_id
    if not notebook_id:
        notebooks = await list_notebooks()
        if not notebooks:
            return QueryResponse(
                answer="",
                notebook_id="",
                success=False,
                error="No notebooks found. Create a notebook on notebooklm.google.com first."
            )
        notebook_id = notebooks[0].id
    
    async with httpx.AsyncClient() as client:
        try:
            # Send query to NotebookLM
            response = await client.post(
                f"{NOTEBOOKLM_API_BASE}/api/notebook/{notebook_id}/query",
                headers=headers,
                json={
                    "query": request.question,
                    "projectId": notebook_id
                },
                timeout=60.0
            )
            
            if response.status_code != 200:
                # Try alternative endpoint format
                response = await client.post(
                    f"{NOTEBOOKLM_API_BASE}/api/chat",
                    headers=headers,
                    json={
                        "message": request.question,
                        "projectId": notebook_id,
                        "history": []
                    },
                    timeout=60.0
                )
            
            if response.status_code != 200:
                return QueryResponse(
                    answer="",
                    notebook_id=notebook_id,
                    success=False,
                    error=f"NotebookLM API error: {response.status_code}"
                )
            
            data = response.json()
            
            # Extract answer from response
            answer = data.get('answer', data.get('response', data.get('text', '')))
            sources = data.get('sources', data.get('citations', []))
            
            return QueryResponse(
                answer=answer,
                sources=sources,
                notebook_id=notebook_id,
                success=True
            )
            
        except httpx.RequestError as e:
            return QueryResponse(
                answer="",
                notebook_id=notebook_id,
                success=False,
                error=f"Request failed: {str(e)}"
            )


@app.get("/health")
async def health_check():
    """Detailed health check with auth status"""
    auth_valid = False
    session_id = None
    
    if AUTH_FILE.exists():
        try:
            auth = load_auth()
            session_id = auth.get('session_id', '')[:10] + '...'
            auth_valid = True
        except:
            pass
    
    return {
        "status": "healthy",
        "auth_valid": auth_valid,
        "session_preview": session_id,
        "auth_file": str(AUTH_FILE)
    }


import os

if __name__ == "__main__":
    # Get port from environment variable (required for Railway)
    port = int(os.environ.get("PORT", 8787))
    
    print(f"🚀 Starting BTC Wheel NotebookLM Bridge on port {port}...")
    print(f"📁 Auth file: {AUTH_FILE}")
    print()
    
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
