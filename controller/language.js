// Système de langue : lit lang="FR" data-en="..." sur chaque élément.
// Stocke le texte FR initial sur dataset._langFr une seule fois au démarrage,
// puis swape avec data-en selon la langue active. Persiste via localStorage.

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

    document.querySelectorAll('#lang, #langTablet').forEach(sel => { sel.value = lang; });

    document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));

    try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
  }

  function init() {
    let saved = 'fr';
    try { saved = localStorage.getItem(LANG_KEY) || 'fr'; } catch (_) {}
    applyLanguage(saved);
    document.querySelectorAll('#lang, #langTablet').forEach(sel => {
      sel.addEventListener('change', e => applyLanguage(e.target.value));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();