/**
 * IndexNow 提交脚本：把站点全部 URL 一次性推送给 Bing / Seznam / Yandex / Naver，
 * 让它们秒级抓取（比等爬虫自然发现快得多）。Google 不参与 IndexNow，仍需走 GSC。
 *
 * 用法：
 *   node scripts/submit-indexnow.mjs
 * 可选环境变量：
 *   INDEXNOW_HOST  默认 www.wevva.top
 *   INDEXNOW_KEY   默认读 public/ 下唯一的 32 位 hex key 文件
 *
 * 说明：key 文件必须已部署到 https://<host>/<key>.txt 且内容就是 key 本身，
 *       否则 IndexNow 会拒绝（返回 403 / key validation failed）。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const HOST = process.env.INDEXNOW_HOST || 'www.wevva.top';

// 1) 找出 key（public 目录下 32 位 hex .txt）
function findKey() {
  if (process.env.INDEXNOW_KEY) return process.env.INDEXNOW_KEY;
  const pub = path.join(ROOT, 'public');
  const f = fs.readdirSync(pub).find((n) => /^[0-9a-f]{32}\.txt$/.test(n));
  if (!f) throw new Error('未找到 IndexNow key 文件（public/<32位hex>.txt）');
  return f.replace('.txt', '');
}

// 2) 从构建产物 sitemap 提取所有 URL
function collectUrls() {
  const urls = new Set();
  const dist = path.join(ROOT, 'dist');
  for (const f of fs.readdirSync(dist)) {
    if (!/^sitemap(-.*)?\.xml$/.test(f)) continue;
    const xml = fs.readFileSync(path.join(dist, f), 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(m[1].trim());
  }
  return [...urls];
}

// 3) 先自检 key 是否已在公网可访问（未部署就提交会被拒）
async function verifyKey(key) {
  const url = `https://${HOST}/${key}.txt`;
  try {
    const r = await fetch(url, { redirect: 'follow' });
    const t = (await r.text()).trim();
    return { ok: r.ok && t === key, status: r.status, text: t.slice(0, 40) };
  } catch (e) {
    return { ok: false, status: 0, text: e.message };
  }
}

async function main() {
  const key = findKey();
  const urls = collectUrls();
  console.log(`[indexnow] host=${HOST} key=${key} urls=${urls.length}`);

  const v = await verifyKey(key);
  if (!v.ok) {
    console.error(`[indexnow] key 校验失败（status=${v.status}, body="${v.text}"）`);
    console.error(`[indexnow] 请先部署站点，确保 https://${HOST}/${key}.txt 可访问且内容等于 key，再重跑本脚本。`);
    process.exit(1);
  }
  console.log('[indexnow] key 校验通过 ✓');

  // IndexNow 单次上限 10000 条，分批提交
  const body = JSON.stringify({
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${key}.txt`,
    urlList: urls,
  });

  for (const endpoint of ['https://api.indexnow.org/indexnow', 'https://www.bing.com/indexnow']) {
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body,
      });
      console.log(`[indexnow] POST ${endpoint} -> ${r.status}`);
      if (r.status === 429) console.warn('[indexnow] 被限流，稍后再试');
    } catch (e) {
      console.error(`[indexnow] POST ${endpoint} 失败: ${e.message}`);
    }
  }
}

main();
