"""
数据库服务文件
提供对风格分析结果的增删改查操作
"""

from .db_models import StyleAnalysis, get_session, get_async_session
from typing import List, Optional
from sqlalchemy.future import select


class StyleAnalysisService:
    """
    风格分析结果数据库服务类
    """
    
    @staticmethod
    def create_style_analysis(style_name: str, feature_desc: str, category: str, 
                            sample_title: str = None, sample_content: str = None) -> StyleAnalysis:
        """
        创建新的风格分析记录
        
        Args:
            style_name: 风格名称
            feature_desc: 风格特征描述
            category: 分类
            sample_title: 样本文案标题
            sample_content: 样本文案内容
            
        Returns:
            StyleAnalysis: 创建的风格分析对象
        """
        session = get_session()
        try:
            style_analysis = StyleAnalysis(
                style_name=style_name,
                feature_desc=feature_desc,
                category=category,
                sample_title=sample_title,
                sample_content=sample_content
            )
            session.add(style_analysis)
            session.commit()
            session.refresh(style_analysis)
            return style_analysis
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    @staticmethod
    async def create_style_analysis_async(style_name: str, feature_desc: str, category: str, 
                                        sample_title: str = None, sample_content: str = None) -> StyleAnalysis:
        """
        异步创建新的风格分析记录
        
        Args:
            style_name: 风格名称
            feature_desc: 风格特征描述
            category: 分类
            sample_title: 样本文案标题
            sample_content: 样本文案内容
            
        Returns:
            StyleAnalysis: 创建的风格分析对象
        """
        async_session = get_async_session()
        async with async_session() as session:
            try:
                style_analysis = StyleAnalysis(
                    style_name=style_name,
                    feature_desc=feature_desc,
                    category=category,
                    sample_title=sample_title,
                    sample_content=sample_content
                )
                session.add(style_analysis)
                await session.commit()
                await session.refresh(style_analysis)
                return style_analysis
            except Exception as e:
                await session.rollback()
                raise e
    
    @staticmethod
    def get_style_analysis_by_id(analysis_id: int) -> Optional[StyleAnalysis]:
        """
        根据ID获取风格分析记录
        
        Args:
            analysis_id: 分析记录ID
            
        Returns:
            StyleAnalysis: 风格分析对象，如果未找到则返回None
        """
        session = get_session()
        try:
            return session.query(StyleAnalysis).filter(StyleAnalysis.id == analysis_id).first()
        finally:
            session.close()
    
    @staticmethod
    async def get_style_analysis_by_id_async(analysis_id: int) -> Optional[StyleAnalysis]:
        """
        异步根据ID获取风格分析记录
        
        Args:
            analysis_id: 分析记录ID
            
        Returns:
            StyleAnalysis: 风格分析对象，如果未找到则返回None
        """
        async_session = get_async_session()
        async with async_session() as session:
            try:
                stmt = select(StyleAnalysis).where(StyleAnalysis.id == analysis_id)
                result = await session.execute(stmt)
                return result.scalar_one_or_none()
            except Exception as e:
                raise e
    
    @staticmethod
    def get_all_style_analyses() -> List[StyleAnalysis]:
        """
        获取所有风格分析记录
        
        Returns:
            List[StyleAnalysis]: 风格分析记录列表
        """
        session = get_session()
        try:
            return session.query(StyleAnalysis).all()
        finally:
            session.close()
    
    @staticmethod
    async def get_all_style_analyses_async() -> List[StyleAnalysis]:
        """
        异步获取所有风格分析记录
        
        Returns:
            List[StyleAnalysis]: 风格分析记录列表
        """
        async_session = get_async_session()
        async with async_session() as session:
            try:
                stmt = select(StyleAnalysis)
                result = await session.execute(stmt)
                return result.scalars().all()
            except Exception as e:
                raise e
    
    @staticmethod
    def get_style_analyses_by_category(category: str) -> List[StyleAnalysis]:
        """
        根据分类获取风格分析记录
        
        Args:
            category: 分类
            
        Returns:
            List[StyleAnalysis]: 风格分析记录列表
        """
        session = get_session()
        try:
            return session.query(StyleAnalysis).filter(StyleAnalysis.category == category).all()
        finally:
            session.close()
    
    @staticmethod
    async def get_style_analyses_by_category_async(category: str) -> List[StyleAnalysis]:
        """
        异步根据分类获取风格分析记录
        
        Args:
            category: 分类
            
        Returns:
            List[StyleAnalysis]: 风格分析记录列表
        """
        async_session = get_async_session()
        async with async_session() as session:
            try:
                stmt = select(StyleAnalysis).where(StyleAnalysis.category == category)
                result = await session.execute(stmt)
                return result.scalars().all()
            except Exception as e:
                raise e
    
    @staticmethod
    def update_style_analysis(analysis_id: int, **kwargs) -> Optional[StyleAnalysis]:
        """
        更新风格分析记录
        
        Args:
            analysis_id: 分析记录ID
            **kwargs: 需要更新的字段
            
        Returns:
            StyleAnalysis: 更新后的风格分析对象，如果未找到则返回None
        """
        session = get_session()
        try:
            style_analysis = session.query(StyleAnalysis).filter(StyleAnalysis.id == analysis_id).first()
            if style_analysis:
                for key, value in kwargs.items():
                    if hasattr(style_analysis, key):
                        setattr(style_analysis, key, value)
                session.commit()
                session.refresh(style_analysis)
            return style_analysis
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    @staticmethod
    async def update_style_analysis_async(analysis_id: int, **kwargs) -> Optional[StyleAnalysis]:
        """
        异步更新风格分析记录
        
        Args:
            analysis_id: 分析记录ID
            **kwargs: 需要更新的字段
            
        Returns:
            StyleAnalysis: 更新后的风格分析对象，如果未找到则返回None
        """
        async_session = get_async_session()
        async with async_session() as session:
            try:
                stmt = select(StyleAnalysis).where(StyleAnalysis.id == analysis_id)
                result = await session.execute(stmt)
                style_analysis = result.scalar_one_or_none()
                
                if style_analysis:
                    for key, value in kwargs.items():
                        if hasattr(style_analysis, key):
                            setattr(style_analysis, key, value)
                    await session.commit()
                    await session.refresh(style_analysis)
                return style_analysis
            except Exception as e:
                await session.rollback()
                raise e
    
    @staticmethod
    def delete_style_analysis(analysis_id: int) -> bool:
        """
        删除风格分析记录
        
        Args:
            analysis_id: 分析记录ID
            
        Returns:
            bool: 删除成功返回True，否则返回False
        """
        session = get_session()
        try:
            style_analysis = session.query(StyleAnalysis).filter(StyleAnalysis.id == analysis_id).first()
            if style_analysis:
                session.delete(style_analysis)
                session.commit()
                return True
            return False
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    @staticmethod
    async def delete_style_analysis_async(analysis_id: int) -> bool:
        """
        异步删除风格分析记录
        
        Args:
            analysis_id: 分析记录ID
            
        Returns:
            bool: 删除成功返回True，否则返回False
        """
        async_session = get_async_session()
        async with async_session() as session:
            try:
                stmt = select(StyleAnalysis).where(StyleAnalysis.id == analysis_id)
                result = await session.execute(stmt)
                style_analysis = result.scalar_one_or_none()
                
                if style_analysis:
                    await session.delete(style_analysis)
                    await session.commit()
                    return True
                return False
            except Exception as e:
                await session.rollback()
                raise e


# 创建全局服务实例
style_analysis_service = StyleAnalysisService()