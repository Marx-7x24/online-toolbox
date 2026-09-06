// 工具「使用说明」：工具正文下方展示的简短用法说明（仿懒人每个工具下方的说明段落）。
// 仅微信族工具先补齐；后续可逐步扩展到更多工具。getGuide 返回 null 表示不展示说明区。

export const GUIDES = {
  wechat: {
    zh: '在下侧逐条添加对话：选择发送方（我 / 对方）、输入文字、设置时间，即可实时生成微信单聊界面。点击「导出 PNG」把整段聊天保存为图片。所有数据仅在本机浏览器处理，不会上传。',
    en: 'Add messages below: pick the sender (me / the other), type text and set a time to build a WeChat one-on-one chat in real time. Click Export PNG to save it as an image. Everything runs locally in your browser.',
  },
  'wechat-chat': {
    zh: '选择搞笑、土味、表白、怼人等内置对话模板，一键复制完整对话文案，可直接粘贴使用。文案仅供娱乐，请勿用于诈骗或冒充他人。',
    en: 'Pick a built-in script (funny, cringe, confession, roast…) and copy the full conversation in one click. For entertainment only—do not use it to impersonate or scam anyone.',
  },
  'wechat-group': {
    zh: '添加多位群成员并设置昵称与头像，逐条指定发送者、文字与时间，生成微信群聊截图。点击「导出 PNG」保存。数据全部在本地处理，不上传服务器。',
    en: 'Add group members with names and avatars, then assign each message’s sender, text and time to build a group-chat screenshot. Click Export PNG to save. All data stays in your browser.',
  },
  'wechat-moments': {
    zh: '填写正文，上传最多 9 张图片，添加点赞与评论，生成朋友圈截图并导出 PNG。图片仅在本地读取，不会上传。',
    en: 'Write a post, upload up to 9 images, add likes and comments to compose a Moments screenshot, then export as PNG. Images are read locally only.',
  },
  'wechat-pro': {
    zh: '进阶版聊天模拟：自定义聊天背景、语音消息气泡、系统提示与时间分割线，导出高清 PNG。适合需要更逼真界面的场景。所有内容本地生成，不上传。',
    en: 'Advanced chat simulator: custom wallpaper, voice-message bubbles, system notices and time dividers, exported as hi-res PNG. Everything is generated locally.',
  },
  'wechat-wallet': {
    zh: '在右侧填写零钱余额、零钱通余额与交易流水（每行一笔：图标关键字 + 金额，例「收+100」「转-50」），左侧预览实时同步更新。可设置状态栏时间，「导出 PNG」保存微信零钱截图。数据仅本地处理，不上传，请勿用于虚假展示或欺诈。',
    en: 'Enter change balance, wealth-balance (零钱通) and transactions on the right (one per line: keyword + amount, e.g. “收+100”, “转-50”); the left preview updates live. Set the status-bar time and click Export PNG. Runs locally—do not use for fraud.',
  },
  'wechat-qrcode': {
    zh: '填写群名称并粘贴群邀请链接，可添加多个群，生成微信群活码卡片并导出 PNG。本工具生成静态活码；如需动态跳转或 7 天自动轮换，需要服务端支持。',
    en: 'Enter group names and invite links (multiple groups supported) to generate a WeChat group QR “live code” card and export PNG. This tool produces a static code; dynamic rotation needs a server.',
  },
  'wechat-alipay': {
    zh: '上传微信收款码与支付宝收款码两张图片，左右合并并加标签，导出 PNG，方便一图同时展示两种收款方式。图片仅在本地读取与合成，不上传。',
    en: 'Upload your WeChat and Alipay payment QR images; they are merged side by side with labels and exported as PNG. Images are processed locally only.',
  },
  'wechat-multi': {
    zh: '设置需要多开的微信实例数量，一键生成多开 .bat 批处理文件，在本地双击即可启动多个微信。文件仅在本机生成，不会上传任何信息。',
    en: 'Set how many WeChat instances you need and generate a multi-open .bat script you can run locally to launch several WeChat windows. The script is created on your machine only.',
  },
  'marketing-card': {
    zh: '填写标题、副标题，上传主图与二维码，一键合成营销海报并导出 PNG。所有素材仅在本地合成，不上传。',
    en: 'Fill in the title and subtitle, upload a hero image and QR code, then compose a marketing poster and export PNG. Assets are merged locally only.',
  },
};

export function getGuide(slug, lang) {
  const g = GUIDES[slug];
  if (!g) return null;
  if (lang === 'en') return g.en || g.zh || null;
  return g.zh || g.en || null;
}
