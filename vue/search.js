// =============================================================================
// SEARCH — Page de recherche publique du site (projets / expertises / blog)
// =============================================================================
// Recherche uniquement le contenu public déjà visible sur le site (cf. model/
// model_pages.php :: searchPublicContent()) — jamais de données réservées à l'outil admin.
(function () {
  'use strict';

  const FORM    = document.getElementById('formSearch');
  const INPUT   = document.getElementById('inputSearch');
  const RESULTS = document.getElementById('searchResults');
  if (!FORM || !INPUT || !RESULTS) return;

  let _lastQuery   = '';
  let _lastResults = null; // null = pas encore de recherche effectuée (état initial)

  function _isEn() {
    return document.documentElement.lang === 'en';
  }

  function _typeLabel(type, isEn) {
    const labels = {
      projet:    isEn ? 'Project'    : 'Projet',
      expertise: isEn ? 'Expertise'  : 'Expertise',
      blog:      isEn ? 'Blog'       : 'Blog',
    };
    return labels[type] || type;
  }

  function _renderMessage(text) {
    RESULTS.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'searchMessage';
    p.textContent = text;
    RESULTS.appendChild(p);
  }

  function _renderResults(results, isEn) {
    RESULTS.innerHTML = '';
    if (!results.length) {
      _renderMessage(isEn ? 'No results found.' : 'Aucun résultat trouvé.');
      return;
    }
    const list = document.createElement('ul');
    list.className = 'searchResultsList';
    results.forEach(item => list.appendChild(_buildResultItem(item, isEn)));
    RESULTS.appendChild(list);
  }

  function _buildResultItem(item, isEn) {
    const li = document.createElement('li');
    li.className = 'searchResultItem';
    li.tabIndex = 0;
    li.setAttribute('role', 'button');

    const title = isEn ? (item.title_en || item.title_fr) : (item.title_fr || item.title_en);
    const rawPath   = item.card_path || item.cover_path || '';
    const thumbPath = rawPath ? (window._getThumbPath?.(rawPath) || rawPath) : '';

    const media = document.createElement('div');
    media.className = 'searchResultMedia';
    if (thumbPath) {
      const img = document.createElement('img');
      img.src = thumbPath; img.alt = ''; img.loading = 'lazy';
      img.onerror = () => { img.src = rawPath; };
      media.appendChild(img);
    }

    const info = document.createElement('div');
    info.className = 'searchResultInfo';

    const type = document.createElement('span');
    type.className = 'searchResultType';
    type.textContent = _typeLabel(item.type, isEn);
    info.appendChild(type);

    const titleEl = document.createElement('span');
    titleEl.className = 'searchResultTitle';
    titleEl.textContent = title || '';
    info.appendChild(titleEl);

    if (item.excerpt) {
      const excerptEl = document.createElement('span');
      excerptEl.className = 'searchResultExcerpt';
      excerptEl.textContent = item.excerpt;
      info.appendChild(excerptEl);
    }

    li.appendChild(media);
    li.appendChild(info);

    const _open = () => { if (item.slug) window.accessPageView?.(item.slug); };
    li.addEventListener('click', _open);
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _open(); }
    });

    return li;
  }

  async function _runSearch(query) {
    const q = query.trim();
    _lastQuery = q;
    if (q.length < 2) {
      _lastResults = null;
      _renderMessage(_isEn()
        ? 'Type at least 2 characters to search.'
        : 'Saisissez au moins 2 caractères pour lancer la recherche.');
      return;
    }
    _renderMessage(_isEn() ? 'Searching…' : 'Recherche en cours…');
    try {
      const res  = await fetch(`controller/controller.php?action=search_public&q=${encodeURIComponent(q)}`);
      const json = await res.json();
      // Ignore une réponse obsolète (requête plus rapide lancée entre-temps)
      if (_lastQuery !== q) return;
      _lastResults = json.success ? (json.results || []) : [];
      _renderResults(_lastResults, _isEn());
    } catch (_) {
      if (_lastQuery !== q) return;
      _lastResults = [];
      _renderMessage(_isEn() ? 'Technical error, please retry.' : 'Erreur technique, veuillez réessayer.');
    }
  }

  FORM.addEventListener('submit', (e) => {
    e.preventDefault();
    _runSearch(INPUT.value);
  });

  // État initial (avant toute recherche) — invite à saisir une requête
  _renderMessage(_isEn() ? 'What are you looking for?' : 'Que cherchez-vous ?');

  // Ré-affiche les résultats déjà chargés dans la langue active, sans refetch
  document.addEventListener('languagechange', (e) => {
    if (_lastResults === null) {
      _renderMessage(e.detail.lang === 'en' ? 'What are you looking for?' : 'Que cherchez-vous ?');
      return;
    }
    _renderResults(_lastResults, e.detail.lang === 'en');
  });

  // Focus auto de l'input à chaque affichage de la page (cf. accessSearch(), vue/navigation.js)
  window._focusSearchInput = function () {
    setTimeout(() => INPUT.focus(), 550);
  };
})();
