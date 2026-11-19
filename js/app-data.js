/* =========================================================
   ProTask app – demo data (dashboards)
   Everything the dashboards show comes from this one file, so you can change names,
   projects and tasks here. Dates are written as "days from today" (due: 2 = in 2 days,
   due: -1 = yesterday) so the demo always looks current.
   Later this file is replaced by calls to the REST API.
   ========================================================= */
const DATA = {
  me: 'ala',
  workspace: { name: 'ENISo Club', initial: 'E' },
  members: [
    { id: 'ala',    name: 'Ala eddine', role: 'Project admin', color: '#6647f0', status: 'online' },
    { id: 'walid',  name: 'Walid',      role: 'Co-founder',    color: '#b45309', status: 'online' },
    { id: 'sarah',  name: 'Sarah B.',   role: 'Designer',      color: '#e0457b', status: 'online' },
    { id: 'omar',   name: 'Omar T.',    role: 'Developer',     color: '#0091ff', status: 'online' },
    { id: 'lina',   name: 'Lina K.',    role: 'Designer',      color: '#078d3b', status: 'away' },
    { id: 'yassine',name: 'Yassine M.', role: 'Backend',       color: '#fc6d2d', status: 'offline' },
    { id: 'meriem', name: 'Meriem H.',  role: 'Marketing',     color: '#0f8b8d', status: 'online' },
    { id: 'nour',   name: 'Nour A.',    role: 'Researcher',    color: '#8a5cf6', status: 'offline' }
  ],
  teams: [
    { name: 'Design team', members: ['sarah', 'lina', 'ala'] },
    { name: 'Dev team',    members: ['omar', 'yassine'] },
    { name: 'Founders',    members: ['ala', 'walid'] }
  ],
  pendingInvites: 2,
  projects: [
    { id: 'p1', name: 'Website Redesign', color: '#6647f0', desc: 'Redesign our marketing website to improve user experience and increase conversions.', members: ['ala', 'walid', 'sarah', 'omar', 'lina', 'yassine', 'meriem', 'nour'] },
    { id: 'p2', name: 'Mobile App',       color: '#0091ff', desc: 'First mobile version of ProTask for team members on the go.', members: ['ala', 'walid', 'omar', 'lina'] },
    { id: 'p3', name: 'Forum Demo',       color: '#078d3b', desc: 'Prototype and 5-minute demo for the enterprise forum in December.', members: ['ala', 'walid', 'omar', 'meriem', 'sarah'] },
    { id: 'p4', name: 'User Research',    color: '#fc6d2d', desc: 'Interviews with team leaders and members of the region.', members: ['ala', 'walid', 'nour', 'meriem'] }
  ],
  // status: todo | progress | review | done   priority: High | Medium | Low
  // due = days from today, upd = days since the last update, comments / files = counters
  tasks: [
    { id: 't1',  p: 'p1', title: 'Write user stories',          status: 'todo',     priority: 'High',   label: 'Design',        who: 'sarah',   due: 1,  upd: 3, comments: 2, files: 1 },
    { id: 't2',  p: 'p1', title: 'Create wireframes',           status: 'todo',     priority: 'Medium', label: 'Design',        who: 'lina',    due: 4,  upd: 1, comments: 0, files: 2 },
    { id: 't3',  p: 'p1', title: 'Set up analytics',            status: 'todo',     priority: 'Low',    label: 'Development',   who: 'omar',    due: 9,  upd: 0, comments: 0, files: 0 },
    { id: 't4',  p: 'p1', title: 'Design login screen',         status: 'todo',     priority: 'Medium', label: 'Design',        who: 'ala',     due: 0,  upd: 1, comments: 1, files: 0 },
    { id: 't5',  p: 'p1', title: 'Design homepage',             status: 'progress', priority: 'High',   label: 'Design',        who: 'sarah',   due: 2,  upd: 1, comments: 4, files: 3 },
    { id: 't6',  p: 'p1', title: 'Build responsive components', status: 'progress', priority: 'Medium', label: 'Development',   who: 'omar',    due: 6,  upd: 0, comments: 1, files: 0 },
    { id: 't7',  p: 'p1', title: 'Copywriting for key pages',   status: 'progress', priority: 'Low',    label: 'Content',       who: 'meriem',  due: 8,  upd: 2, comments: 0, files: 1 },
    { id: 't8',  p: 'p1', title: 'Set up API endpoints',        status: 'review',   priority: 'High',   label: 'Backend',       who: 'yassine', due: 2,  upd: 4, comments: 3, files: 0 },
    { id: 't9',  p: 'p1', title: 'Login page design',           status: 'review',   priority: 'Medium', label: 'Frontend',      who: 'ala',     due: -1, upd: 2, comments: 2, files: 1 },
    { id: 't10', p: 'p1', title: 'Competitor research',         status: 'done',     priority: 'Medium', label: 'Content',       who: 'nour',    due: -9, upd: 6, comments: 0, files: 2 },
    { id: 't11', p: 'p1', title: 'Project brief',               status: 'done',     priority: 'High',   label: 'Documentation', who: 'ala',     due: -12,upd: 8, comments: 1, files: 1 },
    { id: 't12', p: 'p1', title: 'Team kickoff meeting',        status: 'done',     priority: 'Low',    label: 'Documentation', who: 'meriem',  due: -14,upd: 9, comments: 0, files: 0 },
    { id: 't13', p: 'p1', title: 'Style guide',                 status: 'done',     priority: 'Medium', label: 'Design',        who: 'lina',    due: -6, upd: 5, comments: 0, files: 1 },
    { id: 't14', p: 'p1', title: 'Set up repository',           status: 'done',     priority: 'Low',    label: 'Development',   who: 'omar',    due: -10,upd: 7, comments: 0, files: 0 },
    { id: 't15', p: 'p1', title: 'Fix button spacing',          status: 'todo',     priority: 'Medium', label: 'Design',        who: 'ala',     due: 3,  upd: 0, comments: 1, files: 0 },
    { id: 't16', p: 'p1', title: 'Review the login screen mockups', status: 'review', priority: 'High', label: 'Design',        who: 'walid',   due: 3,  upd: 0, comments: 2, files: 1 },
    { id: 'm1',  p: 'p2', title: 'Define app scope',            status: 'progress', priority: 'High',   label: 'Documentation', who: 'ala',     due: 5,  upd: 1, comments: 2, files: 0 },
    { id: 'm2',  p: 'p2', title: 'Wireframe onboarding',        status: 'todo',     priority: 'Medium', label: 'Design',        who: 'lina',    due: 7,  upd: 0, comments: 0, files: 0 },
    { id: 'm3',  p: 'p2', title: 'Choose navigation pattern',   status: 'review',   priority: 'Medium', label: 'Design',        who: 'omar',    due: 3,  upd: 1, comments: 1, files: 0 },
    { id: 'm4',  p: 'p2', title: 'Draft user flows',            status: 'done',     priority: 'Low',    label: 'Design',        who: 'lina',    due: -4, upd: 3, comments: 0, files: 1 },
    { id: 'f1',  p: 'p3', title: 'Prepare demo script',         status: 'progress', priority: 'High',   label: 'Content',       who: 'meriem',  due: 4,  upd: 0, comments: 1, files: 1 },
    { id: 'f2',  p: 'p3', title: 'Seed demo data',              status: 'todo',     priority: 'Medium', label: 'Backend',       who: 'omar',    due: 6,  upd: 0, comments: 0, files: 0 },
    { id: 'f3',  p: 'p3', title: 'Rehearse the 5-minute pitch', status: 'todo',     priority: 'High',   label: 'Content',       who: 'walid',     due: 12, upd: 0, comments: 0, files: 0 },
    { id: 'f4',  p: 'p3', title: 'Record backup video',         status: 'todo',     priority: 'Low',    label: 'Content',       who: 'sarah',   due: 14, upd: 0, comments: 0, files: 0 },
    { id: 'f5',  p: 'p3', title: 'Book the presentation room',  status: 'done',     priority: 'Low',    label: 'Documentation', who: 'meriem',  due: -3, upd: 3, comments: 0, files: 0 },
    { id: 'r1',  p: 'p4', title: 'Interview team leaders',      status: 'progress', priority: 'High',   label: 'Content',       who: 'nour',    due: -2, upd: 3, comments: 2, files: 1 },
    { id: 'r2',  p: 'p4', title: 'Summarize findings',          status: 'todo',     priority: 'Medium', label: 'Documentation', who: 'nour',    due: -1, upd: 5, comments: 0, files: 0 },
    { id: 'r3',  p: 'p4', title: 'Recruit 8 participants',      status: 'progress', priority: 'Medium', label: 'Content',       who: 'meriem',  due: -3, upd: 4, comments: 1, files: 0 },
    { id: 'r4',  p: 'p4', title: 'Write interview guide',       status: 'done',     priority: 'Low',    label: 'Documentation', who: 'ala',     due: -8, upd: 8, comments: 0, files: 1 }
  ],
  inbox: [
    { id: 'i6', type: 'mention',  who: 'walid',  text: 'mentioned you in <b>Review the login screen mockups</b>', note: 'Can you look at it before Friday?', when: '20 min ago', unread: true },
    { id: 'i1', type: 'mention',  who: 'sarah',  text: 'mentioned you in <b>Design homepage</b>', note: 'Can you review the hero layout before noon?', when: '10 min ago', unread: true },
    { id: 'i2', type: 'assigned', who: 'omar',   text: 'assigned you <b>Design login screen</b>',  note: 'Due today',                                  when: '1 h ago',    unread: true },
    { id: 'i3', type: 'comment',  who: 'lina',   text: 'commented on <b>Create wireframes</b>',    note: 'I added the mobile version, see the file.',  when: '3 h ago',    unread: true },
    { id: 'i4', type: 'comment',  who: 'yassine',text: 'replied on <b>Set up API endpoints</b>',   note: 'Waiting for the review before merging.',     when: '6 h ago',    unread: false },
    { id: 'i5', type: 'assigned', who: 'meriem', text: 'joined <b>Website Redesign</b>',           note: 'Invitation accepted',                        when: 'Yesterday',  unread: false }
  ],
  events: [
    { time: '09:30', title: 'Daily stand-up',  meta: 'Website Redesign · 15 min', kind: 'meeting' },
    { time: '11:00', title: 'Design review',   meta: 'Website Redesign · with Sarah B.', kind: 'meeting' },
    { time: '14:00', title: 'Sprint planning', meta: 'All projects · 45 min', kind: 'meeting' }
  ],
  files: [
    { name: 'homepage_v2.fig',      type: 'Figma',  by: 'lina',   p: 'p1', size: '2.4 MB', when: '6 h ago',   source: 'Google Drive' },
    { name: 'Project_brief.pdf',    type: 'PDF',    by: 'ala',    p: 'p1', size: '480 KB', when: 'Yesterday', source: 'Dropbox' },
    { name: 'user_stories.docx',    type: 'Doc',    by: 'sarah',  p: 'p1', size: '96 KB',  when: '2 days ago',source: 'Google Drive' },
    { name: 'interview_guide.pdf',  type: 'PDF',    by: 'nour',   p: 'p4', size: '210 KB', when: '3 days ago',source: 'Dropbox' }
  ],
  activity: [
    { who: 'sarah', verb: 'changed status from', a: 'To do', b: 'In progress', p: 'p1', when: '2h ago' },
    { who: 'omar',  verb: 'added a comment on', obj: 'Design homepage', p: 'p1', when: '4h ago' },
    { who: 'lina',  verb: 'attached a file', obj: 'homepage_v2.fig', p: 'p1', when: '6h ago' },
    { who: 'yassine', verb: 'moved', obj: 'Set up API endpoints', to: 'Review', p: 'p1', when: 'Yesterday' }
  ],
  // small history curves for the KPI sparklines
  trends: {
    due:       { points: [4, 6, 5, 8, 7, 10, 12], delta: '+33%' },
    progress:  { points: [3, 5, 4, 6, 5, 7, 8],   delta: '+2' },
    completed: { points: [2, 3, 5, 6, 8, 9, 12],  delta: '+70%' },
    delayed:   { points: [1, 2, 2, 3, 3, 4, 4],   delta: '+1' }
  }
};

