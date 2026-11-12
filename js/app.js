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
    return '<span class="avatar" title="' + esc(m.name) + '" style="width:' + size + 'px;height:' + size + 'px;background:' + m.color + ';font-size:' + Math.round(size * 0.38) + 'px">' + esc(initials(m.name)) + '</span>';
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
  var KEY = 'protask.tasks.v1', KEY_READ = 'protask.inbox.read', KEY_COL = 'protask.sidebar';
  var tasks;
  try { tasks = JSON.parse(localStorage.getItem(KEY)); } catch (e) { tasks = null; }
  if (!Array.isArray(tasks)) tasks = JSON.parse(JSON.stringify(DATA.tasks));
  function save() { try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch (e) {} }
  var readIds = [];
  try { readIds = JSON.parse(localStorage.getItem(KEY_READ)) || []; } catch (e) {}
  function isUnread(i) { return i.unread && readIds.indexOf(i.id) < 0; }
  function unreadCount() { return DATA.inbox.filter(isUnread).length; }
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
      it('calendar', 'Planner', { act: 'toast', msg: 'Planner (agenda + calendar) is the next screen to build.' }) +
      it('inbox', 'Inbox', { act: 'inbox', dot: unread > 0 }) +
      it('chat', 'Chat', { act: 'toast', msg: 'Team chat arrives in v2 (see the CdC).' }) +
      it('folder', 'Files', { act: 'toast', msg: 'Files (Drive / Dropbox links) is the next screen to build.' }) +
      it('users', 'Teams', { act: 'teams' }) +
      it('reports', 'Reports', { act: 'toast', msg: 'Reports are planned after the dashboards.' }) +
      '<div class="rail-sp"></div>' +
      it('userplus', 'Invite', { act: 'invite' }) +
      it('settings', 'Settings', { act: 'toast', msg: 'Settings are planned after the dashboards.' }) +
      '<button class="rail-me" type="button" data-act="profile" data-pop aria-haspopup="menu" aria-label="Your account">' + avatar(DATA.me, 38) + '<i class="st online"></i></button>';
  }
  function panelHTML() {
    var unread = unreadCount(), onProject = ctx.page === 'project' || (ctx.page === 'board' && !ctx.mine);
    var priorities = open(tasks).filter(function (t) { return t.who === DATA.me && t.due <= 0; }).length;
    var row = function (ic, label, o) {
      o = o || {};
      var tag = o.href ? 'a href="' + o.href + '"' : 'button type="button"';
      return '<' + tag + ' class="pn-i ' + (o.on ? 'is-active' : '') + '" ' + (o.act ? 'data-act="' + o.act + '"' : '') + ' ' + (o.msg ? 'data-msg="' + o.msg + '"' : '') + '>' + (o.lead || icon(ic, 18)) + '<span class="pn-l">' + label + '</span>' + (o.badge ? '<span class="sb-badge">' + o.badge + '</span>' : '') + (o.count !== undefined ? '<small>' + o.count + '</small>' : '') + '</' + (o.href ? 'a' : 'button') + '>';
    };
    var title = ctx.page === 'home' ? 'Home' : (ctx.mine ? 'My tasks' : 'Projects');
    var h = '<div class="pn-head"><h2>' + esc(title) + '</h2><button class="btn btn--dark" type="button" data-act="newtask">' + icon('plus', 16) + 'Create</button></div>' +
      '<div class="pn-scroll">' +
      '<div class="pn-m">' + row('home', 'Home', { href: 'dashboard.html', on: ctx.page === 'home' }) + row('calendar', 'Planner', { act: 'toast', msg: 'Planner is the next screen to build.' }) + row('folder', 'Files', { act: 'toast', msg: 'Files is the next screen to build.' }) + row('reports', 'Reports', { act: 'toast', msg: 'Reports are planned after the dashboards.' }) + '</div>' +
      row('ai', 'Ask ProTask AI', { act: 'toast', msg: 'The AI box is on your Home dashboard (preview).' }) +
      row('inbox', 'Inbox', { act: 'inbox', badge: unread || '' }) +
      row('tasks', 'My tasks', { href: 'board.html?p=all&mine=1', on: !!ctx.mine }) +
      row('chat', 'Chat', { act: 'toast', msg: 'Team chat arrives in v2 (see the CdC).', badge: 3 }) +
      '<div class="pn-h"><span>Projects</span><button type="button" data-act="toast" data-msg="Creating projects comes with the backend." aria-label="New project">' + icon('plus', 16) + '</button></div>';
    DATA.projects.forEach(function (p) {
      h += row('', esc(p.name), { href: 'project.html?p=' + p.id, on: onProject && ctx.p === p.id, lead: '<i class="pn-dot" style="background:' + p.color + '"></i>', count: open(tasksOf(p.id)).length });
    });
    h += row('plus', 'New project', { act: 'toast', msg: 'Creating projects comes with the backend.' }) +
      '<div class="pn-h" id="pn-teams"><span>Teams</span><button type="button" data-act="invite" aria-label="Invite people">' + icon('userplus', 16) + '</button></div>';
    DATA.teams.forEach(function (t) { h += '<div class="pn-team">' + icon('users', 18) + '<span class="pn-l">' + esc(t.name) + '</span>' + stack(t.members, 3, 22) + '</div>'; });
    h += row('userplus', 'Invite people', { act: 'invite' }) +
      '<div class="pn-h"><span>Direct messages</span></div>';
    DATA.members.slice(0, 5).forEach(function (m) {
      h += '<button type="button" class="pn-i" data-act="toast" data-msg="Direct messages arrive in v2 (see the CdC).">' + avatar(m.id, 22) + '<span class="pn-l">' + esc(m.name) + (m.id === DATA.me ? ' <small style="margin:0">— You</small>' : '') + '</span><i class="st ' + m.status + '"></i></button>';
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
      '<form novalidate><div class="fld"><label for="nt-title">Task title</label><input id="nt-title" maxlength="120" placeholder="e.g. Prepare the demo script"><span class="msg-e" role="alert"></span></div>' +
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
      tasks.push({ id: 'n' + Date.now(), p: $('#nt-p', m).value, title: title.value.trim(), status: pre.status || 'todo', priority: $('#nt-pr', m).value, label: 'Design', who: $('#nt-who', m).value, due: off, upd: 0, comments: 0, files: 0 });
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
    else if (act === 'inbox') inboxDrawer();
    else if (act === 'close') closeOverlay();
    else if (act === 'close-pop') closePop();
    else if (act === 'profile') { a.setAttribute('data-pop', ''); profilePop(a); }
    else if (act === 'ws') { a.setAttribute('data-pop', ''); wsPop(a); }
    else if (act === 'menu') { shell.classList.toggle('is-open'); }
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
      '<div class="grid row-home-a"><section class="card" aria-labelledby="h-ag"><div class="card-h"><h2 id="h-ag">Today’s agenda</h2><button class="more" type="button" data-act="toast" data-msg="Planner is the next screen to build.">Open planner ' + icon('right', 14) + '</button></div><div class="agenda">' + agendaHTML() + '</div></section>' +
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
  function projectHead(p, active) {
    var tabs = [['Overview', 'grid', 'project.html?p=' + p.id], ['Board', 'board', 'board.html?p=' + p.id], ['List', 'list', 'board.html?p=' + p.id + '&view=list'], ['Calendar', 'calendar'], ['Chat', 'chat'], ['Files', 'folder'], ['Reports', 'reports']];
    return '<nav class="crumbs" aria-label="Breadcrumb"><a href="dashboard.html">Projects</a> / <span>' + esc(p.name) + '</span></nav>' +
      '<div class="ph"><div><div class="page-title"><h1>' + esc(p.name) + '</h1><span class="badge b-purple">Team space</span></div><p class="sub">' + esc(p.desc) + '</p></div>' +
      '<div class="right">' + stack(p.members, 5, 32) + '<button class="btn btn--line" type="button" data-act="toast" data-msg="Sharing links come with the backend.">' + icon('share', 18) + 'Share</button></div></div>' +
      '<div class="tabs" role="tablist">' + tabs.map(function (t) {
        var on = t[0] === active;
        return t[2] ? '<a class="tab ' + (on ? 'is-active' : '') + '" href="' + t[2] + '" ' + (on ? 'aria-current="page"' : '') + '>' + icon(t[1], 18) + t[0] + '</a>'
          : '<button class="tab" type="button" aria-disabled="true" data-act="toast" data-msg="' + t[0] + ' is not built yet. It comes next.">' + icon(t[1], 18) + t[0] + '</button>';
      }).join('') + '</div>';
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

  /* ---------- 8. Start ---------- */
  function refresh() {
    renderSidebar();
    if (ctx.page === 'home') renderHome(); else if (ctx.page === 'project') renderProject(); else renderBoard();
  }
  function start() {
    root = document.getElementById('app');
    ctx.page = document.body.getAttribute('data-page') || 'home';
    ctx.p = qs.get('p') || (ctx.page === 'board' ? 'p1' : 'p1');
    if (ctx.page === 'board') {
      ctx.mine = qs.get('mine') === '1';
      if (ctx.mine) bf.who = DATA.me;
      if (qs.get('who')) bf.who = qs.get('who');
      if (qs.get('view') === 'list') bf.view = 'list';
    }
    buildShell(); refresh();
    var t = document.title; if (ctx.page === 'project') document.title = (P(ctx.p) || {}).name + ' · ProTask'; else if (ctx.page === 'board') document.title = (ctx.mine ? 'My tasks' : 'Board') + ' · ProTask';
  }
  start();
})();
