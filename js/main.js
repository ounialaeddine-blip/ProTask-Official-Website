/* =========================================================
   ProTask landing page – main.js
   Three small features, each in its own block (each one is skipped on pages that do not have it):
   1. Mobile menu (hamburger)
   2. Monthly / yearly pricing switch
   3. Contact form validation
   ========================================================= */

/* ---------- 1. Mobile menu ---------- */
const menuButton = document.querySelector('.nav__toggle');
const menuLinks  = document.querySelector('.nav__links');

if (menuButton && menuLinks) menuButton.addEventListener('click', () => {
  // classList.toggle returns true when the class was added
  const isOpen = menuLinks.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', isOpen);
});

// close the menu after tapping a link
if (menuLinks) menuLinks.addEventListener('click', (event) => {
  if (event.target.tagName === 'A') {
    menuLinks.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
});

/* ---------- 2. Pricing switch ---------- */
const billingButtons = document.querySelectorAll('.billing__btn');
const switchablePrices = document.querySelectorAll('[data-month]');
const periodLabels = document.querySelectorAll('[data-period-label]');

billingButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const period = button.dataset.period;            // "month" or "year"

    billingButtons.forEach((b) => {
      b.setAttribute('aria-pressed', b === button ? 'true' : 'false');
    });

    switchablePrices.forEach((price) => {
      price.textContent = price.dataset[period];     // data-month / data-year
    });

    periodLabels.forEach((label) => {
      label.textContent = period === 'month' ? 'per user / month' : 'per user / month, billed yearly';
    });
  });
});

/* ---------- 3. Contact form ---------- */
const form   = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');

function showError(input, message) {
  const field = input.closest('.field');
  field.classList.add('field--error');
  field.querySelector('.field__msg').textContent = message;
}

function clearError(input) {
  input.closest('.field').classList.remove('field--error');
}

if (form) form.addEventListener('submit', (event) => {
  event.preventDefault();                            // stop the page from reloading
  status.textContent = '';

  const name    = form.elements.name;
  const email   = form.elements.email;
  const message = form.elements.message;
  let valid = true;

  [name, email, message].forEach(clearError);

  if (name.value.trim().length < 2) {
    showError(name, 'Enter your name.');
    valid = false;
  }
  // simple email check: something@something.something
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    showError(email, 'Enter a valid email address, like name@school.tn.');
    valid = false;
  }
  if (message.value.trim().length < 10) {
    showError(message, 'Write at least 10 characters.');
    valid = false;
  }

  if (!valid) return;

  // Later this is where you will send the data to your back end (fetch + REST API).
  status.textContent = 'Message sent. We will reply by email.';
  form.reset();
});
