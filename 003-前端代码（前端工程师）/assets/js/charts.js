/* ============================================================
   伴读智汇 · 图表库（dataviz 方法论实现）
   - 配色经 validate_palette.js 六项检查验证（见 tools/palette-check.mjs）：
     单序列浅色 #1F3A5F（白面 ≥3:1）/ 暗色 #4E86C8（#222631 面 ≥3:1）
     双序列（需区分身份时）#4E86C8 + #C87F2E，浅/暗两模式全部通过
     顺序色阶（热力图）：浅 #8DACBA→#00083B；暗 #00204E→#6F95BA（暗色翻转锚点）
   - 标记规范：柱 ≤24px 厚、4px 圆角数据端、基线端直角；线 2px；
     标记点 ≥8px 带 2px 表面环；网格线 1px 实线弱化
   - 交互：柱/点悬浮提示、折线十字光标；每个图表附数据表视图
   ============================================================ */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- 令牌（浅/暗双模式） ---------- */
  var TOKENS = {
    light: {
      surface: '#FFFFFF',
      series1: '#1F3A5F',        // 单序列品牌墨蓝
      blue: '#4E86C8',           // 多序列蓝（已验证）
      orange: '#C87F2E',         // 多序列杏橘（已验证）
      gray: '#B9B7B0',           // 强调形式中的灰色上下文
      grid: '#E5E0D8', axis: '#C9C4BB',
      ink: '#2B2B2B', muted: '#6B7280',
      seq: ['#8DACBA', '#6082B0', '#335586', '#0A2E60', '#00083B']
    },
    dark: {
      surface: '#222631',
      series1: '#4E86C8',
      blue: '#4E86C8',
      orange: '#C87F2E',
      gray: '#6A6D76',
      grid: '#3A3D47', axis: '#4A4E59',
      ink: '#E8E6DF', muted: '#A7A9B0',
      seq: ['#00204E', '#1A3D6E', '#375C8E', '#567BB0', '#6F95BA']
    }
  };
  function tk() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? TOKENS.dark : TOKENS.light;
  }
  function seqStep(v, max) {
    var t = tk().seq;
    if (v == null) return null;
    var idx = Math.round(v / max * (t.length - 1));
    return t[Math.max(0, Math.min(t.length - 1, idx))];
  }

  /* ---------- 工具 ---------- */
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function fmt(n) {
    n = Math.round(n);
    if (Math.abs(n) >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + '万';
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  /* ---------- 悬浮提示（单例） ---------- */
  var tip = null;
  function tooltip() {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.className = 'viz-tip';
    tip.style.cssText = 'position:fixed;z-index:400;display:none;pointer-events:none;' +
      'background:var(--card,#fff);border:1px solid var(--divider,#e5e0d8);border-radius:8px;' +
      'box-shadow:0 6px 20px rgba(31,58,95,.18);padding:8px 12px;font-size:12.5px;line-height:1.6;' +
      'color:var(--ink,#2b2b2b);max-width:260px;';
    document.body.appendChild(tip);
    return tip;
  }
  function showTip(html, x, y) {
    var t = tooltip();
    t.innerHTML = html;
    t.style.display = 'block';
    var r = t.getBoundingClientRect();
    var left = Math.min(x + 14, window.innerWidth - r.width - 10);
    var top = Math.min(y + 14, window.innerHeight - r.height - 10);
    t.style.left = Math.max(10, left) + 'px';
    t.style.top = Math.max(10, top) + 'px';
  }
  function hideTip() { if (tip) tip.style.display = 'none'; }
  function swatch(color) {
    return '<span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:' + color + ';margin-right:6px"></span>';
  }
  function dot(color) {
    return '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + color + ';margin-right:6px;border:1px solid rgba(0,0,0,.15)"></span>';
  }

  /* ---------- 框架 ---------- */
  var registry = [];
  function mount(container, renderFn, opts) {
    var t = tk();
    container.innerHTML = '';
    container.classList.add('viz-root');
    var wrap = document.createElement('div');
    wrap.className = 'viz-canvas';
    wrap.style.position = 'relative';
    container.appendChild(wrap);
    var id = 'viz-' + (registry.length + 1) + '-' + Date.now().toString(36);
    registry.push({ container: container, render: renderFn, opts: opts });
    renderFn(wrap, t, opts);
    // 数据表视图（无障碍通道）
    if (opts.table) {
      var det = document.createElement('details');
      det.className = 'viz-table';
      var sum = document.createElement('summary');
      sum.textContent = '查看数据表';
      det.appendChild(sum);
      var tbl = document.createElement('table');
      tbl.className = 'viz-tbl';
      var head = '<tr><th>' + opts.table.cols.map(function (c) { return esc(c); }).join('</th><th>') + '</th></tr>';
      var body = opts.table.rows.map(function (r) {
        return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
      }).join('');
      tbl.innerHTML = head + body;
      det.appendChild(tbl);
      container.appendChild(det);
    }
  }
  global.Charts = {
    rerenderAll: function () {
      registry.forEach(function (r) {
        r.render(r.container.querySelector('.viz-canvas'), tk(), r.opts);
      });
    }
  };

  /* ---------- 轴与网格 ---------- */
  function niceMax(v) {
    if (v <= 30) return Math.ceil(v / 10) * 10;
    if (v <= 100) return Math.ceil(v / 20) * 20;
    return Math.ceil(v / 50) * 50;
  }

  /* ============================================================
     柱状图（纵向）—— 单序列
     opts: { data:[{label,value}], target?, unit?, height? }
     ============================================================ */
  function barChart(container, opts) {
    opts.height = opts.height || 220;
    opts.table = {
      cols: ['日期', opts.unit || '数值'],
      rows: opts.data.map(function (d) { return [d.label, d.value]; })
    };
    mount(container, function (wrap, t, o) {
      var W = wrap.clientWidth || 480, H = o.height;
      var padL = 40, padR = 14, padT = 18, padB = 34;
      var iw = W - padL - padR, ih = H - padT - padB;
      var maxV = Math.max.apply(null, o.data.map(function (d) { return d.value; }).concat([o.target || 0]));
      var yMax = niceMax(maxV);
      var svg = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': o.aria || '柱状图' }, wrap);
      // 网格线（1px 实线，弱化）
      var yTicks = 4;
      for (var i = 0; i <= yTicks; i++) {
        var vy = padT + ih - ih * i / yTicks;
        el('line', { x1: padL, y1: vy, x2: W - padR, y2: vy, stroke: t.grid, 'stroke-width': 1 }, svg);
        var tx = el('text', { x: padL - 10, y: vy + 4, 'text-anchor': 'end', 'font-size': 11, fill: t.muted, 'font-family': 'var(--sans)', 'font-variant-numeric': 'tabular-nums' }, svg);
        tx.textContent = fmt(yMax * i / yTicks);
      }
      // 目标线（参照线，非数据墨迹）
      if (o.target) {
        var ty = padT + ih - ih * o.target / yMax;
        el('line', { x1: padL, y1: ty, x2: W - padR, y2: ty, stroke: t.axis, 'stroke-width': 1, 'stroke-dasharray': '4 4' }, svg);
        var tl = el('text', { x: W - padR, y: ty - 6, 'text-anchor': 'end', 'font-size': 11, fill: t.muted }, svg);
        tl.textContent = '目标 ' + o.target + (o.unit || '');
      }
      // 柱
      var slot = iw / o.data.length;
      var barW = Math.min(24, slot * 0.52);
      o.data.forEach(function (d, i) {
        var cx = padL + slot * i + slot / 2;
        var h = ih * d.value / yMax;
        var by = padT + ih - h;
        var g = el('g', {}, svg);
        var b = el('rect', {
          x: cx - barW / 2, y: by, width: barW, height: Math.max(h, d.value > 0 ? 3 : 0),
          rx: 4, fill: t.series1
        }, g);
        // 圆角数据端 + 直角基线端（用 path 修正底部）
        if (d.value > 0) {
          var p = 'M' + (cx - barW / 2) + ' ' + (padT + ih) +
            ' L' + (cx - barW / 2) + ' ' + (by + 4) +
            ' Q' + (cx - barW / 2) + ' ' + by + ' ' + (cx - barW / 2 + 4) + ' ' + by +
            ' L' + (cx + barW / 2 - 4) + ' ' + by +
            ' Q' + (cx + barW / 2) + ' ' + by + ' ' + (cx + barW / 2) + ' ' + (by + 4) +
            ' L' + (cx + barW / 2) + ' ' + (padT + ih) + ' Z';
          var pb = el('path', { d: p, fill: t.series1 }, g);
          b.parentNode.removeChild(b);
        }
        // 悬浮（命中区域大于柱本身）
        var hit = el('rect', {
          x: cx - slot / 2 + 2, y: padT, width: slot - 4, height: ih,
          fill: 'transparent'
        }, g);
        hit.addEventListener('mousemove', function (ev) {
          showTip('<b>' + esc(d.label) + '</b><br>' + swatch(t.series1) + esc(d.value) + ' ' + esc(o.unit || ''),
            ev.clientX, ev.clientY);
        });
        hit.addEventListener('mouseleave', hideTip);
        // x 轴标签
        var xt = el('text', { x: cx, y: H - 10, 'text-anchor': 'middle', 'font-size': 11, fill: t.muted }, svg);
        xt.textContent = d.label;
        // 选择性直接标注：端点与极值
        var isExtreme = d.value === Math.max.apply(null, o.data.map(function (x) { return x.value; }));
        var isEnd = i === o.data.length - 1;
        if ((isExtreme || isEnd) && d.value > 0) {
          var vt = el('text', { x: cx, y: by - 7, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 600, fill: t.ink }, svg);
          vt.textContent = d.value;
        }
      });
    }, opts);
  }

  /* ============================================================
     横向柱状图 —— 单序列（完成率等）
     opts: { data:[{label, value, meta?}], unit?, max?, height? }
     ============================================================ */
  function barH(container, opts) {
    opts.max = opts.max || 100;
    opts.table = {
      cols: ['名称', opts.unit || '数值', '备注'],
      rows: opts.data.map(function (d) { return [d.label, d.value, d.meta || '']; })
    };
    mount(container, function (wrap, t, o) {
      var W = wrap.clientWidth || 560;
      var rowH = 34, padL = 86, padR = 40;
      var H = o.data.length * rowH + 12;
      var svg = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': o.aria || '横向柱状图' }, wrap);
      var iw = W - padL - padR;
      o.data.forEach(function (d, i) {
        var cy = 10 + rowH * i + rowH / 2;
        var lt = el('text', { x: padL - 12, y: cy + 4, 'text-anchor': 'end', 'font-size': 12.5, fill: t.ink }, svg);
        lt.textContent = d.label;
        var w = Math.max(d.value > 0 ? 4 : 0, iw * d.value / o.max);
        var g = el('g', {}, svg);
        var p = 'M0 ' + (cy - 9) +
          ' L' + (w - 4) + ' ' + (cy - 9) +
          ' Q' + w + ' ' + (cy - 9) + ' ' + w + ' ' + (cy - 5) +
          ' L' + w + ' ' + (cy + 9) +
          ' Q' + w + ' ' + (cy + 9) + ' ' + (w - 4) + ' ' + (cy + 9) +
          ' L0 ' + (cy + 9) + ' Z';
        var bar = el('path', { d: p, fill: t.series1, transform: 'translate(' + padL + ',0)' }, g);
        var hit = el('rect', { x: padL, y: cy - 14, width: iw, height: 28, fill: 'transparent' }, g);
        hit.addEventListener('mousemove', function (ev) {
          showTip('<b>' + esc(d.label) + '</b><br>' + swatch(t.series1) + esc(d.value) + ' ' + esc(o.unit || '') +
            (d.meta ? '<br><span style="color:var(--muted)">' + esc(d.meta) + '</span>' : ''), ev.clientX, ev.clientY);
        });
        hit.addEventListener('mouseleave', hideTip);
        var vt = el('text', { x: padL + w + 8, y: cy + 4, 'font-size': 12, 'font-weight': 600, fill: t.ink, 'font-variant-numeric': 'tabular-nums' }, svg);
        vt.textContent = d.value + (o.unit || '');
      });
      el('line', { x1: padL, y1: H - 2, x2: W - padR, y2: H - 2, stroke: t.grid, 'stroke-width': 1 }, svg);
    }, opts);
  }

  /* ============================================================
     折线图 —— 1-2 序列 / 强调形式
     opts: { labels:[], series:[{name, color:'blue'|'orange'|'gray'|'series1', data:[]}], unit?, height?, endLabel? }
     ============================================================ */
  function lineChart(container, opts) {
    opts.height = opts.height || 220;
    opts.table = {
      cols: [''].concat(opts.labels),
      rows: opts.series.map(function (s) { return [s.name].concat(s.data); })
    };
    mount(container, function (wrap, t, o) {
      var W = wrap.clientWidth || 560, H = o.height;
      var padL = 40, padR = 52, padT = 18, padB = 34;
      var iw = W - padL - padR, ih = H - padT - padB;
      var all = [];
      o.series.forEach(function (s) { all = all.concat(s.data); });
      var yMax = niceMax(Math.max.apply(null, all.concat([1])));
      var svg = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': o.aria || '折线图' }, wrap);
      for (var i = 0; i <= 4; i++) {
        var vy = padT + ih - ih * i / 4;
        el('line', { x1: padL, y1: vy, x2: W - padR, y2: vy, stroke: t.grid, 'stroke-width': 1 }, svg);
        var tx = el('text', { x: padL - 10, y: vy + 4, 'text-anchor': 'end', 'font-size': 11, fill: t.muted, 'font-variant-numeric': 'tabular-nums' }, svg);
        tx.textContent = fmt(yMax * i / 4);
      }
      var n = o.labels.length;
      function px(i) { return padL + (n === 1 ? iw / 2 : iw * i / (n - 1)); }
      function py(v) { return padT + ih - ih * v / yMax; }
      o.labels.forEach(function (lb, i) {
        var x = px(i);
        el('line', { x1: x, y1: padT, x2: x, y2: padT + ih, stroke: t.grid, 'stroke-width': 1, opacity: 0.5 }, svg);
        var xt = el('text', { x: x, y: H - 10, 'text-anchor': 'middle', 'font-size': 11, fill: t.muted }, svg);
        xt.textContent = lb;
      });
      var colorOf = function (c) {
        if (c === 'orange') return t.orange;
        if (c === 'gray') return t.gray;
        if (c === 'blue') return t.blue;
        return t.series1;
      };
      // 十字光标
      var cross = el('line', { y1: padT, y2: padT + ih, stroke: t.axis, 'stroke-width': 1, opacity: 0 }, svg);
      var crossHit = el('rect', { x: padL, y: padT, width: iw, height: ih, fill: 'transparent' }, svg);
      var dots = [];
      o.series.forEach(function (s) {
        var col = colorOf(s.color);
        var linePath = '';
        s.data.forEach(function (v, i) { linePath += (i ? 'L' : 'M') + px(i) + ' ' + py(v) + ' '; });
        el('path', { d: linePath, fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
        s.data.forEach(function (v, i) {
          var g = el('g', {}, svg);
          // 2px 表面环 + ≥8px 标记
          el('circle', { cx: px(i), cy: py(v), r: 6, fill: t.surface }, g);
          var d = el('circle', { cx: px(i), cy: py(v), r: 4, fill: col }, g);
          var hit = el('circle', { cx: px(i), cy: py(v), r: 10, fill: 'transparent' }, g);
          hit.addEventListener('mousemove', function (ev) {
            showTip('<b>' + esc(o.labels[i]) + '</b><br>' + dot(col) + esc(s.name) + '：<b>' + esc(v) + '</b> ' + esc(o.unit || ''),
              ev.clientX, ev.clientY);
          });
          hit.addEventListener('mouseleave', hideTip);
          dots.push({ x: px(i), y: py(v), col: col, name: s.name, v: v, label: o.labels[i], unit: o.unit || '' });
        });
        // 末端直接标注（选择性）
        if (o.endLabel !== false) {
          var lx = px(n - 1), ly = py(s.data[n - 1]);
          var lt = el('text', { x: lx + 10, y: ly + 4, 'font-size': 11.5, 'font-weight': 600, fill: t.ink }, svg);
          lt.textContent = s.name + ' ' + s.data[n - 1];
        }
      });
      crossHit.addEventListener('mousemove', function (ev) {
        var rect = svg.getBoundingClientRect();
        var mx = ev.clientX - rect.left;
        if (mx < padL || mx > W - padR) { cross.setAttribute('opacity', 0); hideTip(); return; }
        var x = Math.round((mx - padL) / (iw / (n - 1)));
        var idx = Math.max(0, Math.min(n - 1, x));
        var cx = px(idx);
        cross.setAttribute('x1', cx); cross.setAttribute('x2', cx);
        cross.setAttribute('opacity', 0.55);
        var html = '<b>' + esc(o.labels[idx]) + '</b><br>';
        dots.forEach(function (d) {
          if (Math.abs(d.x - cx) < 12) html += dot(d.col) + esc(d.name) + '：<b>' + esc(d.v) + '</b> ' + esc(d.unit) + '<br>';
        });
        showTip(html, ev.clientX, ev.clientY);
      });
      crossHit.addEventListener('mouseleave', function () {
        cross.setAttribute('opacity', 0); hideTip();
      });
      // 图例（≥2 序列必须有）
      if (o.series.length >= 2) {
        var lg = el('g', { transform: 'translate(' + padL + ',' + (padT - 2) + ')' }, svg);
        var lx = 0;
        o.series.forEach(function (s) {
          var col = colorOf(s.color);
          el('circle', { cx: lx + 4, cy: 4, r: 4, fill: col }, lg);
          var lt = el('text', { x: lx + 13, y: 8, 'font-size': 12, fill: t.ink }, lg);
          lt.textContent = s.name;
          lx += 13 + s.name.length * 13 + 18;
        });
      }
    }, opts);
  }

  /* ============================================================
     雷达图 —— 单序列（能力四维）
     opts: { dims:[{label, value}], max?, size? }
     ============================================================ */
  function radar(container, opts) {
    opts.max = opts.max || 100;
    var m = opts.max;
    opts.table = {
      cols: ['维度', '得分'],
      rows: opts.dims.map(function (d) { return [d.label, d.value + ' / ' + m]; })
    };
    mount(container, function (wrap, t, o) {
      var S = o.size || Math.min(280, (wrap.clientWidth || 280) * 0.9);
      var cx = S / 2 + 34, cy = S / 2 + 14, R = S / 2 - 46;
      var W = S + 68, H = S + 34;
      var svg = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': o.aria || '能力雷达图' }, wrap);
      var n = o.dims.length;
      function pt(i, r) {
        var ang = -Math.PI / 2 + i * Math.PI * 2 / n;
        return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
      }
      // 网格环（1px 实线弱化）
      for (var ring = 1; ring <= 4; ring++) {
        var rr = R * ring / 4, d = '';
        for (var i = 0; i < n; i++) {
          var p = pt(i, rr);
          d += (i ? 'L' : 'M') + p[0] + ' ' + p[1] + ' ';
        }
        el('path', { d: d + 'Z', fill: 'none', stroke: ring === 4 ? t.axis : t.grid, 'stroke-width': 1 }, svg);
      }
      // 轴线
      for (var a = 0; a < n; a++) {
        var p = pt(a, R);
        el('line', { x1: cx, y1: cy, x2: p[0], y2: p[1], stroke: t.grid, 'stroke-width': 1 }, svg);
      }
      // 数据多边形
      var dataD = '';
      for (var b = 0; b < n; b++) {
        var q = pt(b, R * o.dims[b].value / m);
        dataD += (b ? 'L' : 'M') + q[0] + ' ' + q[1] + ' ';
      }
      el('path', { d: dataD + 'Z', fill: t.series1, 'fill-opacity': 0.1, stroke: 'none' }, svg);
      el('path', { d: dataD + 'Z', fill: 'none', stroke: t.series1, 'stroke-width': 2, 'stroke-linejoin': 'round' }, svg);
      // 标记点：2px 表面环 + 4px 点
      o.dims.forEach(function (dm, i) {
        var q = pt(i, R * dm.value / m);
        el('circle', { cx: q[0], cy: q[1], r: 6, fill: t.surface }, svg);
        el('circle', { cx: q[0], cy: q[1], r: 4, fill: t.series1 }, svg);
        var hit = el('circle', { cx: q[0], cy: q[1], r: 12, fill: 'transparent' }, svg);
        hit.addEventListener('mousemove', function (ev) {
          showTip('<b>' + esc(dm.label) + '</b><br>' + swatch(t.series1) + esc(dm.value) + ' / ' + m, ev.clientX, ev.clientY);
        });
        hit.addEventListener('mouseleave', hideTip);
      });
      // 直接标注（维度名 + 分值）
      o.dims.forEach(function (dm, i) {
        var p = pt(i, R + 26);
        var val = pt(i, R * dm.value / m + 16);
        var lt = el('text', {
          x: p[0], y: p[1], 'text-anchor': 'middle', 'font-size': 12.5, fill: t.ink, 'font-weight': 600
        }, svg);
        lt.textContent = dm.label;
        var vt = el('text', {
          x: val[0], y: val[1], 'text-anchor': 'middle', 'font-size': 11.5, fill: t.muted, 'font-variant-numeric': 'tabular-nums'
        }, svg);
        vt.textContent = dm.value;
      });
    }, opts);
  }

  /* ============================================================
     热力图 —— 顺序色阶（章节完成率）
     opts: { rows:[], cols:[], values:[[0..1]], size?:{w,h}, unit? }
     ============================================================ */
  function heatmap(container, opts) {
    opts.table = {
      cols: [''].concat(opts.cols),
      rows: opts.rows.map(function (r, i) {
        return [r].concat(opts.values[i].map(function (v) { return Math.round(v * 100) + '%'; }));
      })
    };
    mount(container, function (wrap, t, o) {
      var cw = 46, ch = 26, labelW = 92, topH = 28;
      var W = labelW + o.cols.length * cw + 12, H = topH + o.rows.length * ch + 12;
      var svg = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': o.aria || '热力图' }, wrap);
      o.cols.forEach(function (c, i) {
        var xt = el('text', { x: labelW + cw * i + cw / 2, y: topH - 8, 'text-anchor': 'middle', 'font-size': 10.5, fill: t.muted }, svg);
        xt.textContent = c;
      });
      o.rows.forEach(function (r, ri) {
        var rt = el('text', { x: labelW - 10, y: topH + ch * ri + ch / 2 + 4, 'text-anchor': 'end', 'font-size': 12, fill: t.ink }, svg);
        rt.textContent = r;
        o.values[ri].forEach(function (v, ci) {
          var x = labelW + ci * cw, y = topH + ri * ch;
          var fill = seqStep(v, 1);
          // 2px 表面间隙
          var cell = el('rect', { x: x + 1, y: y + 1, width: cw - 2, height: ch - 2, rx: 3, fill: fill }, svg);
          // 单元格文字：按填充亮度选白/墨
          var lum = parseInt(fill.slice(1, 3), 16) * 0.299 + parseInt(fill.slice(3, 5), 16) * 0.587 + parseInt(fill.slice(5, 7), 16) * 0.114;
          var ink = lum < 128 ? '#FFFFFF' : '#1F2A38';
          var vt = el('text', {
            x: x + cw / 2, y: y + ch / 2 + 4, 'text-anchor': 'middle',
            'font-size': 10.5, fill: ink, 'font-variant-numeric': 'tabular-nums'
          }, svg);
          vt.textContent = Math.round(v * 100) + '%';
          var hit = el('rect', { x: x, y: y, width: cw, height: ch, fill: 'transparent' }, svg);
          hit.addEventListener('mousemove', function (ev) {
            showTip('<b>' + esc(r) + '</b> · ' + esc(o.cols[ci]) + '<br>' + swatch(fill) + '完成率 ' + Math.round(v * 100) + '%',
              ev.clientX, ev.clientY);
          });
          hit.addEventListener('mouseleave', hideTip);
        });
      });
      // 图例（顺序色阶）
      var lgY = H - 4;
      el('text', { x: labelW, y: lgY, 'font-size': 10.5, fill: t.muted }, svg).textContent = '0%';
      for (var si = 0; si < 5; si++) {
        el('rect', { x: labelW + 24 + si * 22, y: lgY - 10, width: 20, height: 9, rx: 2, fill: t.seq[si] }, svg);
      }
      el('text', { x: labelW + 24 + 5 * 22 + 6, y: lgY, 'font-size': 10.5, fill: t.muted }, svg).textContent = '100%';
    }, opts);
  }

  /* ---------- 迷你趋势（统计瓦片） ---------- */
  function spark(container, data, opts) {
    opts = opts || {};
    var t = tk();
    container.innerHTML = '';
    var W = opts.width || 96, H = opts.height || 30;
    var svg = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, container);
    var max = Math.max.apply(null, data.concat([1])), min = Math.min.apply(null, data.concat([0]));
    var n = data.length;
    var d = '';
    data.forEach(function (v, i) {
      var x = n === 1 ? W / 2 : W * i / (n - 1);
      var y = H - 4 - (H - 8) * (v - min) / Math.max(1, max - min);
      d += (i ? 'L' : 'M') + x + ' ' + y + ' ';
    });
    el('path', { d: d, fill: 'none', stroke: t.muted, 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: 0.7 }, svg);
    var lx = W, ly = H - 4 - (H - 8) * (data[n - 1] - min) / Math.max(1, max - min);
    el('circle', { cx: lx, cy: ly, r: 3, fill: t.orange }, svg);
  }

  /* ---------- 导出 ---------- */
  global.Charts.bar = barChart;
  global.Charts.barH = barH;
  global.Charts.line = lineChart;
  global.Charts.radar = radar;
  global.Charts.heatmap = heatmap;
  global.Charts.spark = spark;
})(window);
