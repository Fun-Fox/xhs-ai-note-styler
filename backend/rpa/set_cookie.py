"""
设置Cookie的脚本
用于方便地设置小红书爬虫所需的Cookie
"""

from ..rpa.config import config_manager


def set_cookie():
    """
    设置Cookie
    """
    print("请输入小红书的Cookie:")
    print("(可以从浏览器开发者工具中获取，Network标签下任意请求的Request Headers中找到cookie字段)")
    print("示例格式: web_session=xxx; xhsTrackerId=xxx; ...")
    
    cookie = input("\n请输入Cookie: ").strip()
    
    if cookie:
        config_manager.set_cookie(cookie)
        print("\nCookie已成功保存到配置文件中!")
        print(f"配置文件路径: {config_manager.config_file}")
    else:
        print("\n未输入Cookie，操作已取消。")


if __name__ == "__main__":
    set_cookie()