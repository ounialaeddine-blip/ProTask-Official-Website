/* =========================================================
   ProTask – shared header (js/nav.js)
   ONE place to edit the menu for ALL pages: change the MENU list below.
   - href: where the link goes. Use null while the page is not designed yet:
     the link then shows a small "coming soon" message instead of a broken page.
   - icon: a name from the ICONS list at the bottom (nv-<name>).
   Loaded BEFORE main.js (main.js handles the mobile hamburger).
   ========================================================= */
(function () {
  var header = document.querySelector('header.nav');
  if (!header) return;

  var HOME = header.getAttribute('data-home') || '';   // "" on index.html, "index.html" on other pages
  var H = function (hash) { return HOME + hash; };

  /* ---------------- THE MENU ---------------- */
  /* cols: plain text links (title + optional "all" link). features: the cards on the right (with icon). */
  var MENU = [
    { label: 'Product', cols: [
      { title: 'Plan & track', items: [
        { t: 'Kanban boards',       href: H('#features') },
        { t: 'Projects & planning', href: null },
        { t: 'Tasks & priorities',  href: null },
        { t: 'Dashboards',          href: null },
        { t: 'Reports',             href: null }
      ]},
      { title: 'Collaborate', items: [
        { t: 'Team chat',           href: null },
        { t: 'Files & documents',   href: null },
        { t: 'Notifications',       href: null },
        { t: 'Members & roles',     href: null },
        { t: 'Activity log',        href: null }
      ], all: { t: 'See all features', href: H('#features') } },
      { title: 'Work smarter', items: [
        { t: 'Search & filters',    href: null },
        { t: 'Export your data',    href: null },
        { t: 'Templates',           href: null },
        { t: 'Integrations',        href: null }
      ]}
    ], features: [
      { tag: 'AI', t: 'AI assistant', d: 'Summaries, health score and risk alerts', icon: 'sparkle', href: H('#ai') },
      { t: 'Project health score', d: 'Know what is on track at a glance', icon: 'health-score', href: null }
    ]},

    { label: 'Solutions', cols: [
      { title: 'Teams', items: [
        { t: 'Student projects',    href: null },
        { t: 'Software development', href: null },
        { t: 'Design & creative',   href: null },
        { t: 'Marketing',           href: null },
        { t: 'Operations',          href: null }
      ], all: { t: 'See all teams', href: null } },
      { title: 'Organisations', items: [
        { t: 'Startups',            href: null },
        { t: 'Small teams',         href: null },
        { t: 'Enterprise',          href: null },
        { t: 'Clubs & associations', href: null }
      ]},
      { title: 'Industries', items: [
        { t: 'Education',           href: null },
        { t: 'Agencies & services', href: null },
        { t: 'Technology',          href: null },
        { t: 'Non-profit',          href: null }
      ], all: { t: 'See all industries', href: null } }
    ], features: [
      { tag: 'ENISo', t: 'Meet the team', d: 'The students building ProTask', icon: 'members', href: 'team.html' },
      { t: 'For universities', d: 'Supervise many student teams', icon: 'roles', href: null }
    ]},

    { label: 'AI assistant', href: H('#ai') },

    { label: 'Resources', cols: [
      { title: 'Learn', items: [
        { t: 'Help center',         href: null },
        { t: 'Guides & tutorials',  href: null },
        { t: 'Templates',           href: null },
        { t: 'Changelog',           href: null }
      ]},
      { title: 'Company', items: [
        { t: 'About us',            href: 'team.html' },
        { t: 'Contact',             href: H('#contact') },
        { t: 'Blog',                href: null },
        { t: 'Partners',            href: null }
      ]},
      { title: 'Community', items: [
        { t: 'Events',              href: null },
        { t: 'Student program',     href: null },
        { t: 'Feedback & roadmap',  href: null }
      ]}
    ], features: [
      { tag: 'New', t: 'Getting started', d: 'Set up your first board in 5 minutes', icon: 'check-circle', href: null },
      { t: 'Talk to us', d: 'Questions about ProTask? Write to us', icon: 'chat', href: H('#contact') }
    ]},

    { label: 'Pricing', href: H('#pricing') },
    { label: 'Contact', href: H('#contact') }
  ];
  var ICONS = '<symbol id="nv-kanban" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="5" height="10" rx="1.5"/><rect x="9.5" y="4" width="5" height="16" rx="1.5"/><rect x="16" y="4" width="5" height="7" rx="1.5"/><circle cx="18.5" cy="16.5" r="1.7" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-project" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><circle cx="12" cy="14" r="1.7" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-task" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3.5" width="16" height="17" rx="3"/><path d="M8 8.5h8M8 12h5"/><circle cx="9" cy="16" r="1.5" fill="var(--accent)" stroke="none"/><path d="M12.5 16H16"/></g></symbol>'+
'<symbol id="nv-dashboard" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 16.5v-3.5M12 16.5v-6M16 16.5v-5"/><circle cx="12" cy="7.4" r="1.4" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-chat" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 4.5h13a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H17V20.5L12.5 17H5.5a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2z"/><circle cx="8.5" cy="10.7" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="10.7" r="1.3" fill="var(--accent)" stroke="none"/><circle cx="15.5" cy="10.7" r="1" fill="currentColor" stroke="none"/></g></symbol>'+
'<symbol id="nv-drive" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 18.5a4.2 4.2 0 0 1-.7-8.3 5.6 5.6 0 0 1 10.7-1.1 4.7 4.7 0 0 1 .5 9.4z"/><circle cx="12" cy="14" r="1.5" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-notifications" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 16.5c1-.9 1-2.5 1-4.5a4.5 4.5 0 0 1 9 0c0 2 0 3.6 1 4.5z"/><path d="M12 4.5v3M10 19.3a2.2 2.2 0 0 0 4 0"/><circle cx="18" cy="5.5" r="2" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-roles" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3.5" width="14" height="17" rx="2.5"/><circle cx="12" cy="6.8" r="1.4" fill="var(--accent)" stroke="none"/><circle cx="12" cy="12" r="2.2"/><path d="M8.3 18c.5-2 1.9-3 3.7-3s3.2 1 3.7 3"/></g></symbol>'+
'<symbol id="nv-ai-summary" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3.5c.5 2.8 1.7 4 4.5 4.5-2.8.5-4 1.7-4.5 4.5-.5-2.8-1.7-4-4.5-4.5 2.8-.5 4-1.7 4.5-4.5z"/><path d="M4 16h16M4 20h10"/><circle cx="17.5" cy="7" r="1.6" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-sparkle" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4c.8 4.4 2.6 6.2 7 7-4.4.8-6.2 2.6-7 7-.8-4.4-2.6-6.2-7-7 4.4-.8 6.2-2.6 7-7z"/><path d="M18.5 15.5c.2 1.4.8 2 2.2 2.2-1.4.2-2 .8-2.2 2.2-.2-1.4-.8-2-2.2-2.2 1.4-.2 2-.8 2.2-2.2z"/><circle cx="19" cy="5.5" r="1.5" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-at-risk" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="13" r="7.5"/><path d="M11 9v4l2.6 1.6"/><circle cx="18.5" cy="5.5" r="2" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-health-score" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16.5a8 8 0 0 1 16 0"/><path d="M12 16.5l3.6-4.6"/><circle cx="12" cy="16.5" r="1.9" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-workload" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6.5h9M4 12h12M4 17.5h7"/><circle cx="19.5" cy="12" r="1.7" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-members" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8.5" r="3"/><path d="M3.5 19.5c0-3.3 2.4-5.5 5.5-5.5s5.5 2.2 5.5 5.5"/><circle cx="17" cy="8" r="2.3" fill="var(--accent)" stroke="none"/><path d="M16.5 13.8c2.4.3 4 2.1 4 5.2"/></g></symbol>'+
'<symbol id="nv-activity-log" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="1.6"/><circle cx="6" cy="12" r="1.9" fill="var(--accent)" stroke="none"/><circle cx="6" cy="18" r="1.6"/><path d="M6 7.8v2.3M6 13.9v2.3M11 6h9M11 12h9M11 18h6"/></g></symbol>'+
'<symbol id="nv-review" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M2.8 12S6.2 5.8 12 5.8 21.2 12 21.2 12 17.8 18.2 12 18.2 2.8 12 2.8 12z"/><circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="12" r="1.2" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-mobile" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M10.5 17.8h3"/><circle cx="12" cy="9" r="1.6" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-export" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 15v2.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V15M12 4.5v10M8 10.8l4 4 4-4"/><circle cx="12" cy="17.8" r="1.2" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-link" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-.8.8M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l.8-.8"/><circle cx="12" cy="12" r="1.3" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-search" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20"/><circle cx="10.5" cy="10.5" r="1.6" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-language" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.2-3.6-8.5S9.6 5.9 12 3.5z"/><circle cx="12" cy="12" r="1.6" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-check-circle" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8 5.2-5.6"/></g></symbol>'+
'<symbol id="nv-info" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="7.9" r="1.1" fill="currentColor" stroke="none"/></g></symbol>'+
'<symbol id="nv-chevron-down" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9.5l6 6 6-6"/></g></symbol>'+
'<symbol id="nv-arrow-right" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></g></symbol>'+
'<symbol id="nv-settings" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h8.5M17.5 7H20M4 12h2.5M11.5 12H20M4 17h10.5M19.5 17H20"/><circle cx="15" cy="7" r="2.5"/><circle cx="9" cy="12" r="2.5" fill="var(--accent)" stroke="none"/><circle cx="17" cy="17" r="2.5"/></g></symbol>'+
'<symbol id="nv-invite" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3.8 7.8L12 13.2l8.2-5.4"/><circle cx="18" cy="15.5" r="1.4" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-label" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12.2V5.5a2 2 0 0 1 2-2h6.7a2 2 0 0 1 1.4.6l7.3 7.3a2 2 0 0 1 0 2.8l-6.7 6.7a2 2 0 0 1-2.8 0L4.1 13.6a2 2 0 0 1-.6-1.4z"/><circle cx="8" cy="8" r="1.5" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-priority" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v13"/><path d="M6 5.5c2.4-1.3 4.4-.9 6.2 0 1.8.9 3.6 1.2 5.8 0v7.5c-2.2 1.2-4 .9-5.8 0-1.8-.9-3.8-1.3-6.2 0"/><circle cx="6" cy="20" r="1.6" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-due-date" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><circle cx="15.5" cy="15" r="1.6" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-comments" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 4.5h13a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H11.5L7 20.5V17H5.5a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2z"/><path d="M8 9h8"/><circle cx="8.8" cy="12.7" r="1.3" fill="var(--accent)" stroke="none"/><path d="M11.8 12.7H16"/></g></symbol>'+
'<symbol id="nv-assignee" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="8" r="3.5"/><path d="M4.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="19" cy="6" r="1.8" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-archive" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="3.5" rx="1"/><path d="M4.5 7.5V18a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7.5M10 11.5h4"/><circle cx="12" cy="15.8" r="1.3" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-ai-notes" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3.5h7l5 5V18.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z"/><path d="M14 3.5v5h5M8.5 12.5h4M8.5 16h3"/><circle cx="16" cy="16" r="1.6" fill="var(--accent)" stroke="none"/></g></symbol>'+
'<symbol id="nv-security" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l7 2.6v5.4c0 4.4-2.9 7.6-7 9-4.1-1.4-7-4.6-7-9V6.1z"/><circle cx="12" cy="10.8" r="1.7" fill="var(--accent)" stroke="none"/><path d="M12 12.8v3"/></g></symbol>'+
'<symbol id="nv-accessibility" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="7.8" r="1.5" fill="var(--accent)" stroke="none"/><path d="M7.5 10.8h9M12 10.8v3.4M12 14.2l-2.2 3.4M12 14.2l2.2 3.4"/></g></symbol>'+
'<symbol id="nv-profile" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.6 18.4c1.3-2.3 3.3-3.4 5.4-3.4s4.1 1.1 5.4 3.4"/><circle cx="18.4" cy="18.4" r="1.9" fill="var(--accent)" stroke="none"/></g></symbol>';

  /* ---------------- build the HTML ---------------- */
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
  var ic = function (n) { return '<svg class="mm-ic" aria-hidden="true"><use href="#nv-' + n + '"/></svg>'; };
  var link = function (it, cls) {
    return '<a class="' + cls + '" href="' + (it.href || '#') + '"' + (it.href ? '' : ' data-soon') + '>';
  };

  var items = MENU.map(function (m, i) {
    if (!m.cols) return '<li class="nav__item"><a class="nav__a" href="' + m.href + '">' + esc(m.label) + '</a></li>';
    var cols = m.cols.map(function (c) {
      return '<div class="mm-col"><p class="mm-h">' + esc(c.title) + '</p>' +
        c.items.map(function (it) { return link(it, 'mm-link') + esc(it.t) + '</a>'; }).join('') +
        (c.all ? link(c.all, 'mm-link mm-all') + esc(c.all.t) + ' <svg class="mm-ar" aria-hidden="true"><use href="#nv-arrow-right"/></svg></a>' : '') + '</div>';
    }).join('');
    var f = m.features ? '<div class="mm-col mm-feat"><p class="mm-h">Featured</p>' + m.features.map(function (x) {
      return link(x, 'mm-card') + '<span class="mm-card__ic">' + ic(x.icon) + '</span><span><b>' + esc(x.t) + (x.tag ? '<em>' + esc(x.tag) + '</em>' : '') + '</b><small>' + esc(x.d) + '</small></span></a>';
    }).join('') + '</div>' : '';
    return '<li class="nav__item nav__item--mega"><button class="nav__a nav__btn" type="button" aria-expanded="false" aria-controls="mm-' + i + '">' + esc(m.label) +
      '<svg class="nav__chev" aria-hidden="true"><use href="#nv-chevron-down"/></svg></button>' +
      '<div class="mega" id="mm-' + i + '" role="group" aria-label="' + esc(m.label) + '"><div class="mega__in">' + cols + f + '</div></div></li>';
  }).join('');

  var logoHref = HOME ? HOME : '#top';
  header.innerHTML =
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' + ICONS + '</svg>' +
    '<div class="container nav__inner">' +
    '<a href="' + logoHref + '" class="logo" aria-label="ProTask home"><img class="logo__mark" src="images/logo-mark.svg" width="28" height="28" alt=""><span class="logo__text">ProTask</span></a>' +
    '<nav aria-label="Main"><ul class="nav__links" id="main-menu">' + items + '</ul></nav>' +
    '<div class="nav__cta"><a href="login.html" class="btn btn--light">Log in</a><a href="register.html" class="btn btn--dark">Get started</a>' +
    '<button class="nav__toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="main-menu"><span></span></button></div></div>';

  /* ---------------- behaviour ---------------- */
  var mega = [].slice.call(header.querySelectorAll('.nav__item--mega'));
  var canHover = window.matchMedia('(hover:hover) and (min-width:901px)');
  var timer;

  function setOpen(li, on) {
    li.classList.toggle('is-open', on);
    li.querySelector('.nav__btn').setAttribute('aria-expanded', on);
  }
  function closeAll(except) { mega.forEach(function (li) { if (li !== except) setOpen(li, false); }); }

  mega.forEach(function (li) {
    var btn = li.querySelector('.nav__btn');
    btn.addEventListener('click', function () {
      var on = !li.classList.contains('is-open');
      closeAll(li); setOpen(li, on);
    });
    li.addEventListener('pointerenter', function (e) {
      if (!canHover.matches || e.pointerType === 'touch') return;
      clearTimeout(timer); timer = setTimeout(function () { closeAll(li); setOpen(li, true); }, 90);
    });
    li.addEventListener('pointerleave', function (e) {
      if (!canHover.matches || e.pointerType === 'touch') return;
      clearTimeout(timer); timer = setTimeout(function () { setOpen(li, false); }, 160);
    });
    li.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setOpen(li, false); btn.focus(); }
    });
  });
  document.addEventListener('click', function (e) { if (!header.contains(e.target)) closeAll(); });
  header.addEventListener('focusout', function (e) {
    if (e.relatedTarget && !header.contains(e.relatedTarget)) closeAll();
  });

  /* pages that are not designed yet: show a small message instead of jumping to "#" */
  var toast;
  header.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-soon]');
    if (!a) return;
    e.preventDefault();
    if (!toast) { toast = document.createElement('div'); toast.className = 'nav-toast'; toast.setAttribute('role', 'status'); document.body.appendChild(toast); }
    toast.textContent = (a.querySelector('b') ? a.querySelector('b').firstChild.textContent : 'This page') + ' page is coming soon';
    toast.classList.add('is-on');
    clearTimeout(toast._t); toast._t = setTimeout(function () { toast.classList.remove('is-on'); }, 2200);
  });
})();
