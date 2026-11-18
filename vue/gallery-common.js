// =============================================================================
// GALLERY COMMON — Logique partagée entre les galeries de page (page-view) et la
// Section Gallerie de la home (cf. "le système des galeries doit être unifié").
// =============================================================================
(function () {
  'use strict';

  /**
   * Construit une bande de miniatures (toujours en version "thumb", jamais le lead/full
   * — cf. chargement progressif) — empilée verticalement avec barre de défilement sur
   * desktop, en ligne horizontale avec barre de défilement sur mobile (cf. CSS .galleryThumbs).
   */
  function buildThumbStrip(items, { getThumbPath, onSelect, activeIndex = 0 } = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'galleryThumbs';
    const els = items.map((item, i) => {
      const th = document.createElement('div');
      th.className = 'galleryThumb';
      th.classList.toggle('galleryThumb--active', i === activeIndex);
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = '';
      const rawPath = item.file_path || item.cover_path || '';
      img.src = getThumbPath ? (getThumbPath(rawPath) || rawPath) : rawPath;
      img.onerror = () => { img.onerror = null; img.src = rawPath; };
      th.appendChild(img);
      th.addEventListener('click', () => onSelect?.(i));
      wrap.appendChild(th);
      return th;
    });
    wrap.setActive = (i) => {
      els.forEach((el, ei) => el.classList.toggle('galleryThumb--active', ei === i));
      els[i]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    };
    return wrap;
  }

  /**
   * Préchargement progressif : ne précharge QUE l'élément consulté et celui qui suit
   * directement (cf. "précharger uniquement les éléments qui suivent directement").
   */
  function preloadAround(items, index, getFullPath) {
    const next = items[(index + 1) % items.length];
    if (next) {
      const path = getFullPath ? getFullPath(next) : (next.file_path || next.cover_path);
      if (path) { const img = new Image(); img.src = path; }
    }
  }

  /**
   * Visionneuse plein écran (flou du site + superposition dark 50%, bouton retour) —
   * cf. demande : "une image highlightée si cliquée passera en mode plein écran".
   */
  function openFullscreenViewer(imageUrl, altText) {
    let overlay = document.getElementById('galleryFullscreenOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'galleryFullscreenOverlay';
      overlay.className = 'galleryFullscreen';
      const img = document.createElement('img');
      img.className = 'galleryFullscreenImg';
      const btnBack = document.createElement('button');
      btnBack.type = 'button';
      btnBack.className = 'galleryFullscreenBack';
      btnBack.innerHTML = '<span class="icon iconBack"></span>';
      btnBack.addEventListener('click', closeFullscreenViewer);
      overlay.appendChild(img);
      overlay.appendChild(btnBack);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) closeFullscreenViewer(); });
      document.body.appendChild(overlay);
    }
    overlay.querySelector('.galleryFullscreenImg').src = imageUrl;
    overlay.querySelector('.galleryFullscreenImg').alt = altText || '';
    overlay.classList.add('galleryFullscreen--open');
    window.displayBackBlurMask?.();
  }

  function closeFullscreenViewer() {
    const overlay = document.getElementById('galleryFullscreenOverlay');
    if (overlay) overlay.classList.remove('galleryFullscreen--open');
    window.hideBackBlurMask?.();
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFullscreenViewer();
  });

  window.GCAGallery = { buildThumbStrip, preloadAround, openFullscreenViewer, closeFullscreenViewer };
})();
