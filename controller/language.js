// Système de langue : lit lang="FR" data-en="..." sur chaque élément.
// Stocke le texte FR initial sur dataset._langFr une seule fois au démarrage,
// puis swape avec data-en selon la langue active. Persiste via localStorage.
// Même mécanisme pour les placeholders de champs (data-en-placeholder="...").

(function () {
  const LANG_KEY = 'gcaSiteLang';

  function applyLanguage(lang) {
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-en]').forEach(el => {
      // Ignorer les éléments qui ont des enfants (ex: span avec badge imbriqué)
      if (el.children.length > 0) return;

      if (el.dataset._langFr === undefined) el.dataset._langFr = el.textContent;

      el.textContent = lang === 'en'
        ? el.getAttribute('data-en')
        : el.dataset._langFr;
    });

    // Placeholders des champs de formulaire — swap séparé du textContent ci-dessus
    // (data-en-placeholder plutôt que data-en, pour ne pas entrer en conflit avec un
    // éventuel data-en porté par le même élément).
    document.querySelectorAll('[data-en-placeholder]').forEach(el => {
      if (el.dataset._langFrPlaceholder === undefined) {
        el.dataset._langFrPlaceholder = el.getAttribute('placeholder') ?? '';
      }
      el.setAttribute('placeholder', lang === 'en'
        ? el.getAttribute('data-en-placeholder')
        : el.dataset._langFrPlaceholder);
    });

    document.querySelectorAll('#lang, #langTablet, #langMobile').forEach(sel => { sel.value = lang; });

    // Switch FR/EN (desktop/tablette/mobile, cf. templates/partials/topbar.php +
    // nav-mobile.php, vue/assets/scss/layout/_main-nav.scss) — le <select> associé à chaque
    // instance reste la source de vérité fonctionnelle, ce bouton n'en est que la
    // représentation visuelle (knob glissant).
    ['languageSwitchDesktopBtn', 'languageSwitchTabletBtn', 'languageSwitchMobileBtn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.setAttribute('aria-checked', lang === 'en' ? 'true' : 'false');
    });

    document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));

    try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
  }

  function init() {
    let saved = 'fr';
    try { saved = localStorage.getItem(LANG_KEY) || 'fr'; } catch (_) {}
    applyLanguage(saved);
    document.querySelectorAll('#lang, #langTablet, #langMobile').forEach(sel => {
      sel.addEventListener('change', e => applyLanguage(e.target.value));
    });

    // Switch FR/EN — un simple clic bascule la langue (toggle), pilote le <select> caché
    // associé pour réutiliser toute la logique ci-dessus sans duplication. Même mécanisme
    // sur les 3 formats (desktop/tablette/mobile, cf. Interface desktop/tablette : "Remplace
    // le langage selector par le switch FR/EN mis en place dans le menu burger mobile").
    [
      { btnId: 'languageSwitchDesktopBtn', selId: 'lang' },
      { btnId: 'languageSwitchTabletBtn', selId: 'langTablet' },
      { btnId: 'languageSwitchMobileBtn', selId: 'langMobile' },
    ].forEach(({ btnId, selId }) => {
      const btn = document.getElementById(btnId);
      const sel = document.getElementById(selId);
      if (btn && sel) {
        btn.addEventListener('click', () => {
          applyLanguage(sel.value === 'en' ? 'fr' : 'en');
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();