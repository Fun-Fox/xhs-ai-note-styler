
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    小红书链接 *
  </label>
  <input
    type="url"
    name="url"
    value={urlContent.url}
    onChange={handleUrlContentChange}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-black" // 添加 text-black 类
    placeholder="请输入小红书链接"
  />
  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  </div>
</div>
