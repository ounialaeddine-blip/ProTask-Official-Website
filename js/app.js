/* =========================================================
   ProTask app – shell + three dashboards (home, project, board)
   Needs js/app-data.js first. Vanilla JS, no build step.
   Sections: 1 helpers  2 store  3 shell  4 overlays  5 Home  6 Project  7 Board  8 start
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1. Helpers ---------- */
  /* Our own icon set (icons/sprite.svg, injected by js/app-icons.js). Left = name used in this file, right = icon id in the sprite. */
  var ICONS = {
    home: 'dashboard', tasks: 'task', inbox: 'notifications', bell: 'notifications', chat: 'chat', calendar: 'due-date', clock: 'due-date',
    folder: 'drive', file: 'drive', users: 'members', plus: 'plus', search: 'search', help: 'info', send: 'arrow-right', arrow: 'arrow-right',
    template: 'project', reports: 'activity-log', list: 'activity-log', settings: 'settings', logout: 'logout', down: 'chevron-down',
    right: 'chevron-right', filter: 'filter', share: 'export', more: 'more', flag: 'priority', board: 'kanban', sparkle: 'sparkle',
    clip: 'link', comment: 'comments', check: 'check', panel: 'menu', menu: 'menu', close: 'close', userplus: 'invite', alert: 'warning',
    grid: 'dashboard', trash: 'delete', profile: 'profile', project: 'project', health: 'health-score', atrisk: 'at-risk', ai: 'ai-summary', label: 'label', drag: 'drag'
  };
  function icon(n, s) {
    s = s || 20;
    return '<svg class="ic" width="' + s + '" height="' + s + '" aria-hidden="true"><use href="#i-' + (ICONS[n] || n) + '"/></svg>';
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function M(id) { return DATA.members.filter(function (m) { return m.id === id; })[0] || { id: id, name: id, color: '#98a2b3', role: '' }; }
  function P(id) { return DATA.projects.filter(function (p) { return p.id === id; })[0]; }
  function initials(n) { return n.replace(/\./g, '').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase(); }
  function avatar(id, size) {
    var m = M(id); size = size || 28;
    return '<span class="avatar" title="' + esc(m.name) + '" style="width:' + size + 'px;height:' + size + 'px;background:' + m.color + ';font-size:' + Math.round(size * 0.38) + 'px">' + esc(initials(m.name)) + '<img src="images/members/' + m.id + '.jpg" alt="" loading="lazy" onerror="var e=[\'png\',\'webp\',\'jpeg\'],i=+this.dataset.i||0;if(i<e.length){this.dataset.i=i+1;this.src=this.src.slice(0,this.src.lastIndexOf(\'.\'))+\'.\'+e[i]}else this.remove()"></span>';
  }
  function stack(ids, max, size) {
    max = max || 4;
    var h = ids.slice(0, max).map(function (i) { return avatar(i, size || 28); }).join('');
    if (ids.length > max) h += '<span class="avatar more" style="width:' + (size || 28) + 'px;height:' + (size || 28) + 'px">+' + (ids.length - max) + '</span>';
    return '<span class="stack">' + h + '</span>';
  }
  var STATUS = {
    todo: { n: 'To do', c: '#9a9aa6' },
    progress: { n: 'In progress', c: '#6647f0' },
    review: { n: 'Review', c: '#e0a000' },
    done: { n: 'Done', c: '#078d3b' }
  };
  var ORDER = ['todo', 'progress', 'review', 'done'];
  function dueLabel(t) {
    if (t.status === 'done') return 'Done';
    var d = t.due;
    if (d === 0) return 'Today';
    if (d === 1) return 'Tomorrow';
    if (d > 1) return 'In ' + d + ' days';
    return Math.abs(d) + (d === -1 ? ' day late' : ' days late');
  }
  function isLate(t) { return t.status !== 'done' && t.due < 0; }
  function dateOf(off) { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + off); return d; }
  function ymd(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function spark(points, color, w, h) {
    w = w || 84; h = h || 32;
    var max = Math.max.apply(null, points), min = Math.min.apply(null, points), rng = (max - min) || 1;
    var step = w / (points.length - 1);
    var pts = points.map(function (v, i) { return (i * step).toFixed(1) + ',' + (h - 3 - ((v - min) / rng) * (h - 8)).toFixed(1); }).join(' ');
    return '<svg class="spark" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true"><polyline points="' + pts + '" fill="none" stroke="' + color + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function bar(pct, color) { return '<div class="bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + pct + '%;' + (color ? 'background:' + color : '') + '"></i></div>'; }

  /* ---------- 2. Store ---------- */
  var KEY = 'protask.tasks.v2', KEY_READ = 'protask.inbox.read', KEY_COL = 'protask.sidebar';
  var tasks;
  try { tasks = JSON.parse(localStorage.getItem(KEY)); } catch (e) { tasks = null; }
  if (!Array.isArray(tasks)) tasks = JSON.parse(JSON.stringify(DATA.tasks));
  function save() { try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch (e) {} }
  var readIds = [];
  try { readIds = JSON.parse(localStorage.getItem(KEY_READ)) || []; } catch (e) {}
  function isUnread(i) { return i.unread && readIds.indexOf(i.id) < 0; }
  function unreadCount() { if (ctx.page === 'chat' || ctx.page === 'channel') return notifUnread(); return DATA.inbox.filter(isUnread).length; }
  function tasksOf(p) { return p === 'all' ? tasks : tasks.filter(function (t) { return t.p === p; }); }
  function open(ts) { return ts.filter(function (t) { return t.status !== 'done'; }); }
  function stats(ts) {
    var o = open(ts);
    return {
      total: ts.length,
      done: ts.length - o.length,
      progress: ts.filter(function (t) { return t.status === 'progress' || t.status === 'review'; }).length,
      due: o.filter(function (t) { return t.due >= 0 && t.due <= 7; }).length,
      late: o.filter(function (t) { return t.due < 0; }).length,
      pct: ts.length ? Math.round((ts.length - o.length) / ts.length * 100) : 0
    };
  }
  /* Health score, CdC formula: 100 - 50R - 30A - 20C */
  function health(ts) {
    var o = open(ts);
    if (!o.length) return { score: 100, R: 0, A: 0, C: 0, atRisk: [], over: [] };
    var late = o.filter(function (t) { return t.due < 0; });
    var risk = o.filter(function (t) { return t.due <= 2 && t.upd >= 3; });
    var per = {};
    o.forEach(function (t) { per[t.who] = (per[t.who] || 0) + 1; });
    var ids = Object.keys(per), avg = o.length / ids.length;
    var over = ids.filter(function (i) { return per[i] > 8 || per[i] > 1.5 * avg; });
    var R = late.length / o.length, A = risk.length / o.length, C = over.length / ids.length;
    return { score: Math.max(0, Math.round(100 - 50 * R - 30 * A - 20 * C)), R: R, A: A, C: C, late: late, atRisk: risk, over: over };
  }
  function reading(s) { return s >= 70 ? { t: 'On track', c: '#078d3b', b: 'b-green' } : s >= 45 ? { t: 'To watch', c: '#d98a00', b: 'b-amber' } : { t: 'At risk', c: '#c62a2f', b: 'b-red' }; }
  function firstName() {
    var n = '';
    try { var pr = JSON.parse(localStorage.getItem('protask.profile')); n = pr && (pr.displayName || pr.display || pr.name) || ''; } catch (e) {}
    if (!n) { try { n = sessionStorage.getItem('protask.name') || ''; } catch (e) {} }
    return (n || M(DATA.me).name).split(' ')[0];
  }

  /* ---------- 3. Shell ---------- */
  var root, pageEl, shell, ctx = { page: 'home', p: 'p1' };
  var qs = new URLSearchParams(location.search);
  var LOGO = 'images/logo-mark.svg'; /* mark shown at the top of the rail; put your white version here if you prefer */

  function railHTML() {
    var unread = unreadCount();
    var it = function (ic, label, o) {
      o = o || {};
      var tag = o.href ? 'a href="' + o.href + '"' : 'button type="button"';
      return '<' + tag + ' class="rail-i ' + (o.on ? 'is-active' : '') + '" ' + (o.act ? 'data-act="' + o.act + '"' : '') + ' ' + (o.msg ? 'data-msg="' + o.msg + '"' : '') + ' title="' + label + '"><span class="rail-ic">' + icon(ic, 22) + (o.dot ? '<i class="rail-dot"></i>' : '') + '</span><span>' + label + '</span></' + (o.href ? 'a' : 'button') + '>';
    };
    return '<a class="rail-logo" href="index.html" aria-label="ProTask home"><img src="' + LOGO + '" alt=""></a>' +
      it('home', 'Home', { href: 'dashboard.html', on: ctx.page === 'home' }) +
      it('tasks', 'My tasks', { href: 'board.html?p=all&mine=1', on: !!ctx.mine }) +
      it('calendar', 'Planner', { href: 'planner.html', on: ctx.page === 'planner' }) +
      it('inbox', 'Inbox', { act: 'inbox', dot: unread > 0 }) +
      it('chat', 'Chat', { href: 'chat.html', on: ctx.page === 'chat' || ctx.page === 'channel', dot: chatUnread() > 0 }) +
      it('folder', 'Files', { act: 'toast', msg: 'Files (Drive / Dropbox links) is the next screen to build.' }) +
      it('users', 'Teams', { act: 'teams' }) +
      it('reports', 'Reports', { act: 'toast', msg: 'Reports are planned after the dashboards.' }) +
      '<div class="rail-sp"></div>' +
      it('userplus', 'Invite', { act: 'invite' }) +
      it('settings', 'Settings', { act: 'toast', msg: 'Settings are planned after the dashboards.' }) +
      '<button class="rail-me" type="button" data-act="profile" data-pop aria-haspopup="menu" aria-label="Your account">' + avatar(DATA.me, 38) + '<i class="st online"></i></button>';
  }
  function panelHTML() {
    if (ctx.page === 'planner') return plannerPanelHTML();
    if (ctx.page === 'channel') return (chanById(ctx.c) || {}).type === 'dm' ? dmPanelHTML() : chatPanelHTML();
    var unread = unreadCount(), onProject = ctx.page === 'project' || ctx.page === 'chat' || (ctx.page === 'board' && !ctx.mine);
    var priorities = open(tasks).filter(function (t) { return t.who === DATA.me && t.due <= 0; }).length;
    var row = function (ic, label, o) {
      o = o || {};
      var tag = o.href ? 'a href="' + o.href + '"' : 'button type="button"';
      return '<' + tag + ' class="pn-i ' + (o.on ? 'is-active' : '') + '" ' + (o.act ? 'data-act="' + o.act + '"' : '') + ' ' + (o.msg ? 'data-msg="' + o.msg + '"' : '') + '>' + (o.lead || icon(ic, 18)) + '<span class="pn-l">' + label + '</span>' + (o.badge ? '<span class="sb-badge">' + o.badge + '</span>' : '') + (o.count !== undefined ? '<small>' + o.count + '</small>' : '') + '</' + (o.href ? 'a' : 'button') + '>';
    };
    var title = ctx.page === 'home' ? 'Home' : (ctx.page === 'chat' ? 'Chat' : (ctx.mine ? 'My tasks' : 'Projects'));
    var h = '<div class="pn-head"><h2>' + esc(title) + '</h2><button class="btn btn--dark" type="button" data-act="newtask">' + icon('plus', 16) + 'Create</button></div>' +
      '<div class="pn-scroll">' +
      '<div class="pn-m">' + row('home', 'Home', { href: 'dashboard.html', on: ctx.page === 'home' }) + row('calendar', 'Planner', { href: 'planner.html' }) + row('folder', 'Files', { act: 'toast', msg: 'Files is the next screen to build.' }) + row('reports', 'Reports', { act: 'toast', msg: 'Reports are planned after the dashboards.' }) + '</div>' +
      row('ai', 'Ask ProTask AI', { act: 'toast', msg: 'The AI box is on your Home dashboard (preview).' }) +
      row('inbox', 'Inbox', { act: 'inbox', badge: unread || '' }) +
      row('tasks', 'My tasks', { href: 'board.html?p=all&mine=1', on: !!ctx.mine }) +
      row('chat', 'Chat', { href: 'chat.html', on: ctx.page === 'chat', badge: chatUnread() || '' }) +
      '<div class="pn-h"><span>Projects</span><button type="button" data-act="toast" data-msg="Creating projects comes with the backend." aria-label="New project">' + icon('plus', 16) + '</button></div>';
    DATA.projects.forEach(function (p) {
      h += row('', esc(p.name), { href: 'project.html?p=' + p.id, on: onProject && ctx.p === p.id, lead: '<i class="pn-dot" style="background:' + p.color + '"></i>', count: open(tasksOf(p.id)).length });
    });
    h += row('plus', 'New project', { act: 'toast', msg: 'Creating projects comes with the backend.' }) +
      '<div class="pn-h" id="pn-teams"><span>Teams</span><button type="button" data-act="invite" aria-label="Invite people">' + icon('userplus', 16) + '</button></div>';
    DATA.teams.forEach(function (t) { h += '<div class="pn-team">' + icon('users', 18) + '<span class="pn-l">' + esc(t.name) + '</span>' + stack(t.members, 3, 22) + '</div>'; });
    h += row('userplus', 'Invite people', { act: 'invite' }) +
      '<div class="pn-h"><span>Direct messages</span></div>';
    DATA.members.filter(function (m) { return m.id !== DATA.me; }).slice(0, 5).forEach(function (m) {
      h += '<a class="pn-i" href="channel.html?c=dm-' + m.id + '">' + avatar(m.id, 22) + '<span class="pn-l">' + esc(m.name) + (m.id === DATA.me ? ' <small style="margin:0">— You</small>' : '') + '</span><i class="st ' + m.status + '"></i></a>';
    });
    h += '</div><div class="pn-foot"><a class="prio" href="board.html?p=all&mine=1">' + icon('flag', 16) + priorities + ' Priorit' + (priorities === 1 ? 'y' : 'ies') + '</a></div>';
    return h;
  }
  function topbarHTML() {
    return '<button class="tb-menu icon-btn" type="button" data-act="menu" aria-label="Open menu">' + icon('menu') + '</button>' +
      '<button class="ws" type="button" data-act="ws" data-pop aria-haspopup="menu"><b>' + esc(DATA.workspace.initial) + '</b><span>' + esc(DATA.workspace.name) + '</span>' + icon('down', 16) + '</button>' +
      '<button class="icon-btn hide-m" type="button" data-act="toggle-panel" aria-label="Show or hide the side panel" title="Show or hide the side panel">' + icon('panel') + '</button>' +
      '<div class="search" role="search"><label class="sr" for="q">Search tasks, projects and people</label>' + icon('search', 18) +
      '<input id="q" type="search" placeholder="Search tasks, projects, people" autocomplete="off"><kbd>Ctrl K</kbd><div class="results" id="results" role="listbox"></div></div>' +
      '<div class="tb-right">' +
      '<button class="icon-btn hide-m" type="button" data-act="toast" data-msg="Help center is not built yet." aria-label="Help" title="Help">' + icon('help') + '</button>' +
      '<button class="icon-btn" type="button" data-act="inbox" aria-label="Notifications" title="Notifications">' + icon('bell') + '<span class="dot" id="bell-dot" ' + (unreadCount() ? '' : 'hidden') + '></span></button>' +
      '<button class="btn btn--dark" type="button" data-act="newtask">' + icon('plus', 18) + '<span class="t">New task</span></button></div>';
  }
  function buildShell() {
    root.innerHTML = '<div class="shell' + (collapsed() ? ' is-collapsed' : '') + '"><nav class="rail" id="rail" aria-label="Main navigation"></nav><div class="shell-r"><header class="topbar" id="topbar"></header>' +
      '<div class="body"><aside class="panel" id="panel" aria-label="Workspace navigation"></aside><div class="sb-scrim" data-act="menu"></div><main class="page" id="page"></main></div></div></div>' +
      '<div class="scrim" id="scrim"></div><div class="toast" id="toast" role="status" aria-live="polite"></div>';
    shell = $('.shell', root); pageEl = $('#page');
    $('#topbar').innerHTML = topbarHTML();
    renderSidebar();
    bindSearch();
  }
  function collapsed() { try { return localStorage.getItem(KEY_COL) === '1'; } catch (e) { return false; } }
  function renderSidebar() { $('#rail').innerHTML = railHTML(); $('#panel').innerHTML = panelHTML(); var d = $('#bell-dot'); if (d) d.hidden = !unreadCount(); }

  function bindSearch() {
    var q = $('#q'), box = $('#results');
    function run() {
      var v = q.value.trim().toLowerCase();
      if (!v) { box.classList.remove('is-open'); return; }
      var out = '';
      DATA.projects.filter(function (p) { return p.name.toLowerCase().indexOf(v) > -1; }).forEach(function (p) {
        out += '<a href="project.html?p=' + p.id + '"><i class="sb-dot" style="background:' + p.color + '"></i>' + esc(p.name) + '<small>Project</small></a>';
      });
      tasks.filter(function (t) { return t.title.toLowerCase().indexOf(v) > -1; }).slice(0, 6).forEach(function (t) {
        out += '<a href="board.html?p=' + t.p + '">' + icon('tasks', 16) + esc(t.title) + '<small>' + esc(P(t.p).name) + '</small></a>';
      });
      DATA.members.filter(function (m) { return m.name.toLowerCase().indexOf(v) > -1; }).forEach(function (m) {
        out += '<a href="board.html?p=all&who=' + m.id + '">' + avatar(m.id, 22) + esc(m.name) + '<small>' + esc(m.role) + '</small></a>';
      });
      box.innerHTML = out || '<p class="empty">No result for “' + esc(q.value) + '”. Try a task, project or person.</p>';
      box.classList.add('is-open');
    }
    q.addEventListener('input', run);
    q.addEventListener('keydown', function (e) { if (e.key === 'Escape') { q.value = ''; box.classList.remove('is-open'); q.blur(); } });
    document.addEventListener('click', function (e) { if (!e.target.closest('.search')) box.classList.remove('is-open'); });
    document.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); q.focus(); } });
  }

  /* ---------- 4. Overlays ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('is-open');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('is-open'); }, 2600);
  }
  var lastFocus = null, openEl = null;
  function openOverlay(el, focusSel) {
    lastFocus = document.activeElement; openEl = el;
    el.classList.add('is-open'); $('#scrim').classList.add('is-open');
    var f = focusSel && $(focusSel, el); if (f) setTimeout(function () { f.focus(); }, 30);
  }
  function closeOverlay() {
    if (!openEl) return;
    openEl.classList.remove('is-open'); $('#scrim').classList.remove('is-open'); openEl = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closePop(); closeOverlay(); }
    if (e.key === 'Tab' && openEl) {
      var f = $$('button,input,select,a[href]', openEl).filter(function (x) { return !x.disabled && x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var popEl = null;
  function closePop() { if (popEl) { popEl.remove(); popEl = null; } }
  function openPop(anchor, html, opts) {
    closePop();
    opts = opts || {};
    popEl = document.createElement('div'); popEl.className = 'pop'; popEl.setAttribute('role', 'menu'); popEl.innerHTML = html;
    document.body.appendChild(popEl);
    var r = anchor.getBoundingClientRect(), w = popEl.offsetWidth, h = popEl.offsetHeight;
    var left = opts.align === 'right' ? r.right - w : r.left;
    left = Math.max(8, Math.min(left, innerWidth - w - 8));
    var top = opts.up ? r.top - h - 6 : r.bottom + 6;
    if (top + h > innerHeight - 8) top = Math.max(8, r.top - h - 6);
    popEl.style.left = left + scrollX + 'px'; popEl.style.top = top + scrollY + 'px';
    var f = $('button,a', popEl); if (f) f.focus();
    return popEl;
  }
  document.addEventListener('click', function (e) { if (popEl && !popEl.contains(e.target) && !e.target.closest('[data-pop]')) closePop(); });

  function modalShell(id, title, lead, body) {
    var m = document.getElementById(id);
    if (m) m.remove();
    m = document.createElement('div'); m.id = id; m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-labelledby', id + '-t');
    m.innerHTML = '<h2 id="' + id + '-t">' + title + '</h2><p class="lead">' + lead + '</p>' + body;
    root.appendChild(m); return m;
  }
  function fieldErr(f, msg) { var w = f.closest('.fld'); w.classList.toggle('err', !!msg); if (msg) w.querySelector('.msg-e').textContent = msg; }

  function newTaskModal(pre) {
    pre = pre || {};
    var projOpts = DATA.projects.map(function (p) { return '<option value="' + p.id + '"' + ((pre.p || (ctx.p !== 'all' ? ctx.p : 'p1')) === p.id ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('');
    var whoOpts = DATA.members.map(function (m) { return '<option value="' + m.id + '"' + (m.id === DATA.me ? ' selected' : '') + '>' + esc(m.name) + '</option>'; }).join('');
    var today = dateOf(7), iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    var m = modalShell('m-task', 'New task', 'Add a task to a project. Assignee and due date can be changed later.',
      '<form novalidate><div class="fld"><label for="nt-title">Task title</label><input id="nt-title" maxlength="120" placeholder="e.g. Prepare the demo script" value="' + esc(pre.title || '') + '"><span class="msg-e" role="alert"></span></div>' +
      '<div class="two"><div class="fld"><label for="nt-p">Project</label><select id="nt-p">' + projOpts + '</select></div><div class="fld"><label for="nt-who">Assignee</label><select id="nt-who">' + whoOpts + '</select></div></div>' +
      '<div class="two"><div class="fld"><label for="nt-due">Due date</label><input id="nt-due" type="date" value="' + iso + '"></div><div class="fld"><label for="nt-pr">Priority</label><select id="nt-pr"><option>High</option><option selected>Medium</option><option>Low</option></select></div></div>' +
      '<div class="foot"><button type="button" class="btn btn--line" data-act="close">Cancel</button><button type="submit" class="btn btn--dark">Create task</button></div></form>');
    var form = $('form', m), title = $('#nt-title', m);
    title.addEventListener('blur', function () { fieldErr(title, title.value.trim() ? '' : 'Give the task a title so your team knows what to do.'); });
    title.addEventListener('input', function () { if (title.value.trim()) fieldErr(title, ''); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!title.value.trim()) { fieldErr(title, 'Give the task a title so your team knows what to do.'); title.focus(); return; }
      var d = new Date($('#nt-due', m).value + 'T00:00:00'), t0 = dateOf(0);
      var off = isNaN(d) ? 7 : Math.round((d - t0) / 864e5);
      var nt = { id: 'n' + Date.now(), p: $('#nt-p', m).value, title: title.value.trim(), status: pre.status || 'todo', priority: $('#nt-pr', m).value, label: 'Design', who: $('#nt-who', m).value, due: off, upd: 0, comments: 0, files: 0 };
      tasks.push(nt); if (pre.after) pre.after(nt);
      save(); closeOverlay(); refresh(); toast('Task created.');
    });
    openOverlay(m, '#nt-title');
  }
  function inviteModal() {
    var m = modalShell('m-invite', 'Invite people', 'They get a single-use link by email and join as a member. You stay the admin.',
      '<form novalidate><div class="fld"><label for="iv-mail">Email address</label><input id="iv-mail" type="email" placeholder="name@company.com" autocomplete="off"><span class="msg-e" role="alert"></span></div>' +
      '<div class="two"><div class="fld"><label for="iv-role">Role</label><select id="iv-role"><option value="member">Member</option><option value="admin">Admin</option></select></div>' +
      '<div class="fld"><label for="iv-team">Team</label><select id="iv-team">' + DATA.teams.map(function (t) { return '<option>' + esc(t.name) + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="foot"><button type="button" class="btn btn--line" data-act="close">Cancel</button><button type="submit" class="btn btn--dark">Send invitation</button></div></form>');
    var mail = $('#iv-mail', m), re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    mail.addEventListener('blur', function () { fieldErr(mail, re.test(mail.value.trim()) ? '' : 'Enter an email like name@company.com.'); });
    mail.addEventListener('input', function () { if (re.test(mail.value.trim())) fieldErr(mail, ''); });
    $('form', m).addEventListener('submit', function (e) {
      e.preventDefault();
      if (!re.test(mail.value.trim())) { fieldErr(mail, 'Enter an email like name@company.com.'); mail.focus(); return; }
      DATA.pendingInvites++; closeOverlay(); refresh(); toast('Invitation sent to ' + mail.value.trim() + ' (demo).');
    });
    openOverlay(m, '#iv-mail');
  }
  function inboxDrawer() {
    var d = document.getElementById('d-inbox');
    if (d) d.remove();
    d = document.createElement('aside'); d.id = 'd-inbox'; d.className = 'drawer'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'Inbox');
    function draw() {
      d.innerHTML = '<header><h2>Inbox</h2><button class="btn btn--line btn--sm" type="button" data-act="readall">Mark all read</button><button class="icon-btn" type="button" data-act="close" aria-label="Close inbox">' + icon('close') + '</button></header><div class="body">' + msgList(DATA.inbox, true) + '</div>';
    }
    draw(); root.appendChild(d);
    d.addEventListener('click', function (e) {
      if (e.target.closest('[data-act=readall]')) { DATA.inbox.forEach(function (i) { if (readIds.indexOf(i.id) < 0) readIds.push(i.id); }); try { localStorage.setItem(KEY_READ, JSON.stringify(readIds)); } catch (x) {} draw(); renderSidebar(); refreshHomeInbox(); }
    });
    openOverlay(d, '.btn');
  }
  function msgList(items, all) {
    if (!items.length) return '<p class="empty">Nothing here. You are all caught up.</p>';
    return items.map(function (i) {
      return '<div class="msg ' + (isUnread(i) ? 'unread' : '') + '">' + avatar(i.who, 34) + '<div><p><b>' + esc(M(i.who).name) + '</b> ' + i.text + '</p><q>' + esc(i.note) + '</q><small>' + esc(i.when) + '</small></div></div>';
    }).join('');
  }
  function profilePop(a) {
    openPop(a, '<div class="cap">Signed in as</div><div style="padding:2px 10px 8px"><b>' + esc(M(DATA.me).name) + '</b></div><hr>' +
      '<button type="button" data-act="toast" data-msg="Profile page is not built yet.">' + icon('users', 18) + 'My profile</button>' +
      '<button type="button" data-act="toast" data-msg="Status: Online (demo).">' + icon('clock', 18) + 'Set status</button>' +
      '<button type="button" data-act="toast" data-msg="Settings are planned after the dashboards.">' + icon('settings', 18) + 'Account settings</button><hr>' +
      '<a href="login.html">' + icon('logout', 18) + 'Log out</a>', { up: true });
  }
  function wsPop(a) {
    openPop(a, '<div class="cap">Workspaces</div><button type="button" data-act="close-pop"><b style="display:grid;place-items:center;width:24px;height:24px;border-radius:7px;background:#6647f0;color:#fff;font-size:12px">' + esc(DATA.workspace.initial) + '</b>' + esc(DATA.workspace.name) + '<span style="margin-left:auto">' + icon('check', 16) + '</span></button><hr>' +
      '<button type="button" data-act="toast" data-msg="Multiple workspaces come with the backend.">' + icon('plus', 18) + 'Create workspace</button>');
  }

  /* global click delegation */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-act]'); if (!a) return;
    var act = a.getAttribute('data-act');
    if (act === 'toast') { closePop(); toast(a.getAttribute('data-msg')); }
    else if (act === 'newtask') newTaskModal();
    else if (act === 'invite') inviteModal();
    else if (act === 'inbox') { if (ctx.page === 'chat' || ctx.page === 'channel') notifDrawer(); else inboxDrawer(); }
    else if (act === 'newchannel') newChannelModal();
    else if (act === 'followups') followupsModal();
    else if (act === 'newevent') newEventModal({ kind: a.getAttribute('data-kind') || 'event' });
    else if (act === 'close') closeOverlay();
    else if (act === 'close-pop') closePop();
    else if (act === 'profile') { a.setAttribute('data-pop', ''); profilePop(a); }
    else if (act === 'ws') { a.setAttribute('data-pop', ''); wsPop(a); }
    else if (act === 'menu') { shell.classList.toggle('is-open'); }
    else if (act === 'goto') location.href = a.getAttribute('data-href');
    else if (act === 'toggle-panel') { shell.classList.toggle('is-collapsed'); try { localStorage.setItem(KEY_COL, shell.classList.contains('is-collapsed') ? '1' : '0'); } catch (x) {} }
    else if (act === 'teams') { shell.classList.remove('is-collapsed'); shell.classList.add('is-open'); var tt = $('#pn-teams'); if (tt) tt.scrollIntoView({ block: 'center' }); }
  });
  document.addEventListener('click', function (e) { if (e.target.id === 'scrim') closeOverlay(); });

  /* ---------- 5. Home ---------- */
  function greeting() { var h = new Date().getHours(); return (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening') + ', ' + firstName(); }
  function kpiCard(title, num, color, tr, note, suffix) {
    return '<article class="card kpi"><h3>' + title + '</h3><span class="num">' + num + '</span>' + spark(tr.points, color) +
      '<div class="delta"><b class="' + (suffix === 'bad' ? 'down' : 'up') + '">' + tr.delta + '</b> ' + note + '</div></article>';
  }
  function kpisHTML(ts) {
    var s = stats(ts);
    return '<section class="grid kpis" aria-label="Key figures">' +
      kpiCard('Due soon', s.due, '#6647f0', DATA.trends.due, 'next 7 days') +
      kpiCard('In progress', s.progress, '#0091ff', DATA.trends.progress, 'in progress + review') +
      kpiCard('Completed', s.done, '#078d3b', DATA.trends.completed, 'of ' + s.total + ' tasks') +
      kpiCard('Delayed', s.late, '#c62a2f', DATA.trends.delayed, 'need a decision', 'bad') + '</section>';
  }
  function agendaHTML() {
    var h = DATA.events.map(function (e) { return '<div class="ag"><time>' + e.time + '</time><div><b>' + esc(e.title) + '</b><small>' + esc(e.meta) + '</small></div></div>'; }).join('');
    open(tasks).filter(function (t) { return t.due === 0; }).forEach(function (t) {
      h += '<div class="ag task"><time>Due</time><div><b>' + esc(t.title) + '</b><small>' + esc(P(t.p).name) + ' · ' + esc(M(t.who).name) + '</small></div></div>';
    });
    return h;
  }
  function calHTML() {
    var now = new Date(), y = now.getFullYear(), m = now.getMonth(), first = new Date(y, m, 1);
    var lead = (first.getDay() + 6) % 7, dim = new Date(y, m + 1, 0).getDate();
    var map = {};
    open(tasks).forEach(function (t) { var k = ymd(dateOf(t.due)); map[k] = map[k] === 'late' ? 'late' : (t.due < 0 ? 'late' : 'ok'); });
    var h = '<table class="cal" aria-label="Calendar of due dates"><thead><tr>' + ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(function (d) { return '<th scope="col">' + d + '</th>'; }).join('') + '</tr></thead><tbody><tr>';
    var cell = 0, i;
    for (i = 0; i < lead; i++) { h += '<td class="out"></td>'; cell++; }
    for (i = 1; i <= dim; i++) {
      var k = y + '-' + (m + 1) + '-' + i, cls = (i === now.getDate() ? 'today' : '');
      h += '<td class="' + cls + '"><span>' + i + '</span>' + (map[k] ? '<i class="' + (map[k] === 'late' ? 'late' : '') + '"></i>' : '') + '</td>';
      cell++; if (cell % 7 === 0 && i < dim) h += '</tr><tr>';
    }
    while (cell % 7) { h += '<td class="out"></td>'; cell++; }
    return '<p style="margin:0 0 8px;font-weight:600">' + MON[m] + ' ' + y + '</p>' + h + '</tr></tbody></table><div class="legend"><span><i style="background:#6647f0"></i>Due</span><span><i style="background:#c62a2f"></i>Late</span></div>';
  }
  var inboxTab = 'all';
  function inboxCard() {
    var items = DATA.inbox.filter(function (i) { return inboxTab === 'all' || (inboxTab === 'mention' && i.type === 'mention') || (inboxTab === 'assigned' && i.type === 'assigned') || (inboxTab === 'comment' && i.type === 'comment'); });
    return '<div class="tabs-s" role="tablist">' + [['all', 'All'], ['mention', 'Mentions'], ['assigned', 'Assigned'], ['comment', 'Comments']].map(function (t) {
      return '<button class="chip ' + (inboxTab === t[0] ? 'is-active' : '') + '" type="button" role="tab" aria-selected="' + (inboxTab === t[0]) + '" data-tab="' + t[0] + '">' + t[1] + '</button>';
    }).join('') + '</div><div id="inbox-list">' + msgList(items.slice(0, 3)) + '</div>';
  }
  function refreshHomeInbox() { var b = $('#inbox-body'); if (b) { b.innerHTML = inboxCard(); bindInboxTabs(); } }
  function bindInboxTabs() { $$('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { inboxTab = b.getAttribute('data-tab'); refreshHomeInbox(); }); }); }

  function gaugeHTML(h, label) {
    var r = reading(h.score);
    return '<div class="gauge"><div style="position:relative;width:200px;height:112px"><svg width="200" height="112" viewBox="0 0 200 112" aria-hidden="true"><path d="M16 100 A84 84 0 0 1 184 100" fill="none" stroke="#eceef4" stroke-width="14" stroke-linecap="round" pathLength="100"/><path d="M16 100 A84 84 0 0 1 184 100" fill="none" stroke="' + r.c + '" stroke-width="14" stroke-linecap="round" pathLength="100" stroke-dasharray="' + h.score + ' 100"/></svg>' +
      '<div style="position:absolute;left:0;right:0;bottom:2px;text-align:center"><span style="font:700 40px/1 var(--font-title);letter-spacing:-1.5px">' + h.score + '</span></div></div>' +
      '<span class="badge ' + r.b + '">' + r.t + '</span>' +
      '<div class="parts"><div><span>Overdue tasks<small>50% weight</small></span><b>' + Math.round(h.R * 100) + '%</b></div><div><span>At risk (due ≤ 48 h, no update 3 days)<small>30% weight</small></span><b>' + Math.round(h.A * 100) + '%</b></div><div><span>Overloaded members<small>20% weight</small></span><b>' + Math.round(h.C * 100) + '%</b></div></div>' +
      '<div class="rule"><b>How it is calculated</b>100 − 50 × overdue − 30 × at risk − 20 × overloaded. 70+ on track, 45–69 to watch, under 45 at risk.' + (label ? '' : '') + '</div></div>';
  }
  function aiBox(scope) {
    return '<section class="card ai" aria-labelledby="ai-h"><div class="card-h"><h2 id="ai-h">' + icon('sparkle', 20) + 'Ask ProTask AI</h2><span class="badge b-purple" style="margin-left:auto">Preview</span></div>' +
      '<p class="hint">Rule-based demo. The real assistant (IA-2) writes the weekly summary from your data and always waits for your review before sharing.</p>' +
      '<form id="ai-form" novalidate><label class="sr" for="ai-q">Ask a question</label><input id="ai-q" placeholder="e.g. What is late? Who is overloaded?"><button class="send" type="submit" aria-label="Send">' + icon('send', 18) + '</button></form>' +
      '<div class="tabs-s" style="margin:10px 0 0"><button class="chip" type="button" data-q="Weekly summary">Weekly summary</button><button class="chip" type="button" data-q="What is late?">What is late?</button><button class="chip" type="button" data-q="Who is overloaded?">Workload</button></div>' +
      '<div class="ai-out" id="ai-out" aria-live="polite"></div></section>';
  }
  function bindAI(scope) {
    var f = $('#ai-form'), out = $('#ai-out'), q = $('#ai-q');
    function answer(text) {
      var ts = tasksOf(scope), v = text.toLowerCase(), h = health(ts), s = stats(ts), html = '';
      if (/late|overdue|delay/.test(v)) {
        var l = open(ts).filter(function (t) { return t.due < 0; });
        html = l.length ? '<b>' + l.length + ' overdue task' + (l.length > 1 ? 's' : '') + '</b><ul>' + l.slice(0, 5).map(function (t) { return '<li>' + esc(t.title) + ' · ' + esc(M(t.who).name) + ' · ' + dueLabel(t) + '</li>'; }).join('') + '</ul>' : '<b>Nothing is overdue.</b> Nice work.';
      } else if (/who|load|overload|member|team/.test(v)) {
        var per = {}; open(ts).forEach(function (t) { per[t.who] = (per[t.who] || 0) + 1; });
        var rows = Object.keys(per).sort(function (a, b) { return per[b] - per[a]; });
        html = '<b>Open tasks per person</b><ul>' + rows.slice(0, 5).map(function (i) { return '<li>' + esc(M(i).name) + ': ' + per[i] + '</li>'; }).join('') + '</ul>' + (h.over.length ? 'Above 1.5× the average: ' + h.over.map(function (i) { return esc(M(i).name); }).join(', ') + '.' : 'No one is overloaded right now.');
      } else {
        var rd = reading(h.score);
        html = '<b>Weekly summary</b><ul><li>' + s.done + ' of ' + s.total + ' tasks done (' + s.pct + '%).</li><li>' + s.due + ' due in the next 7 days, ' + s.late + ' overdue.</li><li>Health score ' + h.score + ' · ' + rd.t.toLowerCase() + '.</li>' + (h.atRisk && h.atRisk.length ? '<li>At risk: ' + h.atRisk.slice(0, 3).map(function (t) { return esc(t.title); }).join(', ') + '.</li>' : '') + '</ul>';
      }
      out.innerHTML = html + '<small>Draft generated from your tasks. Review it before sharing with the team.</small>'; out.classList.add('is-open');
    }
    f.addEventListener('submit', function (e) { e.preventDefault(); answer(q.value || 'Weekly summary'); });
    $$('[data-q]').forEach(function (b) { b.addEventListener('click', function () { q.value = b.getAttribute('data-q'); answer(q.value); }); });
  }

  function renderHome() {
    var s = stats(tasks), h = health(tasks);
    var rows = DATA.projects.map(function (p) {
      var ts = tasksOf(p.id), st = stats(ts), hh = health(ts), rd = reading(hh.score);
      var next = open(ts).sort(function (a, b) { return a.due - b.due; })[0];
      return '<tr class="link" tabindex="0" data-href="project.html?p=' + p.id + '"><td><span class="pn"><i class="sb-dot" style="background:' + p.color + '"></i>' + esc(p.name) + '</span></td><td><div class="pr"><span>' + st.pct + '%</span>' + bar(st.pct, p.color) + '</div></td><td><span class="badge ' + rd.b + '">' + rd.t + ' · ' + hh.score + '</span></td><td>' + (next ? esc(dueLabel(next)) : '—') + '</td><td>' + stack(p.members, 3, 24) + '</td></tr>';
    }).join('');
    var per = {}; open(tasks).forEach(function (t) { per[t.who] = (per[t.who] || 0) + 1; });
    var maxW = Math.max.apply(null, Object.keys(per).map(function (k) { return per[k]; }).concat([1]));
    var team = DATA.members.map(function (m) {
      var n = per[m.id] || 0;
      return '<div class="member">' + avatar(m.id, 36) + '<div class="mi"><b>' + esc(m.name) + ' <i class="st ' + m.status + '" title="' + m.status + '"></i></b><small>' + esc(m.role) + '</small></div><div class="wl"><small>' + n + ' open</small>' + bar(Math.round(n / maxW * 100), n > 1.5 * (open(tasks).length / Object.keys(per).length) ? '#c62a2f' : '#6647f0') + '</div></div>';
    }).join('');
    var files = DATA.files.map(function (f) {
      return '<div class="file"><span class="fi">' + icon('file', 18) + '</span><div class="fm"><b>' + esc(f.name) + '</b><small>' + esc(P(f.p).name) + ' · ' + esc(M(f.by).name) + ' · ' + esc(f.when) + '</small></div><span class="badge b-grey">' + esc(f.source) + '</span></div>';
    }).join('');
    pageEl.innerHTML =
      '<div class="hello"><div><h1>' + esc(greeting()) + '</h1><p>Here is where all your projects stand today.</p></div><div class="actions"><button class="btn btn--line" type="button" data-act="invite">' + icon('userplus', 18) + 'Invite people</button><button class="btn btn--soft" type="button" data-act="toast" data-msg="Reports are planned after the dashboards.">' + icon('reports', 18) + 'Weekly report</button></div></div>' +
      kpisHTML(tasks) +
      '<div class="grid row-home-a"><section class="card" aria-labelledby="h-ag"><div class="card-h"><h2 id="h-ag">Today’s agenda</h2><button class="more" type="button" data-act="goto" data-href="planner.html">Open planner ' + icon('right', 14) + '</button></div><div class="agenda">' + agendaHTML() + '</div></section>' +
      '<section class="card" aria-labelledby="h-in"><div class="card-h"><h2 id="h-in">Inbox</h2><button class="more" type="button" data-act="inbox">View all ' + icon('right', 14) + '</button></div><div id="inbox-body">' + inboxCard() + '</div></section>' +
      '<section class="card" aria-labelledby="h-cal"><div class="card-h"><h2 id="h-cal">Calendar</h2></div>' + calHTML() + '</section></div>' +
      '<div class="grid row-home-b"><section class="card" aria-labelledby="h-pr"><div class="card-h"><h2 id="h-pr">Projects</h2><span class="badge b-grey">' + DATA.projects.length + ' active</span></div><div style="overflow-x:auto"><table class="tbl"><thead><tr><th scope="col">Project</th><th scope="col">Progress</th><th scope="col">Health</th><th scope="col">Next due</th><th scope="col">Team</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>' +
      '<section class="card" aria-labelledby="h-he"><div class="card-h"><h2 id="h-he">Workspace health</h2></div>' + gaugeHTML(h) + '</section></div>' +
      '<div class="grid row-home-c"><section class="card" aria-labelledby="h-te"><div class="card-h"><h2 id="h-te">Team workload</h2><button class="more" type="button" data-act="invite">Invite ' + icon('userplus', 14) + '</button></div>' + team + (DATA.pendingInvites ? '<p style="margin:10px 0 0"><span class="badge b-amber">' + DATA.pendingInvites + ' pending invitations</span></p>' : '') + '</section>' +
      '<section class="card" aria-labelledby="h-fi"><div class="card-h"><h2 id="h-fi">Recent files</h2><button class="more" type="button" data-act="toast" data-msg="Files (Drive / Dropbox links) is the next screen to build.">All files ' + icon('right', 14) + '</button></div>' + files + '</section>' +
      aiBox('all') + '</div>';
    bindInboxTabs(); bindAI('all'); bindRowLinks();
  }
  function bindRowLinks() {
    $$('tr[data-href]').forEach(function (r) {
      r.addEventListener('click', function () { location.href = r.getAttribute('data-href'); });
      r.addEventListener('keydown', function (e) { if (e.key === 'Enter') location.href = r.getAttribute('data-href'); });
    });
  }

  /* ---------- 6. Project overview ---------- */
  var pf = { who: '' };
  function projectTabs(p, active) {
    var tabs = [['Overview', 'grid', 'project.html?p=' + p.id], ['Board', 'board', 'board.html?p=' + p.id], ['List', 'list', 'board.html?p=' + p.id + '&view=list'], ['Calendar', 'calendar'], ['Chat', 'chat', 'chat.html?p=' + p.id], ['Files', 'folder'], ['Reports', 'reports']];
    return '<div class="tabs" role="tablist">' + tabs.map(function (t) {
      var on = t[0] === active;
      return t[2] ? '<a class="tab ' + (on ? 'is-active' : '') + '" href="' + t[2] + '" ' + (on ? 'aria-current="page"' : '') + '>' + icon(t[1], 18) + t[0] + '</a>'
        : '<button class="tab" type="button" aria-disabled="true" data-act="toast" data-msg="' + t[0] + ' is not built yet. It comes next.">' + icon(t[1], 18) + t[0] + '</button>';
    }).join('') + '</div>';
  }
  function projectHead(p, active) {
    return '<nav class="crumbs" aria-label="Breadcrumb"><a href="dashboard.html">Projects</a> / <span>' + esc(p.name) + '</span></nav>' +
      '<div class="ph"><div><div class="page-title"><h1>' + esc(p.name) + '</h1><span class="badge b-purple">Team space</span></div><p class="sub">' + esc(p.desc) + '</p></div>' +
      '<div class="right">' + stack(p.members, 5, 32) + '<button class="btn btn--line" type="button" data-act="toast" data-msg="Sharing links come with the backend.">' + icon('share', 18) + 'Share</button></div></div>' +
      projectTabs(p, active);
  }
  function filteredTasks(p) { return tasksOf(p).filter(function (t) { return !pf.who || t.who === pf.who; }); }
  function previewCard(t) {
    var done = t.status === 'done';
    return '<div class="pcard ' + (done ? 'is-done' : '') + '"><div class="t"><button class="chk" type="button" data-done="' + t.id + '" role="checkbox" aria-checked="' + done + '" aria-label="Mark ' + esc(t.title) + ' as ' + (done ? 'not done' : 'done') + '">' + (done ? icon('check', 12) : '') + '</button><span>' + esc(t.title) + '</span></div>' +
      '<div class="f"><span class="lbl l-' + t.label + '">' + esc(t.label) + '</span>' + avatar(t.who, 24) + '</div>' +
      '<div class="meta" style="display:flex;gap:6px;align-items:center;font-size:12.5px;color:' + (isLate(t) ? 'var(--red)' : 'var(--grey)') + '">' + icon('clock', 14) + dueLabel(t) + '</div></div>';
  }
  function renderProject() {
    var p = P(ctx.p) || DATA.projects[0]; ctx.p = p.id;
    var ts = filteredTasks(p.id), allTs = tasksOf(p.id);
    var memberOpts = '<option value="">All assignees</option>' + p.members.map(function (m) { return '<option value="' + m + '"' + (pf.who === m ? ' selected' : '') + '>' + esc(M(m).name) + '</option>'; }).join('');
    var cols = ['todo', 'progress', 'review'].map(function (k) {
      var list = ts.filter(function (t) { return t.status === k; });
      return '<div class="pcol"><h4><i class="sb-dot" style="background:' + STATUS[k].c + ';border-radius:50%"></i>' + STATUS[k].n + ' <em>' + list.length + '</em></h4>' + (list.slice(0, 4).map(previewCard).join('') || '<p class="empty" style="padding:8px 0">No tasks</p>') + '</div>';
    }).join('');
    var dl = open(ts).sort(function (a, b) { return a.due - b.due; }).slice(0, 5).map(function (t) {
      var d = dateOf(t.due);
      return '<div class="dl"><div class="d">' + MON[d.getMonth()].toUpperCase() + '<b class="' + (isLate(t) ? '' : 'ok') + '">' + d.getDate() + '</b></div><div><b style="font-weight:600">' + esc(t.title) + '</b><br><small style="color:' + (isLate(t) ? 'var(--red)' : 'var(--grey)') + '">' + dueLabel(t) + ' · ' + esc(M(t.who).name) + '</small></div>' + avatar(t.who, 26) + '</div>';
    }).join('') || '<p class="empty">No upcoming deadlines.</p>';
    var act = DATA.activity.filter(function (a) { return a.p === p.id; }).map(function (a) {
      var txt = a.a ? esc(a.verb) + ' <em>' + esc(a.a) + '</em> to <em>' + esc(a.b) + '</em>' : esc(a.verb) + ' <a href="board.html?p=' + p.id + '">' + esc(a.obj) + '</a>' + (a.to ? ' to <em>' + esc(a.to) + '</em>' : '');
      return '<div class="act">' + avatar(a.who, 28) + '<p><b>' + esc(M(a.who).name) + '</b> ' + txt + '</p><small>' + esc(a.when) + '</small></div>';
    }).join('') || '<p class="empty">No activity yet.</p>';
    pageEl.innerHTML = projectHead(p, 'Overview') +
      '<div class="filters"><label class="sr" for="pf-who">Assignee</label><select class="sel" id="pf-who">' + memberOpts + '</select><button class="btn btn--line" type="button" data-act="toast" data-msg="Advanced filters come with the backend.">' + icon('filter', 18) + 'Filters</button><button class="btn btn--dark" type="button" data-act="newtask" style="margin-left:auto">' + icon('plus', 18) + 'New task</button></div>' +
      kpisHTML(ts.length || pf.who ? ts : allTs) +
      '<div class="grid row-p-main"><section class="card" aria-labelledby="pb"><div class="card-h"><h2 id="pb">Board</h2><a class="more" href="board.html?p=' + p.id + '">Open full board ' + icon('right', 14) + '</a></div><div class="preview-cols">' + cols + '</div></section>' +
      '<div style="display:grid;gap:16px"><section class="card" aria-labelledby="pd"><div class="card-h"><h2 id="pd">Deadlines</h2><span class="badge b-grey">' + stats(ts).late + ' late</span></div>' + dl + '</section>' +
      '<section class="card" aria-labelledby="pa"><div class="card-h"><h2 id="pa">Activity</h2></div>' + act + '</section></div></div>' +
      '<div class="grid" style="grid-template-columns:1fr 1fr">' + '<section class="card" aria-labelledby="ph2"><div class="card-h"><h2 id="ph2">Project health</h2></div>' + gaugeHTML(health(allTs)) + '</section>' + aiBox(p.id) + '</div>';
    $('#pf-who').addEventListener('change', function (e) { pf.who = e.target.value; renderProject(); });
    $$('[data-done]').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = tasks.filter(function (x) { return x.id === b.getAttribute('data-done'); })[0];
        t.status = t.status === 'done' ? 'progress' : 'done'; save(); refresh(); toast(t.status === 'done' ? 'Task completed.' : 'Task reopened.');
      });
    });
    bindAI(p.id);
  }

  /* ---------- 7. Board ---------- */
  var bf = { who: '', label: '', group: 'status', view: 'board' };
  function groups() {
    if (bf.group === 'priority') return ['High', 'Medium', 'Low'].map(function (k) { return { key: k, name: k + ' priority', color: { High: '#c62a2f', Medium: '#d98a00', Low: '#9a9aa6' }[k] }; });
    if (bf.group === 'who') return DATA.members.filter(function (m) { return tasksOf(ctx.p).some(function (t) { return t.who === m.id; }); }).map(function (m) { return { key: m.id, name: m.name, color: m.color }; });
    return ORDER.map(function (k) { return { key: k, name: STATUS[k].n, color: STATUS[k].c }; });
  }
  function gKey(t) { return bf.group === 'priority' ? t.priority : bf.group === 'who' ? t.who : t.status; }
  function setGroup(t, key) { if (bf.group === 'priority') t.priority = key; else if (bf.group === 'who') t.who = key; else t.status = key; }
  function cardHTML(t) {
    var showP = ctx.p === 'all';
    return '<article class="tcard ' + (t.status === 'done' ? 'is-done' : '') + '" draggable="true" tabindex="0" data-id="' + t.id + '" aria-label="' + esc(t.title) + ', ' + STATUS[t.status].n + '">' +
      '<button class="menu-btn" type="button" data-menu="' + t.id + '" data-pop aria-haspopup="menu" aria-label="Actions for ' + esc(t.title) + '">' + icon('more', 18) + '</button>' +
      '<h4>' + esc(t.title) + '</h4><div><span class="lbl l-' + t.label + '">' + esc(t.label) + '</span>' + (showP ? ' <span class="badge b-grey" style="margin-left:4px">' + esc(P(t.p).name) + '</span>' : '') + '</div>' +
      '<div class="meta"><span class="' + (isLate(t) ? 'late' : '') + '">' + icon('clock', 14) + dueLabel(t) + '</span><span class="flag ' + t.priority + '">' + icon('flag', 14) + t.priority + '</span></div>' +
      '<div class="foot"><div class="meta"><span>' + icon('comment', 14) + t.comments + '</span><span>' + icon('clip', 14) + t.files + '</span></div>' + avatar(t.who, 26) + '</div></article>';
  }
  function boardTasks() {
    return tasksOf(ctx.p).filter(function (t) { return (!bf.who || t.who === bf.who) && (!bf.label || t.label === bf.label); });
  }
  function renderBoard() {
    var p = ctx.p === 'all' ? null : (P(ctx.p) || DATA.projects[0]);
    var ts = boardTasks(), g = groups();
    var members = DATA.members.map(function (m) { return '<option value="' + m.id + '"' + (bf.who === m.id ? ' selected' : '') + '>' + esc(M(m.id).name) + '</option>'; }).join('');
    var labels = ['Design', 'Frontend', 'Backend', 'Development', 'Documentation', 'Content'].map(function (l) { return '<option' + (bf.label === l ? ' selected' : '') + '>' + l + '</option>'; }).join('');
    var head = p ? projectHead(p, 'Board') : '<nav class="crumbs"><a href="dashboard.html">Home</a> / <span>' + (ctx.mine ? 'My tasks' : 'All tasks') + '</span></nav><div class="page-title"><h1>' + (ctx.mine ? 'My tasks' : 'All tasks') + '</h1></div><p class="sub">Tasks from every project in one board.</p>';
    var body;
    if (bf.view === 'list') {
      body = '<div class="listview">' + g.map(function (c) {
        var list = ts.filter(function (t) { return gKey(t) === c.key; });
        return '<section class="card"><h3><i class="sb-dot" style="background:' + c.color + ';border-radius:50%"></i>' + esc(c.name) + ' <span style="color:var(--grey-light);font-weight:500">' + list.length + '</span></h3>' +
          (list.length ? '<div style="overflow-x:auto"><table class="tbl"><thead><tr><th scope="col">Task</th><th scope="col">Label</th><th scope="col">Priority</th><th scope="col">Due</th><th scope="col">Assignee</th></tr></thead><tbody>' + list.map(function (t) {
            return '<tr><td style="font-weight:500">' + esc(t.title) + '</td><td><span class="lbl l-' + t.label + '">' + esc(t.label) + '</span></td><td><span class="flag ' + t.priority + '">' + icon('flag', 14) + t.priority + '</span></td><td style="color:' + (isLate(t) ? 'var(--red)' : 'inherit') + '">' + dueLabel(t) + '</td><td>' + avatar(t.who, 24) + '</td></tr>';
          }).join('') + '</tbody></table></div>' : '<p class="empty">No tasks</p>') + '</section>';
      }).join('') + '</div>';
    } else {
      body = '<div class="board" id="board">' + g.map(function (c) {
        var list = ts.filter(function (t) { return gKey(t) === c.key; });
        return '<section class="col" data-key="' + esc(c.key) + '" aria-label="' + esc(c.name) + '"><div class="col-h"><i class="dot" style="background:' + c.color + '"></i><h3>' + esc(c.name) + '</h3><span class="cnt">' + list.length + '</span><div class="acts"><button class="mini" type="button" data-add="' + esc(c.key) + '" aria-label="Add task to ' + esc(c.name) + '" title="Add task">' + icon('plus', 16) + '</button></div></div><div class="slot">' + list.map(cardHTML).join('') + '</div>' +
          '<button class="add-row" type="button" data-add="' + esc(c.key) + '">' + icon('plus', 16) + 'Add task</button></section>';
      }).join('') + '</div>';
    }
    pageEl.innerHTML = head +
      '<div class="toolbar"><div class="seg" role="group" aria-label="View"><button type="button" data-view="board" class="' + (bf.view === 'board' ? 'is-active' : '') + '" aria-pressed="' + (bf.view === 'board') + '">' + icon('board', 18) + 'Board</button><button type="button" data-view="list" class="' + (bf.view === 'list' ? 'is-active' : '') + '" aria-pressed="' + (bf.view === 'list') + '">' + icon('list', 18) + 'List</button></div>' +
      '<label class="sr" for="b-who">Assignee</label><select class="sel" id="b-who"><option value="">All assignees</option>' + members + '</select>' +
      '<label class="sr" for="b-label">Label</label><select class="sel" id="b-label"><option value="">All labels</option>' + labels + '</select>' +
      '<label class="sr" for="b-group">Group by</label><select class="sel" id="b-group"><option value="status"' + (bf.group === 'status' ? ' selected' : '') + '>Group: Status</option><option value="priority"' + (bf.group === 'priority' ? ' selected' : '') + '>Group: Priority</option><option value="who"' + (bf.group === 'who' ? ' selected' : '') + '>Group: Assignee</option></select>' +
      '<div class="sp"><button class="btn btn--line" type="button" data-act="toast" data-msg="Board customization comes with the backend.">Customize</button><button class="btn btn--line" type="button" data-act="toast" data-msg="Templates are planned for later.">' + icon('template', 18) + 'Templates</button></div></div>' + body;
    bindBoard();
  }
  function bindBoard() {
    $$('[data-view]').forEach(function (b) { b.addEventListener('click', function () { bf.view = b.getAttribute('data-view'); renderBoard(); }); });
    $('#b-who').addEventListener('change', function (e) { bf.who = e.target.value; renderBoard(); });
    $('#b-label').addEventListener('change', function (e) { bf.label = e.target.value; renderBoard(); });
    $('#b-group').addEventListener('change', function (e) { bf.group = e.target.value; renderBoard(); });
    if (bf.view !== 'board') return;
    var drag = null;
    $$('.tcard').forEach(function (c) {
      c.addEventListener('dragstart', function (e) { drag = c.getAttribute('data-id'); c.classList.add('is-drag'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', drag); } catch (x) {} });
      c.addEventListener('dragend', function () { c.classList.remove('is-drag'); $$('.col').forEach(function (x) { x.classList.remove('is-over'); }); });
    });
    $$('.col').forEach(function (col) {
      col.addEventListener('dragover', function (e) { e.preventDefault(); col.classList.add('is-over'); });
      col.addEventListener('dragleave', function (e) { if (!col.contains(e.relatedTarget)) col.classList.remove('is-over'); });
      col.addEventListener('drop', function (e) {
        e.preventDefault(); col.classList.remove('is-over');
        var id = drag || (e.dataTransfer && e.dataTransfer.getData('text/plain')); var t = tasks.filter(function (x) { return x.id === id; })[0];
        if (t && gKey(t) !== col.getAttribute('data-key')) { setGroup(t, col.getAttribute('data-key')); save(); refresh(); toast('Moved to ' + $('h3', col).textContent + '.'); }
      });
    });
    $$('[data-menu]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var t = tasks.filter(function (x) { return x.id === b.getAttribute('data-menu'); })[0];
        var html = '<div class="cap">Move to</div>' + ORDER.map(function (k) { return '<button type="button" data-move="' + k + '" ' + (t.status === k ? 'disabled style="opacity:.5"' : '') + '><i class="sb-dot" style="background:' + STATUS[k].c + ';border-radius:50%"></i>' + STATUS[k].n + '</button>'; }).join('') + '<hr><button type="button" data-del="1" style="color:var(--red)">' + icon('trash', 18) + 'Delete task</button>';
        var pop = openPop(b, html, { align: 'right' });
        pop.addEventListener('click', function (ev) {
          var mv = ev.target.closest('[data-move]'), dl = ev.target.closest('[data-del]');
          if (mv) { t.status = mv.getAttribute('data-move'); save(); closePop(); refresh(); toast('Moved to ' + STATUS[t.status].n + '.'); }
          if (dl) { var ok = confirm('Delete “' + t.title + '”? This cannot be undone.'); if (ok) { tasks = tasks.filter(function (x) { return x !== t; }); save(); closePop(); refresh(); toast('Task deleted.'); } else closePop(); }
        });
      });
    });
    $$('[data-add]').forEach(function (b) {
      b.addEventListener('click', function () {
        var col = b.closest('.col'), slot = $('.slot', col); if ($('.add-box', col)) { $('input', col).focus(); return; }
        var box = document.createElement('div'); box.className = 'add-box';
        box.innerHTML = '<label class="sr" for="add-in">Task title</label><input id="add-in" placeholder="Task title" maxlength="120"><small>Enter to add · Esc to cancel</small>';
        slot.prepend(box); var inp = $('input', box); inp.focus();
        inp.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') box.remove();
          if (e.key === 'Enter') {
            var v = inp.value.trim(); if (!v) return;
            var t = { id: 'n' + Date.now(), p: ctx.p === 'all' ? 'p1' : ctx.p, title: v, status: 'todo', priority: 'Medium', label: 'Design', who: DATA.me, due: 7, upd: 0, comments: 0, files: 0 };
            setGroup(t, col.getAttribute('data-key')); tasks.push(t); save(); refresh(); toast('Task added.');
          }
        });
        inp.addEventListener('blur', function () { if (!inp.value.trim()) box.remove(); });
      });
    });
  }


  /* ---------- 7b. Chat ---------- */
  var KEY_CHAT = 'protask.chat.v1';
  var cs = { added: {}, react: {}, taskOf: {}, read: {}, threads: {}, chans: [], fu: { st: {}, task: {}, extra: [] }, nread: [], nout: [] };
  try { var _c = JSON.parse(localStorage.getItem(KEY_CHAT)); if (_c) cs = { added: _c.added || {}, react: _c.react || {}, taskOf: _c.taskOf || {}, read: _c.read || {}, threads: _c.threads || {}, chans: _c.chans || [], fu: _c.fu || { st: {}, task: {}, extra: [] }, nread: _c.nread || [], nout: _c.nout || [] }; } catch (e) {}
  cs.chans.forEach(function (c) { if (!DATA.channels.some(function (x) { return x.id === c.id; })) DATA.channels.push(c); });
  function saveChat() { try { localStorage.setItem(KEY_CHAT, JSON.stringify(cs)); } catch (e) {} }
  var NOW = Date.now();
  function chanById(id) {
    var c = DATA.channels.filter(function (x) { return x.id === id; })[0];
    if (c) return c;
    if (id && id.indexOf('dm-') === 0) {
      var m = M(id.slice(3));
      return { id: id, name: m.name, type: 'dm', other: m.id, members: [DATA.me, m.id], unread: (DATA.dmUnread || {})[m.id] || 0, desc: 'Direct message with ' + m.name };
    }
    return null;
  }
  function msgsOf(c) {
    var seed = (DATA.chatSeed[c.id] || []).map(function (m) { var o = {}; for (var k in m) o[k] = m[k]; o.ts = NOW - m.ago * 60000; return o; });
    return seed.concat(cs.added[c.id] || []).sort(function (a, b) { return a.ts - b.ts; });
  }
  function lastMsg(c) { var l = msgsOf(c); return l[l.length - 1]; }
  function chanUnread(c) { return cs.read[c.id] ? 0 : (c.unread || 0); }
  function chatUnread() { return DATA.channels.concat(DATA.members.filter(function (m) { return m.id !== DATA.me; }).map(function (m) { return chanById('dm-' + m.id); })).reduce(function (n, c) { return n + chanUnread(c); }, 0); }
  function agoLabel(ts) {
    var m = Math.max(0, Math.round((Date.now() - ts) / 60000));
    if (m < 1) return 'Just now';
    if (m < 60) return m + ' min ago';
    if (m < 1440) return Math.round(m / 60) + ' h ago';
    return Math.round(m / 1440) + ' d ago';
  }
  function clock(ts) { return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
  function dayLabel(ts) {
    var d = new Date(ts), t = new Date(); d.setHours(0, 0, 0, 0); t.setHours(0, 0, 0, 0);
    var diff = Math.round((t - d) / 864e5);
    return diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : MON[d.getMonth()] + ' ' + d.getDate();
  }
  function fmt(text) { return esc(text).replace(/@[A-Za-z]+/g, function (m) { return '<span class="mention">' + m + '</span>'; }).replace(/#[0-9a-fA-F]{6}\b/g, function (m) { return '<span class="hexc"><i style="background:' + m + '"></i>' + m + '</span>'; }); }
  function hash(c) { return '<span class="hash" aria-hidden="true">#</span>'; }


  function taskById(id) { return tasks.filter(function (x) { return x.id === id; })[0] || DATA.tasks.filter(function (x) { return x.id === id; })[0]; }
  function dmPanelHTML() {
    var rows = DATA.members.filter(function (m) { return m.id !== DATA.me; }).map(function (m) {
      var c = chanById('dm-' + m.id), l = lastMsg(c), u = chanUnread(c);
      return { m: m, c: c, l: l, u: u };
    }).sort(function (a, b) { return (b.l ? b.l.ts : 0) - (a.l ? a.l.ts : 0); });
    var h = '<div class="pn-head"><h2>Messages</h2><button class="icon-btn" type="button" id="dm-find" aria-label="Search conversations">' + icon('search', 18) + '</button></div><div class="pn-scroll">' +
      '<div class="pn-m"><a class="pn-i" href="dashboard.html">' + icon('home', 18) + '<span class="pn-l">Home</span></a><a class="pn-i" href="chat.html">' + icon('chat', 18) + '<span class="pn-l">Chat space</span></a></div>' +
      '<div class="pn-search">' + icon('search', 16) + '<label class="sr" for="dm-q">Search conversations</label><input id="dm-q" type="search" placeholder="Search conversations" autocomplete="off"></div>' +
      '<div class="pn-h"><span>Direct messages</span></div>';
    rows.forEach(function (r) {
      h += '<a class="dm-row ' + (ctx.c === r.c.id ? 'is-active' : '') + '" href="channel.html?c=' + r.c.id + '" data-q="' + esc(r.m.name.toLowerCase()) + '"><span class="dm-av">' + avatar(r.m.id, 40) + '<i class="st ' + r.m.status + '"></i></span><span class="dm-t"><b>' + esc(r.m.name) + '</b><small>' + (r.l ? (r.l.who === DATA.me ? 'You: ' : '') + esc(r.l.text) : 'Start a conversation') + '</small></span><span class="dm-w">' + (r.l ? agoLabel(r.l.ts) : '') + (r.u ? '<i class="unread-dot" aria-label="Unread"></i>' : '') + '</span></a>';
    });
    h += '<div class="pn-h"><span>Channels</span></div>';
    DATA.channels.forEach(function (c) {
      var l = lastMsg(c), u = chanUnread(c);
      h += '<a class="dm-row" href="channel.html?c=' + c.id + '" data-q="' + esc(c.name) + '"><span class="dm-av"><span class="hash-tile" style="width:40px;height:40px">#</span></span><span class="dm-t"><b>' + esc(c.name) + '</b><small>' + (l ? esc(M(l.who).name.split(' ')[0]) + ': ' + esc(l.text) : '') + '</small></span><span class="dm-w">' + (l ? agoLabel(l.ts) : '') + (u ? '<i class="unread-dot"></i>' : '') + '</span></a>';
    });
    return h + '</div>';
  }
  document.addEventListener('input', function (e) {
    if (e.target.id !== 'dm-q') return;
    var v = e.target.value.trim().toLowerCase();
    $$('.dm-row').forEach(function (r) { r.hidden = !!v && r.getAttribute('data-q').indexOf(v) < 0; });
  });
  document.addEventListener('click', function (e) { if (e.target.closest('#dm-find')) { var i = $('#dm-q'); if (i) i.focus(); } });

  function chatPanelHTML() {
    var row = function (ic, label, o) {
      o = o || {};
      var tag = o.href ? 'a href="' + o.href + '"' : 'button type="button"';
      return '<' + tag + ' class="pn-i ' + (o.on ? 'is-active' : '') + '" ' + (o.act ? 'data-act="' + o.act + '"' : '') + ' ' + (o.msg ? 'data-msg="' + o.msg + '"' : '') + '>' + (o.lead || icon(ic, 18)) + '<span class="pn-l">' + label + '</span>' + (o.badge ? '<span class="sb-badge">' + o.badge + '</span>' : '') + '</' + (o.href ? 'a' : 'button') + '>';
    };
    var next = 'This chat page comes next.';
    var h = '<div class="pn-head"><div style="min-width:0"><h2>Website Redesign</h2><div class="pn-sub">Chat space</div></div><button class="mini" type="button" data-act="newchannel" aria-label="New channel" title="New channel">' + icon('plus', 18) + '</button></div><div class="pn-scroll">' +
      '<div class="pn-m">' + row('home', 'Home', { href: 'dashboard.html' }) + row('tasks', 'My tasks', { href: 'board.html?p=all&mine=1' }) + '</div>' +
      row('comments', 'Replies (12)', { act: 'toast', msg: next }) + row('notifications', 'Activity', { href: 'chat.html' }) + row('due-date', 'Follow-ups' + (fuOpen() ? ' (' + fuOpen() + ')' : ''), { act: 'followups' }) + row('activity-log', 'Posts', { act: 'toast', msg: next }) +
      '<div class="pn-h"><span>Pinned</span></div>';
    DATA.channels.filter(function (c) { return c.pinned; }).forEach(function (c) { var u = chanUnread(c); h += row('', esc(c.name), { href: 'channel.html?c=' + c.id, on: ctx.c === c.id, lead: hash(), badge: u || '' }); });
    h += '<div class="pn-h"><span>Channels</span></div>';
    DATA.channels.filter(function (c) { return !c.pinned; }).forEach(function (c) { h += row('', esc(c.name), { href: 'channel.html?c=' + c.id, on: ctx.c === c.id, lead: hash() }); });
    h += row('plus', 'Add channel', { act: 'newchannel' }) + '<div class="pn-h"><span>Direct messages</span></div>';
    DATA.members.filter(function (m) { return m.id !== DATA.me; }).forEach(function (m) {
      h += '<a class="pn-i ' + (ctx.c === 'dm-' + m.id ? 'is-active' : '') + '" href="channel.html?c=dm-' + m.id + '">' + avatar(m.id, 22) + '<span class="pn-l">' + esc(m.name) + '</span><i class="st ' + m.status + '"></i></a>';
    });
    h += '<a class="pn-i ' + (ctx.c === 'dm-' + DATA.me ? 'is-active' : '') + '" href="channel.html?c=dm-' + DATA.me + '">' + avatar(DATA.me, 22) + '<span class="pn-l">' + esc(M(DATA.me).name) + ' <small style="margin:0">— You</small></span></a>';
    return h + '</div><div class="pn-foot"><a class="prio" href="chat.html">' + icon('chat', 16) + 'Chat space</a></div>';
  }

  /* Chat space (overview) */
  var actTab = 'all';
  function renderChat() {
    var pinned = DATA.channels.filter(function (c) { return c.pinned; }).map(function (c) {
      var l = lastMsg(c), u = chanUnread(c);
      return '<a class="pinrow" href="channel.html?c=' + c.id + '"><span class="hash-tile">#</span><div><b>' + esc(c.name) + '</b><span class="pw">' + agoLabel(l.ts) + '</span>' +
        '<span class="pu ' + (u ? '' : 'zero') + '">' + (u ? u + ' unread' : 'All read') + '</span><p>' + esc(M(l.who).name.split(' ')[0]) + ': ' + esc(l.text) + '</p></div></a>';
    }).join('');
    var team = DATA.projects[0].members.map(function (id) {
      var m = M(id);
      return '<div class="member">' + avatar(id, 38) + '<div class="mi"><b>' + esc(m.name) + ' <i class="st ' + m.status + '" title="' + m.status + '"></i></b><small>' + esc(m.role) + '</small></div>' +
        (id !== DATA.me ? '<a class="icon-btn" href="channel.html?c=dm-' + id + '" aria-label="Message ' + esc(m.name) + '" title="Message ' + esc(m.name) + '">' + icon('chat', 18) + '</a>' : '') + '</div>';
    }).join('');
    pageEl.innerHTML = '<div class="ph"><div class="page-title"><h1>Website Redesign</h1><span class="badge b-grey">Private project channel</span></div>' +
      '<div class="right"><button class="btn btn--dark" type="button" data-act="goto" data-href="channel.html?c=general#compose">' + icon('plus', 18) + 'New message</button></div></div>' +
      '<div class="grid chat-grid"><section class="card" aria-labelledby="c-pin"><div class="card-h"><h2 id="c-pin">Pinned conversations</h2></div><div class="pinlist">' + pinned + '</div></section>' +
      '<section class="card" aria-labelledby="c-act"><div class="card-h"><h2 id="c-act">Recent activity</h2></div><div class="tabs-s" role="tablist">' + [['all', 'All'], ['mention', 'Mentions'], ['task', 'Tasks']].map(function (t) {
        return '<button class="chip ' + (actTab === t[0] ? 'is-active' : '') + '" type="button" role="tab" aria-selected="' + (actTab === t[0]) + '" data-atab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div><div id="act-list"></div></section>' +
      '<div style="display:grid;gap:16px"><section class="card" aria-labelledby="c-team"><div class="card-h"><h2 id="c-team">Team</h2><span class="badge b-grey">' + DATA.projects[0].members.length + '</span></div>' + team +
      '<button class="btn btn--line" type="button" data-act="invite" style="width:100%;margin-top:10px">Invite teammates</button></section>' +
      '<section class="card cta"><h3>Turn messages into tasks</h3><p>Any message can become a task. Hover a message and choose “Make task”.</p><a href="channel.html?c=design-review">Try it ' + icon('arrow', 14) + '</a></section></div></div>';
    function drawAct() {
      var ic = { mention: 'comments', task: 'task', reply: 'comments', file: 'link', join: 'plus' };
      var list = DATA.chatActivity.filter(function (a) { return actTab === 'all' || (actTab === 'mention' && a.type === 'mention') || (actTab === 'task' && a.type === 'task'); });
      $('#act-list').innerHTML = list.length ? '<ol class="tl">' + list.map(function (a) {
        return '<li><span class="tl-i">' + icon(ic[a.type], 18) + '</span><a href="channel.html?c=' + a.c + '"><p>' + (a.type === 'mention' ? '<span class="badge b-purple" style="margin-right:6px">' + icon('comments', 12) + 'Mention</span>' : '') + '<b>' + esc(M(a.who).name.split(' ')[0]) + '</b> ' + (a.type === 'mention' ? fmt(a.text) : a.text) + '</p><small>' + agoLabel(NOW - a.ago * 60000) + ' · #' + esc(a.c) + '</small></a></li>';
      }).join('') + '</ol>' : '<p class="empty">Nothing here yet.</p>';
      $$('[data-atab]').forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-atab') === actTab); b.setAttribute('aria-selected', b.getAttribute('data-atab') === actTab); });
    }
    drawAct();
    $$('[data-atab]').forEach(function (b) { b.addEventListener('click', function () { actTab = b.getAttribute('data-atab'); drawAct(); }); });
  }

  /* Channel */
  var EMOJI = ['👍', '🎉', '👀', '✅', '❤️', '🙌'];
  var chat = { q: '', draftTask: '', muted: false, details: null, thread: null, tab: 'thread' };
  function reactionsOf(m) {
    var base = {}; (m.react || []).forEach(function (r) { base[r.e] = r.n; });
    var mine = cs.react[m.id] || {};
    Object.keys(mine).forEach(function (e) { if (!(e in base)) base[e] = 0; });
    return Object.keys(base).map(function (e) { return { e: e, n: base[e] + (mine[e] ? 1 : 0), me: !!mine[e] }; }).filter(function (r) { return r.n > 0; });
  }
  function repliesOf(id) {
    var seed = ((DATA.threads || {})[id] || []).map(function (m) { var o = {}; for (var k in m) o[k] = m[k]; o.ts = NOW - m.ago * 60000; return o; });
    return seed.concat(cs.threads[id] || []).sort(function (a, b) { return a.ts - b.ts; });
  }
  function taskCardHTML(t) {
    return '<a class="tcard-e" href="board.html?p=' + t.p + '"><span class="chk-e ' + (t.status === 'done' ? 'on' : '') + '">' + icon('check', 14) + '</span><span class="te-t"><b>' + esc(t.title) + '</b><small>' + dueLabel(t) + '</small></span><span class="badge ' + ({ todo: 'b-grey', progress: 'b-purple', review: 'b-amber', done: 'b-green' }[t.status]) + '">' + STATUS[t.status].n + '</span>' + avatar(t.who, 24) + '</a>';
  }
  function bodyHTML(m, withReact) {
    var tid = m.task || cs.taskOf[m.id], t = tid && taskById(tid), h = '<p class="cm-t">' + fmt(m.text) + '</p>';
    if (m.file) h += '<div class="fcard"><span class="fi">' + icon('drive', 20) + '</span><div><b>' + esc(m.file.name) + '</b><small>' + esc(m.file.size) + ' · ' + esc(m.file.source) + '</small></div><button class="btn btn--line btn--sm" type="button" data-act="toast" data-msg="Opening files is planned with the Files screen.">Open</button></div>';
    if (t) h += taskCardHTML(t);
    var rs = reactionsOf(m);
    if (rs.length) h += '<div class="rx">' + rs.map(function (r) { return '<button type="button" class="rx-b ' + (r.me ? 'me' : '') + '" data-rx="' + m.id + '" data-e="' + r.e + '" aria-pressed="' + r.me + '" aria-label="' + r.e + ' ' + r.n + '">' + r.e + ' ' + r.n + '</button>'; }).join('') +
      '<button type="button" class="rx-b add" data-rxadd="' + m.id + '" data-pop aria-label="Add reaction">' + icon('plus', 14) + '</button></div>';
    return { html: h, task: t };
  }
  function msgHTML(m, prev) {
    var same = prev && prev.who === m.who && m.ts - prev.ts < 5 * 60000, b = bodyHTML(m), rp = repliesOf(m.id);
    var h = '<article class="cm ' + (same ? 'same' : '') + '" data-id="' + m.id + '">' + (same ? '<span class="cm-av"></span>' : '<span class="cm-av">' + avatar(m.who, 40) + '</span>') + '<div class="cm-b">' +
      (same ? '' : '<div class="cm-h"><b>' + esc(M(m.who).name) + '</b><time>' + clock(m.ts) + '</time></div>') + b.html;
    if (rp.length) {
      var who = []; rp.forEach(function (r) { if (who.indexOf(r.who) < 0) who.push(r.who); });
      h += '<button class="th-chip" type="button" data-th="' + m.id + '">' + stack(who, 3, 22) + '<b>' + rp.length + ' repl' + (rp.length === 1 ? 'y' : 'ies') + '</b><span>Last reply ' + agoLabel(rp[rp.length - 1].ts) + '</span>' + icon('right', 14) + '</button>';
    }
    h += '</div><div class="cm-acts" role="toolbar" aria-label="Message actions"><button type="button" data-rxadd="' + m.id + '" data-pop aria-label="Add reaction" title="Add reaction">' + icon('plus', 16) + '</button><button type="button" data-th="' + m.id + '" aria-label="Reply in thread" title="Reply in thread">' + icon('comments', 16) + '</button>' +
      (b.task ? '' : '<button type="button" data-mk="' + m.id + '" aria-label="Make task" title="Make task">' + icon('task', 16) + '</button>') + '</div></article>';
    return h;
  }
  function drawMsgs(c, scroll) {
    var box = $('#cm-list'), list = msgsOf(c), q = chat.q.trim().toLowerCase();
    if (q) list = list.filter(function (m) { return m.text.toLowerCase().indexOf(q) > -1 || M(m.who).name.toLowerCase().indexOf(q) > -1; });
    var out = '', day = '', prev = null;
    list.forEach(function (m) {
      var d = dayLabel(m.ts);
      if (d !== day) { out += '<div class="day"><span>' + d + '</span></div>'; day = d; prev = null; }
      out += msgHTML(m, prev); prev = m;
    });
    box.innerHTML = out || (q ? '<p class="empty">No message matches “' + esc(chat.q) + '”.</p>' : '<div class="chat-empty"><b>This is the start of ' + (c.type === 'dm' ? esc(c.name) : '#' + esc(c.name)) + '</b><p>Say hello, share a file or turn an idea into a task.</p></div>');
    if (scroll !== false) box.scrollTop = box.scrollHeight;
  }
  function statusLabel(s) { return { online: 'Online', away: 'Away', offline: 'Offline' }[s] || s; }
  function detailsHTML(c) {
    var dm = c.type === 'dm', files = msgsOf(c).filter(function (m) { return m.file; }).map(function (m) { return { name: m.file.name, meta: m.file.size + ' · ' + M(m.who).name.split(' ')[0] }; });
    if (dm) DATA.files.filter(function (f) { return f.by === c.other || f.by === DATA.me; }).slice(0, 3).forEach(function (f) { files.push({ name: f.name, meta: f.size + ' · ' + M(f.by).name.split(' ')[0] }); });
    var h = '<div class="dt-head"><h2>Details</h2><button class="icon-btn" type="button" id="dt-close" aria-label="Close details">' + icon('close', 18) + '</button></div>';
    if (dm) {
      var o = M(c.other), tog = DATA.projects.filter(function (p) { return p.members.indexOf(c.other) > -1 && p.members.indexOf(DATA.me) > -1; });
      var ot = open(tasks).filter(function (t) { return t.who === c.other; }).slice(0, 3);
      h += '<div class="dt-me">' + avatar(c.other, 56) + '<div><b>' + esc(o.name) + '</b><span>' + esc(o.role) + '</span><span class="dt-st"><i class="st ' + o.status + '"></i>' + statusLabel(o.status) + '</span></div></div>' +
        '<h3>Projects together <span class="cnt">' + tog.length + '</span></h3><div class="chips">' + tog.map(function (p) { return '<a class="chip-l" href="project.html?p=' + p.id + '"><i class="sb-dot" style="background:' + p.color + '"></i>' + esc(p.name) + '</a>'; }).join('') + '</div>' +
        (ot.length ? '<h3>Open tasks of ' + esc(o.name.split(' ')[0]) + '</h3><div class="dt-list">' + ot.map(function (t) { return '<a href="board.html?p=' + t.p + '">' + icon('task', 16) + '<span>' + esc(t.title) + '</span><small>' + dueLabel(t) + '</small></a>'; }).join('') + '</div>' : '');
    } else {
      h += '<p class="dt-desc">' + esc(c.desc) + '</p><h3>Members <span class="cnt">' + c.members.length + '</span></h3><div class="dt-list">' + c.members.map(function (id) { return '<a href="channel.html?c=dm-' + id + '">' + avatar(id, 28) + '<span>' + esc(M(id).name) + '</span><small>' + esc(M(id).role) + '</small></a>'; }).join('') + '</div>';
    }
    h += '<h3 id="dt-files">Shared files <span class="cnt">' + files.length + '</span></h3><div class="dt-list">' + (files.length ? files.map(function (f) { return '<button type="button" data-act="toast" data-msg="Opening files is planned with the Files screen."><span class="fi s">' + icon('drive', 16) + '</span><span><b>' + esc(f.name) + '</b><small>' + esc(f.meta) + '</small></span></button>'; }).join('') : '<p class="empty" style="text-align:left;padding:4px 0">No file shared yet.</p>') + '</div>' +
      '<button class="btn btn--line" type="button" id="dt-search" style="width:100%;margin-top:14px">' + icon('search', 18) + 'Search in conversation</button>';
    return h;
  }
  function threadHTML(c, m) {
    var rp = repliesOf(m.id), b = bodyHTML(m);
    var head = '<header class="th-head"><div><small>' + (c.type === 'dm' ? esc(c.name) : '#' + esc(c.name)) + '</small><h2>' + rp.length + ' repl' + (rp.length === 1 ? 'y' : 'ies') + '</h2></div><button class="icon-btn" type="button" id="th-close" aria-label="Close thread">' + icon('close', 20) + '</button></header>' +
      '<div class="th-tabs" role="tablist"><button type="button" role="tab" class="' + (chat.tab === 'thread' ? 'is-active' : '') + '" data-tt="thread" aria-selected="' + (chat.tab === 'thread') + '">Thread</button><button type="button" role="tab" class="' + (chat.tab === 'all' ? 'is-active' : '') + '" data-tt="all" aria-selected="' + (chat.tab === 'all') + '">All replies</button></div>';
    var body = '';
    if (chat.tab === 'all') {
      var ths = msgsOf(c).filter(function (x) { return repliesOf(x.id).length; });
      body = ths.length ? ths.map(function (x) { var r = repliesOf(x.id); return '<button class="th-row" type="button" data-th="' + x.id + '">' + avatar(x.who, 32) + '<span><b>' + esc(M(x.who).name) + '</b><small>' + esc(x.text) + '</small></span><em>' + r.length + '</em></button>'; }).join('') : '<p class="empty">No thread in this conversation yet.</p>';
    } else {
      body = '<div class="th-parent"><span class="cm-av">' + avatar(m.who, 36) + '</span><div class="cm-b"><div class="cm-h"><b>' + esc(M(m.who).name) + '</b><time>' + clock(m.ts) + '</time></div>' + b.html + '</div></div><div class="th-list">' +
        rp.map(function (r) { var rb = bodyHTML(r); return '<div class="th-r"><span class="cm-av">' + avatar(r.who, 36) + '</span><div class="cm-b"><div class="cm-h"><b>' + esc(M(r.who).name) + '</b><time>' + clock(r.ts) + '</time></div>' + rb.html + '</div></div>'; }).join('') + '</div>';
    }
    var foot = '<form class="th-form" id="th-form" novalidate><div class="th-in"><label class="sr" for="th-input">Reply to thread</label><input id="th-input" placeholder="Reply to thread…" autocomplete="off">' +
      '<button type="button" id="th-at" aria-label="Mention someone">@</button><button type="button" id="th-em" data-pop aria-label="Emoji">☺</button><button type="button" data-act="toast" data-msg="Voice messages are not planned yet." aria-label="Voice message">' + icon('chat', 18) + '</button></div><button class="btn btn--dark" type="submit" id="th-send" disabled>Send</button></form>';
    return head + '<div class="th-body">' + body + '</div>' + (chat.tab === 'thread' ? foot : '');
  }
  function renderChannel() {
    var c = chanById(ctx.c) || DATA.channels[1]; ctx.c = c.id;
    if (!cs.read[c.id]) { cs.read[c.id] = 1; saveChat(); renderSidebar(); }
    var p = c.p ? P(c.p) : null, dm = c.type === 'dm';
    if (chat.details === null) chat.details = dm && innerWidth > 1300;
    var tabs = p ? [['Overview', 'dashboard', 'project.html?p=' + p.id], ['Board', 'kanban', 'board.html?p=' + p.id], ['List', 'activity-log', 'board.html?p=' + p.id + '&view=list'], ['Calendar', 'due-date'], ['Chat', 'chat', 'chat.html', 1], ['Files', 'drive'], ['Reports', 'activity-log']] : [];
    var sub = dm ? (M(c.other).role + ' · ' + statusLabel(M(c.other).status)) : 'Shared channel · ' + c.members.length + ' members';
    var nm = dm ? c.name : '#' + c.name;
    pageEl.className = 'page page--chat';
    pageEl.innerHTML = '<div class="ch-wrap"><div class="ch-main"><header class="ch-head"><div class="ch-id">' + (dm ? avatar(c.other, 48) : '<span class="hash-tile lg">#</span>') + '<div><h1>' + esc(c.name) + '</h1><p>' + esc(sub) + ' ' + (dm ? '' : stack(c.members, 4, 24)) + '</p></div></div>' +
      '<div class="ch-tools">' + (dm ? '' : '<button class="btn btn--soft" type="button" data-act="toast" data-msg="Calls are not planned yet. For now, use messages.">' + icon('chat', 18) + 'Join call</button>') +
      '<div class="ch-search" id="ch-search" hidden><label class="sr" for="cq">Search in this conversation</label><input id="cq" type="search" placeholder="Search messages" value="' + esc(chat.q) + '"></div>' +
      '<button class="icon-btn bordered" type="button" id="b-files" aria-label="Shared files" title="Shared files">' + icon('drive', 18) + '</button>' +
      '<button class="icon-btn bordered" type="button" id="b-search" aria-label="Search in conversation" title="Search in conversation">' + icon('search', 18) + '</button>' +
      '<button class="icon-btn bordered" type="button" id="b-mute" aria-pressed="' + chat.muted + '" aria-label="Mute notifications" title="Mute notifications">' + icon('bell', 18) + '</button>' +
      '<button class="icon-btn bordered ' + (chat.details ? 'on' : '') + '" type="button" id="b-info" aria-pressed="' + chat.details + '" aria-label="Show details" title="Details">' + icon('info', 18) + '</button></div></header>' +
      (tabs.length ? '<div class="tabs ch-tabs" role="tablist">' + tabs.map(function (t) {
        return t[2] ? '<a class="tab ' + (t[3] ? 'is-active' : '') + '" href="' + t[2] + '" ' + (t[3] ? 'aria-current="page"' : '') + '>' + t[0] + '</a>' : '<button class="tab" type="button" aria-disabled="true" data-act="toast" data-msg="' + t[0] + ' is not built yet. It comes next.">' + t[0] + '</button>'; }).join('') + '</div>' : '') +
      '<div class="cm-list" id="cm-list" aria-live="polite" tabindex="0" aria-label="Messages"></div>' +
      '<form class="composer" id="composer" novalidate><div class="cp-tabs"><button type="button" class="is-active">Message</button><button type="button" data-act="toast" data-msg="Posts (long messages) are planned with the composer page.">Post</button></div>' +
      '<div class="cp-task" id="cp-task" hidden></div><div class="mention-list" id="mlist" hidden></div>' +
      '<label class="sr" for="cp-in">Write to ' + esc(nm) + '</label><textarea id="cp-in" rows="1" placeholder="Write to ' + esc(dm ? c.name.split(' ')[0] : nm) + '"></textarea>' +
      '<div class="cp-bar"><div class="cp-tools">' +
      '<button type="button" data-act="toast" data-msg="Quick actions come with the composer page." aria-label="More" title="More">' + icon('plus', 18) + '</button>' +
      '<button type="button" id="t-at" aria-label="Mention someone" title="Mention someone">@</button>' +
      '<button type="button" id="t-emoji" data-pop aria-label="Emoji" title="Emoji">☺</button>' +
      '<button type="button" id="t-task" data-pop aria-label="Attach a task" title="Attach a task">' + icon('task', 18) + '</button>' +
      '<button type="button" data-act="toast" data-msg="Files are shared as Drive / Dropbox links (see the CdC)." aria-label="Attach a file link" title="Attach a file link">' + icon('link', 18) + '</button>' +
      '<button type="button" class="ai" data-act="toast" data-msg="AI writing help is part of the IA features (preview)." aria-label="Improve with AI" title="Improve with AI">' + icon('sparkle', 18) + '</button></div>' +
      '<button class="btn btn--dark" type="submit" id="cp-send" disabled>Send</button></div></form></div>' +
      '<aside class="details" id="details" aria-label="Details" ' + (chat.details ? '' : 'hidden') + '></aside></div><aside class="thread" id="thread" aria-label="Thread" hidden></aside>';
    drawMsgs(c); drawDetails(c);
    var inp = $('#cp-in'), send = $('#cp-send');
    function sync() { send.disabled = !inp.value.trim(); inp.style.height = 'auto'; inp.style.height = Math.min(inp.scrollHeight, 140) + 'px'; mention(); }
    function mention() {
      var m = /(^|\s)@([A-Za-z]*)$/.exec(inp.value.slice(0, inp.selectionStart)), ml = $('#mlist');
      if (!m) { ml.hidden = true; return; }
      var res = c.members.filter(function (id) { return id !== DATA.me && M(id).name.toLowerCase().indexOf(m[2].toLowerCase()) === 0; });
      if (!res.length) { ml.hidden = true; return; }
      ml.innerHTML = res.map(function (id) { return '<button type="button" data-mn="' + M(id).name.split(' ')[0] + '">' + avatar(id, 22) + esc(M(id).name) + '<small>' + esc(M(id).role) + '</small></button>'; }).join(''); ml.hidden = false;
    }
    $('#mlist').addEventListener('mousedown', function (e) {
      var b = e.target.closest('[data-mn]'); if (!b) return; e.preventDefault();
      var pos = inp.selectionStart, before = inp.value.slice(0, pos).replace(/@[A-Za-z]*$/, '@' + b.getAttribute('data-mn') + ' ');
      inp.value = before + inp.value.slice(pos); inp.focus(); inp.setSelectionRange(before.length, before.length); sync();
    });
    inp.addEventListener('input', sync);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (inp.value.trim()) $('#composer').requestSubmit(); } });
    function drawDraftTask() {
      var t = chat.draftTask && taskById(chat.draftTask), el = $('#cp-task');
      el.hidden = !t; if (t) el.innerHTML = icon('task', 16) + '<b>' + esc(t.title) + '</b><button type="button" aria-label="Remove task">' + icon('close', 14) + '</button>';
      var rm = $('button', el); if (rm) rm.addEventListener('click', function () { chat.draftTask = ''; drawDraftTask(); });
    }
    drawDraftTask();
    $('#composer').addEventListener('submit', function (e) {
      e.preventDefault(); var v = inp.value.trim(); if (!v) return;
      var m = { id: 'u' + Date.now(), who: DATA.me, ts: Date.now(), text: v }; if (chat.draftTask) m.task = chat.draftTask;
      (cs.added[c.id] = cs.added[c.id] || []).push(m); saveChat(); chat.draftTask = ''; inp.value = ''; sync(); drawDraftTask(); drawMsgs(c); drawDetails(c); inp.focus(); renderSidebar();
    });
    $('#t-at').addEventListener('click', function () { inp.focus(); var pos = inp.selectionStart; inp.value = inp.value.slice(0, pos) + '@' + inp.value.slice(pos); inp.setSelectionRange(pos + 1, pos + 1); sync(); });
    $('#t-emoji').addEventListener('click', function (e) {
      var pop = openPop(e.currentTarget, '<div class="emoji">' + EMOJI.concat(['😀', '🙏', '🔥']).map(function (x) { return '<button type="button" data-em="' + x + '">' + x + '</button>'; }).join('') + '</div>', { up: true });
      pop.addEventListener('click', function (ev) { var b = ev.target.closest('[data-em]'); if (!b) return; closePop(); inp.focus(); var pos = inp.selectionStart; inp.value = inp.value.slice(0, pos) + b.getAttribute('data-em') + inp.value.slice(pos); sync(); });
    });
    $('#t-task').addEventListener('click', function (e) {
      var list = open(tasksOf(c.p || 'p1')).slice(0, 7);
      var pop = openPop(e.currentTarget, '<div class="cap">Attach a task</div>' + list.map(function (t) { return '<button type="button" data-tk="' + t.id + '">' + icon('task', 16) + esc(t.title) + '</button>'; }).join(''), { up: true });
      pop.addEventListener('click', function (ev) { var b = ev.target.closest('[data-tk]'); if (!b) return; chat.draftTask = b.getAttribute('data-tk'); closePop(); drawDraftTask(); inp.focus(); });
    });
    function openSearch() { var w = $('#ch-search'); w.hidden = false; $('#cq').focus(); }
    $('#b-search').addEventListener('click', function () {
      var w = $('#ch-search'); w.hidden = !w.hidden; if (!w.hidden) $('#cq').focus(); else { chat.q = ''; drawMsgs(c); }
    });
    $('#cq').addEventListener('input', function (e) { chat.q = e.target.value; drawMsgs(c, false); });
    if (chat.q) $('#ch-search').hidden = false;
    $('#b-mute').addEventListener('click', function (e) { chat.muted = !chat.muted; e.currentTarget.setAttribute('aria-pressed', chat.muted); e.currentTarget.classList.toggle('on', chat.muted); toast(chat.muted ? 'Notifications muted for this conversation.' : 'Notifications are back on.'); });
    function setDetails(on) { chat.details = on; $('#details').hidden = !on; $('#b-info').classList.toggle('on', on); $('#b-info').setAttribute('aria-pressed', on); if (on) closeThread(); }
    $('#b-info').addEventListener('click', function () { setDetails(!chat.details); });
    $('#b-files').addEventListener('click', function () { setDetails(true); var f = $('#dt-files'); if (f) f.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
    function drawDetails(cc) { var d = $('#details'); d.innerHTML = detailsHTML(cc || c); var x = $('#dt-close', d), s = $('#dt-search', d); if (x) x.addEventListener('click', function () { setDetails(false); $('#b-info').focus(); }); if (s) s.addEventListener('click', openSearch); }
    window.drawDetails = drawDetails;

    /* thread */
    function closeThread() { chat.thread = null; var t = $('#thread'); t.hidden = true; $('.page--chat').classList.remove('has-thread'); }
    function openThread(id, focus) {
      var m = msgsOf(c).filter(function (x) { return x.id === id; })[0]; if (!m) return;
      chat.thread = id; if (chat.details && innerWidth < 1500) setDetails(false);
      var t = $('#thread'); t.hidden = false; $('.page--chat').classList.add('has-thread');
      t.innerHTML = threadHTML(c, m);
      $('#th-close').addEventListener('click', function () { closeThread(); });
      $$('[data-tt]', t).forEach(function (b) { b.addEventListener('click', function () { chat.tab = b.getAttribute('data-tt'); openThread(id); }); });
      $$('[data-th]', t).forEach(function (b) { b.addEventListener('click', function () { chat.tab = 'thread'; openThread(b.getAttribute('data-th')); }); });
      $$('[data-rx]', t).forEach(function (b) { b.addEventListener('click', function () { var i = b.getAttribute('data-rx'), em = b.getAttribute('data-e'); cs.react[i] = cs.react[i] || {}; cs.react[i][em] = !cs.react[i][em]; saveChat(); openThread(id); }); });
      var inp2 = $('#th-input', t), send2 = $('#th-send', t);
      if (inp2) {
        inp2.addEventListener('input', function () { send2.disabled = !inp2.value.trim(); });
        $('#th-at', t).addEventListener('click', function () { inp2.value += '@'; inp2.focus(); });
        $('#th-em', t).addEventListener('click', function (e) {
          var pop = openPop(e.currentTarget, '<div class="emoji">' + EMOJI.map(function (x) { return '<button type="button" data-em="' + x + '">' + x + '</button>'; }).join('') + '</div>', { up: true });
          pop.addEventListener('click', function (ev) { var b = ev.target.closest('[data-em]'); if (!b) return; closePop(); inp2.value += b.getAttribute('data-em'); inp2.focus(); send2.disabled = false; });
        });
        $('#th-form', t).addEventListener('submit', function (e) {
          e.preventDefault(); var v = inp2.value.trim(); if (!v) return;
          (cs.threads[id] = cs.threads[id] || []).push({ id: 'r' + Date.now(), who: DATA.me, ts: Date.now(), text: v }); saveChat(); openThread(id); drawMsgs(c, false); $('#th-input').focus();
        });
        if (focus !== false) inp2.focus();
        var body = $('.th-body', t); body.scrollTop = body.scrollHeight;
      }
    }
    $('#thread').addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeThread(); } });
    var list = $('#cm-list');
    list.addEventListener('click', function (e) {
      var rx = e.target.closest('[data-rx]'), add = e.target.closest('[data-rxadd]'), mk = e.target.closest('[data-mk]'), th = e.target.closest('[data-th]');
      if (th) { chat.tab = 'thread'; openThread(th.getAttribute('data-th')); }
      else if (rx) { var id = rx.getAttribute('data-rx'), em = rx.getAttribute('data-e'); cs.react[id] = cs.react[id] || {}; cs.react[id][em] = !cs.react[id][em]; saveChat(); drawMsgs(c, false); }
      else if (add) {
        var mid = add.getAttribute('data-rxadd');
        var pop = openPop(add, '<div class="emoji">' + EMOJI.map(function (x) { return '<button type="button" data-em="' + x + '">' + x + '</button>'; }).join('') + '</div>');
        pop.addEventListener('click', function (ev) { var b = ev.target.closest('[data-em]'); if (!b) return; cs.react[mid] = cs.react[mid] || {}; cs.react[mid][b.getAttribute('data-em')] = true; saveChat(); closePop(); drawMsgs(c, false); });
      } else if (mk) {
        var msg = msgsOf(c).filter(function (x) { return x.id === mk.getAttribute('data-mk'); })[0];
        var title = msg.text.replace(/@[A-Za-z]+\s?/g, '').replace(/\s+/g, ' ').trim().slice(0, 70) || 'Follow up on a message';
        var t = { id: 'n' + Date.now(), p: c.p || 'p1', title: title, status: 'todo', priority: 'Medium', label: 'Design', who: DATA.me, due: 3, upd: 0, comments: 0, files: 0 };
        tasks.push(t); save(); cs.taskOf[msg.id] = t.id; saveChat(); drawMsgs(c, false); drawDetails(c); renderSidebar(); toast('Task created from this message.');
      }
    });
    if (location.hash === '#compose') inp.focus();
    if (qs.get('thread')) openThread(qs.get('thread'), false);
  }

  /* ---------- 7c. Chat overlays: new channel, follow-ups, notifications ---------- */
  function slug(v) { return v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-{2,}/g, '-').slice(0, 40); }
  function newChannelModal() {
    var proj = P('p1') || { name: 'this project', members: [] }, people = {};
    var m = modalShell('m-chan', 'Create a channel', 'Channels keep a project conversation in one place.',
      '<form novalidate><div class="fld"><label for="nc-name">Channel name</label><div class="nc-name"><span class="hash-tile">#</span><input id="nc-name" maxlength="40" placeholder="e.g. design-review" autocomplete="off"></div><span class="msg-e" role="alert"></span></div>' +
      '<div class="fld"><label for="nc-desc">Description</label><input id="nc-desc" maxlength="120" placeholder="What is this channel about?" autocomplete="off"></div>' +
      '<div class="fld"><label id="nc-vis-l">Visibility</label><div class="nc-vis" role="radiogroup" aria-labelledby="nc-vis-l">' +
      '<label class="is-on"><input type="radio" name="nc-vis" value="private" checked><span class="nc-ic">' + icon('security', 16) + '</span><span><b>Private to ' + esc(proj.name) + '</b><small>Only project members can find it</small></span></label>' +
      '<label><input type="radio" name="nc-vis" value="public"><span class="nc-ic">' + icon('language', 16) + '</span><span><b>Public</b><small>Everyone in the workspace can join</small></span></label></div></div>' +
      '<div class="fld nc-people"><label for="nc-find">People</label><div class="nc-find"><input id="nc-find" placeholder="Add people by name" autocomplete="off"><div class="nc-sug" id="nc-sug" hidden></div></div><div id="nc-list"></div>' +
      '<button type="button" class="nc-more" id="nc-all">' + icon('plus', 14) + ' Add everyone from ' + esc(proj.name) + '</button></div>' +
      '<details class="nc-adv"><summary>' + icon('down', 14) + ' Advanced</summary><label class="nc-chk"><input type="checkbox" id="nc-ro"> Read-only for members (only admins can post)</label><label class="nc-chk"><input type="checkbox" id="nc-pin"> Pin to the top of the sidebar</label></details>' +
      '<div class="foot nc-foot"><button type="button" class="btn btn--line" data-act="close">Cancel</button><span class="sp"></span><button type="button" class="nc-skip" id="nc-skip">Skip for now</button><button type="submit" class="btn btn--dark">Create channel</button></div></form>');
    m.classList.add('modal--lg');
    var name = $('#nc-name', m), find = $('#nc-find', m), sug = $('#nc-sug', m), list = $('#nc-list', m);
    function drawPeople() {
      var ids = Object.keys(people);
      list.innerHTML = ids.map(function (i) {
        return '<div class="nc-p">' + avatar(i, 30) + '<span class="nm">' + esc(M(i).name) + '</span><select data-r="' + i + '" aria-label="Role of ' + esc(M(i).name) + '"><option' + (people[i] === 'Member' ? ' selected' : '') + '>Member</option><option' + (people[i] === 'Admin' ? ' selected' : '') + '>Admin</option></select><button type="button" class="mini ghost" data-rm="' + i + '" aria-label="Remove ' + esc(M(i).name) + '">' + icon('close', 14) + '</button></div>';
      }).join('');
    }
    function drawSug() {
      var v = find.value.trim().toLowerCase();
      var c = DATA.members.filter(function (x) { return x.id !== DATA.me && !people[x.id] && (!v || x.name.toLowerCase().indexOf(v) > -1); });
      sug.hidden = !c.length || document.activeElement !== find;
      sug.innerHTML = c.slice(0, 5).map(function (x) { return '<button type="button" data-add="' + x.id + '">' + avatar(x.id, 24) + '<span>' + esc(x.name) + '</span><small>' + esc(x.role) + '</small></button>'; }).join('');
    }
    find.addEventListener('focus', drawSug); find.addEventListener('input', drawSug);
    sug.addEventListener('mousedown', function (e) { e.preventDefault(); });
    sug.addEventListener('click', function (e) { var b = e.target.closest('[data-add]'); if (!b) return; people[b.getAttribute('data-add')] = 'Member'; find.value = ''; drawPeople(); sug.hidden = true; find.focus(); });
    find.addEventListener('blur', function () { sug.hidden = true; });
    list.addEventListener('click', function (e) { var b = e.target.closest('[data-rm]'); if (b) { delete people[b.getAttribute('data-rm')]; drawPeople(); } });
    list.addEventListener('change', function (e) { var r = e.target.getAttribute('data-r'); if (r) people[r] = e.target.value; });
    $('#nc-all', m).addEventListener('click', function () { (proj.members || []).forEach(function (i) { if (i !== DATA.me && !people[i]) people[i] = 'Member'; }); drawPeople(); });
    $$('input[name=nc-vis]', m).forEach(function (r) { r.addEventListener('change', function () { $$('.nc-vis label', m).forEach(function (l) { l.classList.toggle('is-on', l.querySelector('input').checked); }); }); });
    name.addEventListener('input', function () { var p = name.selectionStart, v = slug(name.value); if (v !== name.value) name.value = v; fieldErr(name, ''); });
    function check() {
      var v = name.value.replace(/^-+|-+$/g, '');
      if (!v) { fieldErr(name, 'Give the channel a name, for example design-review.'); return null; }
      if (DATA.channels.some(function (c) { return c.name === v; })) { fieldErr(name, 'A channel named #' + v + ' already exists. Try another name.'); return null; }
      fieldErr(name, ''); return v;
    }
    name.addEventListener('blur', function () { if (name.value) check(); });
    function create(skip) {
      var v = check(); if (!v) { name.focus(); return; }
      var priv = $('input[name=nc-vis]:checked', m).value === 'private', mem = [DATA.me].concat(skip ? [] : Object.keys(people));
      if (!priv) mem = DATA.members.map(function (x) { return x.id; });
      var desc = $('#nc-desc', m).value.trim() || 'Conversation about ' + v.replace(/-/g, ' ') + '.';
      var ch = { id: v, name: v, p: 'p1', pinned: $('#nc-pin', m).checked, unread: 0, desc: desc, members: mem, vis: priv ? 'private' : 'public', readonly: $('#nc-ro', m).checked, custom: true };
      cs.chans.push(ch); DATA.channels.push(ch);
      (cs.added[v] = cs.added[v] || []).push({ id: 'w' + Date.now(), who: DATA.me, ts: Date.now(), text: 'Created this channel. ' + desc });
      cs.read[v] = 1; saveChat(); closeOverlay(); toast('#' + v + ' created.');
      setTimeout(function () { location.href = 'channel.html?c=' + encodeURIComponent(v); }, 350);
    }
    $('form', m).addEventListener('submit', function (e) { e.preventDefault(); create(false); });
    $('#nc-skip', m).addEventListener('click', function () { create(true); });
    drawPeople(); openOverlay(m, '#nc-name');
  }

  /* Follow-ups */
  var fuTab = 'open';
  function fuAll() {
    return DATA.followups.concat(cs.fu.extra).map(function (f) { var o = {}; for (var k in f) o[k] = f[k]; o.ts = f.ts || (NOW - f.ago * 60000); return o; }).sort(function (a, b) { return b.ts - a.ts; });
  }
  function fuState(f) { return cs.fu.st[f.id] || f.state || 'open'; }
  function fuOpen() { return fuAll().filter(function (f) { return fuState(f) === 'open'; }).length; }
  function fuTitle(t) { return t.replace(/@[A-Za-z]+\s?/g, '').replace(/\s+/g, ' ').replace(/\?$/, '').trim().slice(0, 70) || 'Follow up'; }
  function fuMake(f, extra) {
    var t = { id: 'n' + Date.now(), p: (chanById(f.c) || {}).p || 'p1', title: extra || fuTitle(f.text), status: 'todo', priority: 'Medium', label: 'Design', who: DATA.me, due: 3, upd: 0, comments: 0, files: 0 };
    tasks.push(t); save(); return t;
  }
  function followupsModal() {
    var m = modalShell('m-fu', 'Follow-ups', 'Turn assigned messages into tasks',
      '<button class="icon-btn fu-x" type="button" data-act="close" aria-label="Close">' + icon('close') + '</button><div class="fu-tabs" role="tablist" id="fu-tabs"></div><div id="fu-body"></div>');
    m.classList.add('modal--fu');
    function done(f, st, msg) { cs.fu.st[f.id] = st; saveChat(); draw(); renderSidebar(); if (msg) toast(msg); }
    function card(f) {
      var st = fuState(f), when = dayLabel(f.ts) === 'Today' ? clock(f.ts) : clock(f.ts), ch = chanById(f.c) || { name: f.c }, tid = cs.fu.task[f.id], tk = tid && taskById(tid);
      var where = f.c.indexOf('dm-') === 0 ? 'Direct message' : esc((P(ch.p) || {}).name || 'Website Redesign') + ' · <a href="channel.html?c=' + esc(f.c) + '">#' + esc(ch.name) + '</a>';
      if (f.kind === 'file') {
        return '<div class="fu-file"><span class="fu-fi">' + icon('file', 20) + '</span><b>' + esc(f.text) + '</b><small>shared by ' + esc(M(f.who).name.split(' ')[0]) + '</small>' +
          (st === 'open' ? '<button class="btn btn--line btn--sm" type="button" data-fu="attach" data-id="' + f.id + '">Attach to task</button>' : (tk ? '<span class="fu-chip b-green">Attached to ' + esc(tk.title) + '</span>' : '<span class="fu-chip b-grey">Done</span>')) + '</div>';
      }
      var acts = '';
      if (st === 'open') acts = '<button class="fu-ok" type="button" data-fu="done" data-id="' + f.id + '" aria-label="Mark as done" title="Mark as done">' + icon('check', 16) + '</button>' +
        '<button class="btn btn--line btn--sm" type="button" data-fu="convert" data-id="' + f.id + '">Convert to task</button>' +
        '<button class="btn btn--line btn--sm" type="button" data-fu="attach" data-id="' + f.id + '">Attach to task</button>' +
        '<button class="btn btn--purple btn--sm" type="button" data-fu="new" data-id="' + f.id + '">New task</button>';
      else if (st === 'triaged') acts = '<button class="btn btn--line btn--sm" type="button" data-fu="reopen" data-id="' + f.id + '">Move to open</button><button class="fu-ok" type="button" data-fu="done" data-id="' + f.id + '" aria-label="Mark as done" title="Mark as done">' + icon('check', 16) + '</button>';
      else acts = (tk ? '<span class="fu-chip b-green">Task: ' + esc(tk.title) + '</span>' : '<span class="fu-chip b-grey">Done</span>') + '<button class="btn btn--line btn--sm" type="button" data-fu="reopen" data-id="' + f.id + '">Reopen</button>';
      return '<article class="fu-card">' + avatar(f.who, 40) + '<div class="fu-c"><div class="fu-top"><b>' + esc(M(f.who).name) + '</b><time>' + when + '</time></div><p>' + fmt(f.text) + '</p>' +
        '<div class="fu-meta"><span class="fu-where">' + where + '</span><span class="fu-for">For ' + esc(M(DATA.me).name) + '</span></div><div class="fu-acts">' + acts + (st === 'open' ? '<button class="fu-later" type="button" data-fu="triage" data-id="' + f.id + '">Triage for later</button>' : '') + '</div></div></article>';
    }
    function draw() {
      var all = fuAll(), by = { open: [], triaged: [], done: [] };
      all.forEach(function (f) { by[fuState(f)].push(f); });
      $('#fu-tabs', m).innerHTML = [['open', 'Open'], ['triaged', 'Triaged'], ['done', 'Done']].map(function (t) {
        return '<button type="button" role="tab" aria-selected="' + (fuTab === t[0]) + '" class="' + (fuTab === t[0] ? 'is-on' : '') + '" data-tab="' + t[0] + '">' + t[1] + (t[0] === 'open' ? ' (' + by.open.length + ')' : '') + '</button>';
      }).join('');
      var items = by[fuTab], out = '', day = '';
      if (!items.length) out = '<p class="empty">' + (fuTab === 'open' ? 'Nothing to follow up. You are all caught up.' : fuTab === 'triaged' ? 'Nothing triaged for later.' : 'Nothing done yet.') + '</p>';
      items.forEach(function (f) { var d = dayLabel(f.ts); if (d !== day) { day = d; out += '<h3 class="fu-day">' + d + '</h3>'; } out += card(f); });
      out += '<div class="fu-ai"><span class="fu-aic">' + icon('sparkle', 20) + '</span><b>Let ProTask AI suggest follow-ups</b><button class="btn btn--dark" type="button" data-fu="suggest">Suggest follow-ups</button></div>';
      $('#fu-body', m).innerHTML = out;
    }
    m.addEventListener('click', function (e) {
      var tb = e.target.closest('[data-tab]'); if (tb) { fuTab = tb.getAttribute('data-tab'); draw(); return; }
      var b = e.target.closest('[data-fu]'); if (!b) return;
      var a = b.getAttribute('data-fu'), f = fuAll().filter(function (x) { return x.id === b.getAttribute('data-id'); })[0];
      if (a === 'done') done(f, 'done', 'Marked as done.');
      else if (a === 'triage') done(f, 'triaged', 'Moved to Triaged.');
      else if (a === 'reopen') done(f, 'open', 'Moved back to Open.');
      else if (a === 'convert') { var t = fuMake(f); cs.fu.task[f.id] = t.id; done(f, 'done', 'Task created: ' + t.title); }
      else if (a === 'new') { closeOverlay(); newTaskModal({ title: fuTitle(f.text), p: (chanById(f.c) || {}).p, after: function (t) { cs.fu.task[f.id] = t.id; cs.fu.st[f.id] = 'done'; saveChat(); renderSidebar(); } }); }
      else if (a === 'attach') {
        var mine = tasks.filter(function (t) { return t.status !== 'done'; }).slice(0, 6);
        var pop = openPop(b, '<div class="cap">Attach to which task?</div>' + mine.map(function (t) { return '<button type="button" data-tk="' + t.id + '">' + esc(t.title) + '</button>'; }).join(''));
        pop.addEventListener('click', function (ev) { var k = ev.target.closest('[data-tk]'); if (!k) return; cs.fu.task[f.id] = k.getAttribute('data-tk'); closePop(); done(f, 'done', 'Attached to “' + taskById(k.getAttribute('data-tk')).title + '”.'); });
      } else if (a === 'suggest') {
        var known = fuAll().map(function (x) { return x.mid; }), seen = fuAll().map(function (x) { return x.who + x.text; }), found = [];
        DATA.channels.map(function (c) { return c; }).concat(DATA.members.filter(function (x) { return x.id !== DATA.me; }).map(function (x) { return chanById('dm-' + x.id); })).forEach(function (c) {
          msgsOf(c).forEach(function (x) {
            if (x.who === DATA.me || known.indexOf(x.id) > -1 || Date.now() - x.ts > 3 * 864e5) return;
            if ((x.text.indexOf('?') > -1 || /@Ala/i.test(x.text)) && seen.indexOf(x.who + x.text) < 0) { known.push(x.id); seen.push(x.who + x.text); found.push({ id: 'fx' + x.id, mid: x.id, who: x.who, ts: x.ts, c: c.id, kind: 'mention', text: x.text }); }
          });
        });
        cs.fu.extra = cs.fu.extra.concat(found); saveChat(); fuTab = 'open'; draw(); renderSidebar();
        toast(found.length ? found.length + ' new follow-up' + (found.length > 1 ? 's' : '') + ' found from recent messages.' : 'No new follow-ups found. You are up to date.');
      }
    });
    draw(); openOverlay(m, '.fu-x');
  }

  /* Notifications */
  var nTab = 'all';
  function nTs(n) { return NOW - n.ago * 60000; }
  function nUnread(n) { return n.unread && cs.nread.indexOf(n.id) < 0; }
  function notifUnread() { return DATA.chatNotifs.filter(function (n) { return cs.nout.indexOf(n.id) < 0 && nUnread(n); }).length; }
  function nShort(ts) { var m = Math.max(1, Math.round((Date.now() - ts) / 60000)); return m < 60 ? m + 'm' : m < 1440 ? Math.round(m / 60) + 'h' : Math.round(m / 1440) + 'd'; }
  function notifDrawer() {
    var d = document.getElementById('d-notif'); if (d) d.remove();
    d = document.createElement('aside'); d.id = 'd-notif'; d.className = 'drawer drawer--n'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'Notifications');
    var summaryOn = false;
    function link(n) { return n.href ? n.href : n.c ? 'channel.html?c=' + n.c + (n.thread ? '&thread=' + n.thread : '') : ''; }
    function lead(n) {
      if (n.type === 'mention') return '<span class="nf-ic nf-at">@</span>';
      if (n.type === 'task') return '<span class="nf-ic">' + icon('check', 20) + '</span>';
      if (n.type === 'due') return '<span class="nf-ic nf-clock">' + icon('clock', 20) + '</span>';
      if (n.type === 'reply') return avatar(n.who, 34);
      if (n.type === 'file') return '<span class="nf-ic">' + icon('clip', 20) + '</span>';
      if (n.type === 'join') return '<span class="nf-ic">' + icon('userplus', 20) + '</span>';
      return '<span class="nf-ic nf-ai">' + icon('sparkle', 22) + '</span>';
    }
    function sumHTML() {
      var rows = DATA.channels.concat(DATA.members.filter(function (x) { return x.id !== DATA.me; }).map(function (x) { return chanById('dm-' + x.id); })).filter(function (c) { return chanUnread(c) > 0; });
      var tot = rows.reduce(function (a, c) { return a + chanUnread(c); }, 0);
      return '<div class="nf-sum"><b>' + tot + ' unread message' + (tot === 1 ? '' : 's') + '</b>' + (rows.length ? '<ul>' + rows.map(function (c) { return '<li><a href="channel.html?c=' + c.id + '">' + (c.type === 'dm' ? esc(c.name) : '#' + esc(c.name)) + '</a> · ' + chanUnread(c) + ' new</li>'; }).join('') + '</ul>' : '<p>You have read everything. Nice.</p>') + '</div>';
    }
    function draw() {
      var items = DATA.chatNotifs.filter(function (n) { return cs.nout.indexOf(n.id) < 0; }).filter(function (n) { return nTab === 'all' || (nTab === 'mention' && (n.type === 'mention' || n.type === 'reply')) || (nTab === 'task' && (n.type === 'task' || n.type === 'due')); });
      var body = items.length ? items.map(function (n) {
        var inner = '<div class="nf-t"><b>' + esc(n.title) + '</b>' + (n.sub ? '<span>' + esc(n.sub) + '</span>' : '') + '</div>', end = '';
        if (n.type === 'join') end = '<div class="nf-end"><button class="btn btn--dark btn--sm" type="button" data-n="approve" data-id="' + n.id + '">Review</button><button class="nf-link" type="button" data-n="decline" data-id="' + n.id + '">Decline</button></div>';
        else if (n.type === 'ai') end = '<div class="nf-end"><button class="nf-link nf-sm" type="button" data-n="summary">View summary</button><time>' + nShort(nTs(n)) + '</time>' + (nUnread(n) ? '<i class="nf-dot"></i>' : '') + '</div>';
        else end = '<div class="nf-end"><time>' + nShort(nTs(n)) + '</time>' + (nUnread(n) ? '<i class="nf-dot"></i>' : '') + '</div>';
        var h = link(n) && n.type !== 'join' ? '<a class="nf-main" href="' + link(n) + '" data-n="open" data-id="' + n.id + '">' + lead(n) + inner + '</a>' : '<div class="nf-main">' + lead(n) + inner + '</div>';
        return '<div class="nf ' + (nUnread(n) ? 'is-unread' : '') + '">' + h + end + (n.type === 'ai' && summaryOn ? sumHTML() : '') + '</div>';
      }).join('') : '<p class="empty">No notifications here. You are all caught up.</p>';
      d.innerHTML = '<header class="nf-h"><h2>Notifications</h2><button class="icon-btn" type="button" data-act="close" aria-label="Close notifications">' + icon('bell') + '</button></header>' +
        '<div class="nf-tabs"><div role="tablist">' + [['all', 'All'], ['mention', 'Mentions'], ['task', 'Tasks']].map(function (t) { return '<button type="button" role="tab" aria-selected="' + (nTab === t[0]) + '" class="' + (nTab === t[0] ? 'is-on' : '') + '" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div><button class="nf-link" type="button" data-n="readall">Mark all as read</button></div>' +
        '<div class="nf-list">' + body + '</div><footer class="nf-f"><button class="nf-link nf-set" type="button" data-act="toast" data-msg="Notification settings are planned after the chat pages.">Notification settings</button></footer>';
    }
    draw(); root.appendChild(d);
    d.addEventListener('click', function (e) {
      var t = e.target.closest('[data-tab]'); if (t) { nTab = t.getAttribute('data-tab'); draw(); return; }
      var b = e.target.closest('[data-n]'); if (!b) return;
      var a = b.getAttribute('data-n'), id = b.getAttribute('data-id');
      if (a === 'readall') { DATA.chatNotifs.forEach(function (n) { if (cs.nread.indexOf(n.id) < 0) cs.nread.push(n.id); }); saveChat(); draw(); renderSidebar(); }
      else if (a === 'approve') { cs.nout.push(id); saveChat(); draw(); renderSidebar(); toast('Sara Mansour joined Website Redesign (demo).'); }
      else if (a === 'decline') { cs.nout.push(id); saveChat(); draw(); renderSidebar(); toast('Request declined.'); }
      else if (a === 'summary') { summaryOn = !summaryOn; draw(); }
      else if (a === 'open') { if (cs.nread.indexOf(id) < 0) { cs.nread.push(id); saveChat(); } }
    });
    openOverlay(d, '.icon-btn');
  }

  /* ---------- 7d. Planner: agenda, timeline, new event ---------- */
  var KEY_PL = 'protask.planner.v1';
  var ps = { added: [], done: {}, shared: {}, sched: {} };
  try { var _p = JSON.parse(localStorage.getItem(KEY_PL)); if (_p) ps = { added: _p.added || [], done: _p.done || {}, shared: _p.shared || {}, sched: _p.sched || {} }; } catch (e) {}
  function savePl() { try { localStorage.setItem(KEY_PL, JSON.stringify(ps)); } catch (e) {} }
  var pl = { day: 0, view: 'agenda', calM: 0, hide: {} };
  var WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], MONL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var KCOL = { task: '#f5a623', event: '#ec4899', focus: '#2DD4BF' };
  function tmin(h) { var a = h.split(':'); return +a[0] * 60 + +a[1]; }
  function hhmm(m) { return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
  function hrs(m) { var h = Math.round(m / 30) / 2; return h + 'h'; }
  function longDay(off) { var d = dateOf(off); return WD[d.getDay()] + ', ' + d.getDate() + ' ' + MONL[d.getMonth()]; }
  function isoOf(off) { var d = dateOf(off); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function plAll() { return DATA.planner.concat(ps.added); }
  function plItems(off) {
    var wd = dateOf(off).getDay();
    return plAll().filter(function (it) {
      if (it.rep === 'daily') return off >= it.day;
      if (it.rep === 'weekday') return off >= it.day && wd > 0 && wd < 6;
      if (it.rep === 'weekly') return off >= it.day && (off - it.day) % 7 === 0;
      return it.day === off;
    }).map(function (it) {
      var o = {}; for (var k in it) o[k] = it[k]; o.s = tmin(it.start); o.e = o.s + it.dur;
      if (it.kind === 'task') { var t = taskById(it.tid); o.t = t; o.title = t ? t.title : 'Task'; }
      return o;
    }).sort(function (a, b) { return a.s - b.s; });
  }
  function plStats(from, n) {
    var st = { min: 0, focus: 0, meet: 0, n: 0 };
    for (var i = 0; i < n; i++) plItems(from + i).forEach(function (it) { st.min += it.dur; st.n++; if (it.kind === 'focus') st.focus += it.dur; if (it.kind === 'event') st.meet++; });
    return st;
  }
  function weekStart() { var wd = dateOf(0).getDay(); return -((wd + 6) % 7); }
  function plannerPanelHTML() {
    var me = M(DATA.me), st = plStats(weekStart(), 7);
    var shared = DATA.shared.filter(function (x) { return !ps.shared[x.id]; });
    var h = '<div class="pn-head"><h2>My week</h2><button class="mini" type="button" data-act="newevent" aria-label="New event" title="New event">' + icon('plus', 18) + '</button></div><div class="pn-scroll">' +
      '<div class="pn-m"><a class="pn-i" href="dashboard.html">' + icon('home', 18) + '<span class="pn-l">Home</span></a><a class="pn-i is-active" href="planner.html">' + icon('calendar', 18) + '<span class="pn-l">Planner</span></a><a class="pn-i" href="board.html?p=all&mine=1">' + icon('tasks', 18) + '<span class="pn-l">My tasks</span></a></div>' +
      '<div class="pl-me">' + avatar(me.id, 46) + '<div><b>' + esc(me.name) + '</b><small>' + esc(me.role) + '</small></div></div>' +
      '<div class="pl-stats"><div><b>' + hrs(st.min) + '</b><small>Scheduled</small></div><div><b>' + hrs(st.focus) + '</b><small>Focus</small></div><div><b>' + st.meet + '</b><small>Events</small></div></div>' +
      '<div class="pl-leg"><span><i style="background:' + KCOL.task + '"></i>Task</span><span><i style="background:' + KCOL.event + '"></i>Event</span><span><i style="background:' + KCOL.focus + '"></i>Focus time</span></div>' +
      '<div class="pn-h"><span>Projects</span></div>';
    DATA.projects.slice(0, 3).forEach(function (p) { h += '<a class="pn-i" href="project.html?p=' + p.id + '"><i class="pn-dot" style="background:' + p.color + '"></i><span class="pn-l">' + esc(p.name) + '</span><small>' + open(tasksOf(p.id)).length + '</small></a>'; });
    h += '<div class="pn-h"><span>Shared with me</span></div>';
    if (!shared.length) h += '<p class="pl-none">Nothing waiting for you.</p>';
    shared.forEach(function (x) {
      h += '<div class="pl-sh"><div class="pl-sh-t">' + avatar(x.who, 24) + '<span><b>' + esc(x.title) + '</b><small>' + esc(M(x.who).name) + ' · ' + esc(x.project) + '</small></span></div><div class="pl-sh-a"><button class="btn btn--dark btn--sm" type="button" data-sh="accept" data-id="' + x.id + '">Accept</button><button class="btn btn--line btn--sm" type="button" data-sh="decline" data-id="' + x.id + '">Decline</button></div></div>';
    });
    return h + '</div>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-sh]'); if (!b) return;
    var x = DATA.shared.filter(function (i) { return i.id === b.getAttribute('data-id'); })[0], acc = b.getAttribute('data-sh') === 'accept';
    ps.shared[x.id] = acc ? 'accepted' : 'declined';
    if (acc) { tasks.push({ id: 'n' + Date.now(), p: 'p1', title: x.title, status: 'todo', priority: 'Medium', label: 'Design', who: DATA.me, due: 4, upd: 0, comments: 0, files: 0 }); save(); }
    savePl(); renderSidebar(); toast(acc ? 'Added to your tasks: ' + x.title : 'Request declined.');
  });

  function freeGap(from) {
    for (var i = 0; i < 7; i++) {
      var off = from + i, busy = plItems(off), cur = 540, end = 1080;
      if (off === 0) { var n = new Date(); cur = Math.max(cur, Math.ceil((n.getHours() * 60 + n.getMinutes()) / 30) * 30); }
      for (var j = 0; j < busy.length; j++) {
        if (busy[j].s - cur >= 60) return { off: off, s: cur, dur: busy[j].s - cur };
        cur = Math.max(cur, busy[j].e);
      }
      if (end - cur >= 60) return { off: off, s: cur, dur: end - cur };
    }
    return null;
  }
  function dayWord(off) { return off === 0 ? 'today' : off === 1 ? 'tomorrow' : WD[dateOf(off).getDay()]; }
  function plCard(it) {
    var col = KCOL[it.kind], time = hhmm(it.s) + ' – ' + hhmm(it.e), done = ps.done[it.id];
    if (it.kind === 'focus') {
      var pct = pl.day < 0 ? 100 : pl.day > 0 ? 0 : Math.max(0, Math.min(100, Math.round(((new Date().getHours() * 60 + new Date().getMinutes()) - it.s) / it.dur * 100)));
      return '<article class="pl-card pl-focus" style="--k:' + col + '"><div class="pl-ct"><span class="pl-sp">' + icon('sparkle', 20) + '</span><b>' + esc(it.title) + '</b><span class="pl-pct">' + pct + '%</span></div><p><span class="pl-ok">' + icon('check', 14) + '</span>Protected block · no meetings</p><time>' + time + '</time></article>';
    }
    if (it.kind === 'task') {
      var t = it.t || {}, st = t.status || 'todo', stn = { todo: 'To do', progress: 'In progress', review: 'In review', done: 'Done' }[st], bc = { todo: 'b-grey', progress: 'b-purple', review: 'b-amber', done: 'b-green' }[st];
      var due = st === 'done' ? '' : t.due === 0 ? '<span class="badge b-orange">Due today</span>' : t.due < 0 ? '<span class="badge b-red">Overdue</span>' : t.due <= 3 ? '<span class="badge b-grey">Due in ' + t.due + 'd</span>' : '';
      var pct2 = { todo: 0, progress: 50, review: 80, done: 100 }[st], isDone = st === 'done';
      return '<article class="pl-card pl-task ' + (isDone ? 'is-done' : '') + '" style="--k:' + col + '"><div class="pl-ct"><button class="pl-chk ' + (isDone ? 'on' : '') + '" type="button" data-pl="toggle" data-id="' + it.id + '" aria-label="' + (isDone ? 'Reopen' : 'Complete') + ' ' + esc(it.title) + '">' + icon('check', 14) + '</button><a class="pl-tt" href="board.html?p=' + (t.p || 'p1') + '">' + esc(it.title) + '</a><span class="badge ' + bc + '">' + stn + '</span>' + due + '</div>' +
        '<div class="pl-bar"><i style="width:' + pct2 + '%"></i></div><p>' + esc((P(t.p) || {}).name || '') + ' · <time>' + time + '</time></p></article>';
    }
    return '<article class="pl-card pl-ev" style="--k:' + col + '"><div class="pl-ct"><b>' + esc(it.title) + '</b><span class="pl-tag">' + esc(it.tag || 'Event') + '</span></div>' +
      '<div class="pl-row">' + (it.who && it.who.length ? stack(it.who, 4, 26) : '') + '<span class="pl-meta"><time>' + time + '</time>' + (it.video ? ' · Video call' : '') + (it.rep ? ' · Repeats' : '') + '</span></div></article>';
  }
  function agendaHTML2(list) {
    if (!list.length) return '<div class="pl-empty"><b>Nothing planned for this day</b><p>Add a task, an event or a focus block to protect your time.</p><button class="btn btn--dark" type="button" data-act="newevent" data-kind="task">' + icon('plus', 16) + 'Add task</button></div>';
    return '<div class="pl-ag">' + list.map(function (it) { return '<div class="pl-r"><time class="pl-t">' + hhmm(it.s) + '</time><span class="pl-dot" style="background:' + KCOL[it.kind] + '"></span>' + plCard(it) + '</div>'; }).join('') + '</div>';
  }
  function timelineHTML(list) {
    var H0 = 8, H1 = 19, PX = 60, h = '';
    for (var i = H0; i < H1; i++) h += '<div class="pl-hr" style="top:' + (i - H0) * PX + 'px"><span>' + String(i).padStart(2, '0') + ':00</span></div>';
    var cols = [], out = [];
    list.forEach(function (it) {
      var c = 0; while (cols[c] && cols[c] > it.s) c++; cols[c] = it.e; it.col = c;
    });
    list.forEach(function (it) {
      var n = 1; list.forEach(function (o) { if (o !== it && o.s < it.e && o.e > it.s) n = Math.max(n, o.col + 1, it.col + 1); });
      var top = (it.s - H0 * 60) / 60 * PX, ht = Math.max(26, it.dur / 60 * PX - 3);
      out.push('<div class="pl-blk pl-b-' + it.kind + (ht < 44 ? ' pl-short' : '') + '" style="top:' + top + 'px;height:' + ht + 'px;left:calc(' + (it.col / n * 100) + '% + 2px);width:calc(' + (100 / n) + '% - 4px);--k:' + KCOL[it.kind] + '"><b>' + esc(it.title) + '</b><small>' + hhmm(it.s) + ' – ' + hhmm(it.e) + '</small></div>');
    });
    var now = '';
    if (pl.day === 0) { var nm = new Date().getHours() * 60 + new Date().getMinutes(); if (nm >= H0 * 60 && nm <= H1 * 60) now = '<div class="pl-now" style="top:' + (nm - H0 * 60) / 60 * PX + 'px"></div>'; }
    return '<div class="pl-tl" style="height:' + (H1 - H0) * PX + 'px"><div class="pl-grid">' + h + '</div><div class="pl-lane">' + out.join('') + now + '</div></div>';
  }

  /* Agenda = team schedule (workload heatmap + project bars) */
  var GCOL = 46, GN = 14, PRI_H = { High: 3, Medium: 2, Low: 1 }, SDOT = { todo: '#98a2b3', progress: '#6647f0', review: '#d98a00', done: '#078d3b' };
  function working(off) { var w = dateOf(off).getDay(); return w !== 0 && w !== 6; }
  function monOf(off) { return off - ((dateOf(off).getDay() + 6) % 7); }
  function offOfDate(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return Math.round((x - dateOf(0)) / 864e5); }
  function loadMap(from) {
    var cache = {}, evs = {};
    for (var i = 0; i < GN; i++) evs[from + i] = plItems(from + i);
    DATA.members.forEach(function (m) {
      var arr = [];
      for (var i = 0; i < GN; i++) {
        var off = from + i, h = 0;
        if (working(off)) {
          tasks.forEach(function (t) {
            if (t.who !== m.id || t.status === 'done') return;
            var ph = PRI_H[t.priority] || 2;
            if (t.due < 0 ? off === 0 : (off >= Math.max(0, t.due - 3) && off <= t.due)) h += ph;
          });
        }
        evs[off].forEach(function (it) { if (it.kind === 'event' && it.who && it.who.indexOf(m.id) > -1) h += it.dur / 60; if (it.kind === 'focus' && m.id === DATA.me) h += it.dur / 60; });
        arr.push(Math.round(h * 2) / 2);
      }
      cache[m.id] = arr;
    });
    return { by: cache, evs: evs };
  }
  function miniCal() {
    var base = dateOf(pl.day); base = new Date(base.getFullYear(), base.getMonth() + pl.calM, 1);
    var first = (base.getDay() + 6) % 7, days = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate(), h = '', off0 = offOfDate(base), weekend = 0;
    var cells = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(function (d) { return '<span class="mc-w">' + d + '</span>'; }).join('');
    for (var i = 0; i < first; i++) cells += '<span></span>';
    for (var d = 1; d <= days; d++) {
      var off = off0 + d - 1, we = !working(off); if (we) weekend++;
      var cls = 'mc-d' + (off === 0 ? ' is-today' : '') + (off === pl.day ? ' is-sel' : '') + (we ? ' is-off' : '');
      cells += '<button type="button" class="' + cls + '" data-cal="' + off + '" aria-label="' + longDay(off) + '">' + d + '</button>';
    }
    return '<div class="mc"><div class="mc-h"><b>' + MONL[base.getMonth()] + ' ' + base.getFullYear() + '</b><span><button type="button" data-calnav="-1" aria-label="Previous month">' + icon('right', 16).replace('class="ic"', 'class="ic flip"') + '</button><button type="button" data-calnav="1" aria-label="Next month">' + icon('right', 16) + '</button></span></div><div class="mc-g">' + cells + '</div></div>' +
      '<div class="mc-off"><i></i>Non working days <b>' + weekend + '</b></div>';
  }
  function agendaGantt() {
    var from = monOf(pl.day), lm = loadMap(from), todayIdx = 0 - from, rangeEnd = from + GN - 1;
    var weTpl = '';
    for (var i = 0; i < GN; i++) if (!working(from + i)) weTpl += '<i class="gt-we" style="left:' + i * GCOL + 'px"></i>';
    var track = function (inner, cls) { return '<div class="gt-t ' + (cls || '') + '">' + weTpl + inner + '</div>'; };
    var row = function (label, inner, cls) { return '<div class="gt-r ' + (cls || '') + '"><div class="gt-l">' + label + '</div>' + track(inner) + '</div>'; };
    var head = '', mon = '';
    for (i = 0; i < GN; i++) {
      var off = from + i, d = dateOf(off), isM = i === 0 || d.getDate() === 1;
      mon += isM ? '<span style="left:' + i * GCOL + 'px">' + MONL[d.getMonth()] + '</span>' : '';
      head += '<button type="button" class="gt-dy ' + (off === 0 ? 'is-today' : '') + (!working(off) ? ' is-off' : '') + '" data-open="' + off + '" aria-label="Open ' + longDay(off) + '"><small>' + WD[d.getDay()].slice(0, 2) + '</small><b>' + d.getDate() + '</b></button>';
    }
    var h = '<div class="gt-r gt-hd"><div class="gt-l">' + '</div><div class="gt-t gt-hdt"><div class="gt-mo">' + mon + '</div><div class="gt-days">' + head + '</div></div></div>';
    /* my weekly load */
    var wk = '';
    for (var w = 0; w < GN; w += 7) {
      var tot = 0; for (var j = 0; j < 7; j++) tot += lm.by[DATA.me][w + j];
      var pct = Math.round(tot / 40 * 100);
      wk += '<div class="gt-wk ' + (pct > 100 ? 'is-over' : 'is-ok') + '" style="left:' + w * GCOL + 'px;width:' + (7 * GCOL - 6) + 'px"><span>' + pct + '%</span><span>' + tot + 'h /40h</span></div>';
    }
    h += '<div class="gt-sec">My workload</div>' + row('<span class="gt-me">' + avatar(DATA.me, 22) + 'This week</span>', wk, 'gt-wkrow');
    /* daily pills */
    var pills = function (arr, who) {
      return arr.map(function (v, i) {
        var off = from + i, left = 'left:' + (i * GCOL + 2) + 'px;width:' + (GCOL - 6) + 'px';
        if (!working(off)) return '<span class="gt-p is-off" style="' + left + '"></span>';
        if (v > 8) return '<span class="gt-p is-over" style="' + left + '" title="' + esc(who) + ': ' + v + 'h">+' + (v - 8) + 'h</span>';
        if (v === 0) return '<span class="gt-p is-0" style="' + left + '"></span>';
        return '<span class="gt-p is-ok ' + (v >= 6 ? 'is-hi' : '') + '" style="' + left + '" title="' + esc(who) + ': ' + v + 'h"></span>';
      }).join('');
    };
    h += row('<span class="gt-me">' + avatar(DATA.me, 22) + 'Daily load</span>', pills(lm.by[DATA.me], M(DATA.me).name), 'gt-prow');
    /* events */
    var ev = '';
    for (i = 0; i < GN; i++) {
      var list = lm.evs[from + i].filter(function (x) { return x.kind !== 'task'; });
      if (list.length) ev += '<button type="button" class="gt-ev" data-open="' + (from + i) + '" style="left:' + (i * GCOL + 2) + 'px;width:' + (GCOL - 6) + 'px" title="' + esc(list.map(function (x) { return hhmm(x.s) + ' ' + x.title; }).join('\n')) + '">' + list.length + '</button>';
    }
    h += row('<span class="gt-me">' + icon('calendar', 18) + 'Events & focus</span>', ev, 'gt-prow');
    /* team */
    h += '<div class="gt-sec">Team</div>';
    DATA.members.filter(function (m) { return m.id !== DATA.me; }).forEach(function (m) {
      var tt = lm.by[m.id].reduce(function (a, b) { return a + b; }, 0);
      h += row('<span class="gt-me">' + avatar(m.id, 22) + esc(m.name.split(' ')[0]) + '<small>' + tt + 'h</small></span>', pills(lm.by[m.id], m.name), 'gt-prow');
    });
    /* projects */
    h += '<div class="gt-sec">Projects</div>';
    DATA.projects.forEach(function (p) {
      if (pl.hide[p.id]) return;
      var ts = open(tasksOf(p.id)).filter(function (t) { return t.due <= rangeEnd && t.due >= from - 6; }).sort(function (a, b) { return a.due - b.due; });
      if (!ts.length) return;
      h += '<div class="gt-r gt-ph"><div class="gt-l"><i style="background:' + p.color + '"></i><b>' + esc(p.name) + '</b></div>' + track('') + '</div>';
      ts.forEach(function (t) {
        var e = Math.max(t.due, 0), s = Math.max(e - 3 - (t.priority === 'High' ? 1 : 0), -3), si = Math.max(s - from, 0), ei = Math.min(e - from, GN - 1);
        if (ei < 0) { ei = 0; si = 0; }
        var left = si * GCOL + 2, wd = Math.max(2, ei - si + 1) * GCOL - 4, hh = (PRI_H[t.priority] || 2) * (e - s + 1);
        h += '<div class="gt-r gt-tr"><div class="gt-l"><span class="gt-st" style="--c:' + SDOT[t.status] + '"></span><span class="gt-tn">' + esc(t.title) + '</span></div>' + track('<a class="gt-bar" href="board.html?p=' + p.id + '" style="left:' + left + 'px;width:' + wd + 'px;--pc:' + p.color + '" title="' + esc(t.title) + ' · due ' + dueLabel(t) + '">' + avatar(t.who, 22) + '<span>' + esc(t.title) + '</span><em>' + hh + 'h</em></a>') + '</div>';
      });
    });
    var line = todayIdx >= 0 && todayIdx < GN ? '<div class="gt-today" style="left:calc(var(--lab) + ' + (todayIdx + 0.5) * GCOL + 'px)"></div>' : '';
    return '<div class="gt-scroll"><div class="gt-in" style="--col:' + GCOL + 'px;width:calc(var(--lab) + ' + GN * GCOL + 'px)">' + h + line + '</div></div>';
  }
  function filtersHTML() {
    return '<div class="pn-h pl-fh"><span>Projects</span></div>' + DATA.projects.map(function (p) {
      return '<label class="pl-fl"><input type="checkbox" data-hide="' + p.id + '" ' + (pl.hide[p.id] ? '' : 'checked') + '><i style="background:' + p.color + '"></i>' + esc(p.name) + '</label>';
    }).join('');
  }

  function renderPlanner() {
    pageEl.className = 'page page--plan';
    var tools = '<div class="pl-tools"><div class="seg" role="group" aria-label="View"><button type="button" data-view="agenda" class="' + (pl.view === 'agenda' ? 'is-active' : '') + '">' + icon('list', 16) + 'Agenda</button><button type="button" data-view="timeline" class="' + (pl.view === 'timeline' ? 'is-active' : '') + '">' + icon('clock', 16) + 'Timeline</button></div>' +
      '<button class="btn btn--dark" type="button" data-act="newevent" data-kind="task">' + icon('plus', 18) + 'Add task</button></div>';
    if (pl.view === 'agenda') {
      var from = monOf(pl.day);
      pageEl.innerHTML = '<div class="pl-head"><div><h1>Team schedule</h1><p>' + longDay(from).split(', ')[1] + ' – ' + longDay(from + GN - 1).split(', ')[1] + ' · who is busy, who has room</p></div>' + tools + '</div>' +
        '<div class="pl-split"><aside class="pl-side" aria-label="Calendar and filters">' + miniCal() + filtersHTML() + '</aside><section class="pl-gt" aria-label="Team schedule">' + agendaGantt() + '</section></div>' + tipHTML();
      var sc = $('.gt-scroll', pageEl); if (sc && from <= 0 && 0 < from + GN) sc.scrollLeft = 0;
      return;
    }
    var list = plItems(pl.day), st = plStats(pl.day, 1), ws = weekStart(), days = '';
    for (var i = 0; i < 14; i++) {
      var off = ws + i, d = dateOf(off), n = plItems(off).length;
      days += '<button type="button" class="pl-d ' + (off === pl.day ? 'is-on' : '') + (off === 0 ? ' is-today' : '') + '" data-day="' + off + '" aria-pressed="' + (off === pl.day) + '">' + WD[d.getDay()].slice(0, 3) + ' ' + d.getDate() + (n ? '<i></i>' : '') + '</button>';
    }
    pageEl.innerHTML = '<div class="pl-head"><div><h1>' + esc(longDay(pl.day)) + '</h1><p>' + st.n + ' item' + (st.n === 1 ? '' : 's') + ' · ' + hrs(st.min) + ' scheduled</p></div>' + tools + '</div>' +
      '<div class="pl-days"><button type="button" class="pl-d pl-today" data-day="0" aria-label="Jump to today" title="Jump to today">' + icon('calendar', 16) + '</button>' + days + '</div>' +
      '<section class="pl-body" aria-label="Plan for ' + esc(longDay(pl.day)) + '">' + timelineHTML(list) + '</section>' + tipHTML();
    var on = $('.pl-d.is-on', pageEl); if (on && on.scrollIntoView) on.scrollIntoView({ inline: 'center', block: 'nearest' });
  }
  function tipHTML() {
    var gap = freeGap(Math.max(pl.day, 0)); if (!gap) return '';
    return '<div class="pl-tip"><span>' + icon('sparkle', 18) + 'You have ' + hrs(Math.min(gap.dur, 180)) + ' free ' + (gap.off === 0 ? 'today' : 'on ' + dayWord(gap.off)) + (gap.s < 720 ? ' morning' : ' afternoon') + '</span><button type="button" class="pl-link" data-pl="move" data-off="' + gap.off + '" data-s="' + gap.s + '">Move a task here</button></div>';
  }
  document.addEventListener('click', function (e) {
    if (ctx.page !== 'planner') return;
    var dv = e.target.closest('[data-day]'), vw = e.target.closest('[data-view]'), a = e.target.closest('[data-pl]'), cl = e.target.closest('[data-cal]'), cn = e.target.closest('[data-calnav]'), op = e.target.closest('[data-open]');
    if (cl) { pl.day = +cl.getAttribute('data-cal'); pl.calM = 0; renderPlanner(); }
    else if (cn) { pl.calM += +cn.getAttribute('data-calnav'); renderPlanner(); }
    else if (op) { pl.day = +op.getAttribute('data-open'); pl.view = 'timeline'; renderPlanner(); }
    else if (dv) { pl.day = +dv.getAttribute('data-day'); renderPlanner(); }
    else if (vw) { pl.view = vw.getAttribute('data-view'); pl.calM = 0; renderPlanner(); }
    else if (a) {
      var act = a.getAttribute('data-pl');
      if (act === 'toggle') {
        var it = plItems(pl.day).filter(function (x) { return x.id === a.getAttribute('data-id'); })[0], t = it && it.t;
        if (t) { t.status = t.status === 'done' ? 'progress' : 'done'; save(); renderPlanner(); toast(t.status === 'done' ? 'Task completed.' : 'Task reopened.'); }
      } else if (act === 'move') {
        var off = +a.getAttribute('data-off'), s0 = +a.getAttribute('data-s');
        var sch = ps.added.map(function (x) { return x.tid; });
        var cand = open(tasks).filter(function (t) { return t.who === DATA.me && sch.indexOf(t.id) < 0 && !DATA.planner.some(function (x) { return x.tid === t.id; }); }).slice(0, 6);
        var pop = openPop(a, '<div class="cap">Plan which task?</div>' + (cand.length ? cand.map(function (t) { return '<button type="button" data-mv="' + t.id + '">' + esc(t.title) + '</button>'; }).join('') : '<button type="button" disabled>No unplanned tasks</button>'));
        pop.addEventListener('click', function (ev) {
          var k = ev.target.closest('[data-mv]'); if (!k) return;
          ps.added.push({ id: 'pe' + Date.now(), kind: 'task', tid: k.getAttribute('data-mv'), day: off, start: hhmm(s0), dur: 60 });
          savePl(); closePop(); pl.day = off; renderSidebar(); renderPlanner(); toast('Task added to ' + dayWord(off) + ' at ' + hhmm(s0) + '.');
        });
      }
    }
  });

  document.addEventListener('change', function (e) { var h = e.target.getAttribute && e.target.getAttribute('data-hide'); if (h && ctx.page === 'planner') { pl.hide[h] = !e.target.checked; renderPlanner(); } });

  function newEventModal(pre) {
    pre = pre || {};
    var kind = pre.kind || 'event', people = {}, link = '';
    var projOpts = DATA.projects.map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + '</option>'; }).join('');
    var taskOpts = '<option value="">New task</option>' + open(tasks).filter(function (t) { return t.who === DATA.me; }).map(function (t) { return '<option value="' + t.id + '">' + esc(t.title) + '</option>'; }).join('');
    var m = modalShell('m-ev', 'New event', 'Add a meeting, a deadline, or focus time',
      '<button class="icon-btn fu-x" type="button" data-act="close" aria-label="Close">' + icon('close') + '</button>' +
      '<form novalidate><div class="ev-tabs" role="tablist" aria-label="Type"><button type="button" data-k="task">Task</button><button type="button" data-k="event">Event</button><button type="button" data-k="focus">Focus time</button></div>' +
      '<div class="fld" data-for="task"><label for="ev-ex">Schedule</label><div class="ev-in">' + icon('tasks', 18) + '<select id="ev-ex">' + taskOpts + '</select></div></div>' +
      '<div class="fld"><label for="ev-title">Title</label><div class="ev-in">' + icon('tasks', 18) + '<input id="ev-title" maxlength="100" placeholder="e.g. Sprint review" autocomplete="off"></div><span class="msg-e" role="alert"></span></div>' +
      '<div class="two ev-two"><div class="fld"><label for="ev-date">Date</label><div class="ev-in">' + icon('calendar', 18) + '<input id="ev-date" type="date"></div></div>' +
      '<div class="fld"><label for="ev-s">Time</label><div class="ev-in ev-time">' + icon('clock', 18) + '<input id="ev-s" type="time" aria-label="Start time"><span>–</span><input id="ev-e" type="time" aria-label="End time"></div><span class="msg-e" role="alert"></span></div></div>' +
      '<p class="ev-warn" id="ev-warn" hidden></p>' +
      '<div class="fld" data-for="event focus"><label for="ev-rep">Repeat</label><div class="ev-in">' + icon('activity-log', 18) + '<select id="ev-rep"><option value="">Does not repeat</option><option value="daily">Every day</option><option value="weekday">Every weekday</option><option value="weekly">Every week</option></select></div></div>' +
      '<div class="fld" data-for="task event"><label for="ev-p">Project</label><div class="ev-in">' + icon('folder', 18) + '<select id="ev-p">' + projOpts + '</select></div></div>' +
      '<div class="fld" data-for="event"><label for="ev-find">Invite people</label><div class="nc-find ev-in">' + icon('plus', 18) + '<input id="ev-find" placeholder="Add teammates" autocomplete="off"><div class="nc-sug" id="ev-sug" hidden></div></div><div class="ev-chips" id="ev-chips"></div><p class="ev-note">Guests receive an invitation and can accept or decline.</p></div>' +
      '<div class="fld" data-for="event"><label>Where</label><div class="ev-where"><span>Video call</span><label class="sw"><input type="checkbox" id="ev-vid" checked><i></i><span class="sr">Add a video call</span></label></div><button type="button" class="pl-link ev-link" id="ev-link">Create a call link</button></div>' +
      '<div class="fld" data-for="focus"><label>Notifications</label><div class="ev-where"><span>Mute notifications during focus time</span><label class="sw"><input type="checkbox" id="ev-mute" checked><i></i><span class="sr">Mute notifications</span></label></div></div>' +
      '<div class="fld"><label for="ev-rem">Reminder</label><div class="ev-in">' + icon('bell', 18) + '<select id="ev-rem"><option value="">No reminder</option><option value="0">At the start</option><option value="5">5 minutes before</option><option value="15" selected>15 minutes before</option><option value="60">1 hour before</option><option value="1440">1 day before</option></select></div></div>' +
      '<div class="foot ev-foot"><button type="button" class="btn btn--line" data-act="close">Cancel</button><button type="submit" class="btn btn--dark" id="ev-go">Create event</button></div></form>');
    m.classList.add('modal--lg', 'modal--ev');
    var title = $('#ev-title', m), dEl = $('#ev-date', m), sEl = $('#ev-s', m), eEl = $('#ev-e', m), find = $('#ev-find', m), sug = $('#ev-sug', m), chips = $('#ev-chips', m), warn = $('#ev-warn', m);
    var base = pre.day !== undefined ? pre.day : pl.day, st0 = pre.start || (gapStart(base));
    dEl.value = isoOf(base); sEl.value = st0; eEl.value = hhmm(Math.min(1439, tmin(st0) + 60));
    function gapStart(off) { var b = plItems(off), c = 600; b.forEach(function (x) { if (x.s < c + 60 && x.e > c) c = Math.ceil(x.e / 30) * 30; }); return hhmm(Math.min(c, 1020)); }
    function offOf() { var d = new Date(dEl.value + 'T00:00:00'); return isNaN(d) ? null : Math.round((d - dateOf(0)) / 864e5); }
    function setKind(k) {
      kind = k;
      $$('.ev-tabs button', m).forEach(function (b) { var on = b.getAttribute('data-k') === k; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
      $$('[data-for]', m).forEach(function (f) { f.hidden = f.getAttribute('data-for').split(' ').indexOf(k) < 0; });
      $('#ev-go', m).textContent = { event: 'Create event', task: 'Add task', focus: 'Create focus block' }[k];
      title.placeholder = { event: 'e.g. Sprint review', task: 'e.g. Prepare the demo script', focus: 'Focus time' }[k];
      checkOverlap();
    }
    function checkOverlap() {
      var off = offOf(), s = tmin(sEl.value || '00:00'), e = tmin(eEl.value || '00:00');
      var hit = off === null ? [] : plItems(off).filter(function (x) { return x.s < e && x.e > s; });
      warn.hidden = !hit.length;
      if (hit.length) warn.innerHTML = icon('warning', 16) + 'Overlaps with ' + esc(hit[0].title) + ' (' + hhmm(hit[0].s) + '–' + hhmm(hit[0].e) + '). You can still save it.';
    }
    $$('.ev-tabs button', m).forEach(function (b) { b.addEventListener('click', function () { setKind(b.getAttribute('data-k')); }); });
    [dEl, sEl, eEl].forEach(function (x) { x.addEventListener('input', function () { checkOverlap(); fieldErr(eEl, ''); }); });
    $('#ev-ex', m).addEventListener('change', function (e) { var t = taskById(e.target.value); if (t) { title.value = t.title; $('#ev-p', m).value = t.p; fieldErr(title, ''); } });
    title.addEventListener('input', function () { if (title.value.trim()) fieldErr(title, ''); });
    title.addEventListener('blur', function () { if (kind !== 'focus' && !title.value.trim()) fieldErr(title, 'Give it a title so your team knows what it is.'); });
    function drawChips() {
      chips.innerHTML = Object.keys(people).map(function (i) { return '<span class="ev-chip">' + avatar(i, 24) + esc(M(i).name) + '<button type="button" data-rm="' + i + '" aria-label="Remove ' + esc(M(i).name) + '">' + icon('close', 12) + '</button></span>'; }).join('');
    }
    function drawSug() {
      var v = find.value.trim().toLowerCase();
      var c = DATA.members.filter(function (x) { return x.id !== DATA.me && !people[x.id] && (!v || x.name.toLowerCase().indexOf(v) > -1); });
      sug.hidden = !c.length || document.activeElement !== find;
      sug.innerHTML = c.slice(0, 5).map(function (x) { return '<button type="button" data-add="' + x.id + '">' + avatar(x.id, 24) + '<span>' + esc(x.name) + '</span><small>' + esc(x.role) + '</small></button>'; }).join('');
    }
    find.addEventListener('focus', drawSug); find.addEventListener('input', drawSug); find.addEventListener('blur', function () { sug.hidden = true; });
    sug.addEventListener('mousedown', function (e) { e.preventDefault(); });
    sug.addEventListener('click', function (e) { var b = e.target.closest('[data-add]'); if (!b) return; people[b.getAttribute('data-add')] = 1; find.value = ''; drawChips(); sug.hidden = true; find.focus(); });
    chips.addEventListener('click', function (e) { var b = e.target.closest('[data-rm]'); if (b) { delete people[b.getAttribute('data-rm')]; drawChips(); } });
    $('#ev-link', m).addEventListener('click', function (e) {
      link = 'protask.space/call/' + Math.random().toString(36).slice(2, 5) + '-' + Math.random().toString(36).slice(2, 6) + '-' + Math.random().toString(36).slice(2, 5);
      e.target.textContent = link; e.target.classList.add('is-set'); $('#ev-vid', m).checked = true;
      if (navigator.clipboard) navigator.clipboard.writeText('https://' + link).then(function () { toast('Call link copied.'); }, function () {});
    });
    $('form', m).addEventListener('submit', function (e) {
      e.preventDefault();
      var tk = taskById($('#ev-ex', m).value), ttl = title.value.trim() || (kind === 'focus' ? 'Focus time' : tk ? tk.title : '');
      if (!ttl) { fieldErr(title, 'Give it a title so your team knows what it is.'); title.focus(); return; }
      var off = offOf(), s = tmin(sEl.value || '00:00'), en = tmin(eEl.value || '00:00');
      if (off === null) { dEl.focus(); return; }
      if (en <= s) { fieldErr(eEl, 'The end time must be after the start time.'); eEl.focus(); return; }
      var it = { id: 'pe' + Date.now(), kind: kind, title: ttl, day: off, start: sEl.value, dur: en - s, rem: $('#ev-rem', m).value };
      if (kind === 'event') { it.tag = 'Event'; it.who = [DATA.me].concat(Object.keys(people)); it.video = $('#ev-vid', m).checked; it.link = link; it.project = $('#ev-p', m).value; }
      if (kind === 'task') { if (tk) it.tid = tk.id; else { var nt = { id: 'n' + Date.now(), p: $('#ev-p', m).value, title: ttl, status: 'todo', priority: 'Medium', label: 'Design', who: DATA.me, due: Math.max(0, off), upd: 0, comments: 0, files: 0 }; tasks.push(nt); save(); it.tid = nt.id; } }
      if (kind === 'focus') it.mute = $('#ev-mute', m).checked;
      var rp = $('#ev-rep', m).value; if (rp && kind !== 'task') it.rep = rp;
      ps.added.push(it); savePl(); closeOverlay();
      var msg = kind === 'event' ? (Object.keys(people).length ? 'Event created. ' + Object.keys(people).length + ' invitation' + (Object.keys(people).length > 1 ? 's' : '') + ' sent (demo).' : 'Event created.') : kind === 'task' ? 'Task scheduled.' : 'Focus block created.';
      if (ctx.page === 'planner') { pl.day = off; refresh(); toast(msg); } else { toast(msg); setTimeout(function () { location.href = 'planner.html?d=' + off; }, 450); }
    });
    setKind(kind); drawChips(); openOverlay(m, '#ev-title');
  }

  /* ---------- 8. Start ---------- */
  function refresh() {
    renderSidebar();
    pageEl.className = 'page';
    if (ctx.page === 'home') renderHome(); else if (ctx.page === 'project') renderProject(); else if (ctx.page === 'chat') renderChat(); else if (ctx.page === 'channel') renderChannel(); else if (ctx.page === 'planner') renderPlanner(); else renderBoard();
  }
  function start() {
    root = document.getElementById('app');
    ctx.page = document.body.getAttribute('data-page') || 'home';
    ctx.p = qs.get('p') || 'p1';
    if (ctx.page === 'board') {
      ctx.mine = qs.get('mine') === '1';
      if (ctx.mine) bf.who = DATA.me;
      if (qs.get('who')) bf.who = qs.get('who');
      if (qs.get('view') === 'list') bf.view = 'list';
    }
    ctx.c = qs.get('c') || 'design-review';
    if (qs.get('d') !== null && !isNaN(+qs.get('d'))) pl.day = +qs.get('d');
    if (qs.get('view') === 'timeline' && ctx.page === 'planner') pl.view = 'timeline';
    buildShell(); refresh();
    var t = document.title; if (ctx.page === 'project') document.title = (P(ctx.p) || {}).name + ' · ProTask'; else if (ctx.page === 'channel') document.title = '#' + (chanById(ctx.c) || {}).name + ' · ProTask'; else if (ctx.page === 'chat') document.title = 'Chat · ProTask'; else if (ctx.page === 'planner') document.title = 'Planner · ProTask'; else if (ctx.page === 'board') document.title = (ctx.mine ? 'My tasks' : 'Board') + ' · ProTask';
  }
  start();
})();
