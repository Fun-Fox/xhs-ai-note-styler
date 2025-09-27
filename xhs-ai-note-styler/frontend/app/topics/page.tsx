
/**
 * 渲染选题树结构
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
            onClick={() => handleAssociateStyles(topic)}
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

return (
  <div className="flex flex-col md:flex-row min-h-screen">
    {/* 左侧选题管理区域 */}
    <div className="md:w-1/3 bg-white p-4 shadow-md mb-4 md:mb-0 md:mr-4">
      <h2 className="text-xl font-semibold mb-4">内容选题管理</h2>
      <div className="space-y-4">
        {renderTopicTree(topics)}
      </div>
    </div>

    {/* 右侧内容关联风格面板 */}
    <div className="md:w-2/3 bg-white p-4 shadow-md">
      <h2 className="text-xl font-semibold mb-4">选题关联风格</h2>
      <button 
        onClick={() => setIsStylePanelVisible(!isStylePanelVisible)}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        {isStylePanelVisible ? '隐藏' : '显示'}
      </button>
      {isStylePanelVisible && (
        <div className="mt-4">
          {/* 显示关联风格的内容 */}
        </div>
      )}
    </div>
  </div>
);
