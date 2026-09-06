// 界面文案双语字典 + 取词助手。
// 第一阶段：导航/页脚/关于页等"外壳"已双语；工具内部文案中文优先，英文缺失时回退中文（后续逐步补齐）。

export const LANGS = ['zh', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const UI: Record<Lang, Record<string, string>> = {
  zh: {
    siteName: '在线工具箱',
    tagline: '免费在线工具合集，打开即用',
    home: '首页',
    about: '关于',
    toolsCount: '个工具',
    footerPrivacy: '所有工具均在浏览器本地运行，文件不会上传到服务器。',
    footerCopy: '© 2026 在线工具箱',
    ad: '广告位',
    supportTitle: '支持我们',
    supportWx: '微信支付',
    supportAli: '支付宝',
    supportTip: '若本工具对您有帮助，欢迎扫码打赏，支持我们持续开发与维护。',
    breadHome: '首页',
    aboutTitle: '关于在线工具箱',
    aboutIntro: '我们致力于提供一站式、即开即用的在线工具，覆盖办公、学习、生活与开发场景。',
    searchPlaceholder: '搜索工具...',
    allTools: '全部工具',
    recentTools: '最近使用',
    recentEmpty: '暂无最近使用',
    recentPageTitle: '最近使用',
    recentPageSubtitle: '（本地存储）记录保存在你自己的浏览器中，不会上传到服务器。',
    recentEmptyPage: '暂无最近访问的工具',
    recentEmptyCta: '去逛逛工具',
    recentClear: '清空',
    recentConfirm: '确定清空最近使用记录？',
    recentViewAll: '查看全部',
    relatedTools: '相关工具',
    toolGuide: '使用说明',
  },
  en: {
    siteName: 'Online Toolbox',
    tagline: 'Free online tools, ready to use',
    home: 'Home',
    about: 'About',
    toolsCount: 'tools',
    footerPrivacy: 'All tools run locally in your browser. Your files are never uploaded to any server.',
    footerCopy: '© 2026 Online Toolbox',
    ad: 'Advertisement',
    supportTitle: 'Support Us',
    supportWx: 'WeChat Pay',
    supportAli: 'Alipay',
    supportTip: 'If this tool helps you, feel free to scan the QR code to support our development.',
    breadHome: 'Home',
    aboutTitle: 'About Online Toolbox',
    aboutIntro: 'We provide a one-stop, ready-to-use collection of online tools for work, study, life and development.',
    searchPlaceholder: 'Search tools...',
    recentTools: 'Recent',
    recentEmpty: 'No recent tools',
    recentPageTitle: 'Recent',
    recentPageSubtitle: 'Stored locally in your own browser — never uploaded to any server.',
    recentEmptyPage: 'No recently visited tools',
    recentEmptyCta: 'Browse tools',
    recentClear: 'Clear',
    recentConfirm: 'Clear all recent tools?',
    recentViewAll: 'View all',
    relatedTools: 'Related Tools',
    toolGuide: 'How to use',
  },
};

export function t(lang: Lang, key: string): string {
  return UI[lang]?.[key] ?? UI.zh[key] ?? key;
}