/* ---------- Chat (demo) ----------
   ago = minutes since the message was sent; the demo always looks fresh.
   task = id of a task shown as a card inside the message. */
DATA.channels = [
  { id: 'general',       name: 'general',       p: 'p1', pinned: true,  unread: 2, desc: 'Everyone on Website Redesign. Announcements and quick questions.', members: ['ala', 'walid', 'sarah', 'omar', 'lina', 'yassine', 'meriem', 'nour'] },
  { id: 'design-review', name: 'design-review', p: 'p1', pinned: true,  unread: 1, desc: 'Share designs, ask for feedback and decide together.',          members: ['ala', 'walid', 'sarah', 'lina', 'meriem', 'nour'] },
  { id: 'dev',           name: 'dev',           p: 'p1', pinned: true,  unread: 0, desc: 'Front-end and back-end questions, reviews and releases.',        members: ['ala', 'walid', 'omar', 'yassine'] },
  { id: 'announcements', name: 'announcements', p: 'p1', pinned: false, unread: 0, desc: 'Important news only. Read-only for members.',                    members: ['ala', 'walid', 'sarah', 'omar', 'lina', 'yassine', 'meriem', 'nour'] }
];
DATA.chatSeed = {
  'general': [
    { id: 'g1', who: 'meriem', ago: 1560, text: 'Good morning team! Kickoff notes are in Files. Please read them before the stand-up.' },
    { id: 'g2', who: 'ala',    ago: 1540, text: 'Thanks @Meriem. Stand-up is at 09:30 as usual.', react: [{ e: '👍', n: 3 }] },
    { id: 'g3', who: 'omar',   ago: 95,   text: 'Staging is up. I deployed the new responsive components, tell me if something looks off.' },
    { id: 'g4', who: 'sarah',  ago: 40,   text: 'Looks good on my phone. The footer needs more space, I will note it on the task.', react: [{ e: '✅', n: 1 }] },
    { id: 'g5', who: 'lina',   ago: 2,    text: 'Ok, will finalize the wireframes this afternoon.' }
  ],
  'design-review': [
    { id: 'd0', who: 'ala', ago: 190, text: 'Hey team, here are the latest login screen mockups based on the new brand guidelines. Let me know what you think about the purple accents and the button styling.' },
    { id: 'd1', who: 'sarah',  ago: 62, text: 'Hey @Ala, can you review these onboarding screens? Let me know if the user flow feels natural before I start prototyping the rest.', task: 't5' },
    { id: 'd2', who: 'lina',   ago: 48, text: 'I worked on the dark mode version of the dashboard. Here is the file:', file: { name: 'dashboard_dark_v2.fig', size: '3.1 MB', source: 'Google Drive' } },
    { id: 'd3', who: 'ala',    ago: 20, text: 'Looks great! I will add a few comments on the file directly.', react: [{ e: '👍', n: 2 }] },
    { id: 'd4', who: 'sarah',  ago: 1,  text: 'Can we review the mobile flow tomorrow?' }
  ],
  'dev': [
    { id: 'v1', who: 'yassine', ago: 400, text: 'API endpoints are ready for review.', task: 't8' },
    { id: 'v2', who: 'omar',    ago: 380, text: 'I will review them after lunch. @Yassine can you add the error codes to the docs?' },
    { id: 'v3', who: 'yassine', ago: 0,   text: 'Deploying staging now...' }
  ],
  'announcements': [
    { id: 'a1', who: 'ala', ago: 4300, text: 'Welcome to ProTask! The December forum demo is our main goal. Check the Forum Demo project for the plan.' }
  ]
};
DATA.chatActivity = [
  { type: 'mention', who: 'sarah',  ago: 2,  c: 'design-review', text: '@Ala eddine Can you check the Figma file?' },
  { type: 'task',    who: 'omar',   ago: 5,  c: 'dev',           text: 'created the task <b>Set up API endpoints</b>' },
  { type: 'reply',   who: 'lina',   ago: 7,  c: 'design-review', text: 'replied to your comment: “Looks great, let’s align on spacing.”' },
  { type: 'file',    who: 'lina',   ago: 10, c: 'design-review', text: 'shared a file: <b>dashboard_dark_v2.fig</b>' },
  { type: 'join',    who: 'meriem', ago: 15, c: 'general',       text: 'joined the project' }
];

