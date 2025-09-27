'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();
  
  const navItems = [
    { name: "首页", href: "/" },
    { name: "选题管理", href: "/topics" },
    { name: "风格分析", href: "/styles" },
    { name: "风格列表", href: "/styles/list" },
    { name: "内容复写", href: "/rewrite" },
    { name: "生成记录", href: "/rewrite/records" },
  ];

  return (
    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
            pathname === item.href
              ? "border-blue-500 text-gray-900"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
          }`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}