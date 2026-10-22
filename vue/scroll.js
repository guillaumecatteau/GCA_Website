// =============================================================================
// SECTION NAV LABEL ANIMATIONS
// Transitions CSS directes sur les spans de label (rotateY + opacity)
// Évite les conflits avec staggerReveal qui ne gère pas le transform CSS restant
//
// Robustesse : lors d'interactions rapides/répétées (survols ou clics successifs
// avant la fin d'une animation en cours), chaque appel précédent sur un même
// label est intégralement annulé (tous ses setTimeout en attente) avant de
// démarrer le nouveau — sinon d'anciens timeouts "hide" peuvent s'exécuter
// après un "reveal" plus récent (ou l'inverse) et laisser des lettres bloquées
// dans un état visuel incohérent. Un jeton (`_labelAnimState`) identifie la
// génération d'animation en cours par label : tout timeout d'une génération
// périmée se neutralise lui-même au moment de s'exécuter.
// =============================================================================

const _labelAnimState = new WeakMap(); // labelEl -> { timers: number[] }

function _clearLabelAnim(labelEl) {
  const state = _labelAnimState.get(labelEl);
  if (state) state.timers.forEach((id) => clearTimeout(id));
}

/**
 * Révèle les spans d'un label lettre par lettre (rotateY 90°→0°, opacity 0→1).
 * @param {Element} labelEl  conteneur .sectionNavLabel (spans = enfants directs)
 * @param {number}  delay    ms entre chaque lettre
 */
function _navLabelReveal(labelEl, delay = 28) {
  if (!labelEl) return;
  _clearLabelAnim(labelEl);
  const state = { timers: [] };
  _labelAnimState.set(labelEl, state);

  Array.from(labelEl.children).forEach((span, i) => {
    const id = setTimeout(() => {
      // Génération périmée (une animation plus récente a déjà pris le relais) : no-op
      if (_labelAnimState.get(labelEl) !== state) return;
      span.style.transition = `opacity 0.3s ease, transform 0.35s cubic-bezier(0.34,2,0.64,1)`;
      span.style.opacity    = '1';
      span.style.transform  = 'rotateY(0deg)';
    }, delay * i);
    state.timers.push(id);
  });
}

/**
 * Cache les spans d'un label lettre par lettre (rotateY 0°→90°, opacity 1→0).
 * @param {Element} labelEl  conteneur .sectionNavLabel (spans = enfants directs)
 * @param {boolean} reverse  true = masquer de droite à gauche
 * @param {number}  delay    ms entre chaque lettre
 */
function _navLabelHide(labelEl, reverse = false, delay = 20) {
  if (!labelEl) return;
  _clearLabelAnim(labelEl);
  const state = { timers: [] };
  _labelAnimState.set(labelEl, state);

  const arr = Array.from(labelEl.children);
  if (reverse) arr.reverse();
  arr.forEach((span, i) => {
    const id = setTimeout(() => {
      if (_labelAnimState.get(labelEl) !== state) return;
      span.style.transition = `opacity 0.2s ease, transform 0.2s ease-in`;
      span.style.opacity    = '0';
      span.style.transform  = 'rotateY(90deg)';
    }, delay * i);
    state.timers.push(id);
  });
}

/**
 * Reconstruit les lettres d'un label (.sectionNavLabel[data-en]) dans la langue demandée —
 * seul moyen de traduire un texte animé lettre par lettre sans perdre son état visuel en
 * cours (visible/caché). Le texte FR d'origine est mémorisé une seule fois (dataset._langFr)
 * à partir du contenu HTML initial, exactement comme controller/language.js le fait pour les
 * éléments texte simples.
 * @param {Element} labelEl  conteneur .sectionNavLabel portant data-en="..."
 * @param {string}  lang     'fr' | 'en'
 */
function _setNavLabelLang(labelEl, lang) {
  if (!labelEl || !labelEl.hasAttribute('data-en')) return;
  if (labelEl.dataset._langFr === undefined) {
    labelEl.dataset._langFr = Array.from(labelEl.children).map((s) => s.textContent).join('');
  }
  const wanted = (lang === 'en' ? labelEl.getAttribute('data-en') : labelEl.dataset._langFr).toUpperCase();
  const current = Array.from(labelEl.children).map((s) => s.textContent).join('');
  if (current === wanted) return; // déjà dans la bonne langue — rien à reconstruire

  // Préserve l'état visuel courant (entièrement révélé ou entièrement caché) plutôt que de
  // rejouer l'animation lettre par lettre à chaque changement de langue.
  const wasVisible = labelEl.children[0]?.style.opacity === '1';
  _clearLabelAnim(labelEl);
  labelEl.innerHTML = '';
  wanted.split('').forEach((ch) => {
    const span = document.createElement('span');
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    if (wasVisible) {
      span.style.opacity   = '1';
      span.style.transform = 'rotateY(0deg)';
    }
    labelEl.appendChild(span);
  });
}

