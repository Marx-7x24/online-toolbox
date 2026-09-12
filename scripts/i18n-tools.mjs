/**
 * 工具组件 i18n 批处理：把 src/components/tools/*.astro 里的中文 UI 文案
 * 机械替换为 tu(lang, '原文') 调用，并注入 lang prop / import。
 *
 * 用法：
 *   node scripts/i18n-tools.mjs --file base64   # 只处理单个组件（试点）
 *   node scripts/i18n-tools.mjs --dry           # 全量预览（不写盘）
 *   node scripts/i18n-tools.mjs                 # 全量写入
 *
 * 设计要点：
 *  - 只处理「模板文本」「属性值」「<script> 内字符串字面量」，<style> 与 frontmatter 跳过；
 *  - 属性先替换并用占位符保护，避免被后续文本替换二次包裹（否则会生成语法错误的嵌套）；
 *  - 中文串允许内部含空格/ASCII/中文标点，避免把一句话切碎；
 *  - 幂等：已含 tu(...) 的片段不会二次包裹；
 *  - 字典缺条目时 tu() 回退中文，替换永远安全，翻译可增量补充。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'src/components/tools');

// 中文串：以汉字开头，中间允许汉字/中文标点/空格/ASCII（不含 < > = " ' { } / 等 HTML 敏感字符），
// 以汉字或句末标点结尾。这样「中文采用 UTF-8 编码处理，不会出现乱码。」能整体命中。
const CN = /[\u4e00-\u9fff](?:[\u4e00-\u9fff\u3001\u3002\uff0c\uff1a\uff1b\uff01\uff1f\uff08\uff09\u2026\u2014 0-9A-Za-z.,:;!?()+\-%·]*[\u4e00-\u9fff\u3002\uff01\uff1f])?/g;
const TRANS_ATTRS = ['placeholder', 'title', 'aria-label', 'alt', 'value', 'label', 'data-tip'];
const HOLD = '\u0000'; // 占位符保护已处理片段

// 用逐行方式拆 frontmatter，兼容空 frontmatter（---\n---\n）的情况
function splitFile(src) {
  const lines = src.split('\n');
  if (lines[0].trim() !== '---') return { fm: null, body: src };
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      return {
        fm: lines.slice(1, i).join('\n'),
        body: lines.slice(i + 1).join('\n'),
      };
    }
  }
  return { fm: null, body: src };
}

function injectFrontmatter(fm) {
  let out = (fm ?? '').replace(/^\s+|\s+$/g, '');
  if (!/toolUi/.test(out)) {
    out = `import { tu } from '../../i18n/toolUi.ts';\n${out}`;
  }
  if (!/Astro\.props/.test(out)) {
    out += `\ninterface Props { lang?: string }\nconst { lang = 'zh' } = Astro.props;\n`;
  } else if (!/\blang\b\s*=/.test(out)) {
    out = out.replace(/const\s*\{([^}]*)\}\s*=\s*Astro\.props;/, (s, inner) =>
      s.replace(inner, inner.trim() ? `${inner.trim()}, lang = 'zh'` : `lang = 'zh'`)
    );
  }
  return out;
}

function splitBlocks(body) {
  const parts = [];
  const re = /<(script|style)\b([^>]*)>([\s\S]*?)<\/\1>/g;
  let last = 0;
  let m;
  while ((m = re.exec(body))) {
    if (m.index > last) parts.push({ type: 'tpl', text: body.slice(last, m.index) });
    parts.push({ type: m[1], attrs: m[2], inner: m[3] });
    last = m.index + m[0].length;
  }
  if (last < body.length) parts.push({ type: 'tpl', text: body.slice(last) });
  return parts;
}

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const wrap = (s) => `{tu(lang, '${esc(s.trim())}')}`;

// 已存在的 tu(...) 调用（含模板里的 {tu(lang,'x')} 与脚本里的 tu(LANG,'x')），
// 替换前先抽出来保护，保证脚本重复运行不会二次包裹（幂等）。
const TU_CALL = /\{?tu\((?:lang|LANG),\s*(?:'[^']*'|"[^"]*")\)\}?/g;

function processTemplate(text, store) {
  let out = text;

  // 0) 保护既有 tu 调用
  out = out.replace(TU_CALL, (s) => {
    store.push(s);
    return `${HOLD}${store.length - 1}${HOLD}`;
  });

  // 1) 属性：placeholder="中文" -> placeholder={tu(lang,'中文')}（结果入占位符，防二次处理）
  for (const attr of TRANS_ATTRS) {
    // 同时支持双引号与单引号属性（如 placeholder='[{"id":1}]'），否则单引号属性会漏到
    // 文本替换阶段，把示例数据里的中文也替换掉，导致引号冲突。
    const re = new RegExp(`\\b${attr}=("([^"]*)"|'([^']*)')`, 'g');
    out = out.replace(re, (whole, _g, dq, sq) => {
      const quote = dq !== undefined ? '"' : "'";
      const val = dq !== undefined ? dq : sq;
      CN.lastIndex = 0;
      const trimmed = val.trim();
      // 代码/示例数据不翻译（如 placeholder='[{"id":1,"name":"张三"}]' 里的示例人名），
      // 但无论是否翻译，属性值都会被占位符保护 —— 否则文本替换阶段会误伤属性值内部。
      if (CN.test(val) && !/["{}<>]/.test(trimmed)) {
        const isPure = !/[A-Za-z]{2,}/.test(trimmed);
        const replaced = isPure ? wrap(trimmed) : trimmed.replace(CN, (s) => wrap(s));
        store.push(replaced);
        const idx = store.length - 1;
        // 纯中文用裸表达式；混合内容（如 "Base64 结果"）保留引号，否则属性值会被截断
        return isPure ? `${attr}=${HOLD}${idx}${HOLD}` : `${attr}="${HOLD}${idx}${HOLD}"`;
      }
      store.push(val);
      return `${attr}=${quote}${HOLD}${store.length - 1}${HOLD}${quote}`;
    });
  }
  CN.lastIndex = 0;

  // 2) 文本节点里的中文（跳过含 { } 的，避免破坏已有的 JSX 表达式）
  out = out.replace(CN, (s) => {
    if (/[{}]/.test(s.trim())) return s;
    store.push(wrap(s));
    return `${HOLD}${store.length - 1}${HOLD}`;
  });
  CN.lastIndex = 0;

  // 3) 还原占位符
  return out.replace(new RegExp(`${HOLD}(\\d+)${HOLD}`, 'g'), (_, i) => store[Number(i)]);
}

function processScript(part) {
  let inner = part.inner;
  const before = inner;

  // 有些文件误用 <script> 包 CSS（内容全是选择器，没有函数调用）。
  // 这类块不能注入 import，否则会生成非法 JS，直接跳过。
  // 注意：不能用 \bvar\b 判断，CSS 的 var(--x) 会被误判成 JS。
  const jsLike =
    /\bfunction\b|=>|\b(?:const|let|var)\s+\w+\s*=|;?\s*\breturn\b|document\.|addEventListener|querySelector|\$\(/;
  const looksLikeCss = /^\s*[.#@a-z\[][^{}]*\{/i.test(inner) && !jsLike.test(inner);
  // 源码缺陷：用 <script> 包 CSS，浏览器会当 JS 执行而报错（样式也完全不生效）。
  // 这里顺手纠正为 <style>，样式才能真正生效。
  if (looksLikeCss) return `<style>${inner}</style>`;

  // 只替换"纯文案"字符串：
  //  - 含 { } " \ < > 的多半是代码/模板片段；
  //  - 后面紧跟冒号的是**对象 key**（如 { '京A': '北京' }），替换会破坏语法。
  const isCodeLike = (s) => /[{}"\\<>]/.test(s);
  const isObjectKey = (str, offset, whole) => /^\s*:/.test(str.slice(offset + whole.length));
  inner = inner.replace(/'([^'\n]*[\u4e00-\u9fff][^'\n]*)'/g, (whole, s, offset, str) =>
    /tu\(/.test(s) || isCodeLike(s) || isObjectKey(str, offset, whole) ? whole : `tu(LANG, '${esc(s)}')`
  );
  inner = inner.replace(/"([^"\n]*[\u4e00-\u9fff][^"\n]*)"/g, (whole, s, offset, str) =>
    /tu\(/.test(s) || isCodeLike(s) || isObjectKey(str, offset, whole) ? whole : `tu(LANG, "${s.replace(/"/g, '\\"')}")`
  );
  if (inner === before) return null;

  let head = '';
  if (!/toolUi/.test(inner)) head += `import { tu, currentLang } from '../../i18n/toolUi.ts';\n`;
  if (!/const LANG/.test(inner)) head += `const LANG = currentLang();\n`;
  return `<script${part.attrs}>${head}${inner}</script>`;
}

function processFile(file, dry) {
  const src = fs.readFileSync(file, 'utf8');
  const { fm, body } = splitFile(src);
  const store = [];
  let out = '';
  for (const p of splitBlocks(body)) {
    if (p.type === 'tpl') out += processTemplate(p.text, store);
    else if (p.type === 'script') out += processScript(p) ?? `<script${p.attrs}>${p.inner}</script>`;
    // style 块原样输出（曾误写成 <script>，会把样式变成非法 JS 导致构建失败）
    else out += `<style${p.attrs}>${p.inner}</style>`;
  }
  const result = `---\n${injectFrontmatter(fm)}\n---\n${out}`;
  if (!dry) fs.writeFileSync(file, result);
  return result !== src;
}

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const only = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;

let files = fs.readdirSync(DIR).filter((f) => f.endsWith('.astro'));
if (only) files = files.filter((f) => f.replace(/\.astro$/, '') === only);

let n = 0;
for (const f of files) {
  try {
    if (processFile(path.join(DIR, f), dry)) n++;
  } catch (e) {
    console.error(`[i18n-tools] ${f} 失败: ${e.message}`);
  }
}
console.log(`[i18n-tools] ${dry ? '预览' : '已处理'} ${n}/${files.length} 个组件${only ? ` (${only})` : ''}`);