/* Direct messages with the people of the team (id = "dm-" + member id) */
DATA.dmUnread = { walid: 1, sarah: 1 };
DATA.chatSeed['dm-walid'] = [
  { id: 'w1', who: 'walid', ago: 180, text: 'Hey Ala! Did you see the login mockups?' },
  { id: 'w2', who: 'ala',   ago: 170, text: 'Yes, they look good. I want the purple accent a bit stronger on the buttons.' },
  { id: 'w3', who: 'walid', ago: 150, text: 'Agreed. I created a review task for you:', task: 't16' },
  { id: 'w4', who: 'ala',   ago: 60,  text: 'Perfect, I will review it before Friday. Can you prepare the demo script for the forum?' },
  { id: 'w5', who: 'walid', ago: 55,  text: 'On it. Here is the first draft:', file: { name: 'forum_demo_script_v1.docx', size: '96 KB', source: 'Google Drive' } },
  { id: 'w6', who: 'walid', ago: 5,   text: 'Should we rehearse the 5-minute pitch together on Monday?' }
];
DATA.chatSeed['dm-sarah'] = [
  { id: 's1', who: 'sarah', ago: 30, text: 'I added the mobile version of the homepage in the Figma file.' },
  { id: 's2', who: 'ala',   ago: 25, text: 'Great, thank you Sarah. I will have a look this evening.' },
  { id: 's3', who: 'sarah', ago: 3,  text: 'Can we review the mobile flow tomorrow?' }
];
DATA.chatSeed['dm-omar'] = [
  { id: 'o1', who: 'omar', ago: 200, text: 'Staging is up. Tell me if something looks off on your phone.' }
];
/* Threads: replies to a message (key = id of the first message) */
DATA.threads = {
  d0: [
    { id: 'd0r1', who: 'walid',  ago: 175, text: 'Looks great! I think the @mention feature should be highlighted more, in the purple #6647f0 you used.' },
    { id: 'd0r2', who: 'meriem', ago: 170, text: 'I agree. The black rounded button looks perfect. Thumbs up!', react: [{ e: '👍', n: 1 }] },
    { id: 'd0r3', who: 'ala',    ago: 160, text: 'Thanks! I have created a task for the spacing fix.', task: 't15' }
  ]
};

