"""
数据模型定义文件
定义了风格分析相关的数据模型
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any, List


class StyleAnalyzerRequest(BaseModel):
    """风格分析请求模型"""
    content: str
    category: Optional[str] = None
    topic_level_1: Optional[str] = None
    topic_level_2: Optional[str] = None
    topic_level_3: Optional[str] = None


class StyleAnalyzerResponse(BaseModel):
    """风格分析响应模型"""
    success: bool
    result: Dict[str, Any]
    execution_time: float


class RewriteRequest(BaseModel):
    """内容重写请求模型"""
    style_info: Dict[str, Any]  # 风格信息，包含style_name, feature_desc, word_count, example_content
    user_task: str  # 用户需求


class RewriteResponse(BaseModel):
    """内容重写响应模型"""
    success: bool
    title: str  # 文案标题
    content: str  # 文案内容
    tags: str  # 文案标签
    execution_time: float


class UrlAnalyzerRequest(BaseModel):
    """URL分析请求模型"""
    urls: str  # 小红书URL，多个URL用空格分隔


class NoteContent(BaseModel):
    """小红书笔记内容模型"""
    url: str
    title: str
    content: str


class StyleAnalysisResult(BaseModel):
    """风格分析结果模型"""
    style_name: str
    feature_desc: str
    category: str


class UrlAnalyzerResponse(BaseModel):
    """URL分析响应模型"""
    success: bool
    notes: List[NoteContent]
    analyses: List[StyleAnalysisResult]
    execution_time: float