"""
设置Cookie的脚本
用于方便地设置小红书爬虫所需的Cookie
"""

import sys
import os

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

from backend.rpa.config import config_manager
from backend.utils.logger import info


def set_cookie():
    """
    设置Cookie
    """
    info("请输入小红书的Cookie:")
    info("(可以从浏览器开发者工具中获取，Network标签下任意请求的Request Headers中找到cookie字段)")
    info("示例格式: web_session=xxx; xhsTrackerId=xxx; ...")
    
    cookie = input("\n请输入Cookie: ").strip()
    
    if cookie:
        config_manager.set_cookie(cookie)
        info("\nCookie已成功保存到配置文件中!")
        info(f"配置文件路径: {config_manager.config_file}")
    else:
        info("\n未输入Cookie，操作已取消。")


if __name__ == "__main__":
    set_cookie()