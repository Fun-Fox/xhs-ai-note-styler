# 小红书内容风格分析、内容题材管理、内容二创

Agent基于[swarms](https://docs.swarms.world/)框架实现

![](/doc/1.png)
![](/doc/2.png)
![](/doc/3.png)

## 项目概述

本项目是一个智能内容创作工具，专门用于分析小红书平台的爆款内容风格，并基于分析结果进行内容二创。系统提供内容题材管理功能，帮助用户更好地组织和规划内容创作。

## 后端接口说明

### 1. 风格分析相关接口

#### 1.1 分析单篇内容风格
- **URL**: `/api/v1/style/style/analyze`
- **方法**: POST
- **描述**: 分析单篇小红书内容的写作风格
- **请求参数**:
  - `title` (string): 文案标题
  - `content` (string): 文案内容
- **响应**:
  - `success` (bool): 是否成功
  - `analysis` (object): 风格分析结果
    - `style_name` (string): 风格名称
    - `feature_desc` (string): 风格特征描述
    - `category` (string): 分类
  - `execution_time` (float): 执行时间
  - `id` (int): 分析结果ID

#### 1.2 分析URL中多个笔记风格
- **URL**: `/api/v1/style/style/analyze-urls`
- **方法**: POST
- **描述**: 分析指定URL中多个小红书笔记的写作风格
- **请求参数**:
  - `url` (string): 小红书链接
  - `max_notes` (int, optional): 最大分析笔记数
- **响应**:
  - `success` (bool): 是否成功
  - `notes` (array): 提取的笔记列表
  - `analyses` (array): 分析结果列表
  - `execution_time` (float): 执行时间

### 2. 内容仿写相关接口

#### 2.1 根据指定风格重写内容
- **URL**: `/api/v1/rewrite/style/rewrite`
- **方法**: POST
- **描述**: 根据指定风格重写内容，生成新的小红书文案
- **请求参数**:
  - `style_id` (int): 风格分析ID
  - `user_task` (string): 用户具体需求
- **响应**:
  - `success` (bool): 是否成功
  - `title` (string): 生成的文案标题
  - `content` (string): 生成的文案内容
  - `tags` (string): 生成的标签
  - `execution_time` (float): 执行时间

### 3. 内容选题管理接口

#### 3.1 创建新选题
- **URL**: `/api/v1/topic/create`
- **方法**: POST
- **描述**: 创建新的一级、二级或三级选题
- **请求参数**:
  - `name` (string): 选题名称
  - `level` (int): 选题级别（1-3）
  - `parent_id` (int, optional): 父级选题ID
  - `description` (string, optional): 选题描述
  - `style_ids` (array, optional): 关联的风格ID列表
- **响应**:
  - `success` (bool): 是否成功
  - `data` (object): 创建的选题信息
  - `message` (string): 响应消息

#### 3.2 获取单个选题信息
- **URL**: `/api/v1/topic/get/{topic_id}`
- **方法**: GET
- **描述**: 获取指定ID的选题详细信息
- **路径参数**:
  - `topic_id` (int): 选题ID
- **响应**:
  - `success` (bool): 是否成功
  - `data` (object): 选题信息
  - `message` (string): 响应消息

#### 3.3 更新选题信息
- **URL**: `/api/v1/topic/update/{topic_id}`
- **方法**: PUT
- **描述**: 更新指定选题的信息
- **路径参数**:
  - `topic_id` (int): 选题ID
- **请求参数**:
  - `name` (string, optional): 选题名称
  - `parent_id` (int, optional): 父级选题ID
  - `description` (string, optional): 选题描述
  - `style_ids` (array, optional): 关联的风格ID列表
- **响应**:
  - `success` (bool): 是否成功
  - `data` (object): 更新后的选题信息
  - `message` (string): 响应消息

#### 3.4 删除选题
- **URL**: `/api/v1/topic/delete/{topic_id}`
- **方法**: DELETE
- **描述**: 删除指定的选题
- **路径参数**:
  - `topic_id` (int): 选题ID
- **响应**:
  - `success` (bool): 是否成功
  - `message` (string): 响应消息

#### 3.5 列出选题
- **URL**: `/api/v1/topic/list`
- **方法**: GET
- **描述**: 获取选题列表，支持按级别和父级筛选
- **查询参数**:
  - `level` (int, optional): 选题级别
  - `parent_id` (int, optional): 父级选题ID
- **响应**:
  - `success` (bool): 是否成功
  - `data` (array): 选题列表
  - `message` (string): 响应消息

#### 3.6 获取选题层级结构
- **URL**: `/api/v1/topic/hierarchy`
- **方法**: GET
- **描述**: 获取选题的层级结构
- **查询参数**:
  - `parent_id` (int, optional): 父级选题ID
- **响应**:
  - `success` (bool): 是否成功
  - `data` (array): 层级结构数据
  - `message` (string): 响应消息

#### 3.7 获取所有风格列表
- **URL**: `/api/v1/topic/style/list`
- **方法**: GET
- **描述**: 获取所有已分析的风格列表
- **响应**:
  - `success` (bool): 是否成功
  - `data` (array): 风格列表
  - `message` (string): 响应消息

#### 3.8 获取选题关联的风格列表
- **URL**: `/api/v1/topic/style/associated/{topic_id}`
- **方法**: GET
- **描述**: 获取指定选题关联的风格列表
- **路径参数**:
  - `topic_id` (int): 选题ID
- **响应**:
  - `success` (bool): 是否成功
  - `data` (array): 关联的风格列表
  - `message` (string): 响应消息

## 业务流程说明

### 1. 风格分析流程

1. 用户提供单篇小红书内容或小红书链接
2. 系统提取内容文本
3. 调用AI代理分析内容的写作风格
4. 将分析结果保存到数据库
5. 返回分析结果给用户

### 2. 内容仿写流程

1. 用户选择已分析的风格ID
2. 用户提供具体的产品/服务信息和要求
3. 系统根据选定风格和用户需求生成新的小红书文案
4. 返回生成的文案（标题、内容、标签）给用户

### 3. 内容选题管理流程

1. 用户创建不同级别的选题（一级、二级、三级）
2. 可以为选题关联已分析的内容风格
3. 用户可以查看选题的层级结构
4. 支持对选题进行增删改查操作
5. 可以查看选题关联的风格列表

### 4. 整体业务流程

1. **内容收集**: 通过URL或手动输入获取小红书内容
2. **风格分析**: 分析内容的写作特点和风格
3. **选题规划**: 创建和管理内容选题，关联分析出的风格
4. **内容创作**: 基于选题和风格生成新的原创内容
5. **内容优化**: 根据需要调整和优化生成的内容

## 数据模型

### 1. 风格分析模型 (StyleAnalysis)
- `id`: 主键
- `style_name`: 风格名称
- `feature_desc`: 风格特征描述
- `category`: 分类
- `sample_title`: 样本文案标题
- `sample_content`: 样本文案内容
- `created_at`: 创建时间

### 2. 内容选题模型 (Topic)
- `id`: 主键
- `name`: 选题名称
- `level`: 选题级别（1-3）
- `parent_id`: 父级选题ID
- `description`: 选题描述
- `created_at`: 创建时间

### 3. 选题风格关联模型 (TopicStyleAssociation)
- `id`: 主键
- `topic_id`: 选题ID
- `style_id`: 风格ID
- `created_at`: 创建时间

## 技术架构

- **后端框架**: FastAPI
- **数据库**: SQLite
- **AI框架**: 基于swarms框架实现的智能代理
- **异步支持**: 支持异步操作提高性能

## 部署说明

1. 安装依赖: `pip install -r requirements.txt`
2. 运行应用: `python backend/main.py`
3. 访问API文档: `http://localhost:8000/docs`