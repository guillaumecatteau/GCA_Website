// =============================================================================
// HOME HERO — Titre principal + sous-titres défilants de la section Accueil
// =============================================================================
// cf. Redéfinition de la section Accueil :
//  - Taille du titre + sous-titres réglable (vh, cf. Settings admin tool), jamais affectée
//    par le zoom navigateur, et TOUJOURS proportionnelle au logo de la scène 3D (qui suit
//    lui aussi window.innerHeight) — cf. _applyHeroScale() ci-dessous : titre ET sous-titre
//    sont mis à l'échelle comme UN SEUL groupe rigide (#homeHeroGroup, cf. _navigation.scss)
//    via un unique transform:scale(), ce qui garantit que l'espacement des lettres, la
//    taille du sous-titre et la distance titre/sous-titre gardent TOUJOURS le même ratio
//    entre eux (cf. bug rapporté : le letter-spacing en px fixe ne suivait pas le vh du
//    titre, cassant la composition avec le logo).
//  - Sous-titres gérés depuis Settings (FR/EN, réordonnables), défilent les uns
//    après les autres avec le même effet de bascule 3D lettre par lettre que les
//    autres titres du site (cf. titleDisplay()/titleHide(), vue/navigation.js).
//  - Couleur des sous-titres prélevée en temps réel sur le ColorMapLead de la
//    scène 3D (position 50%, cf. vue/threejs-background.js), à un taux de
//    rafraîchissement réglable (ms).
// =============================================================================
(function () {
  'use strict';

  let _subtitles = [];
  let _cycleIndex = 0;
  let _cycleTimer = null;
  let _colorTimer = null;
  let _started = false;

  // Durée d'affichage par défaut d'un sous-titre avant de passer au suivant — réglable
  // depuis Settings (hero_subtitle_hold_ms, cf. model/model_admin.php), cette constante ne
  // sert plus que de secours tant que le fetch de _init() n'a pas répondu.
  let _holdMs = 3500;

  // ===========================================================================
  // IMMUNITÉ AU ZOOM NAVIGATEUR + RATIO FIXE AVEC LE LOGO 3D
  // ===========================================================================
  // Historique : une 1ère tentative (compensation JS devicePixelRatio en plus du vh CSS)
  // provoquait une double-compensation inversée. Une 2e tentative (vh CSS seul, sans aucune
  // compensation JS, sur la théorie que vh serait "naturellement" immunisé au zoom par
  // annulation vh-shrink / devicePixelRatio-growth) s'est révélée INSUFFISANTE en pratique
  // (rapporté plusieurs fois, zoom navigateur continuant d'affecter visuellement le titre)
  // — et ne garantissait de toute façon PAS que titre/sous-titre gardent un ratio interne
  // fixe entre eux (letter-spacing en px fixe désynchronisé du vh de la taille).
  //
  // Approche actuelle, EXPLICITE et sans ambiguïté théorique : TOUTES les tailles/espacements
  // internes (titleVh, subtitleVh, titleLetterSpacing, subtitleDistanceVh) sont calculés UNE
  // FOIS en px fixes pour une hauteur de référence (REFERENCE_HEIGHT, 1080px — valeur neutre
  // ne changeant jamais), puis c'est l'ENSEMBLE du groupe #homeHeroGroup qui est mis à
  // l'échelle via un SEUL transform:scale(ratio) calculé ainsi :
  //   ratio = (window.innerHeight / REFERENCE_HEIGHT) * (devicePixelRatio / baselineDPR)
  // Le 1er facteur suit un vrai redimensionnement de fenêtre (desktop/tablette/mobile).
  // Le 2e facteur ANNULE EXPLICITEMENT tout changement de devicePixelRatio survenu depuis le
  // chargement de la page (zoom navigateur) — baselineDPR est figé une seule fois au
  // chargement. Un vrai resize ne touche jamais devicePixelRatio (2e facteur = 1, sans
  // effet) ; un zoom navigateur fait varier innerHeight ET devicePixelRatio ENSEMBLE dans le
  // même sens — mais puisque PLUS AUCUNE taille interne n'est exprimée en vh/% CSS natif
  // (tout est en px fixe + ce seul scale()), il n'y a qu'UN SEUL mécanisme de compensation
  // actif (pas de double-comptage possible par construction), et il est appliqué
  // explicitement plutôt que supposé. Ne jamais réintroduire de vh/% CSS sur .homeTitle/
  // .homeSubtitle : UNIQUEMENT ce scale() doit porter la réactivité à la fenêtre.
  //
  // Validé avec de VRAIES mesures navigateur (pas une simulation) : avant zoom
  // (innerHeight=2038, DPR=1) → scale=1.88704 ; après Ctrl+ (innerHeight=1359, DPR=1.5) →
  // scale=1.8875 — écart de 0.02%, confirmé stable.
  // ===========================================================================
  const REFERENCE_HEIGHT = 1080;
  // Plafond à 1.5 — DOIT rester synchronisé avec le plafond du renderer Three.js (cf.
  // vue/threejs-background.js, "Math.min(window.devicePixelRatio, 1.5)") : la scène 3D
  // (logo) plafonne SA PROPRE compensation DPR à 1.5 (optimisation perf) — sans appliquer
  // le MÊME plafond ici, le titre continuerait de compenser au-delà de ce seuil alors que
  // le logo, lui, plafonne : les deux cesseraient de suivre le même ratio passé ce point
  // (cf. "le titre et le logo fonctionnent ENSEMBLE" — exigence explicite). Avec ce plafond
  // identique des deux côtés, titre et logo saturent À LA MÊME VALEUR, donc restent
  // TOUJOURS dans le même rapport entre eux, quel que soit le niveau de zoom/DPI.
  const DPR_CAP = 1.5;
  const _baselineDPR = Math.min(window.devicePixelRatio || 1, DPR_CAP);
  let _titleOffsetPxAtRef = 0;
  let _lastScaleInnerHeight = null;
  let _lastScaleDPR = null;

  function _applyHeroScale() {
    const group = document.getElementById('homeHeroGroup');
    if (!group) return;
    const resizeRatio = window.innerHeight / REFERENCE_HEIGHT;
    const dprRatio = Math.min(window.devicePixelRatio || 1, DPR_CAP) / _baselineDPR;
    let scale = resizeRatio * dprRatio;
    // Contrainte de largeur (bug réel rapporté — "sur tablette/mobile le titre/sous-titre
    // n'ont plus du tout le rapport de taille défini à la base") : le calcul ci-dessus ne
    // réagit QU'À la hauteur de fenêtre, sans jamais vérifier que le sous-titre (le plus
    // large des deux, texte variable au fil du cycle) tient dans la LARGEUR disponible —
    // sur un viewport étroit mais relativement haut (mobile portrait typique : ~390×844),
    // le sous-titre débordait purement et simplement hors de l'écran (confirmé visuellement
    // par capture d'écran). "scrollWidth" reflète la largeur de layout INTRINSÈQUE du
    // groupe, à l'échelle 1, JAMAIS affectée par le transform:scale() déjà appliqué
    // (contrairement à getBoundingClientRect(), qui lui inclut le transform) — on peut donc
    // s'en servir à tout moment, quel que soit le scale courant, pour calculer le plafond
    // de largeur sans boucle de rétroaction.
    const naturalWidth = group.scrollWidth;
    if (naturalWidth > 0) {
      const maxWidthScale = (window.innerWidth - 32) / naturalWidth; // 16px de marge de chaque côté
      scale = Math.min(scale, maxWidthScale);
    }
    // offsetPx pré-multiplié par "scale" en JS (et non laissé à la composition CSS des
    // transforms) : on veut que la distance du titre au centre suive la MÊME échelle que
    // le reste du groupe, sans dépendre de l'ordre d'application translate/scale de CSS.
    const offsetPx = _titleOffsetPxAtRef * scale;
    group.style.transform =
      `translate(-50%, -50%) translateY(${offsetPx.toFixed(2)}px) scale(${scale.toFixed(5)})`;
  }

  // Note : le texte de bienvenue (#homeWelcomeText) n'a PLUS besoin d'être positionné ici —
  // c'est désormais un élément autonome, positionné directement via un "top: X%" fixé en
  // inline style SSR (cf. templates/pages/home.php + réglage "Position verticale du texte
  // de bienvenue" dans Settings) — une valeur CSS "%" est déjà naturellement immunisée au
  // zoom navigateur, sans le moindre calcul JS requis. L'ancienne approche (milieu calculé
  // entre le sous-titre et l'icône de scroll, recalculée à chaque frame) a été abandonnée :
  // elle dépendait de deux éléments positionnés indépendamment l'un de l'autre et ne
  // garantissait pas un rendu stable au tout premier paint (cf. bug rapporté "le titre
  // saute d'un coup au chargement").

  // ===========================================================================
  // SURVEILLANCE CONTINUE (requestAnimationFrame), PAS seulement sur l'évènement 'resize'
  // ===========================================================================
  // Un vrai zoom navigateur (Ctrl+/Ctrl-) fait VARIER window.innerHeight ET
  // devicePixelRatio ensemble (cf. plus haut), mais RIEN NE GARANTIT que l'évènement
  // DOM 'resize' se déclenche de façon fiable sur CE changement précis selon le
  // navigateur/la plateforme — s'appuyer uniquement sur ce listener s'est avéré
  // insuffisant en pratique. Cette boucle RAF ne dépend D'AUCUN évènement : elle compare
  // innerHeight/devicePixelRatio à chaque frame et ré-applique le scale dès que l'un des
  // deux change, qu'un 'resize' ait été émis ou non — c'est la seule garantie robuste
  // indépendante du comportement exact du navigateur. Coût négligible (une comparaison de
  // 2 nombres, 60×/s).
  function _watchHeroScale() {
    const h = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    if (h !== _lastScaleInnerHeight || dpr !== _lastScaleDPR) {
      _lastScaleInnerHeight = h;
      _lastScaleDPR = dpr;
      _applyHeroScale();
    }
    requestAnimationFrame(_watchHeroScale);
  }

  function _applySizing(heroSettings) {
    const refPxPerVh = REFERENCE_HEIGHT / 100;
    // Posées sur #homeHeroGroup directement (pas sur :root) : cf. templates/pages/home.php,
    // qui pose déjà ces MÊMES variables en inline style SSR (évite un bond visible de
    // taille au chargement, le temps que ce fetch admin_status aboutisse — cf. bug rapporté
    // "le titre saute d'un coup"). Les poser ici au même endroit (élément, pas racine)
    // garantit que cette mise à jour JS (cas où les réglages changeraient après le rendu
    // SSR initial) écrase bien la même source, sans ambiguïté de cascade.
    const group = document.getElementById('homeHeroGroup');
    const root = (group || document.documentElement).style;
    root.setProperty('--home-title-size', `${(heroSettings.titleVh * refPxPerVh).toFixed(1)}px`);
    root.setProperty('--home-subtitle-size', `${(heroSettings.subtitleVh * refPxPerVh).toFixed(1)}px`);
    // Espacement des lettres du titre — implémenté via le "gap" du flex .homeTitle (déjà le
    // mécanisme d'espacement inter-lettres utilisé par ce composant, cf. .titleMain gap:24px),
    // pas la propriété CSS letter-spacing (sans effet entre spans en display:flex). Déjà en
    // px fixe (pas de vh ici) : c'est désormais CORRECT, puisque c'est le scale() du groupe
    // entier qui porte la mise à l'échelle — garantit le même ratio que la taille du titre.
    root.setProperty('--home-title-letter-spacing', `${heroSettings.titleLetterSpacing}px`);
    // Distance titre → sous-titre — PX fixe à l'échelle de référence (plus du tout en vh :
    // cf. .homeSubtitle { margin-top } dans _navigation.scss).
    root.setProperty('--home-subtitle-distance', `${(heroSettings.subtitleDistanceVh * refPxPerVh).toFixed(1)}px`);
    // Position verticale du titre (écart par rapport au centre, en % de la hauteur de
    // référence) — appliquée via translateY() dans _applyHeroScale(), PAS via un "top: calc"
    // CSS (qui réintroduirait du %/vh natif non maîtrisé par le scale() explicite ci-dessus).
    _titleOffsetPxAtRef = (heroSettings.titleOffsetPct / 100) * REFERENCE_HEIGHT;
    _holdMs = heroSettings.subtitleHoldMs || _holdMs;
    // Opacité du sous-titre — posée en variable CSS directement sur #homeSubtitle (pas sur
    // :root, pour ne jamais affecter les autres titres du site qui partagent les mêmes
    // animations .rotateInSlow/.rotateOutSlow). Ces keyframes (cf. _animations.scss) ciblent
    // désormais directement "var(--subtitle-opacity, 1)" au lieu d'un 1 codé en dur : la
    // révélation ET la disparition animent donc NATIVEMENT vers/depuis cette valeur, sans le
    // moindre correctif JS a posteriori.
    const container = document.getElementById('homeSubtitle');
    if (container) container.style.setProperty('--subtitle-opacity', String(heroSettings.subtitleOpacity ?? 1));
    _applyHeroScale();
  }

  // ===========================================================================

  function _buildLetters(container, text) {
    container.innerHTML = '';
    text.split('').forEach((ch) => {
      const span = document.createElement('span');
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      container.appendChild(span);
    });
    // Le texte du sous-titre change (nouveau cycle ou changement de langue) → sa largeur
    // naturelle change aussi → le plafond de largeur dans _applyHeroScale() doit être
    // recalculé immédiatement (cf. commentaire détaillé là-bas), sans attendre un
    // changement de innerHeight/devicePixelRatio qui ne se produira pas forcément ici.
    _applyHeroScale();
  }

  function _currentText(entry) {
    const isEn = document.documentElement.lang === 'en';
    return (isEn ? entry.text_en : entry.text_fr) || entry.text_fr || entry.text_en || '';
  }

  function _showNextSubtitle(container) {
    if (!_subtitles.length) return;
    const entry = _subtitles[_cycleIndex % _subtitles.length];
    _cycleIndex++;
    _buildLetters(container, _currentText(entry));
    window.titleDisplay?.(container);
    clearTimeout(_cycleTimer);
    _cycleTimer = setTimeout(() => {
      window.titleHide?.(container);
      setTimeout(() => _showNextSubtitle(container), 600);
    }, _holdMs);
  }

  function _startColorSampling(container, intervalMs) {
    clearInterval(_colorTimer);
    const apply = () => {
      const color = window.GCABackground?.sampleColorMapLeadLive?.(0.5);
      if (color) container.style.color = `#${color.getHexString()}`;
    };
    apply();
    _colorTimer = setInterval(apply, Math.max(16, intervalMs || 200));
  }

  function _startCycle(heroSettings) {
    if (_started) return;
    _started = true;
    const container = document.getElementById('homeSubtitle');
    if (!container) return;
    _startColorSampling(container, heroSettings.colorSampleMs);
    _showNextSubtitle(container);
  }

  // Texte de bienvenue (cf. chronologie d'intro configurable) — simple fondu d'opacité,
  // desktop + tablette uniquement (cf. templates/pages/home.php #homeWelcomeText, caché en
  // CSS sur mobile, cf. _navigation.scss).
  function _displayWelcomeText() {
    const el = document.getElementById('homeWelcomeText');
    if (el) el.style.opacity = '1';
  }

  document.addEventListener('languagechange', () => {
    // Rebascule immédiatement le sous-titre affiché dans la nouvelle langue, sans
    // attendre le prochain cycle (même texte, juste retraduit).
    const container = document.getElementById('homeSubtitle');
    if (!container || !_subtitles.length) return;
    const entry = _subtitles[(_cycleIndex - 1 + _subtitles.length) % _subtitles.length];
    _buildLetters(container, _currentText(entry));
    window.titleDisplay?.(container);
  });

  function _init() {
    Promise.all([
      fetch('controller/controller.php?action=admin_status').then((r) => r.json()).catch(() => null),
      fetch('controller/controller.php?action=home_subtitles_public').then((r) => r.json()).catch(() => null),
    ]).then(([status, subtitlesJson]) => {
      const heroSettings = status?.heroSettings || {
        titleVh: 4.2, subtitleVh: 2.2, colorSampleMs: 200,
        titleOffsetPct: 7.5, titleLetterSpacing: 24, subtitleDistanceVh: 4.5,
        subtitleOpacity: 1, subtitleHoldMs: 3500,
      };
      _applySizing(heroSettings);
      // Le recalcul réactif à la fenêtre/au zoom est désormais entièrement porté par la
      // boucle RAF _watchHeroScale() (cf. plus haut) — _applySizing() elle-même ne dépend
      // plus que des réglages admin (vh → px de référence FIXES, cf. REFERENCE_HEIGHT),
      // elle n'a donc plus besoin d'être ré-exécutée sur 'resize'.
      _watchHeroScale();

      _subtitles = subtitlesJson?.success ? (subtitlesJson.subtitles || []) : [];
      // Révélation du texte de bienvenue (cf. Settings admin tool, chronologie d'intro) —
      // simple fondu, indépendant du cycle des sous-titres ci-dessous. Desktop/tablette
      // uniquement (mobile : non applicable, schedule() ne fait rien dans ce cas).
      window._introTimeline?.schedule('welcomeText', _displayWelcomeText);

      if (!_subtitles.length) return;

      // Démarrage du cycle planifié via la chronologie d'intro configurable ("subtitles",
      // cf. Settings admin tool). Repli sur l'ancienne approximation (durée de révélation
      // lettre par lettre du titre principal) si _introTimeline est indisponible.
      if (window._introTimeline) {
        window._introTimeline.schedule('subtitles', () => _startCycle(heroSettings));
      } else {
        const letterCount = document.querySelectorAll('.homeTitle > span').length || 10;
        setTimeout(() => _startCycle(heroSettings), letterCount * 75 + 900);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }
})();
