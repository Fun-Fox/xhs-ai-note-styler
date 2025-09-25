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
from rpa.note_content import extract_note_content

# 导入分析代理
from agent.analyze_style import analyze_style_agent, save_analysis_result_async

# 导入copy_cat代理
from agent.copy_cat import copycat_agent

# 导入数据库服务
from db.db_service import style_analysis_service

import json
import ast


def analyze_style(request: StyleAnalyzerRequest) -> StyleAnalyzerResponse:
    """
    分析小红书内容的写作风格
    
    Args:
        request: 风格分析请求数据
        
    Returns:
        StyleAnalyzerResponse: 风格分析结果
    """
    logger.info("开始分析写作风格")
    start_time = time.time()
    
    try:
        # 构建任务内容，包含选题信息
        task_content = f"分析小红书帖子: {request.content}"
        if request.topic_level_1 or request.topic_level_2 or request.topic_level_3:
            topic_info = " 选题信息: "
            if request.topic_level_1:
                topic_info += f"一级选题 - {request.topic_level_1}"
            if request.topic_level_2:
                topic_info += f", 二级选题 - {request.topic_level_2}"
            if request.topic_level_3:
                topic_info += f", 三级选题 - {request.topic_level_3}"
            task_content += topic_info
            
        logger.debug(f"任务内容: {task_content}")
        
        # 模拟代理分析（实际实现中这里会使用swarms库）
        result = {
            "style_name": "产品推广风格",
            "language_characteristics": "使用大量emoji表情，包含价格信息，突出产品卖点",
            "key_features": "1. 开头使用吸引眼球的词语 2. 使用emoji增加视觉吸引力 3. 明确的价格和产品信息 4. 强调使用效果和体验",
            "recommended_categories": ["美妆", "个护", "生活用品"],
            "examples": request.content[:100] + "..."
        }
        
        execution_time = time.time() - start_time
        logger.info(f"风格分析完成，耗时: {execution_time:.2f}秒")
        
        return StyleAnalyzerResponse(
            success=True,
            result=result,
            execution_time=execution_time
        )
        
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"风格分析失败: {str(e)}")
        raise Exception(f"风格分析失败: {str(e)}")


def rewrite_content(request: RewriteRequest) -> RewriteResponse:
    """
    根据指定风格重写内容
    
    Args:
        request: 内容重写请求数据
        
    Returns:
        RewriteResponse: 重写后的内容结果
    """
    logger.info(f"开始内容重写，目标风格: {request.style_info.get('style_name', '未知')}")
    start_time = time.time()
    
    try:
        # 构造完整的任务描述，包含风格信息和用户需求
        full_task = f"""
参照这个文案书写风格，输出小红书爆款文案：
# 风格信息

风格名称：{request.style_info.get('style_name')}
特征描述：{request.style_info.get('feature_desc')}
字数：{request.style_info.get('word_count')}

## 风格示例文稿

{request.style_info.get('example_content')}

# 其余要求：

{request.user_task}
    
请根据以上风格信息和用户其余需求，生成符合该风格的全新原创小红书种草文案。
"""

        # 运行copy_cat代理
        result = copycat_agent.run(full_task)
        result = result.split("CopycatAgent: ")[1]

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
        execution_time = time.time() - start_time
        logger.error(f"内容重写失败: {str(e)}")
        raise Exception(f"内容重写失败: {str(e)}")


async def analyze_urls(request: UrlAnalyzerRequest) -> UrlAnalyzerResponse:
    """
    通过小红书URL分析写作风格
    
    Args:
        request: URL分析请求数据
        
    Returns:
        UrlAnalyzerResponse: URL分析结果
    """
    logger.info("开始通过URL分析写作风格")
    start_time = time.time()
    
    try:
        # 从URL获取笔记内容
        logger.info(f"开始提取URL内容: {request.urls}")
        notes_data = await extract_note_content(request.urls)
        
        if not notes_data:
            raise Exception("无法从提供的URL中提取内容")
        
        # 转换为NoteContent对象
        notes = [
            NoteContent(
                url=note['url'],
                title=note['title'],
                content=note['content']
            )
            for note in notes_data
        ]
        
        logger.info(f"成功提取{len(notes)}篇笔记内容")
        
        # 对每篇笔记进行风格分析
        analyses = []
        tasks = []
        
        for i, note in enumerate(notes):
            logger.info(f"开始分析第{i+1}篇笔记: {note.title}")
            
            # 构建分析任务
            task = f"""
**文案标题**

{note.title}

**文案内容**

{note.content}
"""
            
            # 调用分析代理
            result = analyze_style_agent.run(task)
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