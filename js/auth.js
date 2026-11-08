/* =========================================================
   ProTask – auth pages (login, register, forgot / reset password)
   One file, one block per page. A block only runs when its form exists on the page.
   Nothing is sent to a server yet: look for "TODO API" to see where the REST calls will go.
   ========================================================= */

/* ---------- helpers ---------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COMMON_PASSWORDS = ['password1234', '123456789012', 'azertyuiop12', 'qwertyuiop12', 'protask12345'];

function setError(input, message) {
  const box = input.closest('.af');
  box.classList.toggle('af--error', Boolean(message));
  const msg = box.querySelector('.af__msg');
  if (msg) msg.textContent = message || '';
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
}

// "blur-first": show the error when the user leaves the field, clear it as soon as they fix it
function watch(input, check) {
  input.addEventListener('blur', () => setError(input, check()));
  input.addEventListener('input', () => { if (input.closest('.af--error')) setError(input, check()); });
}

const checkEmail = (input) => () =>
  !input.value.trim() ? 'Enter your email address.'
  : !EMAIL_RE.test(input.value.trim()) ? 'Enter a valid email, like name@school.tn.' : '';

const checkPassword = (input) => () => {
  const v = input.value;
  if (!v) return 'Enter a password.';
  if (v.length < 12) return 'Use at least 12 characters.';
  if (COMMON_PASSWORDS.includes(v.toLowerCase())) return 'This password is too common. Choose another one.';
  return '';
};

function fakeRequest() {            // TODO API: replace with fetch('/api/...') later
  return new Promise((resolve) => setTimeout(resolve, 600));
}

function busy(button, isBusy, label) {
  button.disabled = isBusy;
  if (label) button.textContent = isBusy ? 'Please wait…' : label;
}

// show / hide password buttons
document.querySelectorAll('.af__show').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = btn.parentElement.querySelector('input');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.textContent = show ? 'Hide' : 'Show';
    btn.setAttribute('aria-pressed', show);
  });
});

// language switch: only changes the highlighted button for now (texts are written in English)
document.querySelectorAll('.auth__lang button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.auth__lang button').forEach((b) => b.setAttribute('aria-pressed', b === btn));
    // TODO: swap the texts here (FR / EN)
  });
});

// move between the two screens of a page (form -> "check your inbox")
function showState(name) {
  document.querySelectorAll('.state').forEach((s) => { s.hidden = s.dataset.state !== name; });
  const heading = document.querySelector(`.state[data-state="${name}"] h1`);
  if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
}

/* ---------- 1. Login ---------- */
const loginForm = document.querySelector('#login-form');
if (loginForm) {
  const email = loginForm.elements.email;
  const password = loginForm.elements.password;
  const alertBox = document.querySelector('#login-alert');
  watch(email, checkEmail(email));
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.classList.remove('is-visible');
    const eMsg = checkEmail(email)();
    const pMsg = password.value ? '' : 'Enter your password.';
    setError(email, eMsg); setError(password, pMsg);
    if (eMsg || pMsg) return;

    const button = loginForm.querySelector('button[type=submit]');
    busy(button, true, 'Log in');
    await fakeRequest();
    busy(button, false, 'Log in');
    // TODO API: POST /api/auth/login. If the server answers 401, show the banner:
    //   alertBox.classList.add('is-visible'); setError(email, ' '); setError(password, ' ');
    // On success: redirect to the dashboard.
    window.location.href = 'index.html';
  });
}

