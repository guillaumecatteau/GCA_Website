// =============================================================================
// BIO — Timeline Expérience / Formation / Études (panel gauche section home "bio")
// =============================================================================
// Réutilise exactement le rendu de l'éditeur d'expériences (admintool.js
// _buildExpCard + groupes .basicBlock.tagGroup), mais en lecture seule
// (pas de boutons d'action, pas de sélection, pas de badge Freelance, pas de
// bloc/carte individuel — juste un trait séparateur entre les entrées).
//
// Regroupement :
// - Expériences : expériences sans statut (affichées d'office) + expériences
//   "freelance" ayant show_in_timeline=1 (forcées individuellement) + UNE entrée
//   groupée "Designer numérique freelance" (date de début la plus ancienne
//   parmi TOUTES les expériences freelance, forcées ou non → aujourd'hui, tags
//   jobs cumulés des expériences non forcées). Tri chrono strict (en cours
//   d'abord, puis date de début décroissante).
// - Formations : statut "formation".
// - Études : statut "school".
// =============================================================================
(function () {
  'use strict';

  let _cachedExperiences = null; // permet de ré-afficher sans refetch au changement de langue

  // Sépare les expériences en 3 groupes, agrège les freelance non forcées en une seule entrée
  function _groupExperiences(experiences) {
    const regular   = [];
    const formation = [];
    const etude     = [];

    experiences.forEach(exp => {
      if (exp.status === 'formation') {
        formation.push(exp);
      } else if (exp.status === 'school') {
        etude.push(exp);
      } else if (!exp.status || +exp.show_in_timeline) {
        regular.push(exp); // pas de statut, ou freelance forcée via show_in_timeline
      }
    });

    const allFreelance      = experiences.filter(e => e.status === 'freelance');
    const nonForcedFreelance = allFreelance.filter(e => !+e.show_in_timeline);
    if (allFreelance.length) {
      // Toutes les expériences freelance comptent dans le calcul de la date de
      // début, même celles déjà affichées individuellement dans la timeline.
      const earliestStart = allFreelance
        .map(e => e.date_start).filter(Boolean).sort()[0] || null;
      const tagMap = new Map();
      nonForcedFreelance.forEach(e => (e.tags || []).forEach(t => tagMap.set(t.id, t)));
      regular.push({
        status: 'freelance',
        title_fr: 'Designer num\u00e9rique freelance',
        title_en: 'Freelance digital designer',
        date_start: earliestStart,
        date_end: null,
        tags: [...tagMap.values()],
      });
    }

    // En cours (pas de date de fin) en premier, puis par date de début décroissante
    const _sort = arr => [...arr].sort((a, b) => {
      const aOn = !a.date_end, bOn = !b.date_end;
      if (aOn !== bOn) return aOn ? -1 : 1;
      return (b.date_start || '').localeCompare(a.date_start || '');
    });
    return { regular: _sort(regular), formation: _sort(formation), etude: _sort(etude) };
  }

  function _buildReadOnlyCard(exp, isEn) {
    const card = window._buildExpCard(exp, isEn);
    card.classList.add('expCard--bioTimeline');
    card.querySelector('.expCardActionBtns')?.remove();
    card.querySelector('.expBadgeFreelance')?.remove();
    return card;
  }

  function _renderGroup(container, items, label) {
    if (!items.length) return;
    const isEn = document.documentElement.lang === 'en';
    const grp = document.createElement('div');
    grp.className = 'basicBlock tagGroup';
    grp.innerHTML = `<span class="blockTitle tagGroupTitle">${label}</span>`;
    items.forEach(exp => grp.appendChild(_buildReadOnlyCard(exp, isEn)));
    container.appendChild(grp);
  }

  function _render(isEn) {
    if (!_cachedExperiences) return;
    const container = document.getElementById('bioTimelineContainer');
    if (!container) return;
    container.innerHTML = '';
    const { regular, formation, etude } = _groupExperiences(_cachedExperiences);
    _renderGroup(container, regular,   isEn ? 'Experiences' : 'Exp\u00e9riences');
    _renderGroup(container, formation, isEn ? 'Training'    : 'Formations');
    _renderGroup(container, etude,     isEn ? 'Studies'     : '\u00c9tudes');
    if (!container.children.length) {
      container.innerHTML = `<p class="adminPlaceholder">${isEn ? 'Nothing yet.' : 'Rien pour le moment.'}</p>`;
    }
    window._refreshSectionScrollUI?.();
  }

  async function _loadBioTimeline() {
    const isEn = document.documentElement.lang === 'en';
    try {
      const res  = await fetch('controller/controller.php?action=admin_experiences&sub=list');
      const json = await res.json();
      if (!json.success) return;
      _cachedExperiences = json.experiences || [];
      _render(isEn);
    } catch (_) {}
  }

  document.addEventListener('languagechange', (e) => _render(e.detail.lang === 'en'));

  // Exposée pour être appelée depuis navigation.js à chaque affichage de la home
  window._loadBioTimeline = _loadBioTimeline;
})();

