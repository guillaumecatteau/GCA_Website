// =============================================================================
// PAGE VIEW — Affichage public d'une page projet / expertise / blog
// =============================================================================
// Chargée via vue/navigation.js (accessPageView) quand une card home est
// cliquée, ou via un deep-link /p/{slug}. Rend le cover + les blocs de
// contenu (texte, galerie en carrousel) à gauche, et les infos (titre,
// client, dates, tags) à droite.
// =============================================================================
(function () {
  'use strict';

  let _currentPage = null; // dernière page chargée — permet de ré-afficher sans refetch au changement de langue

  const _CATEGORY_LABEL = {
    projet:    { fr: 'Projet',    en: 'Project' },
    expertise: { fr: 'Expertise', en: 'Expertise' },
    blog:      { fr: 'Blog',      en: 'Blog' },
  };

  function _renderCategoryTitle(type, isEn) {
    const el = document.getElementById('pageViewCategoryTitle');
    if (!el) return;
    const label = _CATEGORY_LABEL[type] || null;
    const text = label ? (isEn ? label.en : label.fr) : '';
    el.innerHTML = '';
    text.split('').forEach(ch => {
      const span = document.createElement('span');
      span.textContent = ch;
      el.appendChild(span);
    });
    window.titleDisplay?.(el);
  }

  // Positionne/dimensionne la cover pour couvrir toute sa box (même logique que l'éditeur)
  function _layoutCover(wrap, img, page) {
    if (!img.naturalWidth || !img.naturalHeight) return;
    const boxW = wrap.clientWidth, boxH = wrap.clientHeight;
    if (!boxW || !boxH) return;
    const baseScale = Math.max(boxW / img.naturalWidth, boxH / img.naturalHeight);
    const userScale = parseFloat(page.cover_scale) || 1;
    const effScale  = baseScale * userScale;
    const renderedW = img.naturalWidth  * effScale;
    const renderedH = img.naturalHeight * effScale;
    const slackX = Math.max(0, renderedW - boxW);
    const slackY = Math.max(0, renderedH - boxH);
    const posX = page.cover_pos_x !== null && page.cover_pos_x !== undefined ? parseFloat(page.cover_pos_x) : 0.5;
    const posY = page.cover_pos_y !== null && page.cover_pos_y !== undefined ? parseFloat(page.cover_pos_y) : 0.5;
    img.style.width  = renderedW + 'px';
    img.style.height = renderedH + 'px';
    img.style.left   = (-posX * slackX) + 'px';
    img.style.top    = (-posY * slackY) + 'px';
  }

  function _buildCover(page) {
    const wrap = document.createElement('div');
    wrap.className = 'pageViewCover';
    if (!page.cover_path) return wrap;
    const img = document.createElement('img');
    img.src = page.cover_path;
    img.alt = '';
    img.addEventListener('load', () => _layoutCover(wrap, img, page));
    wrap.appendChild(img);
    if (img.complete) _layoutCover(wrap, img, page);
    window.addEventListener('resize', () => _layoutCover(wrap, img, page));
    return wrap;
  }

  function _buildTextBlock(block, isEn) {
    const p = document.createElement('div');
    p.className = 'pageViewTextBlock' + (+block.is_intro ? ' pageViewTextBlock--intro' : '');
    p.innerHTML = (isEn ? (block.content_en || block.content_fr) : (block.content_fr || block.content_en)) || '';
    return p;
  }

  function _buildMediaBlock(block) {
    const wrap = document.createElement('div');
    wrap.className = 'pageViewGallery';
    if (!block.media_path) return wrap;
    const box = document.createElement('div');
    box.className = 'pageViewCarouselMain';
    const img = document.createElement('img');
    img.src = block.media_path; img.alt = '';
    box.appendChild(img);
    wrap.appendChild(box);
    return wrap;
  }

  function _buildGalleryBlock(block) {
    const items = (block.gallery || []).filter(g => g.file_path);
    const wrap = document.createElement('div');
    wrap.className = 'pageViewGallery';
    if (!items.length) return wrap;

    const carousel = document.createElement('div');
    carousel.className = 'pageViewCarousel';
    const btnPrev = document.createElement('button');
    btnPrev.type = 'button'; btnPrev.className = 'pageViewCarouselNav'; btnPrev.innerHTML = '&#8249;';
    const mainBox = document.createElement('div');
    mainBox.className = 'pageViewCarouselMain';
    const mainImg = document.createElement('img'); mainImg.alt = '';
    mainBox.appendChild(mainImg);
    const btnNext = document.createElement('button');
    btnNext.type = 'button'; btnNext.className = 'pageViewCarouselNav'; btnNext.innerHTML = '&#8250;';
    carousel.appendChild(btnPrev); carousel.appendChild(mainBox); carousel.appendChild(btnNext);

    const thumbsWrap = document.createElement('div');
    thumbsWrap.className = 'pageViewCarouselThumbs';
    const thumbEls = items.map((it, i) => {
      const th = document.createElement('div');
      th.className = 'pageViewCarouselThumb';
      const im = document.createElement('img'); im.loading = 'lazy'; im.src = it.file_path;
      th.appendChild(im);
      th.addEventListener('click', () => _setCarouselIdx(i));
      thumbsWrap.appendChild(th);
      return th;
    });

    let idx = 0;
    function _setCarouselIdx(i) {
      idx = (i + items.length) % items.length;
      mainImg.src = items[idx].file_path;
      thumbEls.forEach((el, ei) => el.classList.toggle('pageViewCarouselThumb--active', ei === idx));
    }
    btnPrev.addEventListener('click', () => _setCarouselIdx(idx - 1));
    btnNext.addEventListener('click', () => _setCarouselIdx(idx + 1));
    _setCarouselIdx(0);

    wrap.appendChild(carousel);
    wrap.appendChild(thumbsWrap);
    return wrap;
  }

  function _buildDetailRow(labelFr, labelEn, value, isEn) {
    if (!value) return null;
    const row = document.createElement('div');
    row.className = 'pageViewDetailRow';
    const lbl = document.createElement('span');
    lbl.className = 'pageViewDetailLabel';
    lbl.textContent = isEn ? labelEn : labelFr;
    const val = document.createElement('span');
    val.className = 'pageViewDetailValue';
    val.textContent = value;
    row.appendChild(lbl); row.appendChild(val);
    return row;
  }

  function _renderSide(side, page, isEn) {
    side.innerHTML = '';
    const title = document.createElement('h1');
    title.className = 'pageViewTitle';
    title.textContent = isEn ? (page.title_en || page.title_fr) : (page.title_fr || page.title_en);
    side.appendChild(title);

    const tags = page.tags || [];
    const jobTags      = tags.filter(t => t.category === 'job').map(t => isEn ? (t.title_en || t.title_fr) : (t.title_fr || t.title_en));
    const categoryTags  = tags.filter(t => t.category === 'category').map(t => isEn ? (t.title_en || t.title_fr) : (t.title_fr || t.title_en));
    const client = (page.experiences || []).map(e => isEn ? (e.title_en || e.title_fr) : (e.title_fr || e.title_en)).join(', ');
    const dateRange = page.type === 'projet'
      ? window._fmtDateRange?.(page.date_start, page.date_end, isEn)
      : window._fmtDate?.((page.date_publication || '').slice(0, 10), isEn);

    [
      _buildDetailRow('Client', 'Client', client, isEn),
      _buildDetailRow('Date de production', 'Production date', dateRange, isEn),
      _buildDetailRow('Crédité en tant que', 'Credited as', jobTags.join(', '), isEn),
      _buildDetailRow('Catégorie', 'Category', categoryTags.join(', '), isEn),
    ].forEach(row => { if (row) side.appendChild(row); });
  }

  function _renderMain(main, page, isEn) {
    main.innerHTML = '';
    main.appendChild(_buildCover(page));
    const body = document.createElement('div');
    body.className = 'pageViewBody';
    (page.blocks || []).forEach(block => {
      if (block.block_type === 'text')    body.appendChild(_buildTextBlock(block, isEn));
      if (block.block_type === 'media')   body.appendChild(_buildMediaBlock(block));
      if (block.block_type === 'gallery') body.appendChild(_buildGalleryBlock(block));
    });
    main.appendChild(body);
  }

  window._loadPageView = function (slug) {
    const main = document.getElementById('pageViewMain');
    const side = document.getElementById('pageViewSide');
    if (!main || !side) return;
    main.innerHTML = ''; side.innerHTML = '';
    fetch(`controller/controller.php?action=admin_pages&sub=get_by_slug&slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(json => {
        if (!json.success) return;
        _currentPage = json.page;
        const isEn = document.documentElement.lang === 'en';
        _renderCategoryTitle(json.page.type, isEn);
        _renderMain(main, json.page, isEn);
        _renderSide(side, json.page, isEn);
      })
      .catch(() => {});
  };

  window._unloadPageView = function () {
    // Le contenu est effacé par _loadPageView juste avant le rendu suivant —
    // ne pas le vider ici, sinon le fade-out de hideContent() n'a plus rien à animer.
  };

  // Ré-affiche le contenu déjà chargé dans la langue active, sans refetch
  document.addEventListener('languagechange', (e) => {
    if (!_currentPage) return;
    const main = document.getElementById('pageViewMain');
    const side = document.getElementById('pageViewSide');
    if (!main || !side) return;
    const isEn = e.detail.lang === 'en';
    _renderCategoryTitle(_currentPage.type, isEn);
    _renderMain(main, _currentPage, isEn);
    _renderSide(side, _currentPage, isEn);
  });
})();
