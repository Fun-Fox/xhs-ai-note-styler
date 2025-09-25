"""
数据库初始化脚本
用于初始化SQLite数据库
"""

from db.db_models import init_database
import os


def initialize_database():
    """
    初始化数据库
    """
    print("正在初始化数据库...")
    try:
        engine = init_database()
        print(f"数据库初始化成功!")
        print(f"数据库路径: {os.path.abspath(engine.url.database)}")
    except Exception as e:
        print(f"数据库初始化失败: {e}")


if __name__ == "__main__":
    initialize_database()