
const [searchQuery, setSearchQuery] = useState('');
const [filteredStyles, setFilteredStyles] = useState(styles);

useEffect(() => {
  if (searchQuery) {
    const filtered = styles.filter(style =>
      style.style_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.feature_desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStyles(filtered);
  } else {
    setFilteredStyles(styles);
  }
}, [searchQuery, styles]);


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
          
          {/* 添加搜索框 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              风格搜索
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="请输入风格名称或描述进行搜索"
            />
          </div>

          {/* 显示搜索结果 */}
          {searchQuery && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">搜索结果:</h3>
              {filteredStyles.length > 0 ? (
                <ul className="space-y-2">
                  {filteredStyles.map(style => (
                    <li key={style.id} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="style_id"
                        value={style.id}
                        checked={formData.style_id === style.id.toString()}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span>{style.style_name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">没有找到相关风格。</p>
              )}
            </div>
          )}

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
                <p style={{ color: 'black' }}>{rewriteResult.content}</p> {/* 设置内容字体为黑色 */}
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
