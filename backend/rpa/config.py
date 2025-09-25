"""
配置管理模块
用于存储和读取Cookie等设置信息
"""

import json
import os


class ConfigManager:
    """
    配置管理器
    """
    
    def __init__(self, config_file="rpa_config.json"):
        """
        初始化配置管理器
        
        Args:
            config_file (str): 配置文件名
        """
        # 获取项目根目录
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        # 配置文件路径
        self.config_file = os.path.join(project_root, config_file)
        # 确保配置文件存在
        self._ensure_config_file()
    
    def _ensure_config_file(self):
        """
        确保配置文件存在，如果不存在则创建一个默认配置文件
        """
        if not os.path.exists(self.config_file):
            default_config = {
                "cookie": "",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
            self.save_config(default_config)
    
    def save_config(self, config_data):
        """
        保存配置到文件
        
        Args:
            config_data (dict): 配置数据
        """
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(config_data, f, indent=4, ensure_ascii=False)
        except Exception as e:
            print(f"保存配置文件时出错: {e}")
    
    def load_config(self):
        """
        从文件加载配置
        
        Returns:
            dict: 配置数据
        """
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            # 如果文件不存在，创建默认配置
            self._ensure_config_file()
            return self.load_config()
        except Exception as e:
            print(f"读取配置文件时出错: {e}")
            return {}
    
    def set_cookie(self, cookie):
        """
        设置Cookie
        
        Args:
            cookie (str): Cookie字符串
        """
        config = self.load_config()
        config["cookie"] = cookie
        self.save_config(config)
    
    def get_cookie(self):
        """
        获取Cookie
        
        Returns:
            str: Cookie字符串
        """
        config = self.load_config()
        return config.get("cookie", "")
    
    def set_user_agent(self, user_agent):
        """
        设置User-Agent
        
        Args:
            user_agent (str): User-Agent字符串
        """
        config = self.load_config()
        config["user_agent"] = user_agent
        self.save_config(config)
    
    def get_user_agent(self):
        """
        获取User-Agent
        
        Returns:
            str: User-Agent字符串
        """
        config = self.load_config()
        return config.get("user_agent", "")


# 创建全局配置管理器实例
config_manager = ConfigManager()


def save_setting(cookie=""):
    """
    保存设置信息
    
    Args:
        cookie (str): Cookie字符串
    """
    config_manager.set_cookie(cookie)
    print("设置已保存")


def read_setting():
    """
    读取设置信息
    
    Returns:
        dict: 设置信息
    """
    return {
        "cookie": config_manager.get_cookie(),
        "user_agent": config_manager.get_user_agent()
    }


# 示例用法
if __name__ == "__main__":
    # 保存Cookie
    save_setting("your_cookie_here")
    
    # 读取设置
    settings = read_setting()
    print("当前设置:", settings)