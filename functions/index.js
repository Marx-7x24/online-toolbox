// Cloudflare Pages Function —— 只处理根路径 /
//
// 作用：按访客浏览器 / 设备的 Accept-Language 请求头，把根路径分流到 /zh/ 或 /en/。
//
// 为什么必须放在边缘：
//   本站是 Astro 纯静态输出（output: 'static'），没有服务端运行时；
//   而 Cloudflare 的 _redirects 官方文档明确写了「Redirect by country or language ❌」，
//   只有 Pages Functions（跑在 Workers 上）能读请求头做内容协商。
//
// 为什么用 functions/index.js 而不是 functions/_middleware.js：
//   _middleware.js 会拦截每一个请求，全站 400+ 静态资源都要过一遍 Worker（变慢 + 计费）；
//   index.js 按官方文件路由只匹配 /，其余路径仍由 CDN 直接吐静态文件。
//   配套的 public/_routes.json 把 include 收窄到 ["/"]，保证静态请求依旧是免费无限量。
//
// 官方文档同时说明：「_redirects 对被 Functions 处理的请求不生效」，
// 所以 public/_redirects 里的 `/ /zh/ 301` 在本函数上线后自动让位，不会抢先执行；
// 它仍保留着，万一 Functions 没部署成功，可以兜住 /index.html 这类边角路径。

// 明确归到中文站的语言标签（zh 及其地区变体、粤语、吴语等汉藏语系）
const ZH_TAGS = new Set(['zh', 'cmn', 'yue', 'wuu', 'nan', 'hak', 'gan', 'hakka', 'cantonese']);

// 搜索引擎与爬虫：主域名是中文站（ICP 备案主体在国内），一律送 /zh/。
// 否则 bot 常年发 Accept-Language: en-US，会把根路径判给英文版，
// 连带影响 /zh/ 的收录权重。真正的语言版本由 hreflang + sitemap 传达，不靠根路径。
const BOT_UA =
  /(googlebot|bingbot|baiduspider|yandexbot|sogou|duckduckbot|applebot|petalbot|bytespider|ahrefs|semrush|mj12bot|dotbot|rogerbot|slurp|curl\/|wget\/|python-requests|scrapy)/i;

/** 解析 Accept-Language，按 q 值从高到低排序；q=0 表示明确不接受，剔除 */
function parseAcceptLanguage(header) {
  if (!header) return [];
  return header
    .split(',')
    .map((part) => {
      const seg = part.split(';');
      const tag = seg[0].trim().toLowerCase();
      let q = 1;
      for (const p of seg.slice(1)) {
        const m = p.trim().match(/^q\s*=\s*([0-9.]+)$/i);
        if (m) {
          const v = Number.parseFloat(m[1]);
          q = Number.isNaN(v) ? 0 : v;
        }
      }
      return { tag, q };
    })
    .filter((item) => item.tag && item.q > 0)
    .sort((a, b) => b.q - a.q);
}

function isChineseTag(tag) {
  if (tag === '*') return true; // 接受任意语言 → 按国内用户默认给中文
  if (ZH_TAGS.has(tag)) return true;
  // 同时比对基础子标签，才能覆盖 yue-Hant-HK / cmn-Hans 这类带地区或书写系统的完整标签
  const base = tag.split('-')[0];
  return base === 'zh' || ZH_TAGS.has(base);
}

/**
 * 语言决策：取 q 值最高的那一项说了算，而不是「列表里有没有中文」。
 * 反例：Accept-Language: en-US,en;q=0.9,zh-CN;q=0.8 —— 用户明显更想看英文，
 * 若用「只要含 zh 就给中文」会判错。
 */
function pickLang(acceptLanguage, userAgent) {
  if (BOT_UA.test(userAgent || '')) return 'zh';
  const list = parseAcceptLanguage(acceptLanguage);
  if (list.length === 0) return 'zh'; // 无请求头（curl / 老客户端）→ 默认中文站
  return isChineseTag(list[0].tag) ? 'zh' : 'en';
}

export function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  const lang = pickLang(request.headers.get('accept-language'), request.headers.get('user-agent'));

  const target = new URL(`/${lang}/`, url.origin);
  target.search = url.search; // 保留 utm_source 等来源参数，广告归因不丢

  return new Response(null, {
    // 用 302 而非 301：这是「按访问者语言」的结果，对同一 URL 不是永久归属，
    // 用 301 会让浏览器/中间缓存把某一次的语言选择固化下来。
    // 根路径已不在 sitemap 内，302 不会带来收录损失。
    status: 302,
    headers: {
      location: target.href,
      // 结果随请求头变化，任何一层缓存都不能跨语言复用
      vary: 'Accept-Language, User-Agent',
      'cache-control': 'private, no-cache, no-store, must-revalidate',
    },
  });
}
