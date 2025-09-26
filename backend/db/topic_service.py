"""
选题管理数据库服务文件
提供对内容选题的增删改查操作
"""

from .db_models import Topic, TopicStyleAssociation, StyleAnalysis, get_session
from typing import List, Dict, Optional


class TopicService:
    """
    内容选题数据库服务类
    """
    
    @staticmethod
    def create_topic(name: str, level: int, parent_id: Optional[int] = None, 
                     description: Optional[str] = None) -> Topic:
        """
        创建新的选题
        
        Args:
            name: 选题名称
            level: 选题级别 (1, 2, 3)
            parent_id: 父级选题ID
            description: 选题描述
            
        Returns:
            Topic: 创建的选题对象
        """
        session = get_session()
        try:
            topic = Topic(
                name=name,
                level=level,
                parent_id=parent_id,
                description=description
            )
            session.add(topic)
            session.commit()
            session.refresh(topic)
            return topic
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    @staticmethod
    def get_topic(topic_id: int) -> Optional[Topic]:
        """
        根据ID获取选题
        
        Args:
            topic_id: 选题ID
            
        Returns:
            Topic: 选题对象，如果未找到则返回None
        """
        session = get_session()
        try:
            return session.query(Topic).filter(Topic.id == topic_id).first()
        finally:
            session.close()
    
    @staticmethod
    def update_topic(topic_id: int, **kwargs) -> Optional[Topic]:
        """
        更新选题
        
        Args:
            topic_id: 选题ID
            **kwargs: 需要更新的字段
            
        Returns:
            Topic: 更新后的选题对象，如果未找到则返回None
        """
        session = get_session()
        try:
            topic = session.query(Topic).filter(Topic.id == topic_id).first()
            if topic:
                for key, value in kwargs.items():
                    if hasattr(topic, key):
                        setattr(topic, key, value)
                session.commit()
                session.refresh(topic)
            return topic
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    @staticmethod
    def delete_topic(topic_id: int) -> bool:
        """
        删除选题
        
        Args:
            topic_id: 选题ID
            
        Returns:
            bool: 删除成功返回True，否则返回False
        """
        session = get_session()
        try:
            topic = session.query(Topic).filter(Topic.id == topic_id).first()
            if topic:
                session.delete(topic)
                session.commit()
                return True
            return False
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    @staticmethod
    def list_topics(level: Optional[int] = None, parent_id: Optional[int] = None) -> List[Topic]:
        """
        列出选题
        
        Args:
            level: 选题级别
            parent_id: 父级选题ID
            
        Returns:
            List[Topic]: 选题列表
        """
        session = get_session()
        try:
            query = session.query(Topic)
            if level is not None:
                query = query.filter(Topic.level == level)
            if parent_id is not None:
                query = query.filter(Topic.parent_id == parent_id)
            return query.all()
        finally:
            session.close()
    
    @staticmethod
    def get_children_topics(parent_id: int) -> List[Topic]:
        """
        获取父级选题的子选题列表
        
        Args:
            parent_id: 父级选题ID
            
        Returns:
            List[Topic]: 子选题列表
        """
        session = get_session()
        try:
            return session.query(Topic).filter(Topic.parent_id == parent_id).all()
        finally:
            session.close()
    
    @staticmethod
    def get_topic_hierarchy(parent_id: Optional[int] = None) -> List[Dict]:
        """
        获取选题层级结构
        
        Args:
            parent_id: 父级选题ID，None表示获取所有一级选题
            
        Returns:
            List[Dict]: 层级结构数据
        """
        session = get_session()
        try:
            if parent_id is None:
                # 获取所有一级选题
                topics = session.query(Topic).filter(Topic.level == 1).all()
            else:
                # 获取指定选题的子选题
                topics = session.query(Topic).filter(Topic.parent_id == parent_id).all()
            
            result = []
            for topic in topics:
                topic_dict = topic.to_dict()
                # 如果是父级选题，递归获取子选题
                if topic.level < 3:  # 只有1级和2级选题才可能有子选题
                    topic_dict['children'] = TopicService.get_topic_hierarchy(topic.id)
                result.append(topic_dict)
            
            return result
        finally:
            session.close()
    
    @staticmethod
    def associate_style_with_topic(topic_id: int, style_id: int) -> TopicStyleAssociation:
        """
        关联选题和风格
        
        Args:
            topic_id: 选题ID
            style_id: 风格ID
            
        Returns:
            TopicStyleAssociation: 关联对象
        """
        session = get_session()
        try:
            # 检查是否已存在关联
            association = session.query(TopicStyleAssociation).filter(
                TopicStyleAssociation.topic_id == topic_id,
                TopicStyleAssociation.style_id == style_id
            ).first()
            
            if not association:
                association = TopicStyleAssociation(
                    topic_id=topic_id,
                    style_id=style_id
                )
                session.add(association)
                session.commit()
                session.refresh(association)
            
            return association
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    @staticmethod
    def disassociate_style_from_topic(topic_id: int, style_id: int) -> bool:
        """
        解除选题和风格的关联
        
        Args:
            topic_id: 选题ID
            style_id: 风格ID
            
        Returns:
            bool: 解除成功返回True，否则返回False
        """
        session = get_session()
        try:
            association = session.query(TopicStyleAssociation).filter(
                TopicStyleAssociation.topic_id == topic_id,
                TopicStyleAssociation.style_id == style_id
            ).first()
            
            if association:
                session.delete(association)
                session.commit()
                return True
            return False
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    @staticmethod
    def get_associated_styles(topic_id: int) -> List[StyleAnalysis]:
        """
        获取选题关联的风格列表
        
        Args:
            topic_id: 选题ID
            
        Returns:
            List[StyleAnalysis]: 关联的风格列表
        """
        session = get_session()
        try:
            associations = session.query(TopicStyleAssociation).filter(
                TopicStyleAssociation.topic_id == topic_id
            ).all()
            
            style_ids = [assoc.style_id for assoc in associations]
            if style_ids:
                return session.query(StyleAnalysis).filter(
                    StyleAnalysis.id.in_(style_ids)
                ).all()
            return []
        finally:
            session.close()


# 创建全局服务实例
topic_service = TopicService()