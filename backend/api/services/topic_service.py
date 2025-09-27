"""
内容选题管理服务模块
处理选题增删改查、层级关系和风格关联等业务逻辑
"""

from typing import Dict, Any, List, Optional
from datetime import datetime

# 导入数据库服务
from backend.db.style_service import style_analysis_service
from backend.db.topic_service import topic_service

# 导入数据模型
from ..models.topic_models import (
    TopicCreateRequest,
    TopicUpdateRequest,
    TopicResponse,
    TopicListResponse,
    TopicHierarchyResponse,
    StyleListResponse,
    AssociatedStyleResponse,
    AssociateStyleRequest,
    AssociateStyleResponse
)

# 配置日志
from backend.utils.logger import info as logger_info, error as logger_error, warning as logger_warning

def create_topic(request: TopicCreateRequest) -> TopicResponse:
    """
    创建新选题
    
    Args:
        request (TopicCreateRequest): 创建选题请求
        
    Returns:
        TopicResponse: 创建后的选题响应
    """
    try:
        logger_info("创建新选题")
        
        # 验证父级选题是否存在（如果是二级或三级选题）
        if request.parent_id and request.parent_id != 0:
            parent_topic = topic_service.get_topic(request.parent_id)
            if not parent_topic:
                raise Exception(f"父级选题ID {request.parent_id} 不存在")
                
        # 创建选题
        topic = topic_service.create_topic(
            name=request.name,
            level=request.level,
            parent_id=request.parent_id,
            description=request.description
        )
        
        # 关联风格
        if request.style_ids:
            for style_id in request.style_ids:
                topic_service.associate_style_with_topic(topic.id, style_id)
        
        # 确保parent关系已加载，避免懒加载错误
        _ = topic.parent if topic.parent_id else None
        
        return TopicResponse(
            success=True,
            data=topic.to_dict(),
            message="选题创建成功"
        )
        
    except Exception as e:
        logger_error(f"创建选题时出错: {str(e)}")
        raise Exception(f"创建选题失败: {str(e)}")

def get_topic(topic_id: int) -> TopicResponse:
    """
    获取单个选题信息
    
    Args:
        topic_id (int): 选题ID
        
    Returns:
        TopicResponse: 选题响应
    """
    try:
        logger_info("获取选题详情")
        
        topic = topic_service.get_topic(topic_id)
        if not topic:
            raise Exception(f"选题ID {topic_id} 不存在")
            
        return TopicResponse(
            success=True,
            data=topic.to_dict(),
            message="获取选题成功"
        )
        
    except Exception as e:
        logger_error(f"获取选题详情时出错: {str(e)}")
        raise Exception(f"获取选题失败: {str(e)}")

def update_topic(topic_id: int, request: TopicUpdateRequest) -> TopicResponse:
    """
    更新选题信息
    
    Args:
        topic_id (int): 选题ID
        request (TopicUpdateRequest): 更新请求
        
    Returns:
        TopicResponse: 更新后的选题响应
    """
    try:
        logger_info("更新选题信息")
        
        # 检查选题是否存在
        topic = topic_service.get_topic(topic_id)
        if not topic:
            raise Exception(f"选题ID {topic_id} 不存在")
            
        # 验证父级选题是否存在（如果是二级或三级选题）
        if request.parent_id and request.parent_id != 0 and request.parent_id != topic.parent_id:
            parent_topic = topic_service.get_topic(request.parent_id)
            if not parent_topic:
                raise Exception(f"父级选题ID {request.parent_id} 不存在")
                
        # 更新选题
        updated_topic = topic_service.update_topic(
            topic_id=topic_id,
            name=request.name,
            description=request.description,
            parent_id=request.parent_id
        )
        
        # 更新风格关联
        if request.style_ids is not None:
            # 先获取当前关联的风格
            current_styles = topic_service.get_associated_styles(topic_id)
            current_style_ids = [style.id for style in current_styles]
            
            # 需要添加的风格
            styles_to_add = set(request.style_ids) - set(current_style_ids)
            # 需要删除的风格
            styles_to_remove = set(current_style_ids) - set(request.style_ids)
            
            # 添加新关联
            for style_id in styles_to_add:
                topic_service.associate_style_with_topic(topic_id, style_id)
            
            # 删除不需要的关联
            for style_id in styles_to_remove:
                topic_service.disassociate_style_from_topic(topic_id, style_id)
        
        return TopicResponse(
            success=True,
            data=updated_topic.to_dict(),
            message="选题更新成功"
        )
        
    except Exception as e:
        logger_error(f"更新选题时出错: {str(e)}")
        raise Exception(f"更新选题失败: {str(e)}")

