"""
数据库初始化脚本
用于初始化SQLite数据库
"""

from .db_models import init_database
import os
import sys
import os

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

from backend.utils import info, error


def initialize_database():
    """
    初始化数据库
    """
    info("正在初始化数据库...")
    try:
        engine = init_database()
        info("数据库初始化成功!")
        info(f"数据库路径: {os.path.abspath(engine.url.database)}")
    except Exception as e:
        error(f"数据库初始化失败: {e}")


if __name__ == "__main__":
    initialize_database()