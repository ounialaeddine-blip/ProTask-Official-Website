/* =========================================================
   ProTask – onboarding (3 steps shown once after sign-up)
   Needs js/auth.js first (it provides setError and the language buttons).
   Nothing is sent to a server yet: look for "TODO API".
   ========================================================= */
(function () {
  const form = document.querySelector('#onboarding-form');
  if (!form) return;

  const NEXT_PAGE = 'index.html';              // TODO: change to 'dashboard.html' when that page exists
  const steps = Array.from(form.querySelectorAll('.step'));
  const counter = document.querySelector('#step-count');
  let current = 1;

  // full name comes from the account (saved by the register page)
  try {
    const saved = sessionStorage.getItem('protask.name');
    if (saved) form.elements.fullName.value = saved;
  } catch (e) { /* storage blocked: the field simply stays empty */ }

  function show(n, focus = true) {
    current = n;
    steps.forEach((s) => { s.hidden = Number(s.dataset.step) !== n; });
    counter.textContent = `Step ${n} of ${steps.length}`;
    if (history.replaceState) history.replaceState(null, '', n === 1 ? location.pathname : `#step-${n}`);
    if (focus) {
      const h = steps[n - 1].querySelector('h1');
      h.setAttribute('tabindex', '-1');
      h.focus({ preventScroll: true });
    }
  }

  // required dropdowns of a step: show an error under each empty one
  function validate(n) {
    let ok = true;
    steps[n - 1].querySelectorAll('select[required]').forEach((sel) => {
      const bad = !sel.value;
      setError(sel, bad ? 'Choose an option.' : '');
      if (bad) ok = false;
    });
    const firstBad = steps[n - 1].querySelector('[aria-invalid="true"]');
    if (firstBad) firstBad.focus();
    return ok;
  }

  form.querySelectorAll('select').forEach((sel) => sel.addEventListener('change', () => setError(sel, '')));
  form.querySelectorAll('[data-next]').forEach((b) => b.addEventListener('click', () => { if (validate(current)) show(current + 1); }));
  form.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', () => show(current - 1)));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (current < steps.length) { if (validate(current)) show(current + 1); return; }
    if (!validate(current)) return;

    const profile = Object.fromEntries(new FormData(form).entries());
    const button = document.querySelector('#finish');
    button.disabled = true;
    button.textContent = 'Setting up your workspace…';
    try { localStorage.setItem('protask.profile', JSON.stringify(profile)); } catch (err) { /* ignore */ }
    // TODO API: PATCH /api/profile with `profile`, then redirect
    setTimeout(() => { window.location.href = NEXT_PAGE; }, 700);
  });

  // open directly on a step with onboarding.html#step-2 (only steps already reachable)
  const start = Number((location.hash.match(/step-(\d)/) || [])[1]) || 1;
  show(Math.min(start, steps.length), false);
})();
