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

// 根路径 https://www.wevva.top/ 由 public/_redirects 做 301 → /zh/，
// 它是「跳转页」而不是内容页。放进 sitemap 会被 Google 判成
// 「网页会自动重定向」(Page with redirect) 而拒绝收录，所以这里直接剔掉，
// 语言首页 /zh/ 与 /en/ 本身都在 sitemap 里，收录不会少。
function isRootUrl(page) {
  try {
    return new URL(page).pathname === '/';
  } catch (e) {
    return false;
  }
}

// 站点域名：sitemap / canonical / hreflang / 表单回调地址全靠它。
// 优先读环境变量 SITE_URL（部署时注入）；未设置时回退到正式域名 www.wevva.top ——
// 注意不要回退成 example.com 之类的占位符：一旦部署环境漏配 SITE_URL，
// sitemap 会变成占位域名（GSC 直接判失败），表单 redirect 也会跳错地址。
export default defineConfig({
  site: process.env.SITE_URL || 'https://www.wevva.top',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !isHiddenToolUrl(page) && !isRootUrl(page),
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
