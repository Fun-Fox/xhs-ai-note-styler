import json
import os.path
# from swarms_memory import ChromaDB
from swarms.structs import AgentLoader
from dotenv import load_dotenv
import litellm
import sys
import os

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

from ..db.style_service import style_analysis_service

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
current_dir = os.path.dirname(__file__)
agent_md = os.path.join(current_dir,"prompt", "style_analyzer.md")


def get_analyze_style_agent():
    """
    创建并返回analyze_style_agent实例
    
    Returns:
        Agent: analyze_style_agent实例
    """
    # Initialize ChromaDB memory
    # chromadb_memory = ChromaDB(
    #     metric="cosine",
    #     output_dir="finance_agent_rag",
    # )
    
    analyze_style_agent = loader.load_agent_from_markdown(
        file_path=agent_md,
        tools_list_dictionary=tools,
        # long_term_memory = chromadb_memory,
    )
    
    return analyze_style_agent


async def save_analysis_result_async(arguments_dict: dict, sample_title: str, sample_content: str):
    """
    异步保存分析结果到数据库
    
    Args:
        arguments_dict: 包含style_name, feature_desc, category的字典
        sample_title: 样本文案标题
        sample_content: 样本文案内容
    """
    try:
        # 异步保存到数据库
        style_analysis = await style_analysis_service.create_style_analysis_async(
            style_name=arguments_dict['style_name'],
            feature_desc=arguments_dict['feature_desc'],
            category=arguments_dict['category'],
            sample_title=sample_title,
            sample_content=sample_content
        )
        print(f"分析结果已保存到数据库，ID: {style_analysis.id}")
        return style_analysis
    except Exception as e:
        print(f"保存分析结果到数据库时出错: {e}")
        return None


def save_analysis_result(arguments_dict: dict, sample_title: str, sample_content: str):
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
        print(f"分析结果已保存到数据库，ID: {style_analysis.id}")
        return style_analysis
    except Exception as e:
        print(f"保存分析结果到数据库时出错: {e}")
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

        print("\n=== 风格分析结果 ===")
        print(f"风格名称: {arguments_dict['style_name']}")
        print(f"分类: {arguments_dict['category']}")
        print(f"特征描述: {arguments_dict['feature_desc']}")
        
        # 保存分析结果到数据库
        save_analysis_result(arguments_dict, title, task)
        
        return arguments_dict

    except Exception as e:
        print(f"解析过程中出错: {e}")
        import traceback
        traceback.print_exc()
        return None


# 示例使用
sample_title = "和中医老公学中医后，工作都没了"
sample_content = """和中医老公学中医后，工作都没了，中医说人应该在滋养自己的人和事在一起，这些年，老公一直在鼓励我离职！于是，在我33岁的时候我就离职啦！离职后开了一个中翳学堂，和好多可爱的中翳老师们一起学习，和很多有爱的中翳爱好者一起交流～

#学了中医才知道 #杭州中医爱好者 #杭州神阙学堂 #杭州学中医 #中医养生 #杭州学习中医 #杭州中医学习 #自学中医 #杭州中医搭子 #中医学习搭子"""


if __name__ == "__main__":
    analyze_sample_content(sample_title, sample_content)