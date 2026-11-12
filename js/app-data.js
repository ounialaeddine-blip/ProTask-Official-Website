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
    { id: 'sarah',  name: 'Sarah B.',   role: 'Designer',      color: '#e0457b', status: 'online' },
    { id: 'omar',   name: 'Omar T.',    role: 'Developer',     color: '#0091ff', status: 'online' },
    { id: 'lina',   name: 'Lina K.',    role: 'Designer',      color: '#078d3b', status: 'away' },
    { id: 'yassine',name: 'Yassine M.', role: 'Backend',       color: '#fc6d2d', status: 'offline' },
    { id: 'meriem', name: 'Meriem H.',  role: 'Marketing',     color: '#0f8b8d', status: 'online' },
    { id: 'nour',   name: 'Nour A.',    role: 'Researcher',    color: '#8a5cf6', status: 'offline' }
  ],
  teams: [
    { name: 'Design team', members: ['sarah', 'lina', 'ala'] },
    { name: 'Dev team',    members: ['omar', 'yassine'] }
  ],
  pendingInvites: 2,
  projects: [
    { id: 'p1', name: 'Website Redesign', color: '#6647f0', desc: 'Redesign our marketing website to improve user experience and increase conversions.', members: ['ala', 'sarah', 'omar', 'lina', 'yassine', 'meriem', 'nour'] },
    { id: 'p2', name: 'Mobile App',       color: '#0091ff', desc: 'First mobile version of ProTask for team members on the go.', members: ['ala', 'omar', 'lina'] },
    { id: 'p3', name: 'Forum Demo',       color: '#078d3b', desc: 'Prototype and 5-minute demo for the enterprise forum in December.', members: ['ala', 'omar', 'meriem', 'sarah'] },
    { id: 'p4', name: 'User Research',    color: '#fc6d2d', desc: 'Interviews with team leaders and members of the region.', members: ['ala', 'nour', 'meriem'] }
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
    { id: 'm1',  p: 'p2', title: 'Define app scope',            status: 'progress', priority: 'High',   label: 'Documentation', who: 'ala',     due: 5,  upd: 1, comments: 2, files: 0 },
    { id: 'm2',  p: 'p2', title: 'Wireframe onboarding',        status: 'todo',     priority: 'Medium', label: 'Design',        who: 'lina',    due: 7,  upd: 0, comments: 0, files: 0 },
    { id: 'm3',  p: 'p2', title: 'Choose navigation pattern',   status: 'review',   priority: 'Medium', label: 'Design',        who: 'omar',    due: 3,  upd: 1, comments: 1, files: 0 },
    { id: 'm4',  p: 'p2', title: 'Draft user flows',            status: 'done',     priority: 'Low',    label: 'Design',        who: 'lina',    due: -4, upd: 3, comments: 0, files: 1 },
    { id: 'f1',  p: 'p3', title: 'Prepare demo script',         status: 'progress', priority: 'High',   label: 'Content',       who: 'meriem',  due: 4,  upd: 0, comments: 1, files: 1 },
    { id: 'f2',  p: 'p3', title: 'Seed demo data',              status: 'todo',     priority: 'Medium', label: 'Backend',       who: 'omar',    due: 6,  upd: 0, comments: 0, files: 0 },
    { id: 'f3',  p: 'p3', title: 'Rehearse the 5-minute pitch', status: 'todo',     priority: 'High',   label: 'Content',       who: 'ala',     due: 12, upd: 0, comments: 0, files: 0 },
    { id: 'f4',  p: 'p3', title: 'Record backup video',         status: 'todo',     priority: 'Low',    label: 'Content',       who: 'sarah',   due: 14, upd: 0, comments: 0, files: 0 },
    { id: 'f5',  p: 'p3', title: 'Book the presentation room',  status: 'done',     priority: 'Low',    label: 'Documentation', who: 'meriem',  due: -3, upd: 3, comments: 0, files: 0 },
    { id: 'r1',  p: 'p4', title: 'Interview team leaders',      status: 'progress', priority: 'High',   label: 'Content',       who: 'nour',    due: -2, upd: 3, comments: 2, files: 1 },
    { id: 'r2',  p: 'p4', title: 'Summarize findings',          status: 'todo',     priority: 'Medium', label: 'Documentation', who: 'nour',    due: -1, upd: 5, comments: 0, files: 0 },
    { id: 'r3',  p: 'p4', title: 'Recruit 8 participants',      status: 'progress', priority: 'Medium', label: 'Content',       who: 'meriem',  due: -3, upd: 4, comments: 1, files: 0 },
    { id: 'r4',  p: 'p4', title: 'Write interview guide',       status: 'done',     priority: 'Low',    label: 'Documentation', who: 'ala',     due: -8, upd: 8, comments: 0, files: 1 }
  ],
  inbox: [
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
