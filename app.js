// app.js — Portafolio María José Duarte Torres
// Funciones: loadJSON, renderSlider, bindSliderControls, openModal, equalizeHeights

// -----------------------------
// Config global de secciones (nuevo orden)
// -----------------------------
const sections = [
  {
    key: 'podcast',
    json: 'content/podcast.json',
    sliderId: 'slider-podcast',
    dotsId: 'dots-podcast',
    tagsId: 'podcast-tags', // filtros visibles en Podcast
    filterable: true,
  },
  {
    key: 'arquitectura',
    json: 'content/architecture.json',
    sliderId: 'slider-arquitectura',
    dotsId: 'dots-arquitectura',
    tagsId: 'arquitectura-tags',
    filterable: true,
  },
  {
    key: 'investigacion',
    json: 'content/research.json',
    sliderId: 'slider-investigacion',
    dotsId: 'dots-investigacion',
    filterable: false,
  },
  {
    key: 'programas',
    json: 'content/code.json',
    sliderId: 'slider-programas',
    dotsId: 'dots-programas',
    tagsId: 'programas-tags',
    filterable: true,
  },
];

// -----------------------------
// Estado global
// -----------------------------
const state = {
  data: {},
  filters: { arquitectura: null, programas: null, podcast: null },
  modals: { open: false, lastFocus: null }
};

// -----------------------------
// Loader
// -----------------------------
function showLoader(show = true) {
  document.getElementById('loader').classList.toggle('active', show);
}

// -----------------------------
// Tema (claro/oscuro)
// -----------------------------
function setTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.classList.toggle('light', theme === 'light');
  localStorage.setItem('theme', theme);
  document.getElementById('themeIcon').textContent = theme === 'dark' ? '🌚' : '🌞';
}
function toggleTheme() {
  const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  setTheme(current === 'dark' ? 'light' : 'dark');
}
document.getElementById('themeToggle').addEventListener('click', toggleTheme);
(function () {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(saved || (prefersDark ? 'dark' : 'light'));
})();

// -----------------------------
// Helpers
// -----------------------------
function spotifyEmbedFrom(url) {
  if (!url) return null;
  const ep = url.match(/open\.spotify\.com\/episode\/([A-Za-z0-9]+)/);
  if (ep) return `https://open.spotify.com/embed/episode/${ep[1]}`;
  const show = url.match(/open\.spotify\.com\/show\/([A-Za-z0-9]+)/);
  if (show) return `https://open.spotify.com/embed/show/${show[1]}`;
  return null;
}
function cleanText(t = '') {
  return t.replace(/【[^】]*】/g, '').replace(/\s+/g, ' ').trim();
}
function truncate(t = '', n = 200) {
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
}
function throttle(fn, wait = 150) {
  let t = 0;
  return (...args) => {
    const now = Date.now();
    if (now - t > wait) { t = now; fn(...args); }
  };
}

// -----------------------------
// Carga de datos JSON
// -----------------------------
async function loadJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('No se pudo cargar: ' + url);
    return await res.json();
  } catch (e) {
    return [];
  }
}

// -----------------------------
// Renderizado de sliders
// -----------------------------
async function renderSlider(section) {
  showLoader(true);
  const data = await loadJSON(section.json);
  state.data[section.key] = data;

  const slider = document.getElementById(section.sliderId);
  if (!slider) return;
  slider.innerHTML = '';

  let items = data;

  // Filtros
  if (section.filterable && state.filters[section.key]) {
    items = items.filter(item =>
      (item.tags || []).includes(state.filters[section.key])
    );
  }

  if (items.length === 0) {
    slider.innerHTML = `<div class="card"><div class="card-body">No hay elementos disponibles.</div></div>`;
  } else {
    items.forEach((item, idx) => {
      let cardHtml = '';
      if (section.key === 'arquitectura') cardHtml = arquitecturaCard(item, idx);
      if (section.key === 'programas')     cardHtml = programasCard(item, idx);
      if (section.key === 'investigacion') cardHtml = investigacionCard(item, idx);
      if (section.key === 'podcast')       cardHtml = podcastCard(item, idx);
      slider.insertAdjacentHTML('beforeend', cardHtml);
    });
  }

  bindSliderControls(section, items.length);
  if (section.filterable) renderTags(section, data);

  // Igualar alturas
  setTimeout(() => equalizeHeights(section), 0);

  showLoader(false);
}