/* ---------- 2. Register ---------- */
const registerForm = document.querySelector('#register-form');
if (registerForm) {
  const { name, email, password, terms } = registerForm.elements;
  const rules = document.querySelector('#pw-rules');

  function updateRules() {
    const v = password.value;
    rules.querySelector('[data-rule=length]').classList.toggle('is-ok', v.length >= 12);
    rules.querySelector('[data-rule=common]').classList.toggle('is-ok', v.length >= 12 && !COMMON_PASSWORDS.includes(v.toLowerCase()));
  }
  password.addEventListener('input', updateRules);

  const checkName = () => (name.value.trim().length < 2 ? 'Enter your full name.' : '');
  const checkTerms = () => (terms.checked ? '' : 'Accept the terms and the privacy policy to continue.');
  watch(name, checkName); watch(email, checkEmail(email)); watch(password, checkPassword(password));
  terms.addEventListener('change', () => setError(terms, checkTerms()));

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgs = [[name, checkName()], [email, checkEmail(email)()], [password, checkPassword(password)()], [terms, checkTerms()]];
    msgs.forEach(([input, msg]) => setError(input, msg));
    const firstBad = msgs.find(([, msg]) => msg);
    if (firstBad) { firstBad[0].focus(); return; }

    const button = registerForm.querySelector('button[type=submit]');
    busy(button, true, 'Create account');
    await fakeRequest();                 // TODO API: POST /api/auth/register (the server sends the 24 h verification link)
    document.querySelector('#verify-email').textContent = email.value.trim();
    showState('verify');
    busy(button, false, 'Create account');
  });

  // resend with a 60 s cooldown (the server must also limit the number of resends)
  const resend = document.querySelector('#resend');
  if (resend) resend.addEventListener('click', async () => {
    resend.disabled = true;
    await fakeRequest();                 // TODO API: POST /api/auth/resend-verification
    let left = 60;
    const timer = setInterval(() => {
      resend.textContent = `Resend in ${left}s`;
      if (--left < 0) { clearInterval(timer); resend.disabled = false; resend.textContent = 'Resend email'; }
    }, 1000);
  });
  const different = document.querySelector('#different-email');
  if (different) different.addEventListener('click', () => { showState('form'); email.focus(); });
}

/* ---------- 3. Forgot password ---------- */
const forgotForm = document.querySelector('#forgot-form');
if (forgotForm) {
  const email = forgotForm.elements.email;
  watch(email, checkEmail(email));
  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = checkEmail(email)();
    setError(email, msg);
    if (msg) { email.focus(); return; }
    const button = forgotForm.querySelector('button[type=submit]');
    busy(button, true, 'Send reset link');
    await fakeRequest();                 // TODO API: POST /api/auth/forgot (single-use link, valid 1 hour)
    document.querySelector('#sent-email').textContent = email.value.trim();
    showState('sent');                   // same neutral message whether the account exists or not
    busy(button, false, 'Send reset link');
  });
  const again = document.querySelector('#resend-link');
  if (again) again.addEventListener('click', async (e) => { e.preventDefault(); await fakeRequest(); again.textContent = 'link sent again'; });
}

/* ---------- 4. Reset password ---------- */
const resetForm = document.querySelector('#reset-form');
if (resetForm) {
  const { password, confirm } = resetForm.elements;
  const rules = document.querySelector('#pw-rules');
  const matchRule = rules.querySelector('[data-rule=match]');

  function updateRules() {
    const v = password.value;
    rules.querySelector('[data-rule=length]').classList.toggle('is-ok', v.length >= 12);
    rules.querySelector('[data-rule=common]').classList.toggle('is-ok', v.length >= 12 && !COMMON_PASSWORDS.includes(v.toLowerCase()));
    matchRule.classList.toggle('is-ok', v.length > 0 && v === confirm.value);
  }
  password.addEventListener('input', updateRules);
  confirm.addEventListener('input', updateRules);

  const checkConfirm = () => (confirm.value !== password.value ? 'The two passwords do not match.' : '');
  watch(password, checkPassword(password)); watch(confirm, checkConfirm);

  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pMsg = checkPassword(password)();
    const cMsg = checkConfirm();
    setError(password, pMsg); setError(confirm, cMsg);
    if (pMsg || cMsg) return;
    const button = resetForm.querySelector('button[type=submit]');
    busy(button, true, 'Save new password');
    // TODO API: POST /api/auth/reset with the token from the link (?token=...). The server logs the user out everywhere.
    await fakeRequest();
    showState('done');
    busy(button, false, 'Save new password');
  });
}
