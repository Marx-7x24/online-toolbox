#!/usr/bin/env bash
# 本地兜底部署脚本（仅当需要我代大哥用 Cloudflare API Token 部署时使用）
# 用法：
#   1) 复制 .env.cf.example 为 .env.cf 并填入 CF_ACCOUNT_ID / CF_API_TOKEN
#   2) bash deploy.sh
# 脚本会优先从 .env.cf 读取凭据；也可直接通过环境变量传入（不依赖文件）。
set -euo pipefail
cd "$(dirname "$0")"

# 加载本地密钥（存在且不入库）
if [ -f .env.cf ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.cf
  set +a
  echo "[deploy] 已从 .env.cf 加载 Cloudflare 凭据"
fi

# SITE_URL：站点正式域名，注入给 astro.config 生成 sitemap / canonical / SEO。
# 未设置则警告并回退占位符（sitemap 会带错域名，但部署仍可继续，方便先验证）。
if [ -z "${SITE_URL:-}" ]; then
  echo "[deploy][WARN] 未设置 SITE_URL，将使用占位符 https://tool.example.com 生成 sitemap/canonical"
  echo "[deploy][WARN] 上线前请在 .env.cf 填入真实域名（如 SITE_URL=https://example.com）"
else
  echo "[deploy] 使用 SITE_URL=$SITE_URL 生成 sitemap/canonical"
fi
export SITE_URL

: "${CF_ACCOUNT_ID:?未设置 CF_ACCOUNT_ID（写入 .env.cf 或 export）}"
: "${CF_API_TOKEN:?未设置 CF_API_TOKEN（写入 .env.cf 或 export）}"

echo "[deploy] 重新构建最新产物..."
npm run build

# 清理 Astro 静态构建残留的 SSR 中间产物（dist/pages、dist/chunks、dist/*.mjs）。
# 这些是构建过程产物，不是站点内容，不该随静态站一起上传；
# 某些环境（如带删除护栏的沙箱）Astro 自动清理可能失败，这里兜底再清一次。
rm -rf dist/pages dist/chunks dist/*.mjs 2>/dev/null || true
echo "[deploy] 已清理构建中间产物"

echo "[deploy] 部署到 Cloudflare Pages 项目 online-toolbox ..."
./node_modules/.bin/wrangler pages deploy dist --project-name=online-toolbox

echo "[deploy] 完成。稍候即可在分配的 *.pages.dev 域名访问。"
