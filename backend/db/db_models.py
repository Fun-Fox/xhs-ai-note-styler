"""
数据库模型定义文件
定义风格分析结果的数据结构
"""

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import os
# 异步支持相关
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, relationship
Base = declarative_base()

class StyleAnalysis(Base):
    """
    风格分析结果模型
    """
    __tablename__ = 'style_analysis'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    style_name = Column(String(255), nullable=False)
    feature_desc = Column(Text, nullable=False)
    category = Column(String(255), nullable=False)
    sample_title = Column(String(255), nullable=True)
    sample_content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    
    def __repr__(self):
        return f"<StyleAnalysis(style_name='{self.style_name}', category='{self.category}')>"
        
    def to_dict(self):
        """
        将对象转换为字典格式
        """
        return {
            'id': self.id,
            'style_name': self.style_name,
            'feature_desc': self.feature_desc,
            'category': self.category,
            'sample_title': self.sample_title,
            'sample_content': self.sample_content,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Topic(Base):
    """
    内容选题模型
    """
    __tablename__ = 'topics'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    level = Column(Integer, nullable=False)  # 1, 2, 3 分别代表一级、二级、三级选题
    parent_id = Column(Integer, ForeignKey('topics.id'), nullable=True)  # 父级选题ID
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    
    # 关系定义
    parent = relationship("Topic", remote_side=[id], back_populates="children")
    children = relationship("Topic", back_populates="parent")
    
    def __repr__(self):
        return f"<Topic(name='{self.name}', level={self.level})>"
        
    def to_dict(self):
        """
        将对象转换为字典格式
        """
        # 获取父级选题名称
        parent_name = None
        if self.parent:
            parent_name = self.parent.name
            
        return {
            'id': self.id,
            'name': self.name,
            'level': self.level,
            'parent_id': self.parent_id,
            'parent_name': parent_name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class TopicStyleAssociation(Base):
    """
    选题与风格关联模型
    """
    __tablename__ = 'topic_style_associations'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    topic_id = Column(Integer, ForeignKey('topics.id'), nullable=False)
    style_id = Column(Integer, ForeignKey('style_analysis.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    
    def __repr__(self):
        return f"<TopicStyleAssociation(topic_id={self.topic_id}, style_id={self.style_id})>"
        
    def to_dict(self):
        """
        将对象转换为字典格式
        """
        return {
            'id': self.id,
            'topic_id': self.topic_id,
            'style_id': self.style_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class RewriteRecord(Base):
    """
    文稿二创执行记录模型
    """
    __tablename__ = 'rewrite_records'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    # 用户选择的风格名称
    style_name = Column(String(255), nullable=False)
    # 用户任务描述
    user_task = Column(Text, nullable=False)
    # 字数要求
    word_count = Column(String(50), nullable=True)
    # 生成的标题
    generated_title = Column(String(255), nullable=False)
    # 生成的内容
    generated_content = Column(Text, nullable=False)
    # 生成的标签
    generated_tags = Column(Text, nullable=True)
    # 执行时间（秒）
    execution_time = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    
    def __repr__(self):
        return f"<RewriteRecord(style_name='{self.style_name}', generated_title='{self.generated_title}')>"
        
    def to_dict(self):
        """
        将对象转换为字典格式
        """
        return {
            'id': self.id,
            'style_name': self.style_name,
            'user_task': self.user_task,
            'word_count': self.word_count,
            'generated_title': self.generated_title,
            'generated_content': self.generated_content,
            'generated_tags': self.generated_tags,
            'execution_time': self.execution_time,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


def get_database_path():
    """
    获取数据库文件路径
    """
    # 获取项目根目录
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # 确保output目录存在
    output_dir = os.path.join(project_root, 'output')
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    # 数据库文件放在output目录下
    db_path = os.path.join(output_dir, 'style_analysis.db')
    return db_path


def get_engine():
    """
    创建数据库引擎
    """
    db_path = get_database_path()
    engine = create_engine(f'sqlite:///{db_path}', echo=False)
    return engine


def init_database():
    """
    初始化数据库
    """
    engine = get_engine()
    Base.metadata.create_all(engine)
    return engine


def get_session():
    """
    获取数据库会话
    """
    engine = get_engine()
    Session = sessionmaker(bind=engine)
    session = Session()
    return session




def get_async_engine():
    """
    创建异步数据库引擎
    """
    db_path = get_database_path()
    # 使用aiosqlite驱动
    async_engine = create_async_engine(f'sqlite+aiosqlite:///{db_path}', echo=False)
    return async_engine


def get_async_session():
    """
    获取异步数据库会话
    """
    async_engine = get_async_engine()
    AsyncSessionLocal = sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    return AsyncSessionLocal