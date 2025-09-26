"""
配置管理模块
用于存储和读取Cookie等设置信息
"""

import json
import os
import sys
from typing import Dict, Any

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

from backend.utils.logger import info

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
        self.config_file = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "rpa_settings.json"
        )

            
        # 确保配置文件所在目录存在
        config_dir = os.path.dirname(self.config_file)
        info(f"判断配置文件所在目录 : {config_dir}")
        if not os.path.exists(config_dir):
            os.makedirs(config_dir)
            
        # 默认配置
        self.default_config = {
            "cookie": "",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        # 加载配置
        self.config = self.load_config()
    
    def load_config(self) -> Dict[str, Any]:
        """
        加载配置文件
        
        Returns:
            Dict[str, Any]: 配置信息
        """
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                info(f"加载配置文件时出错: {e}")
                return self.default_config.copy()
        else:
            # 如果配置文件不存在，创建默认配置文件
            self.save_config(self.default_config)
            return self.default_config.copy()
    
    def save_config(self, config: Dict[str, Any]):
        """
        保存配置到文件
        
        Args:
            config (Dict[str, Any]): 配置信息
        """
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(config, f, ensure_ascii=False, indent=2)
        except Exception as e:
            info(f"保存配置文件时出错: {e}")
    
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


def save_setting(cookie: str):
    """
    保存设置信息
    
    Args:
        cookie (str): Cookie字符串
    """
    config_manager.set_cookie(cookie)
    info("设置已保存")


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