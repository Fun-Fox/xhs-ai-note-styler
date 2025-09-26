"""
风格分析服务模块
处理风格分析和内容重写相关的业务逻辑
"""

import time
import logging
import asyncio
import sys
import os

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if project_root not in sys.path:
    sys.path.append(project_root)

from typing import Dict, Any, List
from ..models.style_models import (
    StyleAnalyzerRequest, 
    StyleAnalyzerResponse, 
    RewriteRequest, 
    RewriteResponse,
    UrlAnalyzerRequest,
    UrlAnalyzerResponse,
    NoteContent,
    StyleAnalysisResult
)

# 配置日志
logger = logging.getLogger(__name__)

# 导入RPA模块获取小红书内容
from backend.rpa import extract_note_content

# 导入分析代理
from backend.agent import get_analyze_style_agent, save_analysis_result_async

# 导入copy_cat代理
from backend.agent import get_copycat_agent

# 导入数据库服务
from backend.db import style_analysis_service



def analyze_style(request: StyleAnalyzerRequest) -> StyleAnalyzerResponse:
    """
    分析小红书内容的写作风格
    
    Args:
        request (StyleAnalyzerRequest): 风格分析请求
        
    Returns:
        StyleAnalyzerResponse: 风格分析响应
    """
    start_time = time.time()
    logger.info("开始分析写作风格")
    
    try:
        # 获取agent实例
        agent = get_analyze_style_agent()
        
        task = f"""
**文案标题**

{request.title}

**文案内容**

{request.content}
"""
        
        # 调用分析代理
        result = agent.run(task)
        result = result.split("StyleAnalyzer: ")[1]
        
        import ast
        import json
        
        try:
            # 解析结果
            data = ast.literal_eval(result)
            arguments_str = data[0]['function']['arguments']
            arguments_dict = json.loads(arguments_str)
            
            # 保存到数据库
            style_analysis = style_analysis_service.create_style_analysis(
                style_name=arguments_dict['style_name'],
                feature_desc=arguments_dict['feature_desc'],
                category=arguments_dict['category'],
                sample_title=request.title,
                sample_content=task
            )
            
            execution_time = time.time() - start_time
            logger.info(f"风格分析完成，耗时: {execution_time:.2f}秒")
            
            return StyleAnalyzerResponse(
                success=True,
                analysis=StyleAnalysisResult(
                    style_name=arguments_dict['style_name'],
                    feature_desc=arguments_dict['feature_desc'],
                    category=arguments_dict['category']
                ),
                execution_time=execution_time,
                id=style_analysis.id
            )
            
        except Exception as e:
            logger.error(f"解析分析结果时出错: {str(e)}")
            raise Exception(f"解析分析结果时出错: {str(e)}")
            
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"风格分析失败: {str(e)}")
        raise Exception(f"风格分析失败: {str(e)}")


async def rewrite_content(request: RewriteRequest) -> RewriteResponse:
    """
    根据分析的风格重写内容
    
    Args:
        request (RewriteRequest): 内容重写请求
        
    Returns:
        RewriteResponse: 内容重写响应
    """
    start_time = time.time()
    logger.info("开始重写内容")
    
    try:
        # 获取数据库中的风格分析结果
        style_analysis = style_analysis_service.get_style_analysis(request.style_id)
        if not style_analysis:
            raise Exception(f"未找到ID为{request.style_id}的风格分析结果")
            
        # 构造风格信息
        style_info = {
            "style_name": style_analysis.style_name,
            "feature_desc": style_analysis.feature_desc,
            "category": style_analysis.category,
            "word_count": str(len(style_analysis.sample_content)),
            "example_content": style_analysis.sample_content
        }
        
        # 获取agent实例
        agent = get_copycat_agent()
        
        # 构造任务描述
        full_task = f"""
参照这个文案书写风格，输出小红书爆款文案：
# 风格信息

风格名称：{style_info.get('style_name')}
特征描述：{style_info.get('feature_desc')}
字数：{style_info.get('word_count')}

## 风格示例文稿

{style_info.get('example_content')}

# 其余要求：

{request.user_task}
    
请根据以上风格信息和用户其余需求，生成符合该风格的全新原创小红书种草文案。
"""
        
        # 运行Agent
        result = agent.run(full_task)
        result = result.split("CopycatAgent: ")[1]
        
        import ast
        import json
        
        try:
            # 解析结果
            data = ast.literal_eval(result)
            arguments_str = data[0]['function']['arguments']
            arguments_dict = json.loads(arguments_str)
            
            execution_time = time.time() - start_time
            logger.info(f"内容重写完成，耗时: {execution_time:.2f}秒")
            
            return RewriteResponse(
                success=True,
                title=arguments_dict['title'],
                content=arguments_dict['content'],
                tags=arguments_dict['tags'],
                execution_time=execution_time
            )
            
        except Exception as e:
            logger.error(f"解析重写结果时出错: {str(e)}")
            raise Exception(f"解析重写结果时出错: {str(e)}")
            
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"内容重写失败: {str(e)}")
        raise Exception(f"内容重写失败: {str(e)}")


async def analyze_url_styles(request: UrlAnalyzerRequest) -> UrlAnalyzerResponse:
    """
    分析URL中多个小红书笔记的写作风格
    
    Args:
        request (UrlAnalyzerRequest): URL风格分析请求
        
    Returns:
        UrlAnalyzerResponse: URL风格分析响应
    """
    start_time = time.time()
    logger.info(f"开始分析URL中的笔记风格: {request.url}")
    
    try:
        # 提取笔记内容
        notes = extract_note_content(request.url)
        if not notes:
            raise Exception("未能提取到任何笔记内容")
            
        logger.info(f"成功提取{len(notes)}篇笔记")
        
        analyses: List[StyleAnalysisResult] = []
        tasks = []
        
        # 获取agent实例
        agent = get_analyze_style_agent()
        
        # 分析每篇笔记的风格
        for i, note in enumerate(notes[:request.max_notes] if request.max_notes else notes):
            logger.info(f"开始分析第{i+1}篇笔记: {note.title}")
            
            task = f"""
**文案标题**

{note.title}

**文案内容**

{note.content}
"""
            
            # 调用分析代理
            result = agent.run(task)
            result = result.split("StyleAnalyzer: ")[1]
            
            import ast
            import json
            
            try:
                # 解析结果
                data = ast.literal_eval(result)
                arguments_str = data[0]['function']['arguments']
                arguments_dict = json.loads(arguments_str)
                
                # 创建分析结果对象
                analysis_result = StyleAnalysisResult(
                    style_name=arguments_dict['style_name'],
                    feature_desc=arguments_dict['feature_desc'],
                    category=arguments_dict['category']
                )
                
                analyses.append(analysis_result)
                logger.info(f"第{i+1}篇笔记分析完成: {arguments_dict['style_name']}")
                
                # 异步保存到数据库
                tasks.append(save_analysis_result_async(arguments_dict, note.title, task))
                
            except Exception as e:
                logger.error(f"解析第{i+1}篇笔记分析结果时出错: {str(e)}")
                continue
        
        # 并发执行所有数据库保存操作
        if tasks:
            await asyncio.gather(*tasks)
        
        execution_time = time.time() - start_time
        logger.info(f"URL分析完成，共分析{len(analyses)}篇笔记，耗时: {execution_time:.2f}秒")
        
        return UrlAnalyzerResponse(
            success=True,
            notes=notes,
            analyses=analyses,
            execution_time=execution_time
        )
        
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"URL分析失败: {str(e)}")
        raise Exception(f"URL分析失败: {str(e)}")