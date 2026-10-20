import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(
    title="LifeBridge API",
    version="1.0.0",
    description="Emergency-grade situational analysis and life-saving action engine powered by Gemini."
)

# Enable CORS for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {
        "app": "LifeBridge API",
        "status": "running",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    from app.config import PORT, HOST
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
