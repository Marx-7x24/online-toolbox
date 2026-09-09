// 工具页「长尾正文 + FAQ」内容生成。
// 目的：绝大多数工具页此前只有工具本体、没有文字，属 thin content（Google 评级低）。
// 这里用工具的 name / desc / 分类 / 关键词注入模板，让每个页面生成**带有该工具名称与描述**
// 的独特说明与问答，既补长尾词，又避免全站文字雷同。

// 分类的通俗叫法（用于正文里自然地带出分类词，中文站吃「XXX在线工具」类长尾搜索）
const CAT_LABEL = {
  webmaster: { zh: '站长工具', en: 'webmaster tools' },
  code: { zh: '编程开发工具', en: 'developer tools' },
  text: { zh: '文本处理工具', en: 'text tools' },
  image: { zh: '图片处理工具', en: 'image tools' },
  'doc-convert': { zh: '文档转换工具', en: 'document converters' },
  media: { zh: '音视频工具', en: 'media tools' },
  life: { zh: '生活常用工具', en: 'everyday tools' },
  encode: { zh: '编码加密工具', en: 'encoding & crypto tools' },
  unit: { zh: '单位换算工具', en: 'unit converters' },
};

function catLabel(category, lang) {
  const c = CAT_LABEL[category];
  if (!c) return lang === 'en' ? 'online tools' : '在线工具';
  return lang === 'en' ? c.en : c.zh;
}

/**
 * 生成工具「使用说明」正文。
 * 已在 guides.js 手写过的工具优先用人工文案，其余用模板生成（注入工具名/描述/分类）。
 */
export function buildGuide(tool, lang, manualGuide) {
  if (manualGuide) return manualGuide;
  const name = lang !== 'zh' && tool.name_en ? tool.name_en : tool.name;
  const desc =
    lang !== 'zh' && tool.desc_en ? tool.desc_en : tool.desc || '';
  const cat = catLabel(tool.category, lang);

  if (lang === 'en') {
    return `${name} is a free online tool in our ${cat} collection. ${desc} ` +
      `Just enter or upload your content above and the result updates instantly — copy or download it in one click. ` +
      `No signup, no installation, and everything runs locally in your browser: your files are never uploaded to any server.`;
  }
  return `${name}是一款免费的在线${cat}，${desc}使用方法很简单：在上方的输入框填写或上传内容，结果会实时更新，支持一键复制或下载。无需注册、无需安装软件，全程在你的浏览器本地完成，文件不会上传到服务器。`;
}

/**
 * 生成 3 条 FAQ（含工具名与描述，避免全站雷同），供页面展示 + FAQPage 结构化数据使用。
 */
export function buildFaq(tool, lang) {
  const name = lang !== 'zh' && tool.name_en ? tool.name_en : tool.name;
  const desc =
    (lang !== 'zh' && tool.desc_en ? tool.desc_en : tool.desc) || '';
  const cleanDesc = desc.replace(/。$/, '');

  if (lang === 'en') {
    return [
      {
        q: `How do I use ${name}?`,
        a: `${cleanDesc}. Open the tool above, enter or upload your content, and the result appears instantly — then copy or download it. No signup required.`,
      },
      {
        q: `Is ${name} free?`,
        a: `Yes. ${name} is completely free with no signup, no login and no usage limit. You can use it as often as you like.`,
      },
      {
        q: `Do I need to upload my files? Is my data safe?`,
        a: `No upload needed. Every tool on Wevva Tools runs locally in your browser, so your files and text never leave your device — nothing is stored on our servers.`,
      },
    ];
  }

  return [
    {
      q: `${name}怎么用？`,
      a: `${cleanDesc}。打开上方工具，输入或上传内容，结果会立即生成，可直接复制或下载，无需注册。`,
    },
    {
      q: `${name}是免费的吗？`,
      a: `完全免费。${name}无需注册登录，也不限制使用次数，你可以随时反复使用。`,
    },
    {
      q: `需要上传文件吗？数据安全吗？`,
      a: `不需要上传。Wevva 极速工具箱的所有工具都在你自己的浏览器本地运行，文件和输入内容不会离开你的设备，服务器不会保存任何数据。`,
    },
  ];
}