// -----------------------------
// Tarjetas (card-body con flex column; card-bottom al fondo)
// -----------------------------
function arquitecturaCard(item, idx) {
  return `
    <div class="card" tabindex="0" aria-label="${item.title}">
      <img src="${item.cover}" alt="Cover de ${item.title}" class="card-img">
      <div class="card-body" style="display:flex;flex-direction:column;height:100%;">
        <div>
          <div class="card-title">${item.title}</div>
          <div class="card-meta">${item.location}, ${item.year}</div>
          <div class="card-tags">${(item.tags||[]).map(t=>`<button class="card-tag" tabindex="-1">${t}</button>`).join('')}</div>
          <div class="card-summary">${item.summary}</div>
        </div>
        <div class="card-bottom" style="margin-top:auto;">
          <button class="card-btn" data-modal="arquitectura" data-idx="${idx}" aria-label="Ver más sobre ${item.title}">Ver más</button>
        </div>
      </div>
    </div>`;
}
function programasCard(item, idx) {
  return `
    <div class="card" tabindex="0" aria-label="${item.title}">
      <img src="${item.cover}" alt="Cover de ${item.title}" class="card-img">
      <div class="card-body" style="display:flex;flex-direction:column;height:100%;">
        <div>
          <div class="card-title">${item.title}</div>
          <div class="card-meta">${(item.stack||[]).join(', ')}</div>
          <div class="card-tags">${(item.tags||[]).map(t=>`<button class="card-tag" tabindex="-1">${t}</button>`).join('')}</div>
          <div class="card-summary">${item.summary}</div>
        </div>
        <div class="card-bottom" style="margin-top:auto;">
          <div>
            ${item.links?.github ? `<a href="${item.links.github}" class="card-btn" target="_blank" rel="noopener">GitHub</a>` : ''}
            ${item.links?.demo ? `<a href="${item.links.demo}" class="card-btn" target="_blank" rel="noopener">Demo</a>` : ''}
          </div>
          <button class="card-btn" data-modal="programas" data-idx="${idx}" aria-label="Ver más sobre ${item.title}">Ver más</button>
        </div>
      </div>
    </div>`;
}
function investigacionCard(item, idx) {
  return `
    <div class="card" tabindex="0" aria-label="${item.title}">
      <div class="card-body" style="display:flex;flex-direction:column;height:100%;">
        <div>
          <div class="card-title">${item.title}</div>
          <div class="card-meta">${item.year}</div>
          <div class="card-tags">${(item.keywords||[]).map(t=>`<span class="card-tag">${t}</span>`).join('')}</div>
          <div class="card-summary">${item.summary}</div>
        </div>
        <div class="card-bottom" style="margin-top:auto;">
          <div>
            ${item.pdf ? `<a href="${item.pdf}" class="card-btn" target="_blank" rel="noopener">PDF</a>` : ''}
            ${item.links?.doi ? `<a href="${item.links.doi}" class="card-btn" target="_blank" rel="noopener">DOI</a>` : ''}
          </div>
        </div>
      </div>
    </div>`;
}
function podcastCard(item, idx) {
  const embed = spotifyEmbedFrom(item.spotifyUrl);
  return `
    <div class="card" tabindex="0" aria-label="${item.title}">
      <div class="card-body" style="display:flex;flex-direction:column;height:100%;">
        <div>
          <div class="card-title">${item.title}</div>
          <div class="card-meta">${item.date || ''}</div>
          <div class="card-tags">${(item.tags||[]).map(t=>`<span class="card-tag">${t}</span>`).join('')}</div>
        </div>
        <div class="card-bottom" style="margin-top:auto;">
          <button class="card-btn mt-3" data-modal="podcast" data-idx="${idx}" aria-label="Saber más sobre ${item.title}">Saber más</button>
          ${embed ? `
            <div class="mt-3">
              <iframe
                src="${embed}"
                width="100%"
                height="80"
                frameborder="0"
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                title="Spotify"
                style="border-radius:0.75rem;"
              ></iframe>
            </div>
          ` : ''}
        </div>
      </div>
    </div>`;
}

