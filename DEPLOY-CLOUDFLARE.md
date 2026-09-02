# 在线工具箱 · Cloudflare Pages 手动部署手册

适用场景：面向**国外用户**首发，域名走 Cloudflare，零服务器、零备案、近乎零成本。
（面向国内用户的服务器 + nginx 方案见 `DEPLOY.md`。）

本手册给你**手动部署**的完整步骤。两种方式任选其一：
- **方式一（推荐）Git 连接自动部署**：推一次代码，CF 自动构建上线，后续改工具只需 `git push`。
- **方式二 wrangler CLI 上传**：本地构建好 `dist/`，一条命令传到 CF，无需 Git。

---

## 零、上线前准备

| 物品 | 说明 |
|------|------|
| Cloudflare 账号 | 免费，官网注册即可 |
| 一个域名 | 已实名即可（**国外站无需 ICP 备案**）；可在 CF 直接买，或用其他注册商再把 DNS 转到 CF |
| 本地 Node.js | 18+（构建用；部署到 CF 后服务器不用你管） |
| （可选）Git 仓库 | 方式一需要；GitHub / GitLab 均可 |

> 成本：Cloudflare Pages 免费额度含无限站点、500 次构建/月、流量不限（合理使用），SSL 免费。除域名外几乎不花钱。

---

## 一、方式一：Git 连接自动部署（推荐）

### 1. 把项目推到 Git
```bash
git init
git add .
git commit -m "init online toolbox"
git remote add origin <你的仓库地址>
git push -u origin main
```
（注意：先把 `node_modules`、`dist` 加进 `.gitignore`）

### 2. 在 Cloudflare 创建 Pages 项目
1. 登录 Cloudflare Dashboard → 左侧 **Workers & Pages** → **Create** → 选 **Pages** → **Connect to Git**。
2. 授权并选择你的仓库。
3. 构建配置：
   - **Framework preset**：选 `Astro`
   - **Build command**：`npm run build`
   - **Build output directory**：`dist`
   - **Node.js version**：选 `20`（Settings → Environment variables 里加 `NODE_VERSION=20`，可选但稳妥）
4. 点 **Save and Deploy**。

### 3. 拿到预览域名
部署完会得到一个 `https://<项目名>.pages.dev` 预览地址，先点开验证工具是否正常。

### 4. 绑定你自己的域名
1. 项目里 **Custom domains** → 输入你的域名（如 `tools.example.com`）。
2. 按提示去域名注册商把该域名的 **CNAME** 指向 CF 给的值（或在 CF 里直接托管该域名 DNS）。
3. CF 会自动签发 SSL 证书（几分钟），之后走 HTTPS 访问。

> 之后每次改代码：`git push` → CF 自动重新构建上线，无需再来后台点。

---

## 二、方式二：wrangler CLI 手动上传 dist

适合不想用 Git、只想把本地构建产物传上去的情况。

### 1. 本地安装并登录 wrangler
```bash
npm install -g wrangler
wrangler login          # 浏览器授权
```

### 2. 本地构建
```bash
npm install
npm run build           # 产出 dist/
```

### 3. 上传到 Cloudflare Pages
```bash
wrangler pages deploy dist --project-name=online-toolbox
```
首次会创建项目，后续同名直接覆盖更新。部署完同样在 **Custom domains** 绑域名 + 自动 SSL。

> 如果部署失败或你不想装 CLI，直接把 Cloudflare API Token 给我，我来跑这条命令。

---

## 三、双语（/zh、/en）与"两个域名"怎么落地

当前站点已按 i18n 生成两套路由：
- 中国域名（如 `cn.example.com`）→ 指向 `/zh/`
- 国外域名（如 `example.com`）→ 指向 `/en/`

根路径 `/` 的跳转由 `src/pages/index.astro` **手写控制**（`meta http-equiv="refresh"` 跳到 `/zh/`）。

要改成默认跳英文版，直接改 `src/pages/index.astro` 里的 `url=/en/` 即可。
**注意**：改 `astro.config.mjs` 的 `defaultLocale` **不会影响**根路径跳转，别改错地方。

两种接法：
- **简单版（推荐起步）**：两个域名各自建一个 CF Pages 项目（同一份代码），在各自项目的 **Custom domains** 绑定；默认语言由 `astro.config.mjs` 的 `defaultLocale` 决定。
- **进阶版**：一个项目绑两个域名，用 CF **Rules → Redirect Rules / Transform Rules** 把 `example.com/` 重写到 `/en/`、`cn.example.com/` 重写到 `/zh/`。

> **SITE_URL（域名注入）**：`astro.config.mjs` 的 `site` 已改为读取环境变量 `SITE_URL`，**不再需要手改配置文件**。
> 部署前在 `.env.cf` 里填 `SITE_URL=https://你的域名`（见 `.env.cf.example`），`deploy.sh` 会自动注入并据此生成正确的 sitemap / canonical。
> 走方式一（Git 自动部署）时，在 CF Pages 项目 **Settings → Environment variables** 加 `SITE_URL` 同样生效。

---

## 四、广告位 & 微信/支付宝变现在哪填

- **广告位（当前已隐藏）**：每个页面原本都预留了 `<AdSlot>`（位置标识 `top / home / category / tool-top`），但**当前阶段为保持页面干净，`AdSlot.astro` 已改为空输出，全站不显示任何广告**。
  要开启时：在 `src/components/AdSlot.astro` 里把对应 `slot` 的注释处替换为广告代码（Google AdSense / 百度联盟 / 微信流量主），其余页面会自动带出。
- **微信/支付宝打赏**：工具页底部有 `<Support>` 组件（`src/components/Support.astro`）。
  最简单：把微信、支付宝**收款二维码**存为 `public/support-wx.png`、`public/support-ali.png`，再把占位 `<div>` 换成 `<img>` 即可，**零后端**。
  正式支付（JSAPI / 当面付）前期可不做。

---

## 五、常见失败排查

| 现象 | 原因 / 解决 |
|------|------|
| 部署报 Node 版本错 | Pages 默认 Node 可能过旧；Settings 加环境变量 `NODE_VERSION=20` |
| 页面 404 / 样式丢失 | 构建输出目录必须是 `dist`；Framework 选 `Astro` 会自动识别 |
| `_astro/*.js` 404 | 确认 `astro.config.mjs` 里 `build.format: 'directory'`（已配） |
| `wrangler` 提示未登录 | 先 `wrangler login`；或用 Dashboard 方式一 |
| 自定义域名不开 HTTPS | DNS 生效需几分钟~几小时；确认 CNAME 已指向 CF |
| 中文乱码 | 文件已是 UTF-8，正常不会；若乱码检查编辑器保存编码 |
| 工具页面空白 | 多为组件脚本报错；本地 `npm run dev` 打开控制台看报错 |

---

## 六、后续：打包成 Chrome 扩展（规划）

网站内容固定后，可把每个工具做成独立的 MV3 扩展页：
- 当前每个工具都是 `src/components/tools/<slug>.astro` 自包含组件，逻辑在 `<script>` 里，天然适合抽成独立 HTML 页面。
- 扩展形态：`manifest.json` + `popup.html`/各工具 `tool.html` + 复用现有组件逻辑，无需后端。
- 这一步等工具内容稳定后再做，架构已为此预留。

---

## 七、本地预览命令（调试用）

```bash
npm install
npm run dev        # 本地 http://localhost:4321 ，访问 /zh/ 或 /en/
npm run build      # 产出 dist/，可上传 CF 或本地静态服务器验证
```
