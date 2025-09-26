import json
import os.path
# from swarms_memory import ChromaDB
from swarms.structs import AgentLoader
from dotenv import load_dotenv
import litellm
import sys

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

from backend.db import style_analysis_service
from backend.utils.logger import info, error

load_dotenv()

# 设置代理
litellm.proxy_list = [
    {
        "http": "http://127.0.0.1:10401",
        "https": "http://127.0.0.1:10401"
    }
]

tools = [
    {
        "type": "function",
        "function": {
            "name": "analyze_style",
            "description": "写作风格分析专家",
            "parameters": {
                "type": "object",
                "properties": {
                    "style_name": {
                        "type": "string",
                        "description": "风格名称"
                    },
                    "feature_desc": {
                        "type": "string",
                        "description": "一句话说明文案特征"
                    },
                    "category": {
                        "type": "string",
                        "description": "推荐类别，使用-号分割"
                    }
                },
                "required": [
                    "style_name", "feature_desc", "category",
                ]
            }
        }
    }
]

loader = AgentLoader()
root_dir = os.path.dirname(__file__)
agent_md = os.path.join(root_dir,"prompt", "style_analyzer.md")
# Initialize ChromaDB memory
# chromadb_memory = ChromaDB(
#     metric="cosine",
#     output_dir="finance_agent_rag",
# )

def get_analyze_style_agent():
    """
    获取分析风格的Agent实例
    
    Returns:
        Agent: 分析风格的Agent实例
    """
    # 创建Agent实例
    analyze_style_agent = loader.load_agent_from_markdown(
        file_path=agent_md,
        tools_list_dictionary=tools,
    )
    return analyze_style_agent


async def save_analysis_result_async(arguments_dict: dict, sample_title: str, sample_content: str):
    """
    保存分析结果到数据库
    
    Args:
        arguments_dict: 包含style_name, feature_desc, category的字典
        sample_title: 样本文案标题
        sample_content: 样本文案内容
    """
    try:
        # 保存到数据库
        style_analysis = style_analysis_service.create_style_analysis(
            style_name=arguments_dict['style_name'],
            feature_desc=arguments_dict['feature_desc'],
            category=arguments_dict['category'],
            sample_title=sample_title,
            sample_content=sample_content
        )
        info(f"分析结果已保存到数据库，ID: {style_analysis.id}")
        return style_analysis
    except Exception as e:
        error(f"保存分析结果到数据库时出错: {e}")
        return None


def analyze_sample_content(title: str, content: str):
    """
    分析样本文案并保存结果到数据库
    
    Args:
        title (str): 文案标题
        content (str): 文案内容
        
    Returns:
        dict: 分析结果
    """
    task = f"""
**文案标题**

{title}

**文案内容**

{content}
"""

    # 获取agent实例
    agent = get_analyze_style_agent()
    
    result = agent.run(task)
    result = result.split("StyleAnalyzer: ")[1]

    import ast

    try:
        # 将单引号替换为双引号
        data = ast.literal_eval(result)

        # 解析arguments中的JSON字符串
        arguments_str = data[0]['function']['arguments']
        arguments_dict = json.loads(arguments_str)

        info("\n=== 风格分析结果 ===")
        info(f"风格名称: {arguments_dict['style_name']}")
        info(f"分类: {arguments_dict['category']}")
        info(f"特征描述: {arguments_dict['feature_desc']}")
        
        # 保存分析结果到数据库
        save_analysis_result_async(arguments_dict, title, task)
        
        return arguments_dict

    except Exception as e:
        error(f"解析过程中出错: {e}")
        import traceback
        traceback.print_exc()
        return None


# 示例使用

if __name__ == "__main__":
    # 示例用法
    example_title = "中医养生风"
    example_content = """
杭州神阙学堂的中医课程，是杭州神阙学堂的 flagship课程，以个人经历分享中医养生知识，语言亲切自然。
1. 介绍中医的基本概念和原理
2. 介绍中医的常用工具和仪器
3. 介绍中医的常用方法
"""

    result = analyze_sample_content(example_title, example_content)
    if result:
        info("\n=== 分析完成 ===")
        info(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        info("\n=== 分析失败 ===")