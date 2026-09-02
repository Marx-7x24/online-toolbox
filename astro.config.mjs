import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 站点域名：sitemap / canonical / SEO 全靠它。
// 优先读环境变量 SITE_URL（部署时由 .env.cf 注入，不入库，杜绝误提交占位符）；
// 本地未设置时回退占位符，保证本地构建照常可用。
export default defineConfig({
  site: process.env.SITE_URL || 'https://tool.example.com',
  output: 'static',
  integrations: [sitemap()],
  build: {
    // 每个工具一个独立 HTML，和懒人工具箱的 URL 结构一致
    format: 'directory',
  },
  // 中英双语：/zh/ 给中国域名，/en/ 给国外域名（两条腿走，结构已预留）
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: { prefixDefaultLocale: true },
  },
});
