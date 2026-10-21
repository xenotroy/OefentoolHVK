'use strict';

const chapters = [...document.querySelectorAll('.chapter')];
const chapterLinks = [...document.querySelectorAll('.contents nav a')];
const progress = document.getElementById('reading-progress');
let scheduled = false;
function updateReading() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${scrollable > 0 ? Math.min(100, window.scrollY / scrollable * 100) : 0}%`;
  let current = null;
  for (const chapter of chapters) {
    if (chapter.getBoundingClientRect().top <= 145) current = chapter.id;
  }
  for (const link of chapterLinks) {
    const active = link.hash === `#${current}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  scheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scheduled) { requestAnimationFrame(updateReading); scheduled = true; }
}, { passive: true });
window.addEventListener('resize', updateReading);
updateReading();

const contents = document.getElementById('contents');
const contentsToggle = document.getElementById('open-contents');
function closeContents() {
  contents.classList.remove('open');
  contentsToggle.setAttribute('aria-expanded', 'false');
}
contentsToggle.addEventListener('click', () => {
  const open = !contents.classList.contains('open');
  contents.classList.toggle('open', open);
  contentsToggle.setAttribute('aria-expanded', String(open));
  if (open) document.getElementById('close-contents').focus();
});
document.getElementById('close-contents').addEventListener('click', () => {
  closeContents(); contentsToggle.focus();
});
chapterLinks.forEach(link => link.addEventListener('click', closeContents));
document.addEventListener('click', event => {
  if (!contents.contains(event.target) && !contentsToggle.contains(event.target)) closeContents();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && contents.classList.contains('open')) {
    closeContents(); contentsToggle.focus();
  }
});

const dialog = document.getElementById('search-dialog');
const searchInput = document.getElementById('search-input');
const searchStatus = document.getElementById('search-status');
const searchResults = document.getElementById('search-results');
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('nl');
const index = chapters.map(chapter => ({
  id: chapter.id,
  title: chapter.querySelector('h2').textContent,
  text: chapter.innerText.replace(/\s+/g, ' ').trim()
}));
function openSearch() { closeContents(); dialog.showModal(); searchInput.focus(); }
document.querySelectorAll('.search-trigger').forEach(button => button.addEventListener('click', openSearch));
document.getElementById('close-search').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
searchInput.addEventListener('input', () => {
  const query = normalize(searchInput.value.trim());
  searchResults.replaceChildren();
  if (query.length < 2) { searchStatus.textContent = 'Typ minimaal twee letters.'; return; }
  const matches = index.filter(item => normalize(item.text).includes(query));
  searchStatus.textContent = matches.length ? `${matches.length} ${matches.length === 1 ? 'hoofdstuk gevonden' : 'hoofdstukken gevonden'}.` : 'Geen resultaten. Probeer een ander woord.';
  for (const item of matches) {
    const hit = normalize(item.text).indexOf(query);
    const start = Math.max(0, hit - 65);
    const excerpt = (start ? '…' : '') + item.text.slice(start, hit + query.length + 130) + '…';
    const link = document.createElement('a'); link.href = `#${item.id}`;
    const title = document.createElement('strong'); title.textContent = item.title;
    const preview = document.createElement('p'); preview.textContent = excerpt;
    link.append(title, preview);
    link.addEventListener('click', () => dialog.close());
    searchResults.append(link);
  }
});

const boxes = [...document.querySelectorAll('.checklist input')];
function updateChecks() {
  const checked = boxes.filter(box => box.checked).length;
  document.getElementById('check-count').textContent = `${checked} van ${boxes.length} besproken`;
  document.getElementById('check-bar').style.width = `${checked / boxes.length * 100}%`;
}
boxes.forEach(box => box.addEventListener('change', updateChecks));
document.getElementById('reset-check').addEventListener('click', () => {
  boxes.forEach(box => { box.checked = false; }); updateChecks();
});
updateChecks();

document.getElementById('print-page').addEventListener('click', () => window.print());
document.getElementById('copy-conclusion').addEventListener('click', async () => {
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(document.getElementById('conclusion-text').value.trim());
    status.textContent = 'Invulmodel gekopieerd.';
  } catch (_) {
    status.textContent = 'Kopiëren is hier niet beschikbaar. Selecteer de tekst in het conclusiemodel.';
  }
});