// =============================================================================
// SECTION SCROLLER — Moteur de scroll magnétique pour la home
// =============================================================================
// Usage :
//   const scroller = new SectionScroller(containerEl, navEl);
//   scroller.init();
//   scroller.destroy();   // nettoyage des listeners avant de quitter la home
// =============================================================================

class SectionScroller {
  constructor(container, nav) {
    this.container  = container;
    this.nav        = nav ?? container.querySelector('#sectionNav');
    this.sections   = [];
    this.navItems   = [];
    this.current    = 0;
    this.animating  = false;
    this.duration   = 700;

    // Label hover zone state — géré par navigation.js
    this._labelHoverActive = false;
    this._prevActiveIndex  = undefined;

    this._onWheel      = this._onWheel.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchEnd   = this._onTouchEnd.bind(this);
    this._touchStartY  = 0;

    // Scroll interne de la section active — délai d'immobilité à l'extrémité
    // avant d'autoriser le changement de section (évite un scroll intempestif)
    this._edgeHoldStart = null;
    this._edgeHoldDir   = 0;
    this._edgeHoldDelay = 2000;
    this._onResize      = this._onResize.bind(this);
  }

  // ── Cycle de vie ───────────────────────────────────────────────────────────

  init() {
    this.sections = Array.from(this.container.querySelectorAll('.section'));
    this.navItems = this.nav
      ? Array.from(this.nav.querySelectorAll('.sectionNavItem'))
      : [];

    if (this.sections.length === 0) return;

    // État initial : première section active
    this.sections.forEach((s, i) => {
      s.classList.remove('section--active', 'section--exit-up', 'section--exit-down',
                          'section--enter-up', 'section--enter-down');
      if (i === this.current) s.classList.add('section--active');
    });

    this._updateNav(this.current);
    this._bindEvents();
    this.refreshAll();
  }

  destroy() {
    this._unbindEvents();
  }

  // ── Scroll interne par section ──────────────────────────────────────────────

  // Une section peut contenir 1 ou 2 zones scrollables indépendantes (ex: bio
  // = mainBlock + sideBlock d'un .basicGrid). On cible directement ces
  // conteneurs connus plutôt que le wrapper de section lui-même.
  _getSectionWraps(section) {
    return Array.from(section.querySelectorAll('.mainBlock, .sideBlock, .sectionCardsGrid, .sectionContactLayout'));
  }

  // Le wrap concerné par un événement pointeur donné (survolé), sinon le premier trouvé
  _getScrollWrap(section, eventTarget) {
    const wraps = this._getSectionWraps(section);
    if (!wraps.length) return null;
    if (eventTarget) {
      const hovered = wraps.find(w => w.contains(eventTarget));
      if (hovered) return hovered;
    }
    return wraps[0];
  }

  // La scrollbar est un SIBLING du wrap (enfant de son parent), jamais un
  // descendant : le wrap lui-même est en overflow-y:auto, qui calcule aussi
  // overflow-x:auto en interne et rognerait toute décoration positionnée à
  // l'intérieur qui dépasse sa boîte (cf. .btnPageBack, même contrainte).
  _ensureScrollBar(wrap) {
    if (wrap._scrollBarEl) return wrap._scrollBarEl;
    const bar = document.createElement('div');
    bar.className = 'sectionScrollBar';
    bar.innerHTML = '<div class="sectionScrollBarThumb"></div>';
    wrap.parentElement.appendChild(bar);
    wrap._scrollBarEl = bar;
    wrap.addEventListener('scroll', () => this._refreshWrap(wrap));
    return bar;
  }

  // Positionne la scrollbar juste à droite du wrap qu'elle décore, en dehors
  // de son espace (comme .btnPageBack par rapport à .basicGrid).
  _positionScrollBar(wrap, bar) {
    const parent = wrap.parentElement;
    const wrapRect   = wrap.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    bar.style.position = 'absolute';
    bar.style.top    = `${wrapRect.top - parentRect.top}px`;
    bar.style.left   = `${wrapRect.right - parentRect.left + 16}px`;
    bar.style.height = `${wrapRect.height}px`;
  }

  // Fondu progressif de 64px en haut/bas selon la position de scroll
  _computeMask(atTop, atBottom) {
    if (atTop && atBottom) return '';
    const stops = [];
    stops.push(atTop ? 'black 0%' : 'transparent 0%');
    if (!atTop) stops.push('black 64px');
    if (!atBottom) stops.push('black calc(100% - 64px)');
    stops.push(atBottom ? 'black 100%' : 'transparent 100%');
    return `linear-gradient(to bottom, ${stops.join(', ')})`;
  }

