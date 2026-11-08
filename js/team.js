/* =========================================================
   ProTask – team.js
   Builds the "people behind ProTask" section on every page.
   EDIT ONLY THE BLOCK BELOW: names, roles, photos, logos.
   ========================================================= */
const TEAM = {
  title: 'The people behind ProTask',
  intro: 'Two founders and two supervisors, building ProTask as part of our engineering studies.',

  founders: [
    { name: 'Founder name',  role: 'Co-founder', photo: 'images/team/founder-1.jpg' },
    { name: 'Founder name',  role: 'Co-founder', photo: 'images/team/founder-2.jpg' }
  ],
  supervisors: [
    { name: 'Supervisor name', role: 'Academic supervisor', photo: 'images/team/supervisor-1.jpg' },
    { name: 'Supervisor name', role: 'Academic supervisor', photo: 'images/team/supervisor-2.jpg' }
  ],

  // url is optional: leave '' for no link
  affiliations: [
    { label: 'Developed at', name: 'National School of Engineers of Sousse (ENISo)',
      logo: 'images/partners/eniso-logo.svg', url: '' },
    { label: 'Proud member of', name: 'Orange Digital Center Club',
      logo: 'images/partners/orange-digital-center-logo.svg', url: '' }
  ]
};

/* ---------- nothing to edit below this line ---------- */
const teamRoot = document.querySelector('#team');

if (teamRoot) {
  const silhouette = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="24" r="11" fill="currentColor"/><path d="M10 64c2-17 12-25 22-25s20 8 22 25z" fill="currentColor"/></svg>';

  const person = (p) => `
    <li class="person">
      <span class="person__photo">${silhouette}<img src="${p.photo}" alt="" width="240" height="240" loading="lazy" onerror="this.remove()"></span>
      <b>${p.name}</b>
      <span>${p.role}</span>
    </li>`;

  const group = (title, people) => `
    <div class="team__group">
      <h3>${title}</h3>
      <ul class="people">${people.map(person).join('')}</ul>
    </div>`;

  const tile = (a) => {
    const inner = `
      <span class="affil__label">${a.label}</span>
      <img src="${a.logo}" alt="${a.name} logo" height="48">
      <span class="affil__name">${a.name}</span>`;
    return a.url
      ? `<li><a class="affil" href="${a.url}" target="_blank" rel="noopener">${inner}</a></li>`
      : `<li><div class="affil">${inner}</div></li>`;
  };

  teamRoot.innerHTML = `
    <div>
      <div class="section__head">
        <h2 id="team-title">${TEAM.title}</h2>
        <p>${TEAM.intro}</p>
      </div>
      <div class="team__groups">
        ${group('Founders', TEAM.founders)}
        ${group('Supervisors', TEAM.supervisors)}
      </div>
      <ul class="affils">${TEAM.affiliations.map(tile).join('')}</ul>
    </div>`;
}
