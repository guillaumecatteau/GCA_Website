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
      const im = document.createElement('img'); im.loading = 'lazy';
      im.src = window._getThumbPath?.(it.file_path) || it.file_path;
      im.onerror = () => { im.onerror = null; im.src = it.file_path; };
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

  // ── Right panel display — box "Related experiences" (timeline verticale) ────
  function _appendExperiencesTimeline(box, experiences, isEn) {
    if (!experiences || !experiences.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'pageViewTimeline';
    const sorted = [...experiences].sort((a, b) => {
      const aOn = !a.date_end, bOn = !b.date_end;
      if (aOn !== bOn) return aOn ? -1 : 1;
      return (b.date_start || '').localeCompare(a.date_start || '');
    });
    sorted.forEach(exp => {
      const item = document.createElement('div');
      item.className = 'pageViewTimelineItem';
      const dot = document.createElement('span');
      dot.className = 'pageViewTimelineDot';
      const body = document.createElement('div');
      body.className = 'pageViewTimelineBody';
      const titleEl = document.createElement('span');
      titleEl.className = 'pageViewTimelineTitle';
      titleEl.textContent = isEn ? (exp.title_en || exp.title_fr) : (exp.title_fr || exp.title_en);
      const dateEl = document.createElement('span');
      dateEl.className = 'pageViewTimelineDate';
      dateEl.textContent = window._fmtDateRange?.(exp.date_start, exp.date_end, isEn) || '';
      body.appendChild(titleEl); body.appendChild(dateEl);
      item.appendChild(dot); item.appendChild(body);
      wrap.appendChild(item);
    });
    box.appendChild(wrap);
  }

  // ── Right panel display — cards indépendantes des cards home, personnalisables séparément ──
  function _buildRelCard(item, cardType, isEn) {
    const card = document.createElement('div');
    card.className = `pageViewRelCard pageViewRelCard--${cardType}`;
    if (item.slug) card.addEventListener('click', () => window.accessPageView?.(item.slug));

    const rawPath   = item.card_path || item.cover_path || '';
    const thumbPath = rawPath ? (window._getThumbPath?.(rawPath) || rawPath) : '';
    const media = document.createElement('div');
    media.className = 'pageViewRelCardMedia';
    if (thumbPath) {
      const img = document.createElement('img');
      img.src = thumbPath; img.alt = ''; img.loading = 'lazy';
      img.onerror = () => { img.src = rawPath; };
      media.appendChild(img);
    }

    const info = document.createElement('div');
    info.className = 'pageViewRelCardInfo';
    const titleEl = document.createElement('span');
    titleEl.className = 'pageViewRelCardTitle';
    titleEl.textContent = isEn ? (item.title_en || item.title_fr) : (item.title_fr || item.title_en);
    info.appendChild(titleEl);
    const desc = isEn ? (item.subtitle_en || item.subtitle_fr) : (item.subtitle_fr || item.subtitle_en);
    if (desc) {
      const descEl = document.createElement('span');
      descEl.className = 'pageViewRelCardDesc';
      descEl.textContent = desc;
      info.appendChild(descEl);
    }
    const dateLabel = cardType === 'projet'
      ? window._fmtDateRange?.(item.date_start, item.date_end, isEn)
      : window._fmtDate?.((item.date_publication || '').slice(0, 10), isEn);
    if (dateLabel) {
      const dateEl = document.createElement('span');
      dateEl.className = 'pageViewRelCardDate';
      dateEl.textContent = dateLabel;
      info.appendChild(dateEl);
    }
    card.appendChild(media); card.appendChild(info);
    return card;
  }

  // Seuils responsive — DOIVENT rester synchronisés avec $bp-mobile / $bp-header (_variables.scss)
  const _BP_MOBILE = 800;
  const _BP_HEADER = 1917; // seuil réel du passage en menu burger (@include wide-header)
  // Carrousel (auto-play, une card centrée) en desktop ET mobile ; simple liste scrollable
  // (pas d'auto-play, plusieurs cards visibles) sur la plage "tablette" entre les deux.
  function _isTabletListMode() {
    const w = window.innerWidth;
    return w > _BP_MOBILE && w <= _BP_HEADER;
  }

  // Carrousel auto-play — chaque projet est sa PROPRE card, le navigateur défile nativement
  // (overflow-x + scroll-snap : drag/swipe/molette fonctionnent comme n'importe quel scroll).
  // Boucle en continu dans le même sens (jamais de retour arrière brutal) grâce à une carte clone
  // ajoutée de chaque côté : on scrolle jusqu'au clone puis on saute sans animation vers la vraie card.
  // Retourne { carousel, nav, dots } — nav/dots sont null s'il n'y a qu'une seule card (rien à naviguer),
  // ou en mode "liste tablette" (pas d'auto-play/boucle, juste une rangée scrollable de cards).
  function _buildRelCarousel(items, cardType, isEn) {
    const wrap = document.createElement('div');
    const tabletList = _isTabletListMode();
    wrap.className = 'pageViewRelCarousel' + (tabletList ? ' pageViewRelCarousel--list' : '');

    // Mode liste tablette : pas de clone/boucle/auto-play, juste les vraies cards, scroll natif libre.
    if (tabletList) {
      items.forEach(item => wrap.appendChild(_buildRelCard(item, cardType, isEn)));
      return { carousel: wrap, nav: null, dots: null };
    }

    const loop = items.length > 1;

    const cards = [];
    if (loop) cards.push(_buildRelCard(items[items.length - 1], cardType, isEn));
    items.forEach(item => cards.push(_buildRelCard(item, cardType, isEn)));
    if (loop) cards.push(_buildRelCard(items[0], cardType, isEn));
    cards.forEach(c => wrap.appendChild(c));

    let pos = loop ? 1 : 0; // index réel dans les cards étendues (0 = clone du dernier, dernier = clone du premier)
    let timer = null;
    let settleTimer = null;
    const dotEls = [];
    const _realIdx = (p) => (p - 1 + items.length) % items.length;
    const _setActiveDot = (p) => { dotEls.forEach((d, i) => d.classList.toggle('pageViewRelCarouselDot--active', i === _realIdx(p))); };
    // scrollTo (PAS scrollIntoView, qui remonte aussi les ancêtres verticaux et faisait défiler
    // toute la page à chaque tick de l'auto-play) : ne touche jamais que le carrousel lui-même.
    const _scrollTo = (p, smooth) => {
      pos = p;
      const card = cards[p];
      const left = card.offsetLeft - (wrap.clientWidth - card.offsetWidth) / 2;
      wrap.scrollTo({ left, behavior: smooth ? 'smooth' : 'instant' });
      _setActiveDot(p);
    };
    // Après chaque scroll (auto-play, boutons, ou drag/swipe manuel), une fois le mouvement
    // terminé : si l'utilisateur a atterri sur une card clone (bord), saute sans animation vers
    // l'équivalent réel — sinon resynchronise juste l'index/dot actif sur la position réelle.
    wrap.addEventListener('scroll', () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        const viewportCenter = wrap.scrollLeft + wrap.clientWidth / 2;
        let nearest = 0, nearestDist = Infinity;
        cards.forEach((c, i) => {
          const dist = Math.abs((c.offsetLeft + c.offsetWidth / 2) - viewportCenter);
          if (dist < nearestDist) { nearestDist = dist; nearest = i; }
        });
        if (loop && nearest === items.length + 1) _scrollTo(1, false);
        else if (loop && nearest === 0) _scrollTo(items.length, false);
        else { pos = nearest; _setActiveDot(pos); }
      }, 120);
    });
    const _stopAutoplay = () => { if (timer) { clearInterval(timer); timer = null; } };
    const _startAutoplay = () => {
      if (!loop) return;
      timer = setInterval(() => _scrollTo(pos + 1, true), 5000);
    };

    let nav = null;
    let dots = null;
    if (loop) {
      nav = document.createElement('div');
      nav.className = 'pageViewRelBoxNav';
      const btnPrev = document.createElement('button');
      btnPrev.type = 'button'; btnPrev.className = 'pageViewCarouselNav';
      btnPrev.innerHTML = '&#8249;';
      const btnNext = document.createElement('button');
      btnNext.type = 'button'; btnNext.className = 'pageViewCarouselNav';
      btnNext.innerHTML = '&#8250;';
      btnPrev.addEventListener('click', () => { _stopAutoplay(); _scrollTo(pos - 1, true); });
      btnNext.addEventListener('click', () => { _stopAutoplay(); _scrollTo(pos + 1, true); });
      nav.appendChild(btnPrev); nav.appendChild(btnNext);

      dots = document.createElement('div');
      dots.className = 'pageViewRelCarouselDots';
      items.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'pageViewRelCarouselDot';
        dot.addEventListener('click', () => { _stopAutoplay(); _scrollTo(i + 1, true); });
        dots.appendChild(dot);
        dotEls.push(dot);
      });

      _startAutoplay();
    }
    // Position initiale sans animation, une fois le layout posé (offsetLeft dispo).
    requestAnimationFrame(() => _scrollTo(pos, false));
    return { carousel: wrap, nav, dots };
  }

  function _appendRelBox(side, items, cardType, labelFr, labelEn, isEn) {
    if (!items || !items.length) return;
    const box = document.createElement('div');
    box.className = 'pageViewSideBox pageViewRelBox';

    const { carousel, nav, dots } = _buildRelCarousel(items, cardType, isEn);

    const header = document.createElement('div');
    header.className = 'pageViewRelBoxHeader';
    const label = document.createElement('span');
    label.className = 'pageViewRelBoxTitle';
    label.textContent = isEn ? labelEn : labelFr;
    header.appendChild(label);
    if (nav) header.appendChild(nav);
    box.appendChild(header);

    box.appendChild(carousel);
    if (dots) box.appendChild(dots);
    side.appendChild(box);
  }

  function _renderSide(side, page, isEn) {
    side.innerHTML = '';

    // Box 1 — (selon le type) détails classiques ou timeline des expériences liées
    const box0 = document.createElement('div');
    box0.className = 'pageViewSideBox';

    if (page.type === 'expertise') {
      const label = document.createElement('span');
      label.className = 'pageViewRelBoxTitle';
      label.textContent = isEn ? 'Related experiences' : 'Expériences liées';
      box0.appendChild(label);
      _appendExperiencesTimeline(box0, page.experiences, isEn);
    } else {
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
      ].forEach(row => { if (row) box0.appendChild(row); });
    }
    side.appendChild(box0);

    // Box 2 & 3 — carrousels "Related projects" / "Related posts" (type "expertise" pour l'instant,
    // conçu pour être étendu à d'autres types de page via _RIGHT_PANEL_BOXES le cas échéant)
    if (page.type === 'expertise') {
      _appendRelBox(side, page.related,       'projet', 'Projets liés',  'Related projects', isEn);
      _appendRelBox(side, page.related_posts, 'blog',   'Articles liés', 'Related posts',     isEn);
    }
  }


  function _renderMain(main, page, isEn) {
    main.innerHTML = '';
    main.appendChild(_buildCover(page));
    const body = document.createElement('div');
    body.className = 'pageViewBody';
    const title = document.createElement('h1');
    title.className = 'pageViewTitle';
    title.textContent = isEn ? (page.title_en || page.title_fr) : (page.title_fr || page.title_en);
    body.appendChild(title);
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
        _lastTabletListMode = _isTabletListMode();
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

  // Re-render le right panel si on franchit la frontière carrousel/liste-tablette en resize
  // (ex: rotation d'écran, redimensionnement de fenêtre) — pas à chaque pixel, juste au changement de mode.
  let _lastTabletListMode = null;
  let _resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => {
      if (!_currentPage) return;
      const mode = _isTabletListMode();
      if (mode === _lastTabletListMode) return;
      _lastTabletListMode = mode;
      const side = document.getElementById('pageViewSide');
      if (!side) return;
      const isEn = document.documentElement.lang === 'en';
      _renderSide(side, _currentPage, isEn);
    }, 150);
  });
})();