/* Follow-ups: messages that need an action from you (state: open | triaged | done). mid = id of the chat message. */
DATA.followups = [
  { id: 'f1', mid: 'd1', who: 'sarah',  ago: 62,   c: 'design-review', kind: 'mention', text: 'Can you review the onboarding screens before I start prototyping the rest?' },
  { id: 'f2', mid: 'w6', who: 'walid',  ago: 5,    c: 'dm-walid',      kind: 'dm',      text: 'Should we rehearse the 5-minute pitch together on Monday?' },
  { id: 'f3', mid: 'g1', who: 'meriem', ago: 1560, c: 'general',       kind: 'mention', text: 'Please read the kickoff notes before the stand-up.', state: 'triaged' },
  { id: 'f4', mid: 'x1', who: 'yassine',ago: 1450, c: 'dev',           kind: 'file',    text: 'Sprint-3-planning.pdf' },
  { id: 'f5', mid: 'v2', who: 'omar',   ago: 2900, c: 'dev',           kind: 'mention', text: 'Please add the error codes to the API docs.', state: 'done' }
];
/* Notifications of the chat (ago = minutes). type: mention | task | due | reply | file | join | ai */
DATA.chatNotifs = [
  { id: 'cn1', type: 'mention', who: 'sarah',   ago: 2,    c: 'design-review', title: 'Sarah B. mentioned you in #design-review', sub: 'Can you review the login screen mockups?', unread: true },
  { id: 'cn2', type: 'task',    ago: 15,   href: 'board.html?p=p1', title: 'Task assigned to you', sub: 'Design homepage · Website Redesign' },
  { id: 'cn3', type: 'due',     ago: 60,   href: 'board.html?p=p1', title: 'Due tomorrow', sub: 'Write user stories' },
  { id: 'cn4', type: 'reply',   who: 'meriem', ago: 180, c: 'design-review', thread: 'd0', title: 'Meriem H. replied to your thread', sub: 'I agree. The black rounded button looks perfect.' },
  { id: 'cn5', type: 'file',    ago: 300,  c: 'dev', title: 'Yassine M. shared a file', sub: 'Sprint-3-planning.pdf' },
  { id: 'cn6', type: 'join',    ago: 360,  title: 'Sara Mansour requested to join', sub: 'Website Redesign' },
  { id: 'cn7', type: 'ai',      ago: 2880, title: 'ProTask AI summarised 5 unread messages', sub: '', unread: true }
];

