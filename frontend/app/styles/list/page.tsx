'use client';

import { useState, useEffect } from 'react';
import { styleApi } from '../../api';

interface Style {
  id: number;
  style_name: string;
  feature_desc: string;
  category: string;
  sample_title: string;
  sample_content: string;
  created_at: string;
}

export default function StyleListPage() {
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            风格列表
          </h1>
          <p className="text-gray-600">查看所有已分析的写作风格</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>{error}</p>
            </div>
          ) : styles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {styles.map((style) => (
                <div key={style.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{style.style_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{style.category}</p>
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(style.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-700 line-clamp-3">{style.feature_desc}</p>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-xs text-gray-500">示例标题:</p>
                    <p className="text-sm text-gray-700 truncate" title={style.sample_title}>{style.sample_title}</p>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">示例内容:</p>
                    <p className="text-sm text-gray-700 line-clamp-2" title={style.sample_content}>
                      {style.sample_content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>暂无风格数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}