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
    this.duration   = 700; // ms — doit correspondre à $scroll-duration en SCSS

    this._onWheel      = this._onWheel.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchEnd   = this._onTouchEnd.bind(this);
    this._touchStartY  = 0;
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
  }

  destroy() {
    this._unbindEvents();
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  /** dir : +1 = vers le bas, -1 = vers le haut */
  navigate(dir) {
    if (this.animating) return;
    const next = this.current + dir;
    if (next < 0 || next >= this.sections.length) return;
    this._transition(this.current, next, dir);
  }

  goTo(index) {
    if (this.animating || index === this.current) return;
    if (index < 0 || index >= this.sections.length) return;
    const dir = index > this.current ? 1 : -1;
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

    setTimeout(() => {
      from.classList.remove(exitClass);
      to.classList.remove(enterClass);
      to.classList.add('section--active');

      this.current   = toIdx;
      this.animating = false;

      this._updateNav(toIdx);
      this._dispatchChange(toIdx);
    }, this.duration);
  }

  // ── Nav icônes ─────────────────────────────────────────────────────────────

  _updateNav(activeIndex) {
    this.navItems.forEach((item, i) => {
      item.classList.toggle('sectionNavItem--active', i === activeIndex);
    });
  }

  _bindNavClicks() {
    this.navItems.forEach((item) => {
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
  }

  _unbindEvents() {
    this.container.removeEventListener('wheel', this._onWheel);
    this.container.removeEventListener('touchstart', this._onTouchStart);
    this.container.removeEventListener('touchend', this._onTouchEnd);
    // Les clicks nav n'ont pas besoin d'être retirés — les éléments seront
    // masqués avec le conteneur et recréés à la prochaine visite de la home
  }

  _onWheel(e) {
    e.preventDefault();
    if (this.animating) return;
    if (Math.abs(e.deltaY) < 10) return;
    this.navigate(e.deltaY > 0 ? 1 : -1);
  }

  _onTouchStart(e) {
    this._touchStartY = e.touches[0].clientY;
  }

  _onTouchEnd(e) {
    if (this.animating) return;
    const delta = this._touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(delta) < 50) return;
    this.navigate(delta > 0 ? 1 : -1);
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

