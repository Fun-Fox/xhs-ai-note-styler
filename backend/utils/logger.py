"""
日志管理模块
提供统一的日志记录功能
"""

import logging
import os
from logging.handlers import RotatingFileHandler


class LoggerManager:
    """
    日志管理类
    """
    
    def __init__(self, name: str = "xhs_ai_note_styler", log_level: int = logging.INFO):
        """
        初始化日志管理器
        
        Args:
            name (str): 日志记录器名称
            log_level (int): 日志级别
        """
        self.logger = logging.getLogger(name)
        self.logger.setLevel(log_level)
        
        # 避免重复添加处理器
        if not self.logger.handlers:
            self._setup_handlers()
    
    def _setup_handlers(self):
        """
        设置日志处理器
        """
        # 创建logs目录（如果不存在）
        log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "logs")
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
        
        # 文件处理器（带轮转）
        file_handler = RotatingFileHandler(
            os.path.join(log_dir, "app.log"),
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5,
            encoding='utf-8'  # 显式指定UTF-8编码，避免Windows上的GBK编码错误
        )
        file_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
        )
        file_handler.setFormatter(file_formatter)
        
        # 控制台处理器
        console_handler = logging.StreamHandler()
        console_formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(console_formatter)
        
        # 添加处理器到logger
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)
    
    def debug(self, message: str):
        """
        记录debug级别日志
        
        Args:
            message (str): 日志消息
        """
        self.logger.debug(message)
    
    def info(self, message: str):
        """
        记录info级别日志
        
        Args:
            message (str): 日志消息
        """
        self.logger.info(message)
    
    def warning(self, message: str):
        """
        记录warning级别日志
        
        Args:
            message (str): 日志消息
        """
        self.logger.warning(message)
    
    def error(self, message: str):
        """
        记录error级别日志
        
        Args:
            message (str): 日志消息
        """
        self.logger.error(message)
    
    def critical(self, message: str):
        """
        记录critical级别日志
        
        Args:
            message (str): 日志消息
        """
        self.logger.critical(message)


# 创建全局日志管理器实例
logger_manager = LoggerManager()

# 为方便使用，创建直接调用的函数
def debug(message: str):
    logger_manager.debug(message)

def info(message: str):
    logger_manager.info(message)

def warning(message: str):
    logger_manager.warning(message)

def error(message: str):
    logger_manager.error(message)

def critical(message: str):
    logger_manager.critical(message)