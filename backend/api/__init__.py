from fastapi import FastAPI
from .routers import style_analyzer

# Initialize FastAPI app
app = FastAPI(
    title="VideoCubeSwarms API",
    description="小红书爆款内容分析和创作API",
    version="1.0.0"
)

# Include routers
app.include_router(style_analyzer.router)