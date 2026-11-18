// =============================================================================
// SECTION PORTFOLIO — Carrousel des projets (cf. vue/carousel.js)
// =============================================================================
(function () {
  'use strict';

  let _carousel = null;
  let _pages = [];

  function _fmtYearRange(start, end, isEn) {
    const sy = (start || '').slice(0, 4);
    const ey = (end || '').slice(0, 4);
    if (!sy) return '';
    if (!ey || ey === sy) return sy;
    return isEn ? `from ${sy} to ${ey}` : `de ${sy} à ${ey}`;
  }

  function _jobList(page, isEn) {
    const jobs = (page.tags || []).filter((t) => t.category === 'job');
    return jobs.map((t) => (isEn ? (t.title_en || t.title_fr) : (t.title_fr || t.title_en))).join(', ');
  }

  function _renderSlot(page, slot, offset) {
    slot.innerHTML = '';
    if (!page) return;
    const isEn = document.documentElement.lang === 'en';

    const media = document.createElement('div');
    media.className = 'pfSlotMedia';
    const rawPath = page.card_path || page.cover_path || '';
    if (rawPath) {
      const img = document.createElement('img');
      img.src = rawPath;
      img.alt = '';
      img.loading = offset === 0 ? 'eager' : 'lazy';
      media.appendChild(img);
    }
    const dark = document.createElement('div');
    dark.className = 'pfSlotDark';
    media.appendChild(dark);
    slot.appendChild(media);

    if (page.slug) {
      slot.addEventListener('click', () => {
        if (slot.dataset.offset !== '0') return; // seul le slot central est cliquable (navigation gère le reste)
        window.accessPageView?.(page.slug);
      });
    }

    const info = document.createElement('div');
    info.className = 'pfSlotInfo';

    const title = document.createElement('span');
    title.className = 'pfSlotTitle';
    title.textContent = isEn ? (page.title_en || page.title_fr) : (page.title_fr || page.title_en);
    info.appendChild(title);

    const years = _fmtYearRange(page.date_start, page.date_end, isEn);
    if (years) {
      const yearsEl = document.createElement('span');
      yearsEl.className = 'pfSlotYears';
      yearsEl.textContent = years;
      info.appendChild(yearsEl);
    }

    const jobs = _jobList(page, isEn);
    if (jobs) {
      const jobsEl = document.createElement('span');
      jobsEl.className = 'pfSlotJobs';
      jobsEl.textContent = `${isEn ? 'Credited as' : 'Crédité en tant que'} : ${jobs}`;
      info.appendChild(jobsEl);
    }

    const btn = document.createElement('div');
    btn.className = 'btnMedium pfSlotViewBtn';
    btn.innerHTML = `<div class="btnLabel"><span class="btnText">${isEn ? 'View the project' : 'Voir le projet'}</span></div>`;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (page.slug) window.accessPageView?.(page.slug);
    });
    info.appendChild(btn);

    slot.appendChild(info);
  }

  function _buildCarousel() {
    const track = document.getElementById('portfolioCarouselTrack');
    if (!track) return;
    if (!_pages.length) {
      track.innerHTML = `<p class="adminPlaceholder">${document.documentElement.lang === 'en' ? 'No project yet.' : 'Aucun projet pour le moment.'}</p>`;
      return;
    }
    _carousel = new window.GCACarousel({
      track,
      items: _pages,
      renderSlot: _renderSlot,
      playIntroTour: true,
      swipeThreshold: 50,
    });

    document.getElementById('btnPortfolioPrev')?.addEventListener('click', () => _carousel.prev());
    document.getElementById('btnPortfolioNext')?.addEventListener('click', () => _carousel.next());
  }

  window._initPortfolioCarousel = function () {
    fetch('controller/controller.php?action=admin_pages&sub=list&type=projet&visible_only=1&with_tags=1')
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        _pages = json.pages || [];
        _buildCarousel();
      })
      .catch(() => {});
  };

  // Réaffiche le slot central dans la nouvelle langue sans refaire défiler le carrousel.
  document.addEventListener('languagechange', () => {
    if (!_carousel || !_pages.length) return;
    _carousel.slots.forEach((slot) => { slot.dataset.itemId = ''; });
    _carousel._layout(false);
    const activeSlot = _carousel.slots[_carousel.visibleRadius];
    activeSlot.querySelector('.pfSlotInfo')?.classList.add('pfSlotInfo--visible');
  });
})();
