import asyncio
import re
import sys
import os

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

from rpa.config import read_setting


async def extract_note_content(note_urls: str):
    """
    从小红书笔记链接中提取标题和内容
    
    Args:
        note_urls (str): 小红书笔记链接，多个链接用空格分隔
    
    Returns:
        list: 包含每个笔记标题和内容的字典列表
    """
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("错误: 未安装playwright库，请运行 'pip install playwright' 安装")
        return []

    urls = note_urls.split(' ')
    notes_data = []

    async with async_playwright() as p:
        # 启动浏览器
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()

        # 读取设置中的User-Agent
        settings = read_setting()
        user_agent = settings.get("user_agent",
                                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

        # 设置用户代理，模拟真实浏览器
        await context.set_extra_http_headers({
            "User-Agent": user_agent
        })

        # 添加Cookie
        cookie_str = settings.get("cookie", "")
        if cookie_str:
            # 解析 cookie 字符串为字典
            cookies_dict = {}
            for cookie in cookie_str.split('; '):
                if '=' in cookie:
                    key, value = cookie.split('=', 1)
                    cookies_dict[key] = value

            # 转换为 cookie 对象数组
            cookies = [
                {"name": name, "value": value, "domain": ".xiaohongshu.com", "path": "/"}
                for name, value in cookies_dict.items()
            ]
            await context.add_cookies(cookies)

        page = await context.new_page()

        for url in urls:
            try:
                # 访问笔记页面
                await page.goto(url, timeout=30000)
                await page.wait_for_timeout(5000)  # 等待页面加载

                # 提取笔记数据
                note_data = await page.evaluate('''() => {
                    try {
                        // 尝试从页面中获取笔记数据
                        const initialState = window.__INITIAL_STATE__;
                        if (!initialState || !initialState.note || !initialState.note.noteDetailMap) {
                            return null;
                        }
                       
                        // 获取noteDetailMap中的第一个笔记对象
                        const noteDetailMap = initialState.note.noteDetailMap;
                        let noteDetail = null;
        
                        // 遍历noteDetailMap获取第一个笔记详情
                        for (const key in noteDetailMap) {
                            if (noteDetailMap.hasOwnProperty(key) && noteDetailMap[key].note) {
                                noteDetail = noteDetailMap[key].note;
                                break;
                            }
                        }
                        
                        if (!noteDetail) {
                            return null;
                        }
                        
                        return {
                            title: noteDetail.title || '',
                            content: noteDetail.desc || ''
                        };
                    } catch (error) {
                        console.error('解析笔记数据时出错:', error);
                        return null;
                    }
                }''')
                print(note_data)

                # 如果通过JS无法获取数据，则尝试直接从页面元素提取
                if not note_data:
                    # 尝试从页面元素中提取标题
                    title_element = await page.query_selector('h1.title')
                    title = await title_element.inner_text() if title_element else ''
                    
                    # 尝试从页面元素中提取内容
                    content_element = await page.query_selector('div.desc')
                    content = await content_element.inner_text() if content_element else ''
                    
                    if title or content:
                        note_data = {
                            'title': title,
                            'content': content
                        }

                if note_data and (note_data.get('title') or note_data.get('content')):
                    notes_data.append({
                        'url': url,
                        'title': note_data['title'],
                        'content': note_data['content']
                    })
                    print(f"成功提取笔记: {note_data['title']}")
                else:
                    print(f"无法提取笔记内容: {url}")

            except Exception as e:
                print(f"处理页面时出错: {url}, 错误: {str(e)}")
                continue

        await browser.close()

    return notes_data


def read_setting():
    """
    读取设置信息
    
    Returns:
        dict: 设置信息
    """
    # 这里使用新的配置管理模块
    from rpa.config import read_setting as config_read_setting
    return config_read_setting()


if __name__ == "__main__":
    # 示例用法
    async def main():
        # 示例链接（请替换为真实的小红书笔记链接）
        example_urls = "https://www.xiaohongshu.com/explore/68d41970000000001300e1be?xsec_token=ABGXqkixqlHgrHbAmmV4ESHC91rsQNOPAQlHLNEn-zu2I=&xsec_source=pc_user"

        notes_data = await extract_note_content(example_urls)

        for note in notes_data:
            print(f"链接: {note['url']}")
            print(f"标题: {note['title']}")
            print(f"内容: {note['content']}")
            print("-" * 50)


    # 运行异步函数
    asyncio.run(main())