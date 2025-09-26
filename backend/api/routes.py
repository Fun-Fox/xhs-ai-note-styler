"""
API路由定义文件
定义了风格分析相关的API路由
"""
from typing import Optional

from fastapi import APIRouter
from .services.style_service import analyze_style, rewrite_content, analyze_url_styles
from .services.topic_service import (
    create_topic, 
    get_topic, 
    update_topic, 
    delete_topic, 
    list_topics, 
    get_topic_hierarchy,
    get_style_list,
    get_associated_styles
)
from .models.style_models import (
    StyleAnalyzerRequest, 
    StyleAnalyzerResponse, 
    RewriteRequest, 
    RewriteResponse,
    UrlAnalyzerRequest,
    UrlAnalyzerResponse
)
from .models.topic_models import (
    TopicCreateRequest,
    TopicUpdateRequest,
    TopicResponse,
    TopicListResponse,
    TopicHierarchyResponse,
    StyleListResponse,
    AssociatedStyleResponse
)

style_router = APIRouter(prefix="/api/v1/style", tags=["风格分析"])

@style_router.post("/style/analyze", response_model=StyleAnalyzerResponse)
async def analyze_style_endpoint(request: StyleAnalyzerRequest):
    return await analyze_style(request)

@style_router.post("/style/analyze-urls", response_model=UrlAnalyzerResponse)
async def analyze_url_styles_endpoint(request: UrlAnalyzerRequest):
    return await analyze_url_styles(request)


rewrite_router = APIRouter(prefix="/api/v1/rewrite", tags=["内容仿写"])
@rewrite_router.post("/style/rewrite", response_model=RewriteResponse)
async def rewrite_content_endpoint(request: RewriteRequest):
    """
    根据指定风格重写内容
    此端点用于将现有内容按照特定风格进行改写
    """
    return await rewrite_content(request)



# 添加选题管理路由
topic_router = APIRouter(prefix="/api/v1/topic", tags=["风格选题管理"])

@topic_router.post("/create", response_model=TopicResponse)
async def create_topic_endpoint(request: TopicCreateRequest):
    """创建新选题"""
    return await create_topic(request)

@topic_router.get("/get/{topic_id}", response_model=TopicResponse)
async def get_topic_endpoint(topic_id: int):
    """获取单个选题信息"""
    return await get_topic(topic_id)

@topic_router.put("/update/{topic_id}", response_model=TopicResponse)
async def update_topic_endpoint(topic_id: int, request: TopicUpdateRequest):
    """更新选题信息"""
    return await update_topic(topic_id, request)

@topic_router.delete("/delete/{topic_id}")
async def delete_topic_endpoint(topic_id: int):
    """删除选题"""
    return await delete_topic(topic_id)

@topic_router.get("/list", response_model=TopicListResponse)
async def list_topics_endpoint(level: Optional[int] = None, parent_id: Optional[int] = None):
    """列出选题列表"""
    return await list_topics(level=level, parent_id=parent_id)

@topic_router.get("/hierarchy", response_model=TopicHierarchyResponse)
async def get_topic_hierarchy_endpoint(parent_id: Optional[int] = None):
    """获取选题层级结构"""
    return await get_topic_hierarchy(parent_id=parent_id)

@topic_router.get("/style/list", response_model=StyleListResponse)
async def get_style_list_endpoint():
    """获取所有风格列表"""
    return await get_style_list()

@topic_router.get("/style/associated/{topic_id}", response_model=AssociatedStyleResponse)
async def get_associated_styles_endpoint(topic_id: int):
    """获取某选题关联的风格列表"""
    return await get_associated_styles(topic_id)
