/* =========================================================
   ProTask – team.js   (used by team.html only)
   EDIT ONLY THE BLOCK BELOW: names, roles, photos, texts, logos.
   ========================================================= */
const TEAM = {
  title: 'The people behind ProTask',
  intro: 'ProTask is built by two founders and guided by two supervisors, as part of our engineering studies.',

  groups: [
    {
      title: 'Founders',
      text: 'The students who started ProTask and build it every day.',
      people: [
        { name: 'Founder name', role: 'Co-founder', bio: 'Add a short sentence about this person.', photo: 'images/team/founder-1.jpg' },
        { name: 'Founder name', role: 'Co-founder', bio: 'Add a short sentence about this person.', photo: 'images/team/founder-2.jpg' }
      ]
    },
    {
      title: 'Supervisors',
      text: 'The teachers who guide the project and review our work.',
      people: [
        { name: 'Supervisor name', role: 'Academic supervisor', bio: 'Add a short sentence about this person.', photo: 'images/team/supervisor-1.jpg' },
        { name: 'Supervisor name', role: 'Academic supervisor', bio: 'Add a short sentence about this person.', photo: 'images/team/supervisor-2.jpg' }
      ]
    }
  ],

  affiliations: {
    title: 'School and community',
    text: 'The places where ProTask is developed and where we learn.',
    // url is optional: leave '' for no link
    items: [
      { label: 'Developed at', name: 'National School of Engineers of Sousse (ENISo)',
        logo: 'images/partners/eniso-logo.svg', url: '' },
      { label: 'Proud member of', name: 'Orange Digital Center Club',
        logo: 'images/partners/orange-digital-center-logo.svg', url: '' }
    ]
  }
};

/* ---------- nothing to edit below this line ---------- */
const root = document.querySelector('#team');

if (root) {
  document.querySelector('#team-title').textContent = TEAM.title;
  document.querySelector('#team-intro').textContent = TEAM.intro;

  const silhouette = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="24" r="11" fill="currentColor"/><path d="M10 64c2-17 12-25 22-25s20 8 22 25z" fill="currentColor"/></svg>';

  const person = (p) => `
    <li class="person">
      <span class="person__photo">${silhouette}<img src="${p.photo}" alt="" width="320" height="320" loading="lazy" onerror="this.remove()"></span>
      <b>${p.name}</b>
      <span>${p.role}</span>
      ${p.bio ? `<p class="person__bio">${p.bio}</p>` : ''}
    </li>`;

  const tile = (a) => {
    const inner = `
      <span class="affil__label">${a.label}</span>
      <img src="${a.logo}" alt="${a.name} logo" height="48">
      <span class="affil__name">${a.name}</span>`;
    return a.url
      ? `<li><a class="affil" href="${a.url}" target="_blank" rel="noopener">${inner}</a></li>`
      : `<li><div class="affil">${inner}</div></li>`;
  };

  const row = (title, text, content) => `
    <section class="team-row" aria-label="${title}">
      <div><h2>${title}</h2><p>${text}</p></div>
      <div>${content}</div>
    </section>`;

  root.innerHTML =
    TEAM.groups.map((g) => row(g.title, g.text, `<ul class="people">${g.people.map(person).join('')}</ul>`)).join('') +
    row(TEAM.affiliations.title, TEAM.affiliations.text, `<ul class="affils">${TEAM.affiliations.items.map(tile).join('')}</ul>`);
}
