import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      title: "选题管理",
      description: "创建和管理内容选题，支持多级分类和风格关联",
      href: "/topics",
      icon: "📝",
    },
    {
      title: "风格分析",
      description: "分析小红书爆款内容风格，建立风格库",
      href: "/styles",
      icon: "🔍",
    },
    {
      title: "内容复写",
      description: "基于分析的风格生成新的原创内容",
      href: "/rewrite",
      icon: "✍️",
    },
  ];

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">小红书AI内容助手</h1>
        </div>
        
        <p className="text-center text-lg text-gray-600 max-w-lg">
          专业的AI工具，帮助您分析小红书爆款内容风格并生成高质量原创内容
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 group"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h2>
              <p className="text-gray-600">{feature.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 max-w-lg">
          <p>
            使用左侧导航菜单开始使用各项功能：
          </p>
          <ul className="mt-2 space-y-1">
            <li>📝 选题管理 - 管理您的内容选题和分类</li>
            <li>🔍 风格分析 - 分析小红书内容风格特征</li>
            <li>✍️ 内容复写 - 基于风格生成原创内容</li>
          </ul>
        </div>
      </main>
      
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}