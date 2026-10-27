/* ============================================================
   伴读智汇 · UI 工具层
   顶栏/导航注入、路由守卫、Toast、弹窗、主题切换、图标
   ============================================================ */
(function (global) {
  'use strict';

  /* ---------- 图标（线性 24px，stroke 随 currentColor） ---------- */
  var ICONS = {
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 4.5v15zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
    course: '<rect x="3" y="4" width="14" height="16" rx="2"/><path d="M17 8h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2"/><path d="M7 8h6"/>',
    chat: '<path d="M21 12a8 8 0 0 1-8 8H4l2.2-2.6A8 8 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell: '<path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9"/><path d="M10 20a2.2 2.2 0 0 0 4 0"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    fire: '<path d="M12 21c4 0 7-2.7 7-6.8 0-3-2-5-3.5-7.5C14 9 13 10.5 13 10.5c-1.4-1.4-1.9-4-1-6-2.7.4-4.5 2.6-4.5 5.6C7.5 18.3 9 21 12 21z"/>',
    pen: '<path d="m4 20 4.5-1L20 7.5 16.5 4 5 15.5 4 20z"/><path d="m14.5 6 3.5 3.5"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 1 3.6 10.8c-.7.6-1.1 1.4-1.1 2.2h-5c0-.8-.4-1.6-1.1-2.2A6 6 0 0 1 12 3z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    check: '<path d="m4.5 12.5 5 5L19.5 7"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chevR: '<path d="m9 5 7 7-7 7"/>',
    chevL: '<path d="m15 5-7 7 7 7"/>',
    chevD: '<path d="m5 9 7 7 7-7"/>',
    mark: '<path d="M4 4h16v16H4z"/><path d="M8 15l8-8"/><path d="M8 8h8v8"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4V3z"/>',
    star: '<path d="m12 3 2.7 5.6 6.3.8-4.6 4.4 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.4l6.3-.8L12 3z"/>',
    note: '<path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
    back: '<path d="M19 12H5m0 0 6-6m-6 6 6 6"/>',
    sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/>',
    moon: '<path d="M20 13.5A8 8 0 1 1 10.5 4 6.5 6.5 0 0 0 20 13.5z"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56h.01a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.03z"/>',
    spark: '<path d="M12 3v2M12 19v2M3 12h2M19 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6"/><path d="m9 14 2.5-4 2 2.5L17 9"/>'
  };
  function icon(name, size) {
    return '<svg class="ic" width="' + (size || 18) + '" height="' + (size || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICONS[name] || '') + '</svg>';
  }

  /* ---------- Toast ---------- */
  function toast(msg, type) {
    var wrap = document.getElementById('toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.id = 'toast-wrap'; document.body.appendChild(wrap); }
    var t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.innerHTML = msg;
    wrap.appendChild(t);
    setTimeout(function () {
      t.classList.add('out');
      setTimeout(function () { t.remove(); }, 260);
    }, 2600);
  }

  /* ---------- 弹窗 ---------- */
  function modal(html, actions) {
    return new Promise(function (resolve) {
      var mask = document.createElement('div');
      mask.className = 'modal-mask';
      var box = document.createElement('div');
      box.className = 'modal';
      box.innerHTML = html;
      mask.appendChild(box);
      var footer = document.createElement('div');
      footer.className = 'modal-actions';
      box.appendChild(footer);
      var closed = false;
      function close(val) { if (closed) return; closed = true; mask.remove(); resolve(val); }
      (actions || []).forEach(function (a) {
        var b = document.createElement('button');
        b.className = 'btn ' + (a.cls || 'btn-ghost') + (a.primary ? ' btn-primary' : '');
        b.textContent = a.label;
        b.onclick = function () { close(a.value !== undefined ? a.value : a.label); };
        footer.appendChild(b);
      });
      mask.addEventListener('click', function (e) { if (e.target === mask) close(null); });
      document.body.appendChild(mask);
    });
  }

  /* ---------- 主题 ---------- */
  function applyTheme() {
    var s = Store.settings();
    document.documentElement.setAttribute('data-theme', s.theme);
  }
  function toggleTheme() {
    var s = Store.settings();
    s.theme = s.theme === 'dark' ? 'light' : 'dark';
    Store.setSetting('theme', s.theme);
    applyTheme();
    if (global.Charts && Charts.rerenderAll) Charts.rerenderAll();
    toast(s.theme === 'dark' ? '已切换夜间模式' : '已切换日间模式', 'success');
  }

  /* ---------- 路由守卫 ---------- */
  function guard(role) {
    var u = Store.user();
    var seg = location.pathname.split('/').filter(Boolean);
    var path = seg.slice(-2).join('/'); // 如 student/courses.html
    if (!u) {
      location.replace('../index.html?redirect=' + encodeURIComponent(path));
      return false;
    }
    if (role && u.role !== role) {
      location.replace('../403.html?want=' + role + '&from=' + encodeURIComponent(path));
      return false;
    }
    return true;
  }

  /* ---------- 顶栏注入 ---------- */
  function topbar(activeNav, opts) {
    opts = opts || {};
    var u = Store.user() || { name: '未登录', role: 'student' };
    var base = opts.base || '../';
    var root = opts.root || '.';
    var navs = [
      { key: 'home', label: '首页', href: base + 'student/home.html' },
      { key: 'courses', label: '课程', href: base + 'student/courses.html' },
      { key: 'coaching', label: '陪练', href: base + 'student/coaching.html' },
      { key: 'profile', label: '我的', href: base + 'student/profile.html' }
    ];
    var isTeacher = u.role === 'teacher';
    if (isTeacher) {
      navs = [
        { key: 'dashboard', label: '工作台', href: base + 'teacher/dashboard.html' },
        { key: 'class', label: '班级', href: base + 'teacher/dashboard.html#classes' },
        { key: 'bank', label: '题库', href: base + 'teacher/bank.html' }
      ];
    }
    var html = '<header class="topbar"><div class="topbar-inner">' +
      '<a class="brand" href="' + base + 'index.html"><span class="brand-logo">' + icon('book', 22) + '</span>' +
      '<span class="brand-text"><span class="brand-name">伴读智汇</span><br><span class="brand-slogan">让每一页，都读得更深一点</span></span></a>' +
      '<nav class="topnav">' +
      navs.map(function (n) {
        var active = activeNav === n.key;
        return '<a href="' + n.href + '"' + (active ? ' class="active"' : '') + '>' + n.label + '</a>';
      }).join('') +
      '</nav>' +
      '<div class="topbar-right">' +
      '<div class="search-box">' + icon('search', 15) + '<input placeholder="搜索书目" onkeydown="if(event.key===\'Enter\')UI.searchBook(this.value)"></div>' +
      '<button class="icon-btn" title="消息" onclick="UI.goMessages()">' + icon('bell', 19) +
      (isTeacher ? '<span class="dot"></span>' : '') + '</button>' +
      '<button class="icon-btn" title="切换主题" onclick="UI.toggleTheme()">' + icon('moon', 18) + '</button>' +
      '<div style="position:relative">' +
      '<a class="user-chip" onclick="UI.toggleUserMenu(event)">' +
      '<span class="avatar">' + escChar(u.name[0]) + '</span>' +
      '<span><span class="uname">' + esc(u.name) + '</span><br><span class="urole">' + (isTeacher ? '语文教师' : '学生 · ' + (Store.student().grade || '')) + '</span></span>' +
      icon('chevD', 14) +
      '</a>' +
      '<div class="user-menu" id="user-menu">' +
      '<a href="' + (isTeacher ? base + 'teacher/dashboard.html' : base + 'student/profile.html') + '">' + icon('user', 15) + '个人中心</a>' +
      '<a href="' + base + 'student/settings.html">' + icon('settings', 15) + '设置</a>' +
      '<button onclick="UI.logout()">' + icon('logout', 15) + '退出登录</button>' +
      '</div></div>' +
      '</div></div></header>';
    document.body.insertAdjacentHTML('afterbegin', html);
    document.addEventListener('click', function (e) {
      var menu = document.getElementById('user-menu');
      if (menu && !menu.classList.contains('open')) return;
      if (menu && !e.target.closest('.user-chip') && !e.target.closest('.user-menu')) menu.classList.remove('open');
    });
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function escChar(c) { return c === '<' ? '&lt;' : c; }

  /* ---------- 页面标题区 ---------- */
  function pageHead(title, sub, rightHtml) {
    return '<div class="page-head"><div class="page-head-row">' +
      '<div><h1 class="page-title">' + title + '</h1>' + (sub ? '<p class="page-sub">' + sub + '</p>' : '') + '</div>' +
      '<div class="date-line">' + todayStr() + (rightHtml || '') + '</div>' +
      '</div></div>';
  }
  function todayStr() {
    var d = new Date();
    var wd = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
    return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 · 星期' + wd;
  }

  /* ---------- 空状态 ---------- */
  function empty(ic, title, sub, btnHtml) {
    return '<div class="empty"><div class="empty-ic">' + icon(ic, 30) + '</div>' +
      '<div class="empty-title">' + title + '</div>' +
      (sub ? '<div class="empty-sub">' + sub + '</div>' : '') +
      (btnHtml || '') + '</div>';
  }

  /* ---------- 全局动作 ---------- */
  var UI = {
    icon: icon,
    toast: toast,
    modal: modal,
    esc: esc,
    pageHead: pageHead,
    empty: empty,
    todayStr: todayStr,
    applyTheme: applyTheme,
    toggleTheme: toggleTheme,
    guard: guard,
    topbar: topbar,
    searchBook: function (kw) {
      if (!kw || !kw.trim()) { toast('请输入书名关键词', 'warning'); return; }
      location.href = '../student/courses.html?q=' + encodeURIComponent(kw.trim());
    },
    goMessages: function () {
      if (!Store.user()) { location.href = '../index.html'; return; }
      if (Store.user().role === 'student') location.href = '../student/profile.html#messages';
      else location.href = '../teacher/dashboard.html#messages';
    },
    toggleUserMenu: function (e) {
      e.stopPropagation();
      document.getElementById('user-menu').classList.toggle('open');
    },
    logout: function () {
      Store.logout();
      location.href = '../index.html';
    },
    fmtMin: function (m) {
      if (m >= 60) return Math.floor(m / 60) + '小时' + (m % 60 ? ' ' + (m % 60) + '分钟' : '');
      return m + '分钟';
    },
    // 提交前确认
    confirmAct: function (msg, onOk) {
      modal('<h3>确认操作</h3><p class="modal-sub">' + msg + '</p>', [
        { label: '取消', value: false },
        { label: '确认', value: true, primary: true }
      ]).then(function (v) { if (v) onOk(); });
    }
  };

  global.UI = UI;
  global.uiIcon = icon;

  /* 页面加载即应用主题 */
  document.addEventListener('DOMContentLoaded', function () {
    applyTheme();
  });
})(window);
