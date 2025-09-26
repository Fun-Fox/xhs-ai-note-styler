'use client';

import { useState, useEffect } from 'react';
import { topicApi, styleApi } from '../api';

interface Topic {
  id: number;
  name: string;
  level: number;
  parent_id: number | null;
  description: string | null;
  created_at: string;
}

interface Style {
  id: number;
  style_name: string;
  feature_desc: string;
  category: string;
}

export default function TopicManagement() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    level: 1,
    parent_id: 0,
    description: '',
    style_ids: [] as number[],
  });

  // 获取选题列表
  const fetchTopics = async () => {
    try {
      setLoading(true);
      const data = await topicApi.list();
      if (data.success) {
        setTopics(data.data);
      } else {
        setError(data.message || '获取选题列表失败');
      }
    } catch (err) {
      setError('获取选题列表时发生错误');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 获取风格列表
  const fetchStyles = async () => {
    try {
      const data = await styleApi.list();
      if (data.success) {
        setStyles(data.data);
      }
    } catch (err) {
      console.error('获取风格列表时发生错误:', err);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchTopics();
    fetchStyles();
  }, []);

  // 打开创建选题模态框
  const openCreateModal = () => {
    setFormData({
      name: '',
      level: 1,
      parent_id: 0,
      description: '',
      style_ids: [],
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // 打开编辑选题模态框
  const openEditModal = (topic: Topic) => {
    setSelectedTopic(topic);
    setFormData({
      name: topic.name,
      level: topic.level,
      parent_id: topic.parent_id || 0,
      description: topic.description || '',
      style_ids: [], // 需要获取选题关联的风格
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // 关闭模态框
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTopic(null);
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'level' || name === 'parent_id' ? parseInt(value) : value,
    });
  };

  // 处理复选框变化
  const handleCheckboxChange = (styleId: number) => {
    setFormData(prev => {
      const newStyleIds = prev.style_ids.includes(styleId)
        ? prev.style_ids.filter(id => id !== styleId)
        : [...prev.style_ids, styleId];
      
      return {
        ...prev,
        style_ids: newStyleIds,
      };
    });
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = isEditing
        ? await topicApi.update(selectedTopic?.id || 0, {
            ...formData,
            parent_id: formData.parent_id || null,
          })
        : await topicApi.create({
            ...formData,
            parent_id: formData.parent_id || null,
          });
      
      if (result.success) {
        closeModal();
        fetchTopics(); // 重新获取选题列表
      } else {
        setError(result.message || (isEditing ? '更新选题失败' : '创建选题失败'));
      }
    } catch (err) {
      setError(isEditing ? '更新选题时发生错误' : '创建选题时发生错误');
      console.error(err);
    }
  };

  // 删除选题
  const handleDelete = async (topicId: number) => {
    if (!confirm('确定要删除这个选题吗？')) {
      return;
    }
    
    try {
      const result = await topicApi.delete(topicId);
      
      if (result.success) {
        fetchTopics(); // 重新获取选题列表
      } else {
        setError(result.message || '删除选题失败');
      }
    } catch (err) {
      setError('删除选题时发生错误');
      console.error(err);
    }
  };

  // 获取选题的层级名称
  const getLevelName = (level: number) => {
    switch (level) {
      case 1: return '一级选题';
      case 2: return '二级选题';
      case 3: return '三级选题';
      default: return '未知级别';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">内容选题管理</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
        >
          新建选题
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  选题名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  级别
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  父级选题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  描述
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topics.map((topic) => (
                <tr key={topic.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {topic.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getLevelName(topic.level)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {topic.parent_id || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {topic.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(topic.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(topic)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(topic.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {topics.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无选题数据
            </div>
          )}
        </div>
      )}

      {/* 创建/编辑选题模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditing ? '编辑选题' : '新建选题'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    选题名称 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    级别 *
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value={1}>一级选题</option>
                    <option value={2}>二级选题</option>
                    <option value={3}>三级选题</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    父级选题
                  </label>
                  <select
                    name="parent_id"
                    value={formData.parent_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value={0}>无父级</option>
                    {topics
                      .filter(topic => topic.level < formData.level)
                      .map(topic => (
                        <option key={topic.id} value={topic.id}>
                          {topic.name}
                        </option>
                      ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    关联风格
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {styles.length > 0 ? (
                      styles.map(style => (
                        <div key={style.id} className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            id={`style-${style.id}`}
                            checked={formData.style_ids.includes(style.id)}
                            onChange={() => handleCheckboxChange(style.id)}
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                          <label htmlFor={`style-${style.id}`} className="ml-2 text-sm text-gray-700">
                            {style.style_name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">暂无可用风格</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {isEditing ? '更新' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}