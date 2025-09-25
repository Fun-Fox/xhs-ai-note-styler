"""
API路由定义文件
定义了风格分析相关的API路由
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import asyncio

from .models.style_models import (
    StyleAnalyzerRequest, 
    StyleAnalyzerResponse,
    RewriteRequest,
    RewriteResponse,
    UrlAnalyzerRequest,
    UrlAnalyzerResponse
)
from .services.style_service import analyze_style, rewrite_content, analyze_urls

# 创建路由实例
router = APIRouter(prefix="/api/v1/style", tags=["风格分析"])

@router.post("/analyze", response_model=StyleAnalyzerResponse)
async def analyze_style_endpoint(request: StyleAnalyzerRequest) -> StyleAnalyzerResponse:
    """
    分析小红书内容的写作风格
    """
    try:
        return analyze_style(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rewrite", response_model=RewriteResponse)
async def rewrite_content_endpoint(request: RewriteRequest) -> RewriteResponse:
    """
    根据指定风格重写内容
    """
    try:
        return rewrite_content(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-urls", response_model=UrlAnalyzerResponse)
async def analyze_urls_endpoint(request: UrlAnalyzerRequest) -> UrlAnalyzerResponse:
    """
    通过小红书URL分析写作风格
    """
    try:
        # 使用asyncio.create_task来异步执行
        result = await analyze_urls(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))