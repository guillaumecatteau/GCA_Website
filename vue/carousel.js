// =============================================================================
// CAROUSEL GÉNÉRIQUE — Moteur partagé Portfolio / Galerie
// =============================================================================
// cf. Section Portfolio + Section Gallerie ("le système des galeries doit être
// unifié... pour ne pas répéter du code") : ce moteur gère le positionnement
// (scale/opacité/filtre dark dégressifs par distance au centre), la boucle
// infinie (recyclage d'un nombre fixe de slots DOM via arithmétique modulo —
// jamais de "retour au début" visible), la navigation flèches/molette/swipe,
// l'effet de bounce à l'arrivée, et l'animation d'introduction (survol rapide
// de toutes les cards au premier chargement).
// =============================================================================
(function () {
  'use strict';

  class GCACarousel {
    constructor(opts) {
      this.track          = opts.track;
      this.items          = opts.items || [];
      this.renderSlot      = opts.renderSlot;        // (item, slotEl, offset) => void
      this.onSettle        = opts.onSettle || null;   // (item, slotEl) => void — appelé après la transition du slot central
      this.visibleRadius   = opts.visibleRadius ?? 3;
      this.scaleStep       = opts.scaleStep ?? 0.8;
      this.darkStep        = opts.darkStep ?? 0.22;
      this.opacityStep     = opts.opacityStep ?? 0.28;
      this.spacingPercent  = opts.spacingPercent ?? 62; // écart entre slots, % de la largeur d'un slot
      this.swipeThreshold  = opts.swipeThreshold ?? 50;
      this.transitionMs    = opts.transitionMs ?? 550;
      this.currentIndex    = 0;
      this.slots           = [];
      this.animating       = false;
      this._touchStartX    = 0;

      this._build();
      this._bindEvents();
      if (this.items.length) {
        if (opts.playIntroTour) this._playIntroTour();
        else this._settle(false);
      }
    }

    _mod(i) {
      const n = this.items.length;
      if (!n) return 0;
      return ((i % n) + n) % n;
    }

    _build() {
      this.track.innerHTML = '';
      const total = this.visibleRadius * 2 + 1;
      for (let i = 0; i < total; i++) {
        const slot = document.createElement('div');
        slot.className = 'pfSlot';
        this.track.appendChild(slot);
        this.slots.push(slot);
      }
    }

    _layout(animate) {
      const n = this.items.length;
      if (!n) return;
      this.slots.forEach((slot, i) => {
        const offset = i - this.visibleRadius;
        const itemIndex = this._mod(this.currentIndex + offset);
        const item = this.items[itemIndex];
        const absOffset = Math.abs(offset);
        const scale   = Math.pow(this.scaleStep, absOffset);
        const dark    = Math.min(0.85, absOffset * this.darkStep);
        const opacity = Math.max(0, 1 - absOffset * this.opacityStep);

        slot.style.transition = animate
          ? `transform ${this.transitionMs}ms cubic-bezier(.25,.1,.25,1), opacity ${this.transitionMs}ms ease`
          : 'none';
        slot.style.transform = `translate(-50%, -50%) translateX(${offset * this.spacingPercent}%) scale(${scale})`;
        slot.style.opacity = String(opacity);
        slot.style.zIndex = String(100 - absOffset);
        slot.classList.toggle('pfSlot--active', offset === 0);
        slot.dataset.offset = String(offset);

        // Ne reconstruit le contenu du slot QUE si l'item affiché change réellement —
        // évite de recréer l'image/les infos à chaque frame de layout.
        if (slot.dataset.itemId !== String(item?.id ?? itemIndex)) {
          slot.dataset.itemId = String(item?.id ?? itemIndex);
          this.renderSlot(item, slot, offset);
        }

        let darkEl = slot.querySelector('.pfSlotDark');
        if (darkEl) darkEl.style.opacity = String(dark);

        const info = slot.querySelector('.pfSlotInfo');
        if (info) info.classList.toggle('pfSlotInfo--visible', false);
      });

      if (!animate) {
        // Force un reflow avant de réactiver les transitions (évite qu'un positionnement
        // initial soit lui-même animé depuis une position de départ arbitraire).
        void this.track.offsetHeight;
        requestAnimationFrame(() => {
          this.slots.forEach((s) => { s.style.transition = ''; });
        });
      }
    }

    _settle(animate) {
      this._layout(animate);
      const activeSlot = this.slots[this.visibleRadius];
      const reveal = () => {
        activeSlot.classList.add('pfSlot--bounce');
        const info = activeSlot.querySelector('.pfSlotInfo');
        if (info) info.classList.add('pfSlotInfo--visible');
        this.onSettle?.(this.items[this._mod(this.currentIndex)], activeSlot);
        setTimeout(() => activeSlot.classList.remove('pfSlot--bounce'), 500);
      };
      if (!animate) { reveal(); return; }
      const onEnd = (e) => {
        if (e.target !== activeSlot || e.propertyName !== 'transform') return;
        activeSlot.removeEventListener('transitionend', onEnd);
        reveal();
      };
      activeSlot.addEventListener('transitionend', onEnd);
    }

    goTo(index, { silent = false } = {}) {
      if (this.animating || !this.items.length) return;
      this.animating = true;
      this.currentIndex = index;
      this._layout(true);
      setTimeout(() => { this.animating = false; }, this.transitionMs);
      if (!silent) this._settle(true);
    }

    next() { this.goTo(this.currentIndex + 1); }
    prev() { this.goTo(this.currentIndex - 1); }

    // Balayage rapide de toutes les cards au premier chargement, sans info ni bounce,
    // purement cosmétique (cf. demande) — ne se rejoue pas tant que l'instance vit.
    _playIntroTour() {
      const n = Math.min(this.items.length, 10); // plafonné pour rester rapide même avec un grand portfolio
      const stepMs = 140;
      this.animating = true;
      let i = 0;
      const step = () => {
        i++;
        this.currentIndex = i;
        this._layout(true);
        if (i < n) {
          setTimeout(step, stepMs);
        } else {
          setTimeout(() => {
            this.currentIndex = 0;
            this.animating = false;
            this._settle(true);
          }, this.transitionMs);
        }
      };
      this._layout(false);
      setTimeout(step, stepMs);
    }

    _bindEvents() {
      this.track.addEventListener('touchstart', (e) => {
        this._touchStartX = e.touches[0].clientX;
      }, { passive: true });
      this.track.addEventListener('touchend', (e) => {
        const delta = this._touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(delta) < this.swipeThreshold) return;
        if (delta > 0) this.next(); else this.prev();
      }, { passive: true });
    }
  }

  window.GCACarousel = GCACarousel;
})();
