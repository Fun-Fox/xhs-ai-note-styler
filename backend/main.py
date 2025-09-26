"""
主应用文件
FastAPI应用入口
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sys
import os

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.append(project_root)

# 导入日志模块
from utils import info, error

# 导入API路由
from api.routes import  style_router,rewrite_router,topic_router
# 导入数据库初始化函数
from db.db_models import init_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 应用启动时初始化数据库
    info("正在初始化数据库...")
    try:
        init_database()
        info("数据库初始化成功!")
    except Exception as e:
        error(f"数据库初始化失败: {e}")
        raise e
    yield
    # 应用关闭时的清理工作（如果需要）


# 创建FastAPI应用实例，使用lifespan替代on_event
app = FastAPI(
    title="小红书AI笔记风格分析器",
    description="一个用于分析和模仿小红书爆款笔记风格的AI工具",
    version="1.0.0",
    lifespan=lifespan
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
app.include_router(rewrite_router)
app.include_router(topic_router)  # 添加选题管理路由

@app.get("/")
async def root():
    return {"message": "欢迎使用小红书AI笔记风格分析器"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)