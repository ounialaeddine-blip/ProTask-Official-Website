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

  // The two logos shown side by side at the top of the page (left to right).
  // url is optional: leave '' for no link
  partners: [
    { name: 'École Nationale d\'Ingénieurs de Sousse (ENISo)', logo: 'images/partners/eniso-logo.png', url: '' },
    { name: 'Orange Digital Center Club ENISo', logo: 'images/partners/odc-club-eniso.jpg', url: '', rounded: true }
  ]
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

  // logos separated by a thin vertical line, like a partnership
  const logo = (p) => {
    const img = `<img class="${p.rounded ? 'partner__img partner__img--round' : 'partner__img'}" src="${p.logo}" alt="${p.name}">`;
    return p.url ? `<a href="${p.url}" target="_blank" rel="noopener">${img}</a>` : img;
  };
  const partners = `
    <div class="partners">${TEAM.partners.map(logo).join('<span class="partners__line" aria-hidden="true"></span>')}</div>`;

  const row = (title, text, content) => `
    <section class="team-row" aria-label="${title}">
      <div><h2>${title}</h2><p>${text}</p></div>
      <div>${content}</div>
    </section>`;

  root.innerHTML = partners +
    TEAM.groups.map((g) => row(g.title, g.text, `<ul class="people">${g.people.map(person).join('')}</ul>`)).join('');
}
