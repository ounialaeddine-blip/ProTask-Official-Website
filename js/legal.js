/* =========================================================
   ProTask legal pages – legal.js
   Builds the "On this page" menu from the <h2> titles and
   highlights the section you are reading.
   ========================================================= */
const content = document.querySelector('.legal__content');
const toc = document.querySelector('#toc');

if (content && toc) {
  const headings = content.querySelectorAll('h2');

  headings.forEach((heading, index) => {
    // give every title an id so the menu can link to it
    if (!heading.id) heading.id = 'section-' + (index + 1);
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#' + heading.id;
    link.textContent = heading.textContent;
    item.appendChild(link);
    toc.appendChild(item);
  });

  // mark the link of the section currently on screen
  const links = toc.querySelectorAll('a');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.removeAttribute('aria-current'));
      const active = toc.querySelector('a[href="#' + entry.target.id + '"]');
      if (active) active.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  headings.forEach((heading) => observer.observe(heading));
}
