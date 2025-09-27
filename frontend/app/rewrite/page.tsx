'use client';

import { useState, useEffect, useMemo } from 'react';
import { styleApi, rewriteApi } from '../api';

interface Style {
  id: number;
  style_name: string;
  feature_desc: string;
  category: string;
  sample_title: string;
  sample_content: string;
  created_at: string;
}

export default function RewritePage() {
  // 表单数据状态
  const [formData, setFormData] = useState({
    style_id: 0,
    user_task: '',
    word_count: '',
  });
  
  // 页面状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 风格数据
  const [styles, setStyles] = useState<Style[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  
  // 搜索功能状态
  const [searchQuery, setSearchQuery] = useState('');
  
  // 重写结果
  const [rewriteResult, setRewriteResult] = useState<{
    title: string;
    content: string;
    tags: string;
  } | null>(null);

  // 获取风格列表
  const fetchStyles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await styleApi.list();
      
      if (data.success) {
        setStyles(data.data);
      } else {
        setError(data.message || '获取风格列表失败');
      }
    } catch (err) {
      setError('获取风格列表时发生错误');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchStyles();
  }, []);

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: name === 'style_id' ? parseInt(value) : value,
    });
    
    // 当风格选择变化时，更新选中的风格详情
    if (name === 'style_id') {
      const style = styles.find(s => s.id === parseInt(value));
      setSelectedStyle(style || null);
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.style_id === 0) {
      setError('请选择一个风格');
      return;
    }
    
    if (!formData.user_task.trim()) {
      setError('请输入具体需求');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const requestData = {
        style_id: formData.style_id,
        user_task: formData.user_task,
        word_count: formData.word_count || undefined,
      };
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/v1/rewrite/style/rewrite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess('内容生成成功');
        setRewriteResult({
          title: result.title,
          content: result.content,
          tags: result.tags,
        });
      } else {
        setError(result.message || '内容生成失败');
      }
    } catch (err) {
      setError('内容生成过程中发生错误');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 根据搜索查询过滤风格列表
  const filteredStyles = useMemo(() => {
    if (!searchQuery) return styles;
    
    return styles.filter(style => 
      style.style_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.feature_desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [styles, searchQuery]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">内容复写</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 输入区域 */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">生成设置</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                选择风格 *
              </label>
              
              {/* 搜索输入框 */}
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="搜索风格名称、分类或特征..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              
              {/* 带搜索功能的下拉选择框 */}
              <select
                name="style_id"
                value={formData.style_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value={0}>请选择风格</option>
                {filteredStyles.map(style => (
                  <option key={style.id} value={style.id}>
                    {style.style_name} - {style.category}
                  </option>
                ))}
              </select>
              
              {styles.length === 0 && (
                <p className="mt-1 text-sm text-gray-500">暂无可用风格，请先进行风格分析</p>
              )}
              
              {selectedStyle && (
                <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">风格特点</h4>
                      <p className="text-sm text-gray-600">{selectedStyle.feature_desc}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">推荐分类</h4>
                      <p className="text-sm text-gray-600">{selectedStyle.category}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">标题示例</h4>
                    <p className="text-sm text-gray-600 bg-white p-2 rounded border">{selectedStyle.sample_title}</p>
                  </div>
                  
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">内容示例</h4>
                    <p className="text-sm text-gray-600 bg-white p-2 rounded border whitespace-pre-wrap">{selectedStyle.sample_content}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                具体需求 *
              </label>
              <textarea
                name="user_task"
                value={formData.user_task}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="请输入具体的产品/服务信息和要求，例如：
产品：某某品牌面膜
要求：突出补水保湿功效，适合25+女性使用"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                字数要求
              </label>
              <input
                type="text"
                name="word_count"
                value={formData.word_count}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="例如: 300字左右、500字以内等"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || styles.length === 0}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  loading || styles.length === 0
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
              >
                {loading ? '生成中...' : '生成内容'}
              </button>
            </div>
          </form>
        </div>
        
        {/* 结果展示区域 */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">生成结果</h2>
          
          {rewriteResult ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">标题</h3>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium">{rewriteResult.title}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">内容</h3>
                <div className="p-3 bg-gray-50 rounded border whitespace-pre-wrap">
                  {rewriteResult.content}
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">标签</h3>
                <div className="p-3 bg-gray-50 rounded border">
                  <p>{rewriteResult.tags}</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `标题: ${rewriteResult.title}\n\n内容: ${rewriteResult.content}\n\n标签: ${rewriteResult.tags}`
                    );
                    setSuccess('已复制到剪贴板');
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                  复制全部
                </button>
                <button
                  onClick={() => setRewriteResult(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  清空结果
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>生成的内容将在此处显示</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}