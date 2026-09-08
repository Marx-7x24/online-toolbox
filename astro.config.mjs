import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { tools } from './src/data/tools.js';

// 站内隐藏的工具（hidden: true）：不生成 sitemap，避免让搜索引擎收录已经下线的页面。
const HIDDEN_SLUGS = new Set(tools.filter((t) => t.hidden).map((t) => t.slug));
function isHiddenToolUrl(page) {
  try {
    const m = new URL(page).pathname.match(/^\/(zh|en)\/tools\/([^/]+)\//);
    return m && HIDDEN_SLUGS.has(m[2]);
  } catch (e) {
    return false;
  }
}

// 站点域名：sitemap / canonical / SEO 全靠它。
// 优先读环境变量 SITE_URL（部署时由 .env.cf 注入，不入库，杜绝误提交占位符）；
// 本地未设置时回退占位符，保证本地构建照常可用。
export default defineConfig({
  site: process.env.SITE_URL || 'https://tool.example.com',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !isHiddenToolUrl(page),
      // 每条 URL 带 lastmod（本次构建时间），提示 Google 内容新鲜度、利于重新抓取
      serialize(item) {
        return { ...item, lastmod: new Date().toISOString().slice(0, 10) };
      },
    }),
  ],
  build: {
    // 每个工具一个独立 HTML，和懒人工具箱的 URL 结构一致
    format: 'directory',
  },
  // 中英双语：/zh/ 给中国域名，/en/ 给国外域名（两条腿走，结构已预留）
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
