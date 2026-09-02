import type { APIRoute } from 'astro';

// 动态生成 robots.txt：Sitemap 地址随 astro.config.mjs 的 `site`（即部署时注入的
// SITE_URL）变化，避免静态文件写死占位符域名、上线后把爬虫指到错误地址。
const robots = (site: string) => `User-agent: *
Allow: /

Sitemap: ${new URL('sitemap-index.xml', site).href}
`;

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://tool.example.com');
  return new Response(robots(base.href), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
