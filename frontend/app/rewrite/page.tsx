'use client';

import { useState, useEffect } from 'react';
import { styleApi, rewriteApi } from '../api';

interface Style {
  id: number;
  style_name: string;
  feature_desc: string;
  category: string;
}

interface RewriteResult {
  title: string;
  content: string;
  tags: string;
}

export default function ContentRewritePage() {
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rewriteResult, setRewriteResult] = useState<RewriteResult | null>(null);
  
  // 表单状态
  const [formData, setFormData] = useState({
    style_id: 0,
    user_task: '',
    word_count: '',
  });

  // 获取风格列表
  const fetchStyles = async () => {
    try {
      const data = await styleApi.list();
      if (data.success) {
        setStyles(data.data);
        // 默认选择第一个风格
        if (data.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            style_id: data.data[0].id,
          }));
        }
      }
    } catch (err) {
      console.error('获取风格列表时发生错误:', err);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchStyles();
  }, []);

  // 处理表单变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'style_id' ? parseInt(value) : value,
    }));
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user_task.trim()) {
      setError('请填写具体需求');
      return;
    }

    if (!formData.style_id) {
      setError('请选择一个风格');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setRewriteResult(null);

      const result = await rewriteApi.rewrite(formData);

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
              <select
                name="style_id"
                value={formData.style_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                {styles.map(style => (
                  <option key={style.id} value={style.id}>
                    {style.style_name} - {style.feature_desc}
                  </option>
                ))}
              </select>
              {styles.length === 0 && (
                <p className="mt-1 text-sm text-gray-500">暂无可用风格，请先进行风格分析</p>
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