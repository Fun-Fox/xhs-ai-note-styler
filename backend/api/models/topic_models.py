"""
内容选题管理数据模型
定义选题相关的数据模型
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class TopicBase(BaseModel):
    """选题基础模型"""
    name: str = Field(..., description="选题名称")
    level: int = Field(..., description="选题级别，1为一级，2为二级，3为三级")
    parent_id: Optional[int] = Field(None, description="父级选题ID，0表示无父级")
    description: Optional[str] = Field(None, description="选题描述")
    style_ids: Optional[List[int]] = Field(None, description="关联的风格ID列表")

class TopicCreateRequest(TopicBase):
    """创建选题请求模型"""
    pass

class TopicUpdateRequest(TopicBase):
    """更新选题请求模型"""
    pass

class TopicResponse(BaseModel):
    """选题响应模型"""
    success: bool
    data: Optional[dict] = None
    message: str

class TopicListResponse(BaseModel):
    """选题列表响应模型"""
    success: bool
    data: Optional[List[dict]] = None
    message: str

class TopicHierarchyResponse(BaseModel):
    """选题层级结构响应模型"""
    success: bool
    data: Optional[List[dict]] = None
    message: str

class StyleListResponse(BaseModel):
    """风格列表响应模型"""
    success: bool
    data: Optional[List[dict]] = None
    message: str

class AssociatedStyleResponse(BaseModel):
    """关联风格列表响应模型"""
    success: bool
    data: Optional[List[dict]] = None
    message: str

class AssociateStyleRequest(BaseModel):
    """关联选题和风格请求模型"""
    topic_id: int
    style_id: int

class AssociateStyleResponse(BaseModel):
    """关联选题和风格响应模型"""
    success: bool
    message: str
