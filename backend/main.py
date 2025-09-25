"""
主应用文件
FastAPI应用入口
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 导入API路由
from api.routes import router as style_router

# 创建FastAPI应用实例
app = FastAPI(
    title="小红书AI笔记风格分析器",
    description="一个用于分析和模仿小红书爆款笔记风格的AI工具",
    version="1.0.0"
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(style_router)

@app.get("/")
async def root():
    return {"message": "欢迎使用小红书AI笔记风格分析器"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)