/* Planner (agenda). day = days from today, start = "HH:MM", dur = minutes.
   kind: event | task (tid = id of a real task) | focus.  rep: daily | weekday | weekly */
DATA.planner = [
  { id: 'e0', kind: 'event', tag: 'Meeting', title: 'Daily stand-up',      day: -7, start: '09:30', dur: 15,  who: ['ala', 'walid', 'sarah', 'omar'], rep: 'weekday', video: true },
  { id: 'e1', kind: 'event', tag: 'Meeting', title: 'Design review',       day: 0,  start: '09:00', dur: 60,  who: ['ala', 'sarah', 'lina'], video: true },
  { id: 'k1', kind: 'task',  tid: 't4',      day: 0,  start: '10:15', dur: 90 },
  { id: 'f1', kind: 'focus', title: 'Focus time', day: 0, start: '13:30', dur: 120 },
  { id: 'e2', kind: 'event', tag: 'Event',   title: 'Sprint planning',     day: 0,  start: '15:30', dur: 60,  who: ['ala', 'walid', 'omar'] },
  { id: 'e3', kind: 'event', tag: 'Meeting', title: 'Pitch rehearsal',     day: 1,  start: '16:00', dur: 60,  who: ['ala', 'walid'], video: true },
  { id: 'k2', kind: 'task',  tid: 't9',      day: 1,  start: '11:00', dur: 90 },
  { id: 'f2', kind: 'focus', title: 'Focus time', day: 2, start: '10:30', dur: 120 },
  { id: 'e4', kind: 'event', tag: 'Meeting', title: 'Demo script review',  day: 2,  start: '14:00', dur: 60,  who: ['ala', 'walid', 'meriem'], video: true },
  { id: 'e5', kind: 'event', tag: 'Event',   title: 'Sprint review',       day: 3,  start: '10:30', dur: 90,  who: ['ala', 'walid', 'sarah', 'omar', 'lina'] },
  { id: 'k3', kind: 'task',  tid: 't15',     day: 3,  start: '14:00', dur: 60 },
  { id: 'e6', kind: 'event', tag: 'Meeting', title: 'Forum demo dry-run',  day: 4,  start: '11:00', dur: 60,  who: ['ala', 'walid', 'omar', 'meriem', 'sarah'] },
  { id: 'e7', kind: 'event', tag: 'Meeting', title: 'Weekly design sync',  day: -1, start: '10:00', dur: 60,  who: ['ala', 'sarah', 'lina'] }
];
DATA.shared = [
  { id: 's1', title: 'Review the pitch deck',                who: 'walid',  project: 'Forum Demo' },
  { id: 's2', title: 'Translate the landing page to French', who: 'meriem', project: 'Website Redesign' }
];
