import json

import litellm
from swarms.structs import AgentLoader
from dotenv import load_dotenv
import os

# 添加项目根目录到Python路径

from backend.utils import info, error

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
            "name": "copy_cat",
            "description": "小红书爆款风格种草文案生成专家",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "小红书爆款文案标题"
                    },
                    "content": {
                        "type": "string",
                        "description": "小红书爆款文案内容"
                    },
                    "tags": {
                        "type": "string",
                        "description": "小红书爆款文案标签（使用#号开头，空格进行间隔）"
                    }
                },
                "required": [
                    "title", "content", "tags",
                ]
            }
        }
    }
]
# 加载CopycatAgent
loader = AgentLoader()
current_dir = os.path.dirname(__file__)
agent_md = os.path.join(current_dir,"prompt", "copy_cat.md")


def get_copycat_agent():
    """
    创建并返回copycat_agent实例
    
    Returns:
        Agent: copycat_agent实例
    """
    # 创建Agent实例
    copycat_agent = loader.load_agent_from_markdown(
        file_path=agent_md,
        tools_list_dictionary=tools,
    )
    
    return copycat_agent


def run_copycat_agent(style_info, user_task):
    """
    运行CopycatAgent来生成文案
    
    Args:
        style_info (dict): 已分析的风格信息
        user_task
    Returns:
        str: 生成的文案内容
    """
    # 构造完整的任务描述，包含风格信息和用户需求
    full_task = f"""
参照这个文案书写风格，输出小红书爆款文案：
# 风格信息

风格名称：{style_info.get('style_name')}
特征描述：{style_info.get('feature_desc')}
字数：{style_info.get('word_count')}

## 风格示例文稿

{style_info.get('example_content')}

# 其余要求：

{user_task}
    
请根据以上风格信息和用户其余需求，生成符合该风格的全新原创小红书种草文案。
"""

    # 获取agent实例
    agent = get_copycat_agent()
    
    # 运行Agent
    result = agent.run(full_task)

    result = result.split("CopycatAgent: ")[1]

    return result


if __name__ == "__main__":
    # 示例用法
    example_style_info = {
        "style_name": "中医养生风",
        "feature_desc": "以个人经历分享中医养生知识，语言亲切自然",
        "word_count": "111",
        "example_content": """
杭州神阙学堂的中医课程，是杭州神阙学堂的 flagship课程，以个人经历分享中医养生知识，语言亲切自然。
1. 介绍中医的基本概念和原理
2. 介绍中医的常用工具和仪器
3. 介绍中医的常用方法
"""
    }

    example_user_task = """
产品：杭州神阙学堂的中医课程
要求：突出课程的专业性和实用性，吸引对中医感兴趣的用户报名
"""

    result = run_copycat_agent(example_style_info, example_user_task)
    info("=== 生成的文案 ===")
    info(result)

    import ast

    # print(json.loads(result))
    try:
        # 将单引号替换为双引号
        data = ast.literal_eval(result)

        # 解析arguments中的JSON字符串
        arguments_str = data[0]['function']['arguments']
        arguments_dict = json.loads(arguments_str)

        info("\n=== 爆款文案 ===")
        info(f"文案标题: {arguments_dict['title']}")
        info(f"文案内容: {arguments_dict['content']}")
        info(f"文案标签: {arguments_dict['tags']}")

    except Exception as e:
        error(f"解析过程中出错: {e}")
        import traceback

        traceback.print_exc()