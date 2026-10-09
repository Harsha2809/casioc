from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.calculator import router as calculator_router
from app.api.websocket import router as websocket_router


app = FastAPI(
    title="CASIOC",
    description="Real-Time 3D Calculator API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to CASIOC",
        "status": "running",
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
    }


app.include_router(calculator_router)
app.include_router(websocket_router)