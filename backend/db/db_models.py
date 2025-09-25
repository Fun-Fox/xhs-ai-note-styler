"""
数据库模型定义文件
定义风格分析结果的数据结构
"""

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import os
# 异步支持相关
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
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