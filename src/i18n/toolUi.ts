// 工具组件 UI 文案的翻译入口。
// 用法（组件内）：{tu(lang, '复制')}  → 中文站输出「复制」，英文站输出「Copy」。
// 字典见 ./toolUiDict.ts，缺条目自动回退中文原文，不会抛错。
import { TOOL_UI_DICT } from './toolUiDict.ts';

export function tu(lang: string, zh: string): string {
  if (lang === 'zh') return zh;
  return TOOL_UI_DICT[zh] ?? zh;
}

// 供客户端 <script> 使用：从 <html lang> 判断当前语言。
export function currentLang(): 'zh' | 'en' {
  if (typeof document === 'undefined') return 'zh';
  return document.documentElement.lang === 'en' ? 'en' : 'zh';
}
