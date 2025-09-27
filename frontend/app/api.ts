// API请求处理模块
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Topic相关接口
export const topicApi = {
  // 获取选题层级结构
  hierarchy: async (parentId?: number) => {
    const url = parentId 
      ? `${API_BASE_URL}/api/v1/topic/hierarchy?parent_id=${parentId}`
      : `${API_BASE_URL}/api/v1/topic/hierarchy`;
    const response = await fetch(url);
    return response.json();
  },

  // 获取选题关联的风格列表
  associatedStyles: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/topic/style/associated/${id}`);
    return response.json();
  },

  // 创建新选题
  create: async (data: { name: string; level: number; parent_id: number | null; description: string | null }) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/topic/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // 更新选题信息
  update: async (id: number, data: { name: string; level: number; parent_id: number | null; description: string | null }) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/topic/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // 删除选题
  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/topic/delete/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // 关联风格
  associateStyle: async (topicId: number, styleId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/topic/associate-style`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic_id: topicId,
        style_id: styleId
      }),
    });
    return response.json();
  },
  
  // 获取风格列表
  styleList: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/topic/style/list`);
    return response.json();
  }
};

// Style相关接口
export const styleApi = {
  // 分析单篇内容风格
  analyze: async (data: { title: string; content: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/style/style/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // 分析URL中多个笔记风格
  analyzeUrls: async (data: { urls: string}) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/style/style/analyze-urls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // 获取所有风格列表
  list: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/topic/style/list`);
    return response.json();
  }
};

// Rewrite相关接口
export const rewriteApi = {
  // 根据指定风格重写内容
  rewrite: async (data: { style_id: number; user_task: string; word_count?: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/rewrite/style/rewrite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  // 获取重写记录列表
  listRecords: async (params: { page: number; page_size: number }) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/rewrite/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return response.json();
  }
};