  _refreshWrap(wrap) {
    wrap.classList.add('sectionScrollWrap');

    const scrollable = wrap.scrollHeight > wrap.clientHeight + 1;
    wrap.classList.toggle('sectionScrollWrap--scrollable', scrollable);

    const bar = this._ensureScrollBar(wrap);
    if (!scrollable) {
      bar.style.display          = 'none';
      wrap.style.maskImage       = '';
      wrap.style.webkitMaskImage = '';
      return;
    }

    bar.style.display = '';
    this._positionScrollBar(wrap, bar);
    const atTop    = wrap.scrollTop <= 0;
    const atBottom = wrap.scrollTop + wrap.clientHeight >= wrap.scrollHeight - 1;
    const mask = this._computeMask(atTop, atBottom);
    wrap.style.maskImage       = mask;
    wrap.style.webkitMaskImage = mask;

    const thumb    = bar.querySelector('.sectionScrollBarThumb');
    const thumbPct = Math.max(8, (wrap.clientHeight / wrap.scrollHeight) * 100);
    const topPct   = (wrap.scrollTop / wrap.scrollHeight) * 100;
    thumb.style.height = `${thumbPct}%`;
    thumb.style.top    = `${topPct}%`;
  }

  _refreshSection(section) {
    if (!section) return;
    this._getSectionWraps(section).forEach(w => this._refreshWrap(w));
  }

  /** Recalcule le scroll interne de toutes les sections (à appeler après un chargement de contenu dynamique). */
  refreshAll() {
    this.sections.forEach(s => this._refreshSection(s));
  }

