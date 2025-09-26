'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 头部 */}
        <header className="text-center py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            小红书AI笔记助手
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            基于AI技术的小红书笔记分析与创作工具，帮助您更好地理解内容风格并生成高质量笔记
          </p>
        </header>

        {/* 导航栏 */}
        <nav className="flex flex-wrap justify-center gap-4 mb-12">
          <button 
            onClick={() => setActiveSection('overview')}
            className={`px-6 py-3 rounded-full transition-all duration-300 ${
              activeSection === 'overview' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
            }`}
          >
            功能概述
          </button>
          <button 
            onClick={() => setActiveSection('features')}
            className={`px-6 py-3 rounded-full transition-all duration-300 ${
              activeSection === 'features' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
            }`}
          >
            核心功能
          </button>
          <button 
            onClick={() => setActiveSection('usage')}
            className={`px-6 py-3 rounded-full transition-all duration-300 ${
              activeSection === 'usage' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
            }`}
          >
            使用指南
          </button>
          <Link href="/styles" className="px-6 py-3 rounded-full bg-white text-gray-700 hover:bg-gray-100 shadow-md transition-all duration-300">
            开始使用
          </Link>
        </nav>

        {/* 主要内容区域 */}
        <main className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-12">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">功能概述</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">风格分析</h3>
                  <p className="text-gray-600">
                    通过分析小红书笔记的标题和内容，识别其写作风格、语言特点和结构模式。
                    帮助您理解不同类型笔记的创作要点。
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">内容仿写</h3>
                  <p className="text-gray-600">
                    基于分析出的风格特征，为用户提供内容重写服务，帮助创作符合特定风格的新内容。
                  </p>
                </div>
                <div className="bg-green-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">选题管理</h3>
                  <p className="text-gray-600">
                    建立选题库，支持多级分类管理，为内容创作提供方向指导和灵感来源。
                  </p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">数据分析</h3>
                  <p className="text-gray-600">
                    提供详细的数据分析报告，帮助用户了解内容表现和优化方向。
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'features' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">核心功能</h2>
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="text-xl font-semibold text-gray-800">智能风格识别</h3>
                  <p className="text-gray-600 mt-2">
                    通过自然语言处理技术，自动识别小红书笔记的语言风格、情感倾向、关键词特征等。
                  </p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <h3 className="text-xl font-semibold text-gray-800">多维度分析</h3>
                  <p className="text-gray-600 mt-2">
                    从标题结构、内容组织、语言风格、情感表达等多个维度全面分析笔记特征。
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="text-xl font-semibold text-gray-800">个性化仿写</h3>
                  <p className="text-gray-600 mt-2">
                    根据分析结果，提供个性化的内容重写服务，帮助用户创作符合特定风格的新内容。
                  </p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4 py-2">
                  <h3 className="text-xl font-semibold text-gray-800">选题库管理</h3>
                  <p className="text-gray-600 mt-2">
                    支持建立多级选题库，方便用户管理和查找各类内容创作主题。
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'usage' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">使用指南</h2>
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">1. 风格分析</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>进入"风格分析"页面</li>
                    <li>输入小红书笔记的URL或手动输入标题和内容</li>
                    <li>点击"开始分析"按钮</li>
                    <li>查看系统生成的风格分析报告</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">2. 内容仿写</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>在分析结果页面选择想要仿写的风格</li>
                    <li>输入您想要重写的内容</li>
                    <li>设置字数要求等参数</li>
                    <li>点击"开始仿写"按钮</li>
                    <li>获取符合目标风格的重写内容</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">3. 选题管理</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>进入"选题管理"页面</li>
                    <li>浏览现有选题或创建新的选题分类</li>
                    <li>为选题关联相应的风格特征</li>
                    <li>使用选题库指导内容创作</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* 页脚 */}
        <footer className="text-center py-8 text-gray-500">
          <p>© {new Date().getFullYear()} 小红书AI笔记助手. 保留所有权利.</p>
        </footer>
      </div>
    </div>
  );
}
