// =============================================================================
// SECTION GALLERIE — Galerie de la home (cf. vue/carousel.js + vue/gallery-common.js)
// =============================================================================
(function () {
  'use strict';

  let _carousel = null;
  let _medias = [];
  let _filters = [];
  let _activeFilterId = null;
  let _thumbsWrap = null;
  let _initialized = false;

  function _isEn() { return document.documentElement.lang === 'en'; }

  function _renderSlot(media, slot) {
    slot.innerHTML = '';
    if (!media) return;
    const path = media.type === 'youtube' ? (media.alt_text || '') : media.file_path;
    const media_ = document.createElement('div');
    media_.className = 'pfSlotMedia';
    if (media.type !== 'youtube' && path) {
      const img = document.createElement('img');
      img.src = path;
      img.alt = '';
      img.loading = 'lazy';
      media_.appendChild(img);
    }
    const dark = document.createElement('div');
    dark.className = 'pfSlotDark';
    media_.appendChild(dark);
    slot.appendChild(media_);

    slot.addEventListener('click', () => {
      if (slot.dataset.offset !== '0') return;
      if (media.type === 'youtube') {
        window.open(media.file_path, '_blank', 'noopener');
        return;
      }
      window.GCAGallery?.openFullscreenViewer(media.file_path, media.alt_text || '');
    });
  }

  function _updateDetails(media) {
    const details = document.getElementById('galleryDetails');
    if (!details || !media) return;
    details.innerHTML = '';

    const text = document.createElement('div');
    text.className = 'galleryDetailsText';

    const year = media.year || (media.uploaded_at || '').slice(0, 4);
    if (year) {
      const yearEl = document.createElement('span');
      yearEl.className = 'galleryDetailsYear';
      yearEl.textContent = year;
      text.appendChild(yearEl);
    }
    const projectTitle = _isEn() ? (media.project_title_en || media.project_title_fr) : (media.project_title_fr || media.project_title_en);
    if (projectTitle) {
      const titleEl = document.createElement('span');
      titleEl.className = 'galleryDetailsProject';
      titleEl.textContent = projectTitle;
      text.appendChild(titleEl);
    }
    const desc = _isEn() ? (media.description_en || media.description_fr) : (media.description_fr || media.description_en);
    if (desc) {
      const descEl = document.createElement('span');
      descEl.className = 'galleryDetailsDesc';
      descEl.textContent = desc;
      text.appendChild(descEl);
    }
    details.appendChild(text);

    const btnShare = document.createElement('button');
    btnShare.type = 'button';
    btnShare.className = 'btnShare galleryDetailsShare';
    btnShare.title = 'Partager / Share';
    btnShare.dataset.shareType = 'media';
    btnShare.dataset.shareImage = media.file_path;
    btnShare.dataset.shareTitle = projectTitle || document.title;
    btnShare.innerHTML = '<span class="icon iconShare"></span>';
    details.appendChild(btnShare);
  }

  function _buildCarousel() {
    const track = document.getElementById('galleryCarouselTrack');
    const holder = document.getElementById('galleryThumbsHolder');
    if (!track || !holder) return;
    holder.innerHTML = '';

    if (!_medias.length) {
      track.innerHTML = `<p class="adminPlaceholder">${_isEn() ? 'No media yet.' : 'Aucun média pour le moment.'}</p>`;
      document.getElementById('galleryDetails').innerHTML = '';
      return;
    }

    _thumbsWrap = window.GCAGallery.buildThumbStrip(_medias, {
      getThumbPath: window._getThumbPath,
      onSelect: (i) => _carousel?.goTo(i),
      activeIndex: 0,
    });
    holder.appendChild(_thumbsWrap);

    _carousel = new window.GCACarousel({
      track,
      items: _medias,
      renderSlot: _renderSlot,
      onSettle: (media) => {
        _updateDetails(media);
        const idx = _medias.indexOf(media);
        _thumbsWrap?.setActive?.(idx);
        window.GCAGallery.preloadAround(_medias, idx, (m) => m.file_path);
      },
      swipeThreshold: 50,
    });

    document.getElementById('btnGalleryPrev')?.addEventListener('click', () => _carousel.prev());
    document.getElementById('btnGalleryNext')?.addEventListener('click', () => _carousel.next());
  }

  function _loadMedias(expertiseId) {
    const params = expertiseId ? `?expertise_id=${expertiseId}` : '';
    fetch(`controller/controller.php?action=gallery_public&sub=list${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        _medias = json.medias || [];
        _buildCarousel();
      })
      .catch(() => {});
  }

  function _buildFilterButton(filter, isAll) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'galleryFilterBtn' + (isAll ? ' galleryFilterBtn--active' : '');
    const icon = document.createElement('span');
    icon.className = 'icon ' + (isAll ? 'iconGalleries' : '');
    if (!isAll && filter.expertise_icon_path) {
      icon.style.backgroundImage = `url(${filter.expertise_icon_path})`;
      icon.style.webkitMaskImage = 'none';
      icon.style.maskImage = 'none';
      icon.style.backgroundSize = 'contain';
      icon.style.backgroundRepeat = 'no-repeat';
      icon.style.backgroundPosition = 'center';
    }
    btn.appendChild(icon);
    btn.title = isAll ? (_isEn() ? 'All' : 'Tout') : (_isEn() ? (filter.title_en || filter.title_fr) : (filter.title_fr || filter.title_en));
    btn.addEventListener('click', () => {
      document.querySelectorAll('.galleryFilterBtn').forEach((b) => b.classList.remove('galleryFilterBtn--active'));
      btn.classList.add('galleryFilterBtn--active');
      _activeFilterId = isAll ? null : filter.id;
      _loadMedias(_activeFilterId);
    });
    return btn;
  }

  function _loadFilters() {
    const container = document.getElementById('galleryFilters');
    if (!container) return;
    fetch('controller/controller.php?action=gallery_public&sub=filters')
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        _filters = json.filters || [];
        container.innerHTML = '';
        container.appendChild(_buildFilterButton(null, true));
        _filters.forEach((f) => container.appendChild(_buildFilterButton(f, false)));
      })
      .catch(() => {});
  }

  window._initGallerySection = function () {
    if (_initialized) return;
    _initialized = true;
    _loadFilters();
    _loadMedias(null);
  };
})();
