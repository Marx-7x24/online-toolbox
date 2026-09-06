// 微信系列工具共用的手机状态栏：时间 / 信号强度 / 手机网络 / 剩余电量。
// 控件 id 约定为 `${prefix}-sb-time|-sb-signal|-sb-net|-sb-bat`，预览容器 id 为 `${prefix}-screen`，
// 其内放置 .sb-statusbar 节点。改动实时同步到预览，与懒人工具箱一致。
export function bindStatusBar(prefix) {
  const $ = (id) => document.getElementById(prefix + id);
  function bars(n) {
    let s = '';
    for (let i = 1; i <= 4; i++) {
      const h = 5 + i * 3;
      s += `<span style="display:inline-block;width:3px;height:${h}px;margin-left:2px;background:${i <= n ? '#111' : '#c4c4c4'};border-radius:1px;vertical-align:bottom"></span>`;
    }
    return s;
  }
  function update() {
    const screen = $('screen');
    if (!screen) return;
    const bar = screen.querySelector('.sb-statusbar');
    if (!bar) return;
    const time = $('sb-time') ? $('sb-time').value : '14:30';
    const signal = $('sb-signal') ? parseInt($('sb-signal').value || '4', 10) : 4;
    const net = $('sb-net') ? $('sb-net').value : '5G';
    const batRaw = $('sb-bat') ? $('sb-bat').value : null;
    const bat = batRaw == null ? 80 : parseInt(batRaw, 10);
    bar.querySelector('.sb-time').textContent = time || '14:30';
    bar.querySelector('.sb-signal').innerHTML = bars(signal);
    bar.querySelector('.sb-net').textContent = net;
    const fill = bar.querySelector('.sb-battery i');
    if (fill) {
      fill.style.width = bat + '%';
      fill.style.background = bat <= 20 ? '#e64340' : bat <= 50 ? '#fa9d3b' : '#07C160';
    }
  }
  ['sb-time', 'sb-signal', 'sb-net', 'sb-bat'].forEach((suffix) => {
    const el = $(suffix);
    if (el) {
      el.addEventListener('input', update);
      el.addEventListener('change', update);
    }
  });
  update();
  return update;
}

// 复用的状态栏 HTML 片段（放进每个预览屏幕顶部，prefix 需与控件一致）
export function statusBarHtml() {
  return `<div class="sb-statusbar"><span class="sb-time">14:30</span><span class="sb-right"><span class="sb-signal"></span><span class="sb-net">5G</span><span class="sb-battery"><i></i></span></span></div>`;
}
