
return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-primary mb-6">内容复写</h1>
      
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
          <h2 className="text-lg font-medium text-primary mb-4">生成设置</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-secondary mb-1">
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
                <p className="mt-1 text-sm text-secondary">暂无可用风格，请先进行风格分析</p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-secondary mb-1">
                具体需求 *
              </label>
              <textarea
                name="user_task"
                value={formData.user_task}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