// -----------------------------
// Renderizado de tags/chips
// -----------------------------
function renderTags(section, data) {
  const container = document.getElementById(section.tagsId);
  if (!container) return;

  const allTags = [...new Set([].concat(...data.map(d => d.tags || [])))];
  container.innerHTML = allTags.map(tag =>
    `<button class="tag-chip${state.filters[section.key] === tag ? ' active' : ''}" data-tag="${tag}">${tag}</button>`
  ).join('');

  container.querySelectorAll('.tag-chip').forEach(btn => {
    btn.onclick = () => {
      const t = btn.getAttribute('data-tag');
      state.filters[section.key] = state.filters[section.key] === t ? null : t;
      renderSlider(section);
    };
  });
}

// -----------------------------
// Controles de slider/carousel
// -----------------------------
function bindSliderControls(section, count) {
  const slider = document.getElementById(section.sliderId);
  if (!slider) return;

  const prevBtn = document.querySelector(`[data-section="${section.key}"].slider-prev`);
  const nextBtn = document.querySelector(`[data-section="${section.key}"].slider-next`);

  let pageIdx = 0;

  function updateDots() {
    const dotsDiv = document.getElementById(section.dotsId);
    if (!dotsDiv) return;
    dotsDiv.querySelectorAll('.slider-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === pageIdx);
    });
  }

  function scrollToIdx(idx) {
    pageIdx = Math.max(0, Math.min(idx, count - 1));
    const card = slider.children[pageIdx];
    if (card) {
      const targetLeft = card.offsetLeft - slider.offsetLeft;
      slider.scrollTo({ left: targetLeft, behavior: 'smooth' }); // solo X
    }
    updateDots();
  }

  if (prevBtn && nextBtn) {
    prevBtn.onclick = (e) => { e.preventDefault(); scrollToIdx(pageIdx - 1); };
    nextBtn.onclick = (e) => { e.preventDefault(); scrollToIdx(pageIdx + 1); };
  }

  // Dots
  const dotsDiv = document.getElementById(section.dotsId);
  if (dotsDiv) {
    dotsDiv.innerHTML = '';
    for (let i = 0; i < count; i++) {
      dotsDiv.innerHTML += `<button class="slider-dot${i === pageIdx ? ' active' : ''}" data-idx="${i}" aria-label="Ir a tarjeta ${i+1}"></button>`;
    }
    dotsDiv.querySelectorAll('.slider-dot').forEach(dot => {
      dot.onclick = (e) => {
        e.preventDefault();
        scrollToIdx(Number(dot.getAttribute('data-idx')));
      };
    });
  }

  // Actualiza dot en scroll manual
  slider.onscroll = () => {
    const scrollLeft = slider.scrollLeft;
    let idx = 0;
    for (let i = 0; i < slider.children.length; i++) {
      if (slider.children[i].offsetLeft - slider.offsetLeft <= scrollLeft + 2) idx = i;
    }
    pageIdx = idx;
    updateDots();
  };

  // Modal “Saber más”
  slider.querySelectorAll('.card-btn[data-modal]').forEach(btn => {
    btn.onclick = () => openModal(section.key, Number(btn.getAttribute('data-idx')));
  });
}

// -----------------------------
// Igualar alturas de tarjetas
// -----------------------------
function equalizeHeights(section) {
  const slider = document.getElementById(section.sliderId);
  if (!slider) return;

  const cards = Array.from(slider.querySelectorAll('.card'));
  if (!cards.length) return;

  // reset heights
  cards.forEach(c => (c.style.height = ''));

  // medir alturas reales
  const max = Math.max(...cards.map(c => c.getBoundingClientRect().height));
  cards.forEach(c => (c.style.height = `${Math.ceil(max)}px`));
}

// Recalcular en resize (con throttle)
window.addEventListener('resize', throttle(() => {
  sections.forEach(equalizeHeights);
}, 200));

