'use client';

import { useState, useEffect } from 'react';
import { topicApi } from '../api';

/**
 * 选题接口定义
 */
interface Topic {
  id: number;
  name: string;
  level: number;
  parent_id: number | null;
  description: string | null;
  created_at: string;
  children?: Topic[];
}

/**
 * 风格接口定义
 */
interface Style {
  id: number;
  style_name: string;
  feature_desc: string;
  category: string;
  sample_title: string;
  sample_content: string;
  created_at: string;
}

/**
 * 选题管理主组件
 */
export default function TopicManagement() {
  // 选题数据状态
  const [topics, setTopics] = useState<Topic[]>([]);
  
  // 当前选中的选题
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  
  // 控制模态框显示状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 控制编辑/创建模式
  const [isEditing, setIsEditing] = useState(false);
  
  // 加载状态
  const [loading, setLoading] = useState(true);
  
  // 错误信息
  const [error, setError] = useState<string | null>(null);
  
  // 控制树节点展开/收起状态
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});
  
  // 存储选题关联的风格列表
  const [associatedStyles, setAssociatedStyles] = useState<any[]>([]);
  
  // 控制风格面板显示状态
  const [isStylePanelVisible, setIsStylePanelVisible] = useState(false);

  // 表单数据状态
  const [formData, setFormData] = useState({
    name: '',
    level: 1,
    parent_id: 0,
    description: '',
  });

  /**
   * 获取选题层级结构数据
   */
  const fetchTopicHierarchy = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await topicApi.hierarchy();
      
      if (data.success) {
        setTopics(data.data);
      } else {
        setError(data.message || '获取选题层级结构失败');
      }
    } catch (err) {
      setError('获取选题层级结构时发生错误');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取选题关联的风格列表
   * @param topicId 选题ID
   */
  const fetchAssociatedStyles = async (topicId: number) => {
    try {
      const data = await topicApi.associatedStyles(topicId);
      if (data.success) {
        setAssociatedStyles(data.data);
      } else {
        setError(data.message || '获取关联风格列表失败');
      }
    } catch (err) {
      setError('获取关联风格列表时发生错误');
      console.error(err);
    }
  };

  /**
   * 处理选题选择事件
   * @param topic 选中的选题对象
   */
  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    fetchAssociatedStyles(topic.id);
    setIsStylePanelVisible(true);
  };

  /**
   * 打开创建选题模态框
   */
  const openCreateModal = () => {
    setFormData({
      name: '',
      level: 1,
      parent_id: 0,
      description: '',
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  /**
   * 打开编辑选题模态框
   * @param topic 要编辑的选题对象
   */
  const openEditModal = (topic: Topic) => {
    setSelectedTopic(topic);
    setFormData({
      name: topic.name,
      level: topic.level,
      parent_id: topic.parent_id || 0,
      description: topic.description || '',
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  /**
   * 关闭模态框
   */
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTopic(null);
  };

  /**
   * 处理表单输入变化
   * @param e 表单输入事件
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'level' || name === 'parent_id' ? parseInt(value) : value,
    });
  };

  /**
   * 提交表单处理函数
   * @param e 表单提交事件
   */
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
        fetchTopicHierarchy(); // 重新获取选题层级结构
      } else {
        setError(result.message || (isEditing ? '更新选题失败' : '创建选题失败'));
      }
    } catch (err) {
      setError(isEditing ? '更新选题时发生错误' : '创建选题时发生错误');
      console.error(err);
    }
  };

  /**
   * 删除选题处理函数
   * @param topicId 要删除的选题ID
   */
  const handleDelete = async (topicId: number) => {
    if (!confirm('确定要删除这个选题吗？')) {
      return;
    }
    
    try {
      const result = await topicApi.delete(topicId);
      
      if (result.success) {
        fetchTopicHierarchy(); // 重新获取选题层级结构
      } else {
        setError(result.message || '删除选题失败');
      }
    } catch (err) {
      setError('删除选题时发生错误');
      console.error(err);
    }
  };

  /**
   * 切换节点展开/收起状态
   * @param id 节点ID
   */
  const toggleNode = (id: number) => {
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  /**
   * 获取选题层级名称
   * @param level 选题层级
   * @returns 层级名称
   */
  const getLevelName = (level: number) => {
    switch (level) {
      case 1: return '一级选题';
      case 2: return '二级选题';
      case 3: return '三级选题';
      default: return '未知级别';
    }
  };

  // 新增状态管理
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [selectedTopicForAssociation, setSelectedTopicForAssociation] = useState<Topic | null>(null);
  const [searchedStyles, setSearchedStyles] = useState<Style[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyleIds, setSelectedStyleIds] = useState<number[]>([]);

  // 处理关联风格按钮点击事件
  const handleAssociateStyles = (topic: Topic) => {
    setSelectedTopicForAssociation(topic);
    setShowAssociateModal(true);
    // 初始化时清空已选择的风格
    setSelectedStyleIds([]);
    // 加载所有风格列表
    fetchAllStyles();
  };

  // 获取所有风格列表
  const fetchAllStyles = async () => {
    try {
      const data = await topicApi.styleList();
      if (data.success) {
        setSearchedStyles(data.data);
      } else {
        setError(data.message || '获取风格列表失败');
      }
    } catch (err) {
      setError('获取风格列表时发生错误');
      console.error(err);
    }
  };

  // 处理搜索风格
  const handleSearchStyles = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      fetchAllStyles();
      return;
    }

    try {
      const data = await topicApi.styleList();
      if (data.success) {
        // 前端过滤搜索结果
        const filteredStyles = data.data.filter((style:any) => 
          style.style_name.toLowerCase().includes(query.toLowerCase()) ||
          style.category.toLowerCase().includes(query.toLowerCase())
        );
        setSearchedStyles(filteredStyles);
      } else {
        setError(data.message || '搜索风格失败');
      }
    } catch (err) {
      setError('搜索风格时发生错误');
      console.error(err);
    }
  };

  // 处理复选框变化
  const handleCheckboxChange = (styleId: number, checked: boolean) => {
    if (checked) {
      setSelectedStyleIds(prev => [...prev, styleId]);
    } else {
      setSelectedStyleIds(prev => prev.filter(id => id !== styleId));
    }
  };

  // 处理风格关联
  const handleAssociateSelectedStyles = async () => {
    if (!selectedTopicForAssociation || selectedStyleIds.length === 0) return;

    try {
      // 关联每个选中的风格
      for (const styleId of selectedStyleIds) {
        const result = await topicApi.associateStyle(selectedTopicForAssociation.id, styleId);
        if (!result.success) {
          throw new Error(result.message || '关联风格失败');
        }
      }
      
      setShowAssociateModal(false);
      // 重新获取关联的风格列表
      fetchAssociatedStyles(selectedTopicForAssociation.id);
      
      // 显示成功消息
      alert('风格关联成功');
    } catch (err) {
      setError('关联风格时发生错误: ' + (err as Error).message);
      console.error(err);
    }
  };

  /**
   * 递归渲染选题树结构
   * @param topics 选题列表
   * @param level 当前层级
   * @returns JSX元素
   */
  const renderTopicTree = (topics: Topic[], level = 0) => {
    return topics.map(topic => (
      <div key={topic.id}>
        <div 
          className={`flex items-center justify-between p-3 hover:bg-gray-50 ${
            level > 0 ? `pl-${Math.min(level * 4, 16)}` : ''
          }`}
        >
          <div className="flex items-center">
            {topic.children && topic.children.length > 0 && (
              <button 
                onClick={() => toggleNode(topic.id)}
                className="mr-2 text-gray-500 hover:text-gray-700"
              >
                {expandedNodes[topic.id] ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7 7 7-7" />
                  </svg>
                )}
              </button>
            )}
            <span 
              className="font-medium text-gray-800 cursor-pointer hover:text-blue-600"
              onClick={() => handleTopicSelect(topic)}
            >
              {topic.name}
            </span>
            <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {getLevelName(topic.level)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {new Date(topic.created_at).toLocaleDateString()}
            </span>
            <button
              onClick={() => openEditModal(topic)}
              className="text-blue-600 hover:text-blue-900 text-sm mr-2"
            >
              编辑
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(topic.id);
              }}
              className="text-red-600 hover:text-red-900 text-sm mr-2"
            >
              删除
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAssociateStyles(topic);
              }}
              className="text-green-600 hover:text-green-900 text-sm"
            >
              关联风格
            </button>
          </div>
        </div>
      
        {topic.children && topic.children.length > 0 && expandedNodes[topic.id] && (
          <div className="border-l-2 border-gray-200 ml-4">
            {renderTopicTree(topic.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  // 组件初始化时获取选题数据
  useEffect(() => {
    fetchTopicHierarchy();
  }, []);

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
        <div className="flex flex-col md:flex-row gap-6">
          {/* 左侧选题树 */}
          <div className="md:w-1/2 bg-white shadow-md rounded-lg overflow-hidden">
            {topics.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {renderTopicTree(topics)}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无选题数据
              </div>
            )}
          </div>

          {/* 右侧风格面板 */}
          <div className="md:w-1/2">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">选题关联风格</h2>
                  <button
                    onClick={() => setIsStylePanelVisible(!isStylePanelVisible)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {isStylePanelVisible ? '隐藏' : '显示'}
                  </button>
                </div>
              </div>
              
              {isStylePanelVisible && (
                <div className="p-4">
                  {selectedTopic ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-4">
                        当前选题: <span className="font-medium">{selectedTopic.name}</span>
                      </p>
                      
                      {associatedStyles.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                          {associatedStyles.map((style) => (
                            <div
                              key={style.id}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 relative group"
                            >
                              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"></div>
                              <div className="flex items-start">
                                <div className="flex-shrink-0">
                                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707-.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <h3 className="text-sm font-medium text-gray-900">{style.style_name}</h3>
                                  <p className="text-xs text-gray-500 mt-1">{style.category}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p>暂无关联风格</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>请从左侧选择一个选题以查看其关联风格</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 创建/编辑选题模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditing ? '编辑选题' : '创建选题'}
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
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
                    required
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

      {/* 关联风格模态框 */}
      {showAssociateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                关联风格
              </h2>
            </div>
            
            <div className="px-6 py-4">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="搜索风格..."
                  value={searchQuery}
                  onChange={(e) => handleSearchStyles(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {searchedStyles.length > 0 ? (
                  searchedStyles.map(style => (
                    <div key={style.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`style-${style.id}`}
                        checked={selectedStyleIds.includes(style.id)}
                        onChange={(e) => handleCheckboxChange(style.id, e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 rounded"
                      />
                      <label htmlFor={`style-${style.id}`} className="text-sm text-gray-700">
                        <span className="font-medium">{style.style_name}</span>
                        <span className="ml-2 text-xs text-gray-500">{style.category}</span>
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">暂无风格数据</p>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAssociateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleAssociateSelectedStyles}
                disabled={selectedStyleIds.length === 0}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  selectedStyleIds.length === 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                确认关联
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}