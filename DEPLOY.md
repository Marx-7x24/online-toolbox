# 在线工具箱 · 上线部署手册

静态站架构：本地 `npm run build` 产出 `dist/`，服务器用 nginx 直接托管，无需 Node 运行时、无需数据库。

---

## 一、上线前要准备的东西

### 大哥需要提供的（我无法代办的部分）

| 项目 | 说明 | 耗时 |
|------|------|------|
| 域名 | 已完成实名认证 | 1 天 |
| 服务器 | 中国大陆节点（阿里云/腾讯云/华为云均可），建议 2 核 4G、40G SSD、3–5M 带宽 | 即时 |
| **ICP 备案** | 大陆服务器强制要求，需主体证件 + 幕布拍照，个人/企业均可 | 7–20 天 |
| 公安备案 | 网站上线后 30 日内，在「全国互联网安全管理服务平台」提交 | 1 天 |
| 服务器 SSH 凭据 | root 密码或密钥，或宝塔面板地址账号 | 即时 |

> 备案是唯一的时间硬约束。建议域名一到手就先提交备案，备案期间我在本地把站做完。

### 我能独立完成的部分

写代码、加工具、构建、nginx 配置、SSL 证书申请与自动续期、部署脚本、监控脚本、sitemap 与 SEO 结构。

---

## 二、服务器初始化（一次搞定）

以 Ubuntu 22.04 / Debian 12 为例：

```bash
# 1. 基础环境
apt update && apt upgrade -y
apt install -y nginx rsync curl

# 2. 建站点目录
mkdir -p /var/www/toolbox

# 3. 建专用部署账号（不给 root 更安全）
useradd -m -s /bin/bash deploy
usermod -aG sudo deploy

# 4. 申请 SSL 证书（certbot）
apt install -y certbot python3-certbot-nginx
certbot --nginx -d tool.example.com
```

---

## 三、nginx 配置

`/etc/nginx/conf.d/toolbox.conf`：

```nginx
server {
    listen 80;
    server_name tool.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tool.example.com;
    root /var/www/toolbox;
    index index.html;

    ssl_certificate     /etc/letsencrypt/live/tool.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tool.example.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;

    gzip on;
    gzip_types text/css application/javascript image/svg+xml application/json;
    gzip_min_length 1024;

    # 静态资源长缓存
    location /_astro/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Astro directory 格式：/tools/json-format/ -> /tools/json-format/index.html
    location / {
        try_files $uri $uri/index.html $uri.html =404;
    }

    # 安全头
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header Referrer-Policy strict-origin-when-cross-origin;

    access_log /var/log/nginx/toolbox.access.log;
    error_log  /var/log/nginx/toolbox.error.log;
}
```

改完 `nginx -t && systemctl reload nginx`。

---

## 四、部署脚本

本地 `deploy.sh`（把 `SERVER` 换成实际地址）：

```bash
#!/bin/bash
set -e
SERVER="deploy@your-server-ip"
REMOTE_DIR="/var/www/toolbox"

npm run build
rsync -avz --delete dist/ "$SERVER:$REMOTE_DIR"
echo "部署完成"
ssh "$SERVER" "sudo nginx -t && sudo systemctl reload nginx"
```

用法：`chmod +x deploy.sh && ./deploy.sh`，一次全量同步，几秒完成。

---

## 五、加一个新工具的标准流程

1. 在 `src/components/tools/` 下新建 `<工具slug>.astro`（含界面 + `<script>` 逻辑）
2. 在 `src/data/tools.js` 的 `tools` 数组里加一条记录
3. 跑 `npm run build`

首页、分类页、工具详情页、sitemap、内链全部自动生成，不用手改任何页面。

---

## 六、成本预估（起步阶段）

| 项目 | 费用 |
|------|------|
| 域名（.com / .cn） | 30–80 元/年 |
| 云服务器 2C4G 5M | 300–600 元/年（新用户首年更低） |
| SSL 证书 | 0（Let's Encrypt） |
| CDN（可选，流量大后再上） | 0–500 元/年 |

因为计算全在浏览器端，服务器只发静态文件，**流量涨 10 倍成本几乎不变**——这是选这条路线的核心价值。