  _onResize() {
    this.refreshAll();
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  /** dir : +1 = vers le bas, -1 = vers le haut */
  navigate(dir) {
    if (this.animating) return;
    const next = this.current + dir;
    if (next < 0 || next >= this.sections.length) return;
    this._edgeHoldStart = null;
    this._transition(this.current, next, dir);
  }

  goTo(index) {
    if (this.animating || index === this.current) return;
    if (index < 0 || index >= this.sections.length) return;
    const dir = index > this.current ? 1 : -1;
    this._edgeHoldStart = null;
    this._transition(this.current, index, dir);
  }

  // ── Transition ─────────────────────────────────────────────────────────────

  _transition(fromIdx, toIdx, dir) {
    this.animating = true;

    const from = this.sections[fromIdx];
    const to   = this.sections[toIdx];

    const exitClass  = dir > 0 ? 'section--exit-up'  : 'section--exit-down';
    const enterClass = dir > 0 ? 'section--enter-up' : 'section--enter-down';

    from.classList.remove('section--active');
    from.classList.add(exitClass);
    to.classList.add(enterClass);

    // Feedback immédiat — nav (icône/couleur active) + flou d'arrière-plan : ne jamais
    // attendre la fin de la transition de contenu (cf. duration), sinon l'utilisateur n'a
    // aucun retour visuel pendant les ~700ms de chargement de la section.
    this._updateNav(toIdx);
    this._applyBackdrop(toIdx);

    setTimeout(() => {
      from.classList.remove(exitClass);
      to.classList.remove(enterClass);
      to.classList.add('section--active');

      this.current   = toIdx;
      this.animating = false;

      this._refreshSection(to);
      this._dispatchChange(toIdx);
    }, this.duration);
  }

  // Seule la section "landing" (index 0) affiche la scène 3D nette, sans flou/tramage
  _applyBackdrop(toIdx) {
    if (toIdx === 0) window.hideBackBlurMask?.();
    else window.displayBackBlurMask?.();
  }

  // ── Nav icônes + labels ─────────────────────────────────────────────────────

  _updateNav(activeIndex) {
    const prev = this._prevActiveIndex;

    this.navItems.forEach((item, i) => {
      item.classList.toggle('sectionNavItem--active', i === activeIndex);
    });

    // Animer les labels via transitions CSS directes (pas de staggerReveal)
    // pour éviter les conflits avec le transform rotateY des spans
    const activeItem = this.navItems[activeIndex];
    if (activeItem) {
      _navLabelReveal(activeItem.querySelector('.sectionNavLabel'));
    }

    // Cacher le label de l'ancien actif si on n'est pas en zone hover
    if (prev !== undefined && prev !== activeIndex && !this._labelHoverActive) {
      const prevItem = this.navItems[prev];
      if (prevItem) {
        _navLabelHide(prevItem.querySelector('.sectionNavLabel'), true);
      }
    }

    this._prevActiveIndex = activeIndex;
  }

  _bindNavClicks() {
    this.navItems.forEach((item) => {
      // Feedback tactile immédiat (enfoncement au clic, rebond prononcé au relâchement),
      // entièrement découplé de la navigation réelle (goTo) — l'un ne doit jamais bloquer
      // ou retarder l'autre, même en cas de clics rapides et répétés.
      const press   = () => item.classList.add('sectionNavItem--pressed');
      const release = () => {
        if (!item.classList.contains('sectionNavItem--pressed')) return;
        item.classList.remove('sectionNavItem--pressed');
        // Un seul rebond : on anime directement vers l'état final réel (actif = toujours
        // scale(1.08), sinon survolé ou non), jamais vers une valeur intermédiaire fixe —
        // sinon :hover/--active reprend la main juste après et déclenche un second rebond
        // (double bounce) une fois --released retiré.
        const isActive = item.classList.contains('sectionNavItem--active');
        const restingScale = (isActive || item.matches(':hover')) ? '1.08' : '1';
        item.classList.add('sectionNavItem--released');
        item.style.transform = `scale(${restingScale})`;
        item.addEventListener('transitionend', function onEnd(e) {
          if (e.propertyName !== 'transform') return;
          item.classList.remove('sectionNavItem--released');
          item.style.removeProperty('transform');
          item.removeEventListener('transitionend', onEnd);
        });
      };
      item.addEventListener('pointerdown', press);
      item.addEventListener('pointerup', release);
      item.addEventListener('pointercancel', release);
      item.addEventListener('pointerleave', () => item.classList.remove('sectionNavItem--pressed'));

      item.addEventListener('click', () => {
        const target = parseInt(item.dataset.target, 10);
        if (!isNaN(target)) this.goTo(target);
      });
    });
  }

  // ── Événements ─────────────────────────────────────────────────────────────

  _bindEvents() {
    this._bindNavClicks();
    this.container.addEventListener('wheel', this._onWheel, { passive: false });
    this.container.addEventListener('touchstart', this._onTouchStart, { passive: true });
    this.container.addEventListener('touchend', this._onTouchEnd, { passive: true });
    window.addEventListener('resize', this._onResize);
  }

  _unbindEvents() {
    this.container.removeEventListener('wheel', this._onWheel);
    this.container.removeEventListener('touchstart', this._onTouchStart);
    this.container.removeEventListener('touchend', this._onTouchEnd);
    window.removeEventListener('resize', this._onResize);
    // Les clicks nav n'ont pas besoin d'être retirés — les éléments seront
    // masqués avec le conteneur et recréés à la prochaine visite de la home
  }

  // Retourne true si le scroll a été consommé en interne (pas de changement de section)
  _handleInternalScroll(dir, delta, eventTarget) {
    const section = this.sections[this.current];
    const wrap    = this._getScrollWrap(section, eventTarget);
    const scrollable = wrap && wrap.scrollHeight > wrap.clientHeight + 1;
    if (!scrollable) return false;

    const atTop    = wrap.scrollTop <= 0;
    const atBottom = wrap.scrollTop + wrap.clientHeight >= wrap.scrollHeight - 1;
    const atEdge   = (dir > 0 && atBottom) || (dir < 0 && atTop);

    if (!atEdge) {
      wrap.scrollTop += delta;
      this._edgeHoldStart = null;
      this._refreshWrap(wrap);
      return true;
    }

    // À l'extrémité : n'autorise le changement de section qu'après 2s d'immobilité
    const now = Date.now();
    if (this._edgeHoldDir !== dir || !this._edgeHoldStart) {
      this._edgeHoldDir   = dir;
      this._edgeHoldStart = now;
      return true; // premier contact avec l'extrémité : on démarre le délai, pas de navigation
    }
    if (now - this._edgeHoldStart < this._edgeHoldDelay) return true; // délai pas encore écoulé

    this._edgeHoldStart = null;
    return false; // délai écoulé : le scroll peut déclencher le changement de section
  }

  _onWheel(e) {
    if (this.animating) return;
    if (Math.abs(e.deltaY) < 10) return;
    e.preventDefault();
    const dir = e.deltaY > 0 ? 1 : -1;
    if (this._handleInternalScroll(dir, e.deltaY, e.target)) return;
    this.navigate(dir);
  }

  _onTouchStart(e) {
    this._touchStartY = e.touches[0].clientY;
    this._touchTarget = e.target;
  }

  _onTouchEnd(e) {
    if (this.animating) return;
    const delta = this._touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(delta) < 50) return;
    const dir = delta > 0 ? 1 : -1;
    if (this._handleInternalScroll(dir, delta, this._touchTarget)) return;
    this.navigate(dir);
  }

  // ── Dispatch ───────────────────────────────────────────────────────────────

  _dispatchChange(index) {
    const section   = this.sections[index];
    const sectionId = section?.dataset?.section ?? String(index);
    this.container.dispatchEvent(new CustomEvent('sectionChange', {
      detail: { index, sectionId },
      bubbles: true,
    }));
  }
}

window.SectionScroller = SectionScroller;

