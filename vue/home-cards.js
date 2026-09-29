// =============================================================================
// HOME — Cards dynamiques des sections Expertises / Portfolio / Blog
// =============================================================================
// Chaque section affiche les pages visibles du type correspondant, via une
// card indépendante par type (voir .pageCard--expertise/projet/blog).
// =============================================================================
(function () {
  'use strict';

  const _SECTIONS = [
    { type: 'expertise', gridId: 'expertiseCards' },
    { type: 'projet',    gridId: 'portfolioCards' },
    { type: 'blog',      gridId: 'blogCards' },
  ];

  let _cachedPages = {}; // type -> pages[] — permet de ré-afficher sans refetch au changement de langue

  async function _fetchAndRenderHomeCards() {
    const isEn = document.documentElement.lang === 'en';
    await Promise.all(_SECTIONS.map(async ({ type, gridId }) => {
      const grid = document.getElementById(gridId);
      if (!grid) return;
      try {
        const res  = await fetch(`controller/controller.php?action=admin_pages&sub=list&type=${type}&visible_only=1`);
        const json = await res.json();
        if (!json.success) return;
        _cachedPages[type] = json.pages || [];
        _renderCards(grid, _cachedPages[type], type, isEn);
      } catch (_) {}
    }));
    window._refreshSectionScrollUI?.();
  }

  document.addEventListener('languagechange', (e) => {
    const isEn = e.detail.lang === 'en';
    _SECTIONS.forEach(({ type, gridId }) => {
      const grid = document.getElementById(gridId);
      if (grid && _cachedPages[type]) _renderCards(grid, _cachedPages[type], type, isEn);
    });
    window._refreshSectionScrollUI?.();
  });

  function _renderCards(grid, pages, type, isEn) {
    grid.innerHTML = '';
    if (!pages.length) {
      grid.innerHTML = `<p class="adminPlaceholder">${isEn ? 'No content yet.' : 'Aucun contenu pour le moment.'}</p>`;
      return;
    }
    pages.forEach(page => grid.appendChild(_buildCard(page, type, isEn)));
  }

  function _buildCard(page, type, isEn) {
    const card = document.createElement('div');
    card.className = `pageCard pageCard--${type}`;
    card.dataset.pageId = page.id;
    if (page.slug) {
      card.addEventListener('click', () => window.accessPageView?.(page.slug));
    }

    const title     = isEn ? (page.title_en || page.title_fr) : (page.title_fr || page.title_en);
    // Média card si défini, sinon fallback sur le média cover
    const rawPath   = page.card_path || page.cover_path || '';
    const thumbPath = rawPath ? window._getThumbPath?.(rawPath) || rawPath : '';
    const dateLabel = type === 'projet'
      ? window._fmtDateRange?.(page.date_start, page.date_end, isEn)
      : window._fmtDate?.((page.date_publication || page.updated_at || '').slice(0, 10), isEn);

    const mediaHtml = document.createElement('div');
    mediaHtml.className = 'pageCardMedia';
    if (thumbPath) {
      const img = document.createElement('img');
      img.src = thumbPath; img.alt = ''; img.loading = 'lazy';
      img.onerror = () => { img.src = rawPath; };
      mediaHtml.appendChild(img);
    }

    const info = document.createElement('div');
    info.className = 'pageCardInfo';
    const titleEl = document.createElement('span');
    titleEl.className = 'pageCardTitle';
    titleEl.textContent = title || '';
    info.appendChild(titleEl);
    // Description carte — uniquement pour les pages expertise
    if (type === 'expertise') {
      const desc = isEn ? (page.subtitle_en || page.subtitle_fr) : (page.subtitle_fr || page.subtitle_en);
      if (desc) {
        const descEl = document.createElement('span');
        descEl.className = 'pageCardDesc';
        descEl.textContent = desc;
        info.appendChild(descEl);
      }
    }
    if (dateLabel) {
      const dateEl = document.createElement('span');
      dateEl.className = 'pageCardDate';
      dateEl.textContent = dateLabel;
      info.appendChild(dateEl);
    }

    card.appendChild(mediaHtml);
    card.appendChild(info);
    return card;
  }

  // Exposée pour être appelée depuis navigation.js à chaque affichage de la home
  window._loadHomeCards = _fetchAndRenderHomeCards;
})();
