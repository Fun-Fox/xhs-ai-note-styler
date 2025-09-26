'use client';

import { useState } from 'react';
import { styleApi } from '../api';

interface StyleAnalysis {
  id: number;
  style_name: string;
  feature_desc: string;
  category: string;
  sample_title: string;
  sample_content: string;
  created_at: string;
}

export default function StyleAnalysisPage() {
  const [activeTab, setActiveTab] = useState<'single' | 'url'>('url');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<StyleAnalysis | null>(null);
  
  // 单篇内容分析表单状态
  const [singleContent, setSingleContent] = useState({
    title: '',
    content: '',
  });
  
  // URL分析表单状态
  const [urlContent, setUrlContent] = useState({
    urls: '',
  });

  // 处理URL分析表单变化
  const handleUrlContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUrlContent(prev => ({
        ...prev,
        [name]: value,
    }));
  };

  // 提交URL分析
  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlContent.urls.trim()) {
        setError('URL不能为空');
        return;
    }

    try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const result = await styleApi.analyzeUrls(urlContent);

        if (result.success) {
            setSuccess(`成功分析 ${result.analyses?.length || 0} 篇笔记`);
            
            // 存储完整的分析结果
            setAnalysisResult(result);
        } else {
            setError(result.message || 'URL分析失败');
        }
    } catch (err) {
        setError('URL分析过程中发生错误');
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            内容风格分析
          </h1>
          <p className="text-gray-600">智能分析小红书笔记风格特征</p>
        </div>

        {/* 通知消息 */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          </div>
        )}

        {/* 标签页 */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('url')}
              className={`py-3 px-6 font-medium text-sm transition-colors duration-200 flex-1 text-center ${
                activeTab === 'url'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              输入笔记URL进行分析
            </button>
          </div>
        </div>

        {/* URL批量分析表单 */}
        {activeTab === 'url' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">分析URL中的笔记</h2>
            </div>
            
            <form onSubmit={handleSubmitUrl} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  小红书链接 *
                </label>
                <div className="relative">
                  <input
                    type="urls"
                    name="urls"
                    value={urlContent.urls}
                    onChange={handleUrlContentChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-black"
                    placeholder="请输入小红书链接"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  例如: https://www.xiaohongshu.com/discovery/item/...
                </p>
              </div>
            
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full sm:w-auto sm:min-w-[120px] px-6 py-3 text-base font-medium text-white rounded-lg transition-all duration-200 flex items-center justify-center ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed opacity-80' 
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      分析中...
                    </>
                  ) : '开始分析'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* 添加分析结果展示 */}
        {analysisResult && (
            <div className="mt-8 bg-white shadow-md rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">分析结果</h2>
                
                {/* 笔记详情 */}
                {analysisResult.notes && analysisResult.notes.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-md font-medium text-gray-700 mb-3">笔记详情</h3>
                        <div className="space-y-4">
                            {analysisResult.notes.map((note, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <p className="font-medium text-gray-800">{note.title}</p>
                                    <p className="text-gray-600 mt-1">{note.content}</p>
                                    <p className="text-sm text-gray-500 mt-2">URL: {note.url}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* 分析结果 */}
                {analysisResult.analyses && analysisResult.analyses.length > 0 && (
                    <div>
                        <h3 className="text-md font-medium text-gray-700 mb-3">风格分析</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analysisResult.analyses.map((analysis, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium text-gray-800">{analysis.style_name}</p>
                                    <p className="text-sm text-gray-600 mt-1">{analysis.feature_desc}</p>
                                    <p className="text-xs text-gray-500 mt-1">{analysis.category}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}