// -----------------------------
// Modales accesibles
// -----------------------------
function openModal(sectionKey, idx) {
  const modalOverlay = document.getElementById('modalOverlay');
  const modalContent = document.getElementById('modalContent');

  state.modals.open = true;
  state.modals.lastFocus = document.activeElement;

  modalOverlay.classList.add('active');
  modalOverlay.tabIndex = -1;
  modalOverlay.focus();

  const item = state.data[sectionKey][idx];
  let html = '';

  if (sectionKey === 'arquitectura') {
    html = `
      <h4 class="text-xl font-bold mb-1">${item.title}</h4>
      <div>${item.location}, ${item.year}</div>
      <div class="mb-2">${item.summary}</div>
      <div><b>Tags:</b> ${(item.tags || []).join(', ')}</div>
      <div><b>Roles:</b> ${(item.roles || []).join(', ')}</div>
      <div class="mb-2"><b>Imágenes:</b></div>
      <div class="flex gap-2 mb-2">${(item.images||[]).map(img=>`<img src="${img}" alt="Imagen ${item.title}" style="width:90px;height:90px;object-fit:cover;border-radius:0.6em;">`).join('')}</div>
      ${item.pdf ? `<a href="${item.pdf}" class="card-btn" target="_blank" rel="noopener">Ficha PDF</a>` : ''}
    `;
  }

  if (sectionKey === 'programas') {
    html = `
      <h4 class="text-xl font-bold mb-1">${item.title}</h4>
      <div><b>Stack:</b> ${(item.stack || []).join(', ')}</div>
      <div class="mb-2">${item.summary}</div>
      <div><b>Tags:</b> ${(item.tags || []).join(', ')}</div>
      <div class="mb-2"><b>Imágenes:</b></div>
      <div class="flex gap-2 mb-2">${(item.images||[]).map(img=>`<img src="${img}" alt="Imagen ${item.title}" style="width:90px;height:90px;object-fit:cover;border-radius:0.6em;">`).join('')}</div>
      <div>
        ${item.links?.github ? `<a href="${item.links.github}" class="card-btn" target="_blank" rel="noopener">GitHub</a>` : ''}
        ${item.links?.demo ? `<a href="${item.links.demo}" class="card-btn" target="_blank" rel="noopener">Demo</a>` : ''}
      </div>
    `;
  }

  if (sectionKey === 'investigacion') {
    html = `
      <h4 class="text-xl font-bold mb-1">${item.title}</h4>
      <div><b>Año:</b> ${item.year}</div>
      <div class="mb-2">${item.summary}</div>
      <div><b>Palabras clave:</b> ${(item.keywords || []).join(', ')}</div>
      <div>
        ${item.pdf ? `<a href="${item.pdf}" class="card-btn" target="_blank" rel="noopener">PDF</a>` : ''}
        ${item.links?.doi ? `<a href="${item.links.doi}" class="card-btn" target="_blank" rel="noopener">DOI</a>` : ''}
      </div>
    `;
  }

  if (sectionKey === 'podcast') {
    const embed = spotifyEmbedFrom(item.spotifyUrl);
    html = `
      <h4 class="text-xl font-bold mb-1">${item.title}</h4>
      <div>${item.date || ''}</div>
      <div class="mb-2">${cleanText(item.description || '')}</div>
      ${embed ? `<iframe src="${embed}" width="100%" height="232" frameborder="0" allow="encrypted-media" title="Spotify"></iframe>` : ''}
    `;
  }

  modalContent.innerHTML = html;
  document.body.style.overflow = 'hidden';
  modalContent.focus();
}

// Cierre modal
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
  state.modals.open = false;
  if (state.modals.lastFocus) state.modals.lastFocus.focus();
}
document.getElementById('modalClose').onclick = closeModal;
document.getElementById('modalOverlay').onclick = function (e) {
  if (e.target === this) closeModal();
};
document.addEventListener('keydown', function (e) {
  if (state.modals.open && e.key === 'Escape') closeModal();
});

// -----------------------------
// Botón scroll a primera sección (Podcast)
// -----------------------------
document.getElementById('exploreBtn').onclick = function () {
  document.getElementById('podcast').scrollIntoView({ behavior: 'smooth' });
};

// -----------------------------
// Contacto: mailto
// -----------------------------
document.getElementById('contactForm').onsubmit = function (e) {
  e.preventDefault();
  const nombre = this.nombre.value.trim();
  const email = this.email.value.trim();
  const mensaje = this.mensaje.value.trim();
  let valid = true;
  if (!nombre || !email || !mensaje) valid = false;
  if (!email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/)) valid = false;
  const status = document.getElementById('formStatus');
  if (!valid) {
    status.textContent = 'Por favor, completa todos los campos correctamente.';
    return;
  }
  const mailto = `mailto:dmajoto@gmail.com?subject=Contacto%20Portafolio%20de%20${encodeURIComponent(nombre)}&body=${encodeURIComponent(mensaje + '\n\nCorreo: ' + email)}`;
  window.location.href = mailto;
  status.textContent = '¡Gracias por tu mensaje!';
  this.reset();
};

// -----------------------------
// Inicialización: Renderiza sliders
// -----------------------------
sections.forEach(renderSlider);
