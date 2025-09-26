
import Link from 'next/link'

const navItems = [
  { name: '首页', href: '/' },
  { name: '选题管理', href: '/topics' },
  { name: '风格分析', href: '/styles' },
  { name: '内容复写', href: '/rewrite' },
]


import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "小红书AI内容助手",
  description: "分析小红书爆款内容风格并生成高质量原创内容",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}
      >
        <div className="min-h-screen flex flex-col">
          {/* 导航栏 */}
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-xl font-bold text-gray-900">小红书AI内容助手</h1>
                  </div>
                  <Navigation />
                </div>
              </div>
            </div>
          </nav>

          {/* 主要内容区域 */}
          <main className="flex-grow">
            {children}
          </main>

          {/* 页脚 */}
          <footer className="bg-white border-t border-gray-200 mt-8">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-gray-500">
                © {new Date().getFullYear()} 小红书AI内容助手. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}