def delete_topic(topic_id: int) -> Dict[str, Any]:
    """
    删除选题
    
    Args:
        topic_id (int): 选题ID
        
    Returns:
        Dict[str, Any]: 删除结果
    """
    try:
        logger_info("删除选题")
        
        # 检查选题是否存在
        topic = topic_service.get_topic(topic_id)
        if not topic:
            raise Exception(f"选题ID {topic_id} 不存在")
            
        # 检查是否有子选题
        children = topic_service.get_children_topics(topic_id)
        if children:
            raise Exception(f"该选题有 {len(children)} 个子选题，不能删除")
            
        # 删除选题
        topic_service.delete_topic(topic_id)
        
        return {
            "success": True,
            "message": "选题删除成功"
        }
        
    except Exception as e:
        logger_error(f"删除选题时出错: {str(e)}")
        raise Exception(f"删除选题失败: {str(e)}")

def list_topics(level: Optional[int] = None, parent_id: Optional[int] = None) -> TopicListResponse:
    """
    列出选题列表
    
    Args:
        level (Optional[int]): 选题级别，1为一级，2为二级，3为三级
        parent_id (Optional[int]): 父级选题ID
        
    Returns:
        TopicListResponse: 选题列表响应
    """
    try:
        logger_info("获取选题列表")
        
        topics = topic_service.list_topics(level=level, parent_id=parent_id)
        topic_list = [topic.to_dict() for topic in topics]
        
        return TopicListResponse(
            success=True,
            data=topic_list,
            message="获取选题列表成功"
        )
        
    except Exception as e:
        logger_error(f"获取选题列表时出错: {str(e)}")
        raise Exception(f"获取选题列表失败: {str(e)}")

def get_topic_hierarchy(parent_id: Optional[int] = None) -> TopicHierarchyResponse:
    """
    获取选题层级结构
    
    Args:
        parent_id (Optional[int]): 父级选题ID，如果为None则返回所有一级选题
        
    Returns:
        TopicHierarchyResponse: 选题层级结构响应
    """
    try:
        logger_info("获取选题层级结构")
        
        hierarchy = topic_service.get_topic_hierarchy(parent_id=parent_id)
        
        return TopicHierarchyResponse(
            success=True,
            data=hierarchy,
            message="获取选题层级结构成功"
        )
        
    except Exception as e:
        logger_error(f"获取选题层级结构时出错: {str(e)}")
        raise Exception(f"获取选题层级结构失败: {str(e)}")

def get_style_list() -> StyleListResponse:
    """
    获取所有风格列表
    
    Returns:
        StyleListResponse: 风格列表响应
    """
    try:
        logger_info("关联写作风格")
        
        styles = style_analysis_service.get_all_style_analyses()
        style_list = [style.to_dict() for style in styles]
        
        return StyleListResponse(
            success=True,
            data=style_list,
            message="获取风格列表成功"
        )
        
    except Exception as e:
        logger_error(f"关联写作风格时出错: {str(e)}")
        raise Exception(f"获取风格列表失败: {str(e)}")

def get_associated_styles(topic_id: int) -> AssociatedStyleResponse:
    """
    获取某选题关联的风格列表
    
    Args:
        topic_id (int): 选题ID
        
    Returns:
        AssociatedStyleResponse: 关联风格列表响应
    """
    try:
        logger_info("获取关联的写作风格")
        
        topic = topic_service.get_topic(topic_id)
        if not topic:
            raise Exception(f"选题ID {topic_id} 不存在")
            
        styles = topic_service.get_associated_styles(topic_id)
        style_list = [style.to_dict() for style in styles]
        
        return AssociatedStyleResponse(
            success=True,
            data=style_list,
            message="获取关联风格列表成功"
        )
        
    except Exception as e:
        logger_error(f"获取关联写作风格时出错: {str(e)}")
        raise Exception(f"获取关联风格列表失败: {str(e)}")

def associate_style(request: AssociateStyleRequest) -> AssociateStyleResponse:
    """
    关联选题和风格
    
    Args:
        request (AssociateStyleRequest): 关联请求
        
    Returns:
        AssociateStyleResponse: 关联响应
    """
    try:
        # 验证选题是否存在
        topic = topic_service.get_topic(request.topic_id)
        if not topic:
            raise Exception(f"选题ID {request.topic_id} 不存在")
            
        # 验证风格是否存在
        style = style_analysis_service.get_style_analysis_by_id(request.style_id)
        if not style:
            raise Exception(f"风格ID {request.style_id} 不存在")
            
        # 关联选题和风格
        topic_service.associate_style_with_topic(request.topic_id, request.style_id)
        
        return AssociateStyleResponse(
            success=True,
            message="选题与风格关联成功"
        )
        
    except Exception as e:
        logger_error(f"关联选题和风格时出错: {str(e)}")
        raise Exception(f"关联选题和风格失败: {str(e)}")
