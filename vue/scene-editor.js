// ============================================================================
// Scene Editor — Éditeur d'états de scène Three.js
// Connecté à window.GCABackground via applyEditorState() / getSceneState()
// États persistés dans json/scene-states.json via controller/save_scene_states.php
// ============================================================================

// ─── État interne ─────────────────────────────────────────────────────────────
let _states              = {};     // { [id]: stateObj }
let _currentId           = null;   // ID de l'état sélectionné
let _isDirty             = false;  // Modifications non sauvegardées
// Master Scene / State Variation — cf. refonte architecture (plus de simple liste d'états
// interchangeables : "home" EST la master scene de référence, tout le reste n'est qu'une
// variation qui ne peut que faire varier intensité/portée/caméra/color map + une transition).
const MASTER_SCENE_ID = 'home';
let _scopeMode = 'master'; // 'master' | 'variation'

// ─── Keyframes par paramètre (état "Animé") ───────────────────────────────────
// Remplace, pour les nouveaux états, la logique de "sous-états" (snapshots complets de la
// scène) par des pistes indépendantes par paramètre exposé — cf. #seKeyframeTimeline. L'ancien
// système de sous-états reste fonctionnel en lecture pour les états déjà enregistrés sous cette
// forme (ex. "Intro") : les deux ne sont jamais actifs en même temps pour un même état.
let _kfMode      = 'static'; // 'static' | 'animated' — de l'état en cours d'édition
let _kfExposed   = new Set();  // ids de .seRow exposés à l'animation
let _kfTracks    = {};          // { rowId: [{t:0..1, v:number, e:'linear'|'easeIn'|'easeOut'|'easeInOut'}] }
let _kfPlayheadT = 0;
let _kfPlaying   = false;
let _kfPlayRAF   = null;
const _KF_EASING_FNS = {
  linear:    t => t,
  easeIn:    t => t * t,
  easeOut:   t => 1 - (1 - t) * (1 - t),
  easeInOut: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
};

// ─── Références UI ────────────────────────────────────────────────────────────
const SE = {
  get select()     { return document.getElementById('seStateSelect'); },
  get labelInput() { return document.getElementById('seStateLabelInput'); },
  get assignSelect() { return document.getElementById('seAssignSelect'); },
  get newBtn()     { return document.getElementById('seNewBtn'); },
  get duplicateBtn() { return document.getElementById('seDuplicateBtn'); },
  get saveBtn()    { return document.getElementById('seSaveBtn'); },
  get deleteBtn()  { return document.getElementById('seDeleteBtn'); },
  get previewBtn() { return document.getElementById('sePreviewBtn'); },
  get transitionPreviewBtn() { return document.getElementById('seTransitionPreviewBtn'); },
  get dirtyBadge() { return document.getElementById('seDirtyBadge'); },
  get statusMsg()  { return document.getElementById('seStatusMsg'); },
  get captureBtn() { return document.getElementById('seCaptureBtn'); },
  get readoutPre() { return document.getElementById('seReadoutPre'); },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function _setDirty(v) {
  _isDirty = v;
  if (SE.dirtyBadge) SE.dirtyBadge.style.display = v ? 'flex' : 'none';
  if (SE.saveBtn) SE.saveBtn.classList.toggle('btnOff', !v);
}

function _showStatus(msg, isError = false, duration = 2500) {
  const el = SE.statusMsg;
  if (!el) return;
  el.textContent = msg;
  el.className = 'seStatusMsg ' + (isError ? 'seStatusError' : 'seStatusOk');
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.textContent = ''; el.className = 'seStatusMsg'; }, duration);
}

// ─── Chargement des états depuis le serveur ───────────────────────────────────
async function _loadStates() {
  try {
    const r = await fetch('?action=scene_states', { method: 'GET' });
    const json = await r.json();
    if (json.success) {
      _states = json.states || {};
    } else {
      _showStatus('Erreur chargement états : ' + (json.message ?? ''), true);
    }
  } catch(e) {
    _showStatus('Erreur réseau lors du chargement des états.', true);
  }
}

// ─── Assignation d'une variation à une page/section du site ─────────────────
// Une variation n'a d'effet sur le site QUE si elle est explicitement assignée ici — pas de
// création automatique d'autorité sur toutes les sections/pages existantes. Options statiques
// (sections home + types de page) + options dynamiques (une par page "expertise" existante,
// pour cibler une page précise plutôt que tout le type).
const _HOME_SECTION_OPTIONS = [
  ['home:presentation', 'Section Home — Présentation'],
  ['home:expertise',    'Section Home — Expertise'],
  ['home:portfolio',    'Section Home — Portfolio'],
  ['home:bio',          'Section Home — Bio'],
  ['home:blog',         'Section Home — Blog'],
  ['home:contact',      'Section Home — Contact'],
];
const _PAGETYPE_OPTIONS = [
  ['pagetype:expertise', 'Toutes les pages — Expertise'],
  ['pagetype:projet',    'Toutes les pages — Projet'],
  ['pagetype:blog',      'Toutes les pages — Blog'],
];

async function _populateAssignSelect() {
  const sel = SE.assignSelect;
  if (!sel) return;
  const current = sel.value;
  function optgroup(label, options) {
    const g = document.createElement('optgroup');
    g.label = label;
    options.forEach(([value, text]) => {
      const o = document.createElement('option');
      o.value = value; o.textContent = text;
      g.appendChild(o);
    });
    return g;
  }
  sel.innerHTML = '<option value="">— Aucune —</option>';
  sel.appendChild(optgroup('Section de la home', _HOME_SECTION_OPTIONS));
  sel.appendChild(optgroup('Type de page', _PAGETYPE_OPTIONS));
  try {
    const r = await fetch('controller/controller.php?action=admin_pages&sub=list&type=expertise');
    const json = await r.json();
    if (json.success && Array.isArray(json.pages) && json.pages.length > 0) {
      sel.appendChild(optgroup('Page expertise spécifique', json.pages.map(p => ['page:' + p.slug, p.title_fr || p.title_en || p.slug])));
    }
  } catch (e) { /* liste dynamique optionnelle — pas bloquant si indisponible */ }
  sel.value = current;
}

// ─── Sauvegarde vers le serveur ───────────────────────────────────────────────
async function _saveState(id, state, label) {
  try {
    const r = await fetch('?action=scene_states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', id, state, label }),
    });
    const json = await r.json();
    if (json.success) {
      _states = json.states;
      _setDirty(false);
      _showStatus('État « ' + (label || id) + ' » sauvegardé.');
      _rebuildSelect(id);
    } else {
      _showStatus('Erreur sauvegarde : ' + (json.message ?? json.code), true);
    }
  } catch(e) {
    _showStatus('Erreur réseau lors de la sauvegarde.', true);
  }
}

async function _deleteState(id) {
  try {
    const r = await fetch('?action=scene_states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    const json = await r.json();
    if (json.success) {
      _states = json.states;
      _showStatus('État supprimé.');
      const ids = Object.keys(_states);
      _selectState(ids.length > 0 ? ids[0] : null);
      _rebuildSelect(_currentId);
    } else {
      _showStatus('Erreur suppression : ' + (json.message ?? json.code), true);
    }
  } catch(e) {
    _showStatus('Erreur réseau lors de la suppression.', true);
  }
}

// ─── Migration ancien format → nouveau modèle ───────────────────────────────
// Nouveau modèle (plus de "sous-états") : { label, mode, duration, state, exposedParams,
// tracks, assignment, transition }. "state" est l'unique snapshot de base du paramètre ; en
// mode "animated", les paramètres exposés sont animés par-dessus via les pistes de keyframes
// de la timeline (cf. _kfTracks), le reste restant figé à la valeur de "state".
const _KF_DEFAULT_TRANSITION = { duration: 1500, fadeIn: true, fadeOut: true };

function _migrateItem(item) {
  if (!item) return null;
  // Déjà au nouveau format.
  if (item.state !== undefined && !Array.isArray(item.subStates)) {
    return {
      label: item.label,
      mode: item.mode === 'animated' ? 'animated' : 'static',
      duration: item.duration ?? 0,
      state: item.state ?? {},
      exposedParams: item.exposedParams || [],
      tracks: item.tracks || {},
      assignment: item.assignment ?? null,
      transition: item.transition || { ..._KF_DEFAULT_TRANSITION },
    };
  }
  // Très vieux format ("type: animation" + "keyframes", antérieur aux sous-états eux-mêmes).
  if (item.type === 'animation') {
    const subStates = (item.keyframes ?? []).map((kf, i) => ({
      id: 'ss_' + i, time: Math.round((kf.time ?? 0) * 100), easing: kf.easing ?? 'linear', state: kf.state ?? null,
    }));
    return _migrateItem({ label: item.label, duration: item.duration ?? 2000, subStates });
  }
  // Format "sous-états" (refonte précédente) : converti en un "state" unique (0/1 sous-état)
  // ou en pistes de keyframes auto-générées par diff entre sous-états (plusieurs — ex: "Intro").
  if (Array.isArray(item.subStates)) {
    if (item.subStates.length > 1) return _autoMigrateSubStatesToTracks(item);
    return {
      label: item.label,
      mode: 'static',
      duration: 0,
      state: item.subStates[0]?.state ?? {},
      exposedParams: [],
      tracks: {},
      assignment: item.assignment ?? null,
      transition: item.transition || { ..._KF_DEFAULT_TRANSITION },
    };
  }
  // Objet état brut (format le plus ancien, avant même les sous-états).
  return {
    label: item.label,
    mode: 'static',
    duration: 0,
    state: item,
    exposedParams: [],
    tracks: {},
    assignment: null,
    transition: { ..._KF_DEFAULT_TRANSITION },
  };
}

// Conversion auto d'un ancien état multi-sous-états en pistes de keyframes : pour chaque
// paramètre suivi (même clé que les .seRow de l'inspecteur), si sa valeur diffère d'un
// sous-état à l'autre, une keyframe est créée par sous-état où elle est définie et le paramètre
// est automatiquement exposé. Base ("state") = le premier sous-état. Les lumières additionnelles
// sont suivies dynamiquement (tous les ids rencontrés dans n'importe quel sous-état).
const _KF_LEGACY_FIELD_GETTERS = {
  'seRow-camera-posX': s => s.camera?.posX,
  'seRow-camera-posY': s => s.camera?.posY,
  'seRow-camera-posZ': s => s.camera?.posZ,
  'seRow-camera-lookAtOffsetX': s => s.camera?.lookAtOffsetX,
  'seRow-camera-lookAtOffsetY': s => s.camera?.lookAtOffsetY,
  'seRow-camera-lookAtOffsetZ': s => s.camera?.lookAtOffsetZ,
  'seRow-lights-ambient-intensity': s => s.lights?.ambient?.intensity,
  'se-el-key-intensity': s => s.lights?.key?.intensity,
  'se-el-rimLeft-intensity': s => s.lights?.rimLeft?.intensity ?? s.lights?.rim?.intensity,
  'se-el-rimLeft-distance': s => s.lights?.rimLeft?.distance ?? s.lights?.rim?.distance,
  'se-el-rimRight-intensity': s => s.lights?.rimRight?.intensity,
  'se-el-rimRight-distance': s => s.lights?.rimRight?.distance,
  'seRow-logoLight-gradientSpeed': s => s.logoLight?.gradientSpeed,
  'seRow-logoLight-uvOffset': s => s.logoLight?.uvOffset,
  'seRow-logoLight-lightIntensity': s => s.logoLight?.lightIntensity,
  'seRow-logoLight-lightRange': s => s.logoLight?.lightRange,
};

function _autoMigrateSubStatesToTracks(item) {
  const subs = [...(item.subStates || [])].filter(ss => ss?.state).sort((a, b) => (a.time ?? 0) - (b.time ?? 0));
  const baseline = subs[0]?.state || {};
  const getters = { ..._KF_LEGACY_FIELD_GETTERS };
  const extraLightIds = new Set();
  subs.forEach(ss => (ss.state?.extraLights || []).forEach(l => l?.id && extraLightIds.add(l.id)));
  extraLightIds.forEach(id => {
    getters[`se-el-${id}-intensity`] = s => (s.extraLights || []).find(l => l.id === id)?.intensity;
    getters[`se-el-${id}-distance`]  = s => (s.extraLights || []).find(l => l.id === id)?.distance;
  });

  const tracks = {};
  const exposed = [];
  Object.entries(getters).forEach(([rowId, getter]) => {
    const kfs = [];
    subs.forEach(ss => {
      const v = getter(ss.state);
      if (typeof v === 'number') kfs.push({ t: (ss.time ?? 0) / 100, v, e: ss.easing || 'linear' });
    });
    if (kfs.length < 2) return;
    const distinct = new Set(kfs.map(k => Math.round(k.v * 1000)));
    if (distinct.size < 2) return; // valeur constante d'un sous-état à l'autre : pas la peine de l'exposer
    tracks[rowId] = kfs;
    exposed.push(rowId);
  });

  return {
    label: item.label,
    mode: 'animated',
    duration: item.duration ?? 2000,
    state: baseline,
    exposedParams: exposed,
    tracks,
    assignment: item.assignment ?? null,
    transition: item.transition || { ..._KF_DEFAULT_TRANSITION },
  };
}

// ─── Onglets ──────────────────────────────────────────────────────────────────
function _switchTab(tabId) {
  document.querySelectorAll('.seTab').forEach(btn => {
    btn.classList.toggle('seTab--active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.seTabPane').forEach(pane => {
    pane.classList.toggle('seTabPane--hidden', pane.id !== 'sePane-' + tabId);
  });
  // Les rows animables visibles dépendent de l'onglet actif (cf. _kfAnimatableRows) —
  // resynchronise les cases d'exposition/la timeline à chaque changement d'onglet.
  _kfRebuildExposeCheckboxes();
  _kfRebuildTrackList();
}

// ─── Sélection / population d'un état ────────────────────────────────────────
function _selectState(id) {
  _kfStop();
  _currentId = id;
  if (!id || !_states[id]) {
    _populateForm(null);
    if (SE.assignSelect) SE.assignSelect.value = '';
    _populateTransitionGroup(null);
    _kfMode = 'static'; _kfExposed = new Set(); _kfTracks = {};
    _kfSyncModeUI();
    _setDirty(false);
    return;
  }
  const item = _migrateItem(_states[id]);
  _states[id] = item;
  if (SE.labelInput) SE.labelInput.value = item.label ?? id;
  if (SE.assignSelect) SE.assignSelect.value = item.assignment ?? '';
  const _titleEl = document.getElementById('seAnimStateBoxTitle');
  if (_titleEl) _titleEl.textContent = item.label ?? id;
  const modeSel = document.getElementById('se-state-mode-select');
  if (modeSel) modeSel.value = item.mode ?? 'static';
  _populateTransitionGroup(item.transition);
  _svAnim('seRow-anim-duration', item.duration ?? 0);
  // Keyframes par paramètre (état "Animé") — restaure mode/exposition/pistes.
  _kfMode    = item.mode === 'animated' ? 'animated' : 'static';
  _kfExposed = new Set(item.exposedParams || []);
  _kfTracks  = JSON.parse(JSON.stringify(item.tracks || {}));
  _kfPlayheadT = 0;
  // Repart de zéro à chaque sélection d'état : pertinent surtout pour le mode "Jouer une fois"
  // du gradient ColorMapLead, qui sinon resterait figé indéfiniment après une première lecture.
  window.GCABackground?.resetColorMapAnimation?.();
  _populateForm(item.state);
  _applyFormToScene(item.state);
  _kfSyncModeUI();
  _setDirty(false);
}

// ─── Lecture/écriture du groupe "Transition" (fondu d'entrée/sortie de l'état) ───────────────
// Propriété de l'ÉTAT LUI-MÊME (item.transition), PAS du "state" (paramètres de scène) : ne
// transite donc jamais par _readForm()/_populateForm(). Sa méthode ne peut être qu'un fondu —
// les autres types de transition (linéaire/accél./décél.) ne s'appliquent qu'aux keyframes.
function _readTransitionGroup() {
  function rv(id) {
    const row = document.getElementById(id);
    if (!row) return undefined;
    const num = row.querySelector('input[type="number"]');
    const chk = row.querySelector('input[type="checkbox"]');
    if (chk) return chk.checked;
    if (num) return parseFloat(num.value);
    return undefined;
  }
  return {
    duration: rv('seRow-transition-duration') ?? _KF_DEFAULT_TRANSITION.duration,
    fadeIn:   rv('seRow-transition-fadeIn')   ?? _KF_DEFAULT_TRANSITION.fadeIn,
    fadeOut:  rv('seRow-transition-fadeOut')  ?? _KF_DEFAULT_TRANSITION.fadeOut,
  };
}

function _populateTransitionGroup(t) {
  function sv(id, value) {
    const row = document.getElementById(id);
    if (!row || value === undefined) return;
    const num = row.querySelector('input[type="number"]');
    const chk = row.querySelector('input[type="checkbox"]');
    if (chk) { chk.checked = !!value; return; }
    if (num) num.value = value;
  }
  const t2 = t || _KF_DEFAULT_TRANSITION;
  sv('seRow-transition-duration', t2.duration ?? _KF_DEFAULT_TRANSITION.duration);
  sv('seRow-transition-fadeIn',   t2.fadeIn   ?? _KF_DEFAULT_TRANSITION.fadeIn);
  sv('seRow-transition-fadeOut',  t2.fadeOut  ?? _KF_DEFAULT_TRANSITION.fadeOut);
}

// ════════════════════════════════════════════════════════════════════════════
// ─── Timeline de keyframes par paramètre (état "Animé") ──────────────────────
// ════════════════════════════════════════════════════════════════════════════
// Remplace les "sous-états" (snapshots complets) par des pistes indépendantes : chaque
// paramètre numérique de l'inspecteur peut être "exposé" (case à cocher) puis animé seul, avec
// ses propres keyframes/timing/transition, sans affecter les autres paramètres.

// Liste les .seRow animables actuellement visibles dans l'inspecteur (mode State Variation
// uniquement — la Master Scene n'a pas de notion d'animation interne) : exclut tout ce qui est
// master-only, les sélecteurs/couleurs/cases à cocher, les champs sans input number/range, et
// tout ce qui est actuellement masqué (onglet non actif, champ conditionnel caché).
function _kfAnimatableRows() {
  if (_scopeMode !== 'variation') return [];
  const rows = [];
  document.querySelectorAll('#seInspector .seRow[id]').forEach(row => {
    if (row.closest('[data-master-only]')) return;
    if (row.closest('.seTabPane--hidden')) return;
    if (row.closest('#seTransitionGroup')) return;
    if (row.id === 'seRow-anim-duration') return;
    if (row.classList.contains('seRowCheck') || row.classList.contains('seRowSelect') || row.classList.contains('seRowColor')) return;
    if (!row.querySelector('input[type="number"]') && !row.querySelector('input[type="range"]')) return;
    if (row.offsetParent === null) return; // masqué (display:none sur un ancêtre ou lui-même)
    rows.push(row);
  });
  return rows;
}

function _kfRowLabel(row) {
  const fieldLabel = row.querySelector('label')?.textContent?.trim() || row.id;
  const lightGroup = row.closest('.seExtraLight');
  if (lightGroup) {
    const glabel = lightGroup.querySelector('.seGroupLabel')?.textContent?.trim();
    if (glabel) return `${glabel} — ${fieldLabel}`;
  }
  const group = row.closest('.seGroup');
  const glabel = group?.querySelector(':scope > .seGroupLabel')?.textContent?.trim();
  return glabel ? `${glabel} — ${fieldLabel}` : fieldLabel;
}

function _kfRowGetValue(row) {
  const num = row?.querySelector('input[type="number"]');
  const rng = row?.querySelector('input[type="range"]');
  return parseFloat((num || rng)?.value ?? '0') || 0;
}

function _kfRowSetValue(row, v) {
  if (!row) return;
  const num = row.querySelector('input[type="number"]');
  const rng = row.querySelector('input[type="range"]');
  if (rng) rng.value = v;
  if (num) num.value = v;
}

// Injecte/retire la case "exposer à l'animation" devant chaque paramètre animable, selon
// _kfMode. La case est insérée dans un wrapper AUTOUR de la .seRow (jamais À L'INTÉRIEUR) :
// les helpers de lecture génériques rv()/gv() repèrent le "type" d'une row via le premier
// input trouvé (checkbox > couleur > nombre), une checkbox injectée DANS la row serait donc
// lue à la place de la vraie valeur numérique (bug constaté : camera.posX devenait un booléen).
// Appelée à chaque changement de mode, de scope, ou d'onglet (les lumières additionnelles sont
// reconstruites dynamiquement, donc leurs rows peuvent réapparaître sans leur wrapper).
function _kfRebuildExposeCheckboxes() {
  const show = _kfMode === 'animated' && _scopeMode === 'variation';
  document.querySelectorAll('#seInspector .seKfExposeWrap').forEach(wrap => {
    if (show) return;
    const row = wrap.querySelector(':scope > .seRow');
    if (row) wrap.replaceWith(row); else wrap.remove();
  });
  if (!show) return;
  _kfAnimatableRows().forEach(row => {
    _kfBindCommitOnChange(row);
    if (row.parentElement?.classList.contains('seKfExposeWrap')) {
      const chk = row.parentElement.querySelector(':scope > .seKfExposeChk');
      if (chk) chk.checked = _kfExposed.has(row.id);
      return;
    }
    const wrap = document.createElement('div');
    wrap.className = 'seKfExposeWrap';
    row.parentElement.insertBefore(wrap, row);
    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.className = 'seKfExposeChk';
    chk.title = "Exposer ce paramètre à l'animation";
    chk.checked = _kfExposed.has(row.id);
    chk.addEventListener('change', () => {
      if (chk.checked) _kfExposed.add(row.id);
      else { _kfExposed.delete(row.id); delete _kfTracks[row.id]; }
      _setDirty(true);
      _kfRebuildTrackList();
    });
    wrap.appendChild(chk);
    wrap.appendChild(row);
  });
}

// Comportement façon After Effects : une fois un paramètre exposé, modifier sa valeur PENDANT
// que le curseur de la timeline est sur une keyframe existante met à jour CETTE keyframe ;
// sinon, ça en crée une nouvelle à l'instant courant du curseur. Lié une seule fois par row
// (garde via dataset), indépendamment de l'état d'exposition courant (qui peut changer après
// coup) — _kfCommitValueAtPlayhead() revérifie l'exposition à chaque appel.
function _kfBindCommitOnChange(row) {
  if (row.dataset.kfCommitBound === '1') return;
  row.dataset.kfCommitBound = '1';
  const num = row.querySelector('input[type="number"]');
  const rng = row.querySelector('input[type="range"]');
  [num, rng].filter(Boolean).forEach(inp => {
    inp.addEventListener('change', () => _kfCommitValueAtPlayhead(row.id));
  });
}

// Crée ou met à jour (si une keyframe existe déjà à ± epsilon) la keyframe de `rowId` à
// l'instant courant du curseur, avec la valeur actuellement affichée dans son champ.
function _kfCommitValueAtPlayhead(rowId) {
  if (_kfMode !== 'animated' || !_kfExposed.has(rowId)) return;
  const row = document.getElementById(rowId);
  if (!row) return;
  const v = _kfRowGetValue(row);
  const track = _kfTracks[rowId] = _kfTracks[rowId] || [];
  const EPS = 0.0008;
  const existing = track.find(k => Math.abs(k.t - _kfPlayheadT) <= EPS);
  if (existing) {
    existing.v = v;
  } else {
    track.push({ t: _kfPlayheadT, v, e: 'linear' });
    track.sort((a, b) => a.t - b.t);
  }
  _kfRenderLane(rowId);
  _setDirty(true);
}

function _kfRenderLane(rowId) {
  const lane = document.querySelector(`.seKfLane[data-row-id="${CSS.escape(rowId)}"]`);
  if (!lane) return;
  lane.querySelectorAll('.seKfMarker').forEach(m => m.remove());
  (_kfTracks[rowId] || []).forEach((kf, idx) => {
    const m = document.createElement('div');
    m.className = 'seKfMarker';
    m.style.left = (kf.t * 100) + '%';
    m.title = `t=${Math.round(kf.t * 100)}% · valeur=${kf.v} · ${kf.e}`;
    m.addEventListener('mousedown', e => _kfMarkerMouseDown(e, rowId, idx));
    m.addEventListener('contextmenu', e => _kfMarkerContextMenu(e, rowId, idx));
    lane.appendChild(m);
  });
}

function _kfRebuildTrackList() {
  const list = document.getElementById('seKfTrackList');
  if (!list) return;
  list.innerHTML = '';
  if (_kfMode !== 'animated' || _scopeMode !== 'variation') return;
  _kfAnimatableRows().forEach(row => {
    if (!_kfExposed.has(row.id)) return;
    const track = document.createElement('div');
    track.className = 'seKfTrack';
    track.innerHTML = `<span class="seKfTrackLabel">${_kfRowLabel(row)}</span><div class="seKfLane" data-row-id="${row.id}"></div>`;
    list.appendChild(track);
    track.querySelector('.seKfLane').addEventListener('click', e => _kfLaneClick(e, row.id));
    _kfRenderLane(row.id);
  });
}

function _kfLaneClick(e, rowId) {
  if (e.target.classList.contains('seKfMarker')) return; // le marqueur gère son propre clic/drag
  const rect = e.currentTarget.getBoundingClientRect();
  const t = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const row = document.getElementById(rowId);
  const track = _kfTracks[rowId] = _kfTracks[rowId] || [];
  track.push({ t, v: _kfRowGetValue(row), e: 'linear' });
  track.sort((a, b) => a.t - b.t);
  _setDirty(true);
  _kfRenderLane(rowId);
}

function _kfMarkerMouseDown(e, rowId, idx) {
  e.preventDefault();
  e.stopPropagation();
  const lane = e.currentTarget.parentElement;
  document.body.classList.add('seNoSelectDuringDrag');
  function onMove(ev) {
    const rect = lane.getBoundingClientRect();
    const t = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
    if (_kfTracks[rowId]?.[idx]) _kfTracks[rowId][idx].t = t;
    _kfRenderLane(rowId);
    _setDirty(true);
  }
  function onUp() {
    document.body.classList.remove('seNoSelectDuringDrag');
    _kfTracks[rowId]?.sort((a, b) => a.t - b.t);
    _kfRenderLane(rowId);
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

function _kfMarkerContextMenu(e, rowId, idx) {
  e.preventDefault();
  const menu = document.getElementById('seKfContextMenu');
  if (!menu) return;
  menu.style.left = e.clientX + 'px';
  menu.style.top  = e.clientY + 'px';
  menu.style.display = 'block';
  menu.dataset.rowId = rowId;
  menu.dataset.idx   = idx;
}

function _kfSampleTrackAt(rowId, t) {
  const track = _kfTracks[rowId];
  if (!track || track.length === 0) return undefined;
  const sorted = [...track].sort((a, b) => a.t - b.t);
  if (t <= sorted[0].t) return sorted[0].v;
  if (t >= sorted[sorted.length - 1].t) return sorted[sorted.length - 1].v;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i], b = sorted[i + 1];
    if (t >= a.t && t <= b.t) {
      const span = (b.t - a.t) || 1;
      const p = (_KF_EASING_FNS[b.e] || _KF_EASING_FNS.linear)((t - a.t) / span);
      return a.v + (b.v - a.v) * p;
    }
  }
  return sorted[sorted.length - 1].v;
}

function _kfApplySampledValues() {
  if (_kfMode !== 'animated') return;
  let changed = false;
  _kfExposed.forEach(rowId => {
    const row = document.getElementById(rowId);
    const v = _kfSampleTrackAt(rowId, _kfPlayheadT);
    if (row && v !== undefined) { _kfRowSetValue(row, v); changed = true; }
  });
  if (changed) _applyFormToScene(_readForm());
}

function _kfSetPlayheadT(t) {
  _kfPlayheadT = Math.max(0, Math.min(1, t));
  const ph = document.getElementById('seKfPlayhead');
  if (ph) ph.style.left = (_kfPlayheadT * 100) + '%';
  const dur = _states[_currentId]?.duration ?? 0;
  const input = document.getElementById('seKfTimeInput');
  // Ne pas écraser la valeur pendant que l'utilisateur est en train de la saisir.
  if (input && document.activeElement !== input) input.value = Math.round(_kfPlayheadT * dur);
  _kfApplySampledValues();
}

// Marqueurs de temps en secondes sur la règle de la timeline — pas adaptatif selon la durée
// totale pour garder un nombre de graduations lisible (jamais plus d'une quinzaine).
function _kfRebuildRulerTicks() {
  const ruler = document.getElementById('seKfRuler');
  if (!ruler) return;
  ruler.querySelectorAll('.seKfRulerTick').forEach(el => el.remove());
  const dur = _states[_currentId]?.duration ?? 0;
  if (dur <= 0) return;
  const durationSec = dur / 1000;
  const steps = [0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300];
  const step = steps.find(s => durationSec / s <= 12) ?? steps[steps.length - 1];
  for (let s = 0; s <= durationSec + 0.0001; s += step) {
    const t = Math.min(s / durationSec, 1);
    const tick = document.createElement('div');
    tick.className = 'seKfRulerTick';
    tick.style.left = (t * 100) + '%';
    const label = String(Math.round(s * 100) / 100);
    tick.innerHTML = `<span class="seKfRulerTickLabel">${label}s</span>`;
    ruler.appendChild(tick);
  }
}

function _kfPlay() {
  if (_kfMode !== 'animated' || _kfPlaying) return;
  const dur = _states[_currentId]?.duration ?? 0;
  if (dur <= 0) { _showStatus('Durée = 0 — réglez la durée de l\'état avant de lire.', true); return; }
  _kfPlaying = true;
  const startT = _kfPlayheadT >= 1 ? 0 : _kfPlayheadT;
  const startTime = performance.now();
  function tick(now) {
    if (!_kfPlaying) return;
    const t = startT + (now - startTime) / dur;
    if (t >= 1) { _kfSetPlayheadT(1); _kfPlaying = false; return; }
    _kfSetPlayheadT(t);
    _kfPlayRAF = requestAnimationFrame(tick);
  }
  _kfPlayRAF = requestAnimationFrame(tick);
}

function _kfStop() {
  _kfPlaying = false;
  if (_kfPlayRAF) cancelAnimationFrame(_kfPlayRAF);
  _kfPlayRAF = null;
}

// ─── Navigation façon lecteur vidéo (début / keyframe précédente/suivante / fin) ──────────────
// Considère TOUTES les pistes exposées ensemble : la "keyframe suivante/précédente" est la plus
// proche dans le temps, tous paramètres confondus (pas par piste individuelle).
function _kfAllKeyframeTimes() {
  const times = new Set();
  Object.values(_kfTracks).forEach(track => (track || []).forEach(kf => times.add(Math.round(kf.t * 10000) / 10000)));
  return Array.from(times).sort((a, b) => a - b);
}

function _kfJumpToStart() { _kfStop(); _kfSetPlayheadT(0); }
function _kfJumpToEnd()   { _kfStop(); _kfSetPlayheadT(1); }

function _kfJumpToPrevKeyframe() {
  _kfStop();
  const times = _kfAllKeyframeTimes();
  const prev = [...times].reverse().find(t => t < _kfPlayheadT - 0.0005);
  _kfSetPlayheadT(prev !== undefined ? prev : 0);
}

function _kfJumpToNextKeyframe() {
  _kfStop();
  const times = _kfAllKeyframeTimes();
  const next = times.find(t => t > _kfPlayheadT + 0.0005);
  _kfSetPlayheadT(next !== undefined ? next : 1);
}

// Synchronise toute l'UI de la timeline du bas avec _kfMode/_kfExposed/_kfTracks courants —
// appelée après sélection d'état, changement de scope, ou changement de mode statique/animé.
function _kfSyncModeUI() {
  const modeSel = document.getElementById('se-state-mode-select');
  if (modeSel) modeSel.value = _kfMode;
  const show = _kfMode === 'animated' && _scopeMode === 'variation';
  const panel = document.getElementById('seKeyframeTimeline');
  if (panel) panel.style.display = show ? 'flex' : 'none';
  _kfRebuildExposeCheckboxes();
  _kfRebuildTrackList();
  _kfRebuildRulerTicks();
  _kfSetPlayheadT(0);
}

// ─── Reconstruction du <select> ───────────────────────────────────────────────
function _rebuildSelect(activeId) {
  const sel = SE.select;
  if (!sel) return;
  sel.innerHTML = '';
  // Master Scene : un seul choix possible, "home" (toujours la scène de référence active).
  // State Variation : toutes les variations SAUF la Master Scene, qui n'en est pas une.
  const ids = _scopeMode === 'variation'
    ? Object.keys(_states).filter(id => id !== MASTER_SCENE_ID)
    : Object.keys(_states).filter(id => id === MASTER_SCENE_ID);
  sel.disabled = (_scopeMode === 'master');
  if (ids.length === 0) {
    sel.innerHTML = _scopeMode === 'variation' ? '<option value="">— Aucune variation —</option>' : '<option value="">— Master Scene introuvable —</option>';
    return;
  }
  ids.forEach(id => {
    const item = _states[id];
    const opt = document.createElement('option');
    opt.value = id;
    const dur = _migrateItem(item)?.duration ?? 0;
    const badge = dur > 0 ? ' [▶]' : '';
    opt.textContent = (item.label || id) + badge;
    if (id === activeId) opt.selected = true;
    sel.appendChild(opt);
  });
}

// ─── Appliquer un état à la scène Three.js ────────────────────────────────────
function _applyFormToScene(state) {
  if (!state) return;
  window.GCABackground?.applyEditorState(state);
}

// ─── Helpers gradient LogoLight ──────────────────────────────────────────────
// Position par défaut (répartition uniforme) pour un stop d'index i parmi n — reflète
// _resolveStopPositions() côté moteur (threejs-background.js), à garder synchronisé.
function _defaultStopPos(i, n) { return n <= 1 ? 0 : i / (n - 1); }

function _updateGradientPreview() {
  const rows    = Array.from(document.querySelectorAll('#se-logoLight-stops .seGradientStop'));
  const preview = document.getElementById('se-logoLight-preview');
  if (!preview) return;
  if (rows.length === 0) { preview.style.background = '#222'; return; }
  const parts = rows.map(row => {
    const hex = row.querySelector('input[type="color"]').value;
    const pos = parseFloat(row.querySelector('.seGradientStopPos')?.value ?? '0');
    return `${hex} ${Math.round(pos * 100)}%`;
  });
  preview.style.background = `linear-gradient(to right, ${parts.join(', ')})`;
}

/** Markup d'une ligne de stop de dégradé (couleur + code hex + position + poignée de glisser). */
function _gradientStopRowHtml(hex, pos) {
  return `<span class="seGradientDragHandle" draggable="true" title="Glisser pour réordonner">⋮⋮</span>
      <input type="color" value="${hex}">
      <input type="text" class="seGradientStopHex" maxlength="7" value="${hex}" spellcheck="false" title="Code couleur hexadécimal (#rrggbb)">
      <input type="number" class="seGradientStopPos" min="0" max="1" step="0.01" value="${(+pos).toFixed(2)}" title="Position dans le dégradé (0-1)">
      <button class="seGradientRemoveBtn" title="Supprimer">×</button>`;
}

function _buildGradientStops(stops, positions) {
  const container = document.getElementById('se-logoLight-stops');
  if (!container) return;
  container.innerHTML = '';
  const list = (stops && stops.length > 0) ? stops : ['#4488ff', '#aa44ff', '#ff6644'];
  const n = list.length;
  list.forEach((hex, i) => {
    const pos = (Array.isArray(positions) && positions.length === n) ? positions[i] : _defaultStopPos(i, n);
    const row = document.createElement('div');
    row.className = 'seGradientStop';
    row.innerHTML = _gradientStopRowHtml(hex, pos);
    container.appendChild(row);
  });
  _updateGradientPreview();
}

// ─── Color Map Lead — preview temps réel + sélection de la position des lumières ─────
// Liste des lumières "fixes" (toujours présentes) pouvant utiliser le ColorMapLead.
// Pour chaque lumière dynamique (additionnelle), les ids suivent le même schéma que dans
// _extraLightFields : se-el-{id}-useLeadColor / se-el-{id}-leadColorPos.
const _CML_FIXED_LIGHTS = [
  { key: 'key',       label: 'Key Light',       chk: 'se-el-key-useLeadColor',      pos: 'se-el-key-leadColorPos' },
  { key: 'rimLeft',   label: 'Rim Light Left',  chk: 'se-el-rimLeft-useLeadColor',  pos: 'se-el-rimLeft-leadColorPos' },
  { key: 'rimRight',  label: 'Rim Light Right', chk: 'se-el-rimRight-useLeadColor', pos: 'se-el-rimRight-leadColorPos' },
  { key: 'logoLight', label: 'Point Light (mesh_light)', chk: 'seRow-logoLight-useLeadColor', pos: 'seRow-logoLight-leadColorPos' },
];

let _cmlSelectedKey = null;
let _cmlRafId        = null;
let _cmlDragging      = false;

/** Renvoie les inputs (checkbox + range) de la position/activation pour chaque lumière. */
function _cmlCollectLights() {
  const out = [];
  _CML_FIXED_LIGHTS.forEach(({ key, label, chk, pos }) => {
    const chkRow = document.getElementById(chk);
    const posRow = document.getElementById(pos);
    const chkEl  = chkRow?.querySelector('input[type="checkbox"]');
    const rngEl  = posRow?.querySelector('input[type="range"]');
    const numEl  = posRow?.querySelector('input[type="number"]');
    if (!chkEl || !rngEl) return;
    // Pour key/rimLeft/rimRight, préfère le libellé live (modifiable par double-clic) au
    // libellé statique par défaut, pour rester synchronisé après un renommage.
    const liveLabel = document.getElementById(chk)?.closest('.seExtraLight')?.querySelector('.seGroupLabel')?.textContent?.trim();
    out.push({ key, label: liveLabel || label, chkEl, rngEl, numEl });
  });
  document.querySelectorAll('#se-extraLights-list .seExtraLight').forEach(group => {
    const id    = group.dataset.lightId;
    const label = group.querySelector('.seGroupLabel')?.textContent?.trim() || id;
    const chkEl = document.getElementById(`se-el-${id}-useLeadColor`)?.querySelector('input[type="checkbox"]');
    const posRow = document.getElementById(`se-el-${id}-leadColorPos`);
    const rngEl = posRow?.querySelector('input[type="range"]');
    const numEl = posRow?.querySelector('input[type="number"]');
    if (!chkEl || !rngEl) return; // HemisphereLight n'a pas ces champs
    out.push({ key: `extra:${id}`, label, chkEl, rngEl, numEl });
  });
  return out;
}

function _cmlSetPosition(entry, posValue) {
  const v = Math.max(0, Math.min(1, posValue));
  entry.rngEl.value = v;
  if (entry.numEl) entry.numEl.value = v;
  // Déclenche le binding générique (.seRow auto-binder) déjà attaché par _bindControls(),
  // qui synchronise range↔number, marque l'état "non sauvegardé" et ré-applique la scène.
  entry.rngEl.dispatchEvent(new Event('input', { bubbles: true }));
}

function _cmlPosFromClientX(clientX) {
  const wrap = document.getElementById('seCmlPreviewWrap');
  if (!wrap) return 0;
  const rect = wrap.getBoundingClientRect();
  // Correspondance directe avec mesh_light : pos=0 (une extrémité de la mesh) à gauche,
  // pos=1 (l'autre extrémité) à droite — cf. _cmlRenderStrip pour le détail du mapping
  // physique (quelle extrémité de la mesh est "gauche" ou "droite" dans la scène).
  return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
}

function _cmlRenderStrip() {
  const canvas = document.getElementById('seCmlPreviewCanvas');
  const sample = window.GCABackground?.sampleColorMapLeadLive;
  if (!canvas || !sample) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const img = ctx.createImageData(w, h);
  for (let x = 0; x < w; x++) {
    // Axe horizontal = position physique le long de mesh_light, dans le même sens que
    // "pos" (0 = sommet de la mesh dans la scène, 1 = bas) : la formule pos→couleur
    // (sampleColorMapLeadLive) reste strictement inchangée/exacte, seule la correspondance
    // x↔pos est choisie ici pour que la bande se lise dans le même ordre spatial que la
    // mesh réelle (gauche=sommet, droite=bas) — le sens de LECTURE dans le temps (gauche→
    // droite ou inverse) reste piloté indépendamment par "Sens inversé" (gradientReverse).
    const c = sample(x / (w - 1)); // THREE.Color — accessible directement, pas besoin d'import THREE ici
    const r = Math.round((c?.r ?? 1) * 255);
    const g = Math.round((c?.g ?? 1) * 255);
    const b = Math.round((c?.b ?? 1) * 255);
    for (let y = 0; y < h; y++) {
      const i = (y * w + x) * 4;
      img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function _cmlColorHex(pos) {
  const sample = window.GCABackground?.sampleColorMapLeadLive;
  const c = sample?.(pos);
  return c ? '#' + c.getHexString('srgb') : '#888888';
}

function _cmlRenderMarkersAndList() {
  const lights  = _cmlCollectLights();
  const markers = document.getElementById('seCmlMarkers');
  const list    = document.getElementById('seCmlLightList');
  if (!markers || !list) return;

  // Reconstruit entièrement à chaque frame : peu d'éléments, coût négligeable, et ça reste
  // automatiquement synchronisé avec les sliders existants de chaque groupe de lumière
  // sans avoir à écouter chacun individuellement.
  markers.innerHTML = '';
  list.innerHTML = '';

  lights.forEach(entry => {
    const enabled = entry.chkEl.checked;
    const pos     = parseFloat(entry.rngEl.value) || 0;
    const hex     = enabled ? _cmlColorHex(pos) : '#555555';
    const selected = entry.key === _cmlSelectedKey;

    if (enabled) {
      const marker = document.createElement('div');
      marker.className = 'seCmlMarker' + (selected ? ' seCmlMarker--selected' : '');
      marker.style.left = (pos * 100) + '%'; // correspondance directe avec mesh, cf. _cmlRenderStrip
      marker.style.setProperty('--cml-color', hex);
      marker.title = entry.label;
      marker.dataset.key = entry.key;
      markers.appendChild(marker);
    }

    const row = document.createElement('div');
    row.className = 'seCmlLightRow' + (selected ? ' seCmlLightRow--selected' : '');
    row.dataset.key = entry.key;
    row.innerHTML = `
      <input type="checkbox" class="seCmlRowChk" ${enabled ? 'checked' : ''}>
      <span class="seCmlSwatch" style="background:${hex}"></span>
      <span class="seCmlRowLabel">${entry.label}</span>
      <span class="seCmlRowPos">${pos.toFixed(2)}</span>`;
    row.querySelector('.seCmlRowChk').addEventListener('change', (e) => {
      entry.chkEl.checked = e.target.checked;
      entry.chkEl.dispatchEvent(new Event('change', { bubbles: true }));
      if (e.target.checked) _cmlSelectedKey = entry.key;
    });
    row.addEventListener('click', (e) => {
      if (e.target.classList.contains('seCmlRowChk')) return;
      _cmlSelectedKey = entry.key;
    });
    list.appendChild(row);
  });
}

let _cmlFrameCounter = 0;

function _cmlTick() {
  const visible = document.getElementById('cntSCENEEDITOR')?.classList.contains('se-visible');
  if (visible) {
    _cmlRenderStrip();
    // La bande colorée (défilement fluide) est redessinée chaque frame, mais la liste/les
    // repères (reconstruits via innerHTML, donc plus coûteux) n'ont besoin que de suivre
    // les changements de position/activation, pas la fluidité du défilement — 1 frame sur 4
    // (~15 Hz à 60fps) suffit largement et évite de recréer des nœuds DOM 60 fois/seconde.
    if (_cmlFrameCounter++ % 4 === 0) _cmlRenderMarkersAndList();
  }
  // En pause (basse fréquence) quand l'éditeur de scène n'est pas affiché, pour ne pas
  // gaspiller de CPU en arrière-plan sur le reste du site.
  _cmlRafId = visible
    ? requestAnimationFrame(_cmlTick)
    : setTimeout(_cmlTick, 400);
}

function _cmlStartLoop() {
  if (_cmlRafId !== null) return; // déjà démarré
  _cmlTick();
}

function _cmlBindDragInteraction() {
  const wrap = document.getElementById('seCmlPreviewWrap');
  if (!wrap) return;
  // Clic direct sur un repère → le sélectionne (délégation : les repères sont recréés à
  // chaque rendu de la liste, donc jamais de listener posé directement dessus).
  wrap.addEventListener('pointerdown', (e) => {
    const marker = e.target.closest?.('.seCmlMarker');
    if (marker?.dataset.key) _cmlSelectedKey = marker.dataset.key;
    if (!_cmlSelectedKey) return;
    _cmlDragging = true;
    wrap.setPointerCapture(e.pointerId);
    const lights = _cmlCollectLights();
    const entry  = lights.find(l => l.key === _cmlSelectedKey);
    if (entry) _cmlSetPosition(entry, _cmlPosFromClientX(e.clientX));
  });
  wrap.addEventListener('pointermove', (e) => {
    if (!_cmlDragging || !_cmlSelectedKey) return;
    const lights = _cmlCollectLights();
    const entry  = lights.find(l => l.key === _cmlSelectedKey);
    if (entry) _cmlSetPosition(entry, _cmlPosFromClientX(e.clientX));
  });
  wrap.addEventListener('pointerup',   () => { _cmlDragging = false; });
  wrap.addEventListener('pointercancel', () => { _cmlDragging = false; });
}

// ─── Helpers lumières additionnelles ─────────────────────────────────────────
// Types et valeurs par défaut disponibles pour TOUTE lumière (fixe ou additionnelle, sauf
// mesh_light) — utilisé à la fois pour l'ajout initial et pour le changement de type après
// coup via le sélecteur dans l'en-tête de chaque groupe.
const _LIGHT_DEFAULTS = {
  PointLight:       { color:'#ffffff', intensity:1.0, distance:10, decay:2, posX:0, posY:2, posZ:0 },
  DirectionalLight: { color:'#ffffff', intensity:1.0, posX:3, posY:4, posZ:2, rotX:0, rotY:0, rotZ:0 },
  SpotLight:        { color:'#ffffff', intensity:1.0, distance:10, angle:0.5236, penumbra:0.1, decay:2, posX:0, posY:3, posZ:0, rotX:0, rotY:0, rotZ:0 },
  HemisphereLight:  { skyColor:'#0088ff', groundColor:'#552200', intensity:0.5 },
  AmbientLight:     { color:'#ffffff', intensity:0.3 },
  RectAreaLight:    { color:'#ffffff', intensity:5, width:2, height:2, posX:0, posY:2, posZ:0 },
};

function _extraLightFields(type, data, id, variationMode = false) {
  const d   = data || {};
  const pfx = `se-el-${id}`;

  // Mode "State Variation" : seules intensité/portée sont éditables — le ColorMapLead (sa
  // position dans le dégradé) est une propriété de PLACEMENT de la lumière définie une seule
  // fois dans la Master Scene, au même titre que sa position/rotation ; une variation ne peut
  // pas la redéfinir. Ni création/déplacement/rotation/type, ni couleur directe, ni ombres non
  // plus. Rendu volontairement minimal : pas de ligne "Visible" ni de type particulier.
  if (variationMode) {
    const intensityMax = type === 'HemisphereLight' ? 5 : 20;
    let html = `
    <div class="seRow" id="${pfx}-intensity"><label>Intensité</label><input type="range" min="0" max="${intensityMax}" step="0.05" value="${d.intensity ?? 1}"><input type="number" min="0" max="${intensityMax}" step="0.05" value="${d.intensity ?? 1}"></div>`;
    if (['PointLight', 'SpotLight'].includes(type)) {
      html += `<div class="seRow" id="${pfx}-distance"><label>Portée</label><input type="range" min="0" max="50" step="0.5" value="${d.distance ?? 10}"><input type="number" min="0" max="50" step="0.5" value="${d.distance ?? 10}"><span class="seUnit">u</span></div>`;
    }
    return html;
  }

  const visibleChk = `<div class="seRow seRowCheck" id="${pfx}-visible"><label>Visible</label><input type="checkbox" ${d.visible !== false ? 'checked' : ''}></div>`;

  if (type === 'HemisphereLight') {
    return visibleChk + `
    <div class="seRow seRowColor" id="${pfx}-skyColor"><label>Ciel</label><input type="color" value="${d.skyColor || '#0088ff'}"></div>
    <div class="seRow seRowColor" id="${pfx}-groundColor"><label>Sol</label><input type="color" value="${d.groundColor || '#552200'}"></div>
    <div class="seRow" id="${pfx}-intensity"><label>Intensité</label><input type="range" min="0" max="5" step="0.05" value="${d.intensity ?? 0.5}"><input type="number" min="0" max="5" step="0.05" value="${d.intensity ?? 0.5}"></div>`;
  }

  let html = visibleChk + `
    <div class="seRow seRowColor" id="${pfx}-color"><label>Couleur</label><input type="color" value="${d.color || '#ffffff'}"></div>
    <div class="seRow" id="${pfx}-intensity"><label>Intensité</label><input type="range" min="0" max="20" step="0.05" value="${d.intensity ?? 1}"><input type="number" min="0" max="20" step="0.05" value="${d.intensity ?? 1}"></div>
    <div class="seRow seRowCheck" id="${pfx}-useLeadColor"><label>ColorMapLead</label><input type="checkbox" ${d.useLeadColor ? 'checked' : ''}></div>
    <div class="seRow" id="${pfx}-leadColorPos"><label>Position</label><input type="range" min="0" max="1" step="0.01" value="${d.leadColorPos ?? 0}"><input type="number" min="0" max="1" step="0.01" value="${d.leadColorPos ?? 0}"></div>`;

  // Ombres : uniquement pour les types qui supportent réellement castShadow en Three.js
  // (ni AmbientLight ni RectAreaLight, cf. _lightSupportsShadow côté moteur).
  const supportsShadow = !['AmbientLight', 'RectAreaLight'].includes(type);
  if (supportsShadow) {
    const shadowHidden = !d.castShadow ? ' style="display:none"' : '';
    html += `<div class="seRow seRowCheck" id="${pfx}-castShadow"><label>Ombres</label><input type="checkbox" ${d.castShadow ? 'checked' : ''}></div>
    <div class="seShadowParams"${shadowHidden} data-shadow-params-for="${id}">
      <div class="seRow" id="${pfx}-shadowOpacity"><label>Opacité</label><input type="range" min="0" max="1" step="0.01" value="${d.shadowOpacity ?? 1}"><input type="number" min="0" max="1" step="0.01" value="${d.shadowOpacity ?? 1}"></div>
      <div class="seRow" id="${pfx}-shadowRadius"><label>Diffusion</label><input type="range" min="0" max="10" step="0.1" value="${d.shadowRadius ?? 1}"><input type="number" min="0" max="10" step="0.1" value="${d.shadowRadius ?? 1}"></div>
    </div>`;
  }

  if (['PointLight', 'SpotLight'].includes(type)) {
    html += `
    <div class="seRow" id="${pfx}-distance"><label>Portée</label><input type="range" min="0" max="50" step="0.5" value="${d.distance ?? 10}"><input type="number" min="0" max="50" step="0.5" value="${d.distance ?? 10}"><span class="seUnit">u</span></div>
    <div class="seRow" id="${pfx}-decay"><label>Déclin</label><input type="range" min="0" max="5" step="0.1" value="${d.decay ?? 2}"><input type="number" min="0" max="5" step="0.1" value="${d.decay ?? 2}"></div>`;
  }

  if (['DirectionalLight', 'PointLight', 'SpotLight'].includes(type)) {
    html += `
    <div class="seRow" id="${pfx}-posX"><label>X</label><input type="range" min="-20" max="20" step="0.1" value="${d.posX ?? 0}"><input type="number" min="-20" max="20" step="0.1" value="${d.posX ?? 0}"><span class="seUnit">u</span></div>
    <div class="seRow" id="${pfx}-posY"><label>Y</label><input type="range" min="-20" max="20" step="0.1" value="${d.posY ?? 2}"><input type="number" min="-20" max="20" step="0.1" value="${d.posY ?? 2}"><span class="seUnit">u</span></div>
    <div class="seRow" id="${pfx}-posZ"><label>Z</label><input type="range" min="-20" max="20" step="0.1" value="${d.posZ ?? 0}"><input type="number" min="-20" max="20" step="0.1" value="${d.posZ ?? 0}"><span class="seUnit">u</span></div>`;
  }

  if (type === 'SpotLight') {
    html += `
    <div class="seRow" id="${pfx}-angle"><label>Angle</label><input type="range" min="0" max="1.5708" step="0.01" value="${d.angle ?? 0.5236}"><input type="number" min="0" max="1.5708" step="0.01" value="${d.angle ?? 0.5236}"><span class="seUnit">rad</span></div>
    <div class="seRow" id="${pfx}-penumbra"><label>Pénombre</label><input type="range" min="0" max="1" step="0.01" value="${d.penumbra ?? 0.1}"><input type="number" min="0" max="1" step="0.01" value="${d.penumbra ?? 0.1}"></div>`;
  }

  // Rotation (direction) — uniquement pour les types orientables via .target (Three.js
  // ignore .rotation pour Directional/SpotLight, cf. _applyLightRotation côté moteur).
  if (['DirectionalLight', 'SpotLight'].includes(type)) {
    html += `
    <div class="seRow" id="${pfx}-rotX"><label>Rot X</label><input type="range" min="-3.14159" max="3.14159" step="0.01" value="${d.rotX ?? 0}"><input type="number" min="-3.14159" max="3.14159" step="0.01" value="${d.rotX ?? 0}"><span class="seUnit">rad</span></div>
    <div class="seRow" id="${pfx}-rotY"><label>Rot Y</label><input type="range" min="-3.14159" max="3.14159" step="0.01" value="${d.rotY ?? 0}"><input type="number" min="-3.14159" max="3.14159" step="0.01" value="${d.rotY ?? 0}"><span class="seUnit">rad</span></div>
    <div class="seRow" id="${pfx}-rotZ"><label>Rot Z</label><input type="range" min="-3.14159" max="3.14159" step="0.01" value="${d.rotZ ?? 0}"><input type="number" min="-3.14159" max="3.14159" step="0.01" value="${d.rotZ ?? 0}"><span class="seUnit">rad</span></div>`;
  }

  if (type === 'RectAreaLight') {
    html += `
    <div class="seRow" id="${pfx}-width"><label>Largeur</label><input type="range" min="0.1" max="20" step="0.1" value="${d.width ?? 2}"><input type="number" min="0.1" max="20" step="0.1" value="${d.width ?? 2}"><span class="seUnit">u</span></div>
    <div class="seRow" id="${pfx}-height"><label>Hauteur</label><input type="range" min="0.1" max="20" step="0.1" value="${d.height ?? 2}"><input type="number" min="0.1" max="20" step="0.1" value="${d.height ?? 2}"><span class="seUnit">u</span></div>
    <div class="seRow" id="${pfx}-posX"><label>X</label><input type="range" min="-20" max="20" step="0.1" value="${d.posX ?? 0}"><input type="number" min="-20" max="20" step="0.1" value="${d.posX ?? 0}"><span class="seUnit">u</span></div>
    <div class="seRow" id="${pfx}-posY"><label>Y</label><input type="range" min="-20" max="20" step="0.1" value="${d.posY ?? 2}"><input type="number" min="-20" max="20" step="0.1" value="${d.posY ?? 2}"><span class="seUnit">u</span></div>
    <div class="seRow" id="${pfx}-posZ"><label>Z</label><input type="range" min="-20" max="20" step="0.1" value="${d.posZ ?? 0}"><input type="number" min="-20" max="20" step="0.1" value="${d.posZ ?? 0}"><span class="seUnit">u</span></div>`;
  }

  return html;
}

const _LIGHT_TYPE_OPTIONS = ['PointLight', 'DirectionalLight', 'SpotLight', 'HemisphereLight', 'AmbientLight', 'RectAreaLight'];

function _lightTypeSelectHtml(id, currentType) {
  const opts = _LIGHT_TYPE_OPTIONS.map(t => `<option value="${t}" ${t === currentType ? 'selected' : ''}>${t}</option>`).join('');
  return `<select class="seSelect seExtraLightTypeSelect" id="se-el-${id}-type">${opts}</select>`;
}

// `isCore` : lumières "fixes" du moteur (key/rimLeft/rimRight) — pas de bouton supprimer
// (identité fonctionnelle fixe, cf. threejs-background.js), mais mêmes capacités de
// changement de type/rotation/renommage que les lumières additionnelles classiques.
// `variationMode` : rendu restreint pour une "State Variation" (cf. refonte architecture) —
// ni type/renommage/suppression/réordonnancement, juste intensité/portée/ColorMapLead.
function _buildExtraLightGroup(id, lightData, isCore = false, variationMode = false) {
  const type  = lightData.type || 'PointLight';
  const label = lightData.label || type;
  const group = document.createElement('div');
  group.className      = 'seExtraLight' + (isCore ? ' seExtraLight--core' : '');
  group.dataset.lightId   = id;
  group.dataset.lightType = type;
  group.dataset.core      = isCore ? 'true' : 'false';
  const collapseBtn = `<button class="seExtraLightCollapseBtn" type="button" title="Replier/déplier">▾</button>`;
  const moveBtns = (!variationMode && !isCore)
    ? `<button class="seExtraLightMoveBtn" type="button" data-move="up" title="Monter">▲</button>
       <button class="seExtraLightMoveBtn" type="button" data-move="down" title="Descendre">▼</button>`
    : '';
  const labelHtml = variationMode
    ? `<span class="seGroupLabel">${label}</span>`
    : `<span class="seGroupLabel seGroupLabel--editable" title="Double-cliquer pour renommer">${label}</span>`;
  group.innerHTML = `${collapseBtn}
    <div class="seExtraLightHeader">
      ${labelHtml}
      ${variationMode ? '' : _lightTypeSelectHtml(id, type)}
      ${moveBtns}
      ${(isCore || variationMode) ? '' : '<button class="seExtraLightRemoveBtn" title="Supprimer">×</button>'}
    </div>
    <div class="seExtraLightFields">${_extraLightFields(type, lightData, id, variationMode)}</div>`;

  _bindExtraLightGroupEvents(group, variationMode);
  return group;
}

// Lie les événements d'un groupe de lumière (range↔number, couleur, checkbox, renommage,
// changement de type, repli/dépli, réordonnancement) — factorisé pour être ré-appliqué après
// une reconstruction des champs (changement de type) sans dupliquer la logique de binding.
function _bindExtraLightGroupEvents(group, variationMode = false) {
  group.dataset.variationMode = variationMode ? 'true' : 'false';
  group.querySelectorAll('.seRow').forEach(row => {
    const rng = row.querySelector('input[type="range"]');
    const num = row.querySelector('input[type="number"]');
    const col = row.querySelector('input[type="color"]');
    const chk = row.querySelector('input[type="checkbox"]');
    function _upd() { _setDirty(true); _applyFormToScene(_readForm()); }
    if (rng && num) {
      rng.addEventListener('input', () => { num.value = rng.value; _upd(); });
      num.addEventListener('input', () => {
        const v = parseFloat(num.value);
        if (!isNaN(v)) { rng.value = Math.min(parseFloat(rng.max), Math.max(parseFloat(rng.min), v)); _upd(); }
      });
      num.addEventListener('change', () => {
        const v = Math.min(parseFloat(rng.max), Math.max(parseFloat(rng.min), parseFloat(num.value) || 0));
        rng.value = v; num.value = v; _upd();
      });
    }
    if (col) col.addEventListener('input', _upd);
    if (chk) chk.addEventListener('change', _upd);
  });

  // Repli/dépli (n'affecte que l'affichage, pas les données)
  const collapseBtn = group.querySelector('.seExtraLightCollapseBtn');
  if (collapseBtn && !collapseBtn.dataset.bound) {
    collapseBtn.dataset.bound = 'true';
    collapseBtn.addEventListener('click', () => {
      group.classList.toggle('seExtraLight--collapsed');
    });
  }

  // Réordonnancement (▲▼) parmi les lumières additionnelles dynamiques — Master Scene
  // uniquement (les boutons ne sont générés que dans ce cas, cf. _buildExtraLightGroup).
  group.querySelectorAll('.seExtraLightMoveBtn').forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = 'true';
    btn.addEventListener('click', () => {
      const dir = btn.dataset.move;
      const sibling = dir === 'up' ? group.previousElementSibling : group.nextElementSibling;
      if (!sibling) return;
      if (dir === 'up') sibling.before(group); else sibling.after(group);
      _setDirty(true);
      _applyFormToScene(_readForm());
    });
  });

  // Afficher/masquer les paramètres d'ombre (opacité/diffusion) selon l'état de la case
  // "Ombres" — ils n'ont de sens que lorsqu'une ombre est effectivement activée.
  const castShadowRow = group.querySelector('.seRow[id$="-castShadow"]');
  const shadowParams  = group.querySelector('.seShadowParams');
  if (castShadowRow && shadowParams) {
    const chk = castShadowRow.querySelector('input[type="checkbox"]');
    chk?.addEventListener('change', () => {
      shadowParams.style.display = chk.checked ? '' : 'none';
    });
  }

  // Renommage par double-clic sur le libellé (Master Scene uniquement — pas de span
  // ".seGroupLabel--editable" généré en variationMode, donc rien à lier ici dans ce cas).
  const labelEl = group.querySelector('.seGroupLabel--editable');
  if (labelEl && !labelEl.dataset.renameBound) {
    labelEl.dataset.renameBound = 'true';
    labelEl.addEventListener('dblclick', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'seGroupLabelInput';
      input.value = labelEl.textContent.trim();
      input.maxLength = 40;
      labelEl.replaceWith(input);
      input.focus();
      input.select();
      const commit = () => {
        const newLabel = input.value.trim() || labelEl.textContent.trim();
        labelEl.textContent = newLabel;
        input.replaceWith(labelEl);
        _setDirty(true);
        _applyFormToScene(_readForm());
      };
      input.addEventListener('blur', commit);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') input.blur();
        if (e.key === 'Escape') { input.value = labelEl.textContent.trim(); input.blur(); }
      });
    });
  }

  // Changement de type : reconstruit les champs (différents par type) en conservant les
  // valeurs communes (couleur/intensité/position déjà présentes), puis réapplique à la scène.
  const typeSelect = group.querySelector('.seExtraLightTypeSelect');
  if (typeSelect && !typeSelect.dataset.bound) {
    typeSelect.dataset.bound = 'true';
    typeSelect.addEventListener('change', () => {
      const id = group.dataset.lightId;
      const newType = typeSelect.value;
      const prevData = _readExtraLightGroup(group);
      const merged = { ...(_LIGHT_DEFAULTS[newType] || {}), ...prevData, type: newType };
      group.dataset.lightType = newType;
      const fieldsWrap = group.querySelector('.seExtraLightFields');
      if (fieldsWrap) fieldsWrap.innerHTML = _extraLightFields(newType, merged, id, group.dataset.variationMode === 'true');
      _bindExtraLightGroupEvents(group, group.dataset.variationMode === 'true');
      _setDirty(true);
      _applyFormToScene(_readForm());
    });
  }
}

function _rebuildExtraLightsUI(extraLights, variationMode = false) {
  const list = document.getElementById('se-extraLights-list');
  if (!list) return;
  list.innerHTML = '';
  (extraLights || []).forEach(ld => {
    if (!ld?.id) return;
    list.appendChild(_buildExtraLightGroup(ld.id, ld, false, variationMode));
  });
}

function _readExtraLightGroup(group) {
  const id   = group.dataset.lightId;
  const type = group.dataset.lightType;
  const pfx  = `se-el-${id}`;
  function gv(prop) {
    const row = document.getElementById(`${pfx}-${prop}`);
    if (!row) return undefined;
    const num = row.querySelector('input[type="number"]');
    const col = row.querySelector('input[type="color"]');
    const chk = row.querySelector('input[type="checkbox"]');
    if (chk)  return chk.checked;
    if (col)  return col.value;
    if (num)  return parseFloat(num.value);
    return undefined;
  }
  // State Variation : ne lit QUE les champs autorisés (intensité/portée/ColorMapLead) — tout
  // le reste (couleur, position, type, ombres…) reste `undefined` pour ne jamais écraser la
  // valeur définie dans la Master Scene lors de la fusion (cf. _mergeVariationOntoMaster).
  if (group.dataset.variationMode === 'true') {
    const data = { id, type };
    data.intensity = gv('intensity');
    if (['PointLight', 'SpotLight'].includes(type)) data.distance = gv('distance');
    return data;
  }
  const labelEl = group.querySelector('.seGroupLabel--editable');
  const data = { id, type, label: labelEl?.textContent?.trim() || type, visible: gv('visible') !== false };
  if (type === 'HemisphereLight') {
    data.skyColor    = gv('skyColor')    ?? '#0088ff';
    data.groundColor = gv('groundColor') ?? '#552200';
    data.intensity   = gv('intensity')   ?? 0.5;
  } else {
    data.color     = gv('color')     ?? '#ffffff';
    data.intensity = gv('intensity') ?? 1.0;
    data.useLeadColor = gv('useLeadColor') ?? false;
    data.leadColorPos = gv('leadColorPos') ?? 0;
    if (type !== 'AmbientLight') data.castShadow = gv('castShadow') ?? false;
    if (!['AmbientLight', 'RectAreaLight'].includes(type)) {
      data.shadowOpacity = gv('shadowOpacity') ?? 1;
      data.shadowRadius  = gv('shadowRadius')  ?? 1;
    }
    if (['PointLight','SpotLight'].includes(type)) {
      data.distance = gv('distance') ?? 10;
      data.decay    = gv('decay')    ?? 2;
    }
    if (['DirectionalLight','PointLight','SpotLight'].includes(type)) {
      data.posX = gv('posX') ?? 0; data.posY = gv('posY') ?? 2; data.posZ = gv('posZ') ?? 0;
    }
    if (type === 'SpotLight') { data.angle = gv('angle') ?? 0.5236; data.penumbra = gv('penumbra') ?? 0.1; }
    if (['DirectionalLight', 'SpotLight'].includes(type)) {
      data.rotX = gv('rotX') ?? 0; data.rotY = gv('rotY') ?? 0; data.rotZ = gv('rotZ') ?? 0;
    }
    if (type === 'RectAreaLight') {
      data.width = gv('width') ?? 2; data.height = gv('height') ?? 2;
      data.posX  = gv('posX') ?? 0; data.posY   = gv('posY')  ?? 2; data.posZ = gv('posZ') ?? 0;
    }
  }
  return data;
}

function _readExtraLights() {
  const list = document.getElementById('se-extraLights-list');
  if (!list) return [];
  return Array.from(list.querySelectorAll('.seExtraLight')).map(g => _readExtraLightGroup(g));
}

// ─── Lumières "fixes" (key/rimLeft/rimRight) — mêmes champs/capacités que les lumières
// additionnelles (type, rotation, renommage), mais rendues dans des conteneurs dédiés
// (pas supprimables) et lues/appliquées via state.lights.{key,rimLeft,rimRight}, PAS
// extraLights — leur identité fonctionnelle (ColorMapLead, teinte dynamique) dépend de
// ces clés fixes côté moteur (threejs-background.js).
const _NAMED_LIGHT_CONTAINERS = {
  key:      'seKeyLightGroup',
  rimLeft:  'seRimLeftGroup',
  rimRight: 'seRimRightGroup',
};

function _readNamedLight(key) {
  const container = document.getElementById(_NAMED_LIGHT_CONTAINERS[key]);
  const group = container?.querySelector('.seExtraLight');
  if (!group) return undefined;
  const data = _readExtraLightGroup(group);
  delete data.id; // pas pertinent pour une lumière fixe
  return data;
}

function _populateNamedLight(key, defaultLabel, data, variationMode = false) {
  const container = document.getElementById(_NAMED_LIGHT_CONTAINERS[key]);
  if (!container) return;
  const d = { ...(data || {}), id: key, label: data?.label || defaultLabel, type: data?.type || 'DirectionalLight' };
  container.innerHTML = '';
  container.appendChild(_buildExtraLightGroup(key, d, true, variationMode));
}

function _rvAnim(id) {
  const row = document.getElementById(id);
  if (!row) return undefined;
  const num = row.querySelector('input[type="number"]');
  const rng = row.querySelector('input[type="range"]');
  if (num) return parseFloat(num.value);
  if (rng) return parseFloat(rng.value);
  return undefined;
}
function _svAnim(id, val) {
  const row = document.getElementById(id);
  if (!row || val === undefined) return;
  const num = row.querySelector('input[type="number"]');
  const rng = row.querySelector('input[type="range"]');
  if (rng) rng.value = val;
  if (num) num.value = val;
}

// ─── Lire le formulaire comme un objet état ───────────────────────────────────
// Dispatcheur : la Master Scene lit le formulaire complet (toute la config de scène), une
// State Variation ne lit QUE les champs qu'elle a le droit de faire varier (cf. refonte
// Master Scene / State Variation) — le reste reste `undefined` et n'écrase donc jamais la
// valeur de la master scene lors de la fusion (_mergeVariationOntoMaster).
function _readForm() {
  return _scopeMode === 'variation' ? _readVariationForm() : _readMasterForm();
}

function _readVariationForm() {
  function rv(id) {
    const row = document.getElementById(id);
    if (!row) return undefined;
    const num = row.querySelector('input[type="number"]');
    const rng = row.querySelector('input[type="range"]');
    const col = row.querySelector('input[type="color"]');
    const chk = row.querySelector('input[type="checkbox"]');
    if (chk) return chk.checked;
    if (col) return col.value;
    if (num) return parseFloat(num.value);
    if (rng) return parseFloat(rng.value);
    return undefined;
  }
  return {
    label: SE.labelInput?.value?.trim() || _currentId || 'variation',
    camera: {
      posX: rv('seRow-camera-posX'), posY: rv('seRow-camera-posY'), posZ: rv('seRow-camera-posZ'),
      lookAtOffsetX: rv('seRow-camera-lookAtOffsetX'),
      lookAtOffsetY: rv('seRow-camera-lookAtOffsetY'),
      lookAtOffsetZ: rv('seRow-camera-lookAtOffsetZ'),
    },
    lights: {
      ambient:  { intensity: rv('seRow-lights-ambient-intensity') },
      key:      _readNamedLight('key'),
      rimLeft:  _readNamedLight('rimLeft'),
      rimRight: _readNamedLight('rimRight'),
    },
    logoLight: {
      stops:            Array.from(document.querySelectorAll('#se-logoLight-stops .seGradientStop input[type="color"]')).map(i => i.value),
      stopPositions:     Array.from(document.querySelectorAll('#se-logoLight-stops .seGradientStop .seGradientStopPos')).map(i => parseFloat(i.value)),
      gradientSpeed:    rv('seRow-logoLight-gradientSpeed'),
      gradientReverse:  rv('seRow-logoLight-gradientReverse'),
      gradientPlayOnce: rv('seRow-logoLight-gradientPlayOnce'),
      uvOffset:         rv('seRow-logoLight-uvOffset'),
      lightIntensity:   rv('seRow-logoLight-lightIntensity'),
      lightRange:       rv('seRow-logoLight-lightRange'),
      useLeadColor:     rv('seRow-logoLight-useLeadColor'),
      leadColorPos:     rv('seRow-logoLight-leadColorPos'),
    },
    extraLights: _readExtraLights(),
  };
}

function _readMasterForm() {
  function rv(id) {
    const row = document.getElementById(id);
    if (!row) return undefined;
    const num = row.querySelector('input[type="number"]');
    const rng = row.querySelector('input[type="range"]');
    const col = row.querySelector('input[type="color"]');
    const chk = row.querySelector('input[type="checkbox"]');
    if (chk) return chk.checked;
    if (col) return col.value;
    if (num) return parseFloat(num.value);
    if (rng) return parseFloat(rng.value);
    return undefined;
  }
  return {
    label: SE.labelInput?.value?.trim() || _currentId || 'état',
    camera: {
      posX: rv('seRow-camera-posX'), posY: rv('seRow-camera-posY'), posZ: rv('seRow-camera-posZ'),
      fov:  rv('seRow-camera-fov'),  near: rv('seRow-camera-near'), far:  rv('seRow-camera-far'),
      lookAtOffsetX: rv('seRow-camera-lookAtOffsetX'),
      lookAtOffsetY: rv('seRow-camera-lookAtOffsetY'),
      lookAtOffsetZ: rv('seRow-camera-lookAtOffsetZ'),
    },
    theme: {
      wire:  rv('seRow-theme-wire'),
    },
    parallax: {
      strengthX:      rv('seRow-parallax-strengthX'),
      strengthY:      rv('seRow-parallax-strengthY'),
      mouseSmoothing: rv('seRow-parallax-mouseSmoothing'),
      cameraLerp:     rv('seRow-parallax-cameraLerp'),
    },
    lights: {
      ambient: {
        color:     rv('seRow-lights-ambient-color'),
        intensity: rv('seRow-lights-ambient-intensity'),
      },
      key:      _readNamedLight('key'),
      rimLeft:  _readNamedLight('rimLeft'),
      rimRight: _readNamedLight('rimRight'),
    },
    logo: {
      scale: rv('seRow-logo-scale'),
      posX: rv('seRow-logo-posX'), posY: rv('seRow-logo-posY'), posZ: rv('seRow-logo-posZ'),
      rotX: rv('seRow-logo-rotX'), rotY: rv('seRow-logo-rotY'), rotZ: rv('seRow-logo-rotZ'),
    },
    logoBody: {
      color:             rv('seRow-logoBody-color'),
      metalness:         rv('seRow-logoBody-metalness'),
      roughness:         rv('seRow-logoBody-roughness'),
      emissiveIntensity: rv('seRow-logoBody-emissiveIntensity'),
      castShadow:        rv('seRow-logoBody-castShadow'),
    },
    logoLight: {
      stops:             Array.from(document.querySelectorAll('#se-logoLight-stops .seGradientStop input[type="color"]')).map(i => i.value),
      stopPositions:     Array.from(document.querySelectorAll('#se-logoLight-stops .seGradientStop .seGradientStopPos')).map(i => parseFloat(i.value)),
      gradientSpeed:     rv('seRow-logoLight-gradientSpeed'),
      gradientReverse:   rv('seRow-logoLight-gradientReverse'),
      gradientPlayOnce:  rv('seRow-logoLight-gradientPlayOnce'),
      uvOffset:          rv('seRow-logoLight-uvOffset'),
      texScale:          rv('seRow-logoLight-texScale'),
      emissiveIntensity: rv('seRow-logoLight-emissiveIntensity'),
      lightIntensity:    rv('seRow-logoLight-lightIntensity'),
      lightRange:        rv('seRow-logoLight-lightRange'),
      normalOffset:      rv('seRow-logoLight-normalOffset'),
      castShadow:        rv('seRow-logoLight-castShadow'),
      useLeadColor:      rv('seRow-logoLight-useLeadColor'),
      leadColorPos:      rv('seRow-logoLight-leadColorPos'),
      rimTintBlend:      rv('seRow-logoLight-rimTintBlend'),
      keyTintBlend:      rv('seRow-logoLight-keyTintBlend'),
    },
    ground: {
      color:         rv('seRow-ground-color'),
      metalness:     rv('seRow-ground-metalness'),
      roughness:     rv('seRow-ground-roughness'),
      receiveShadow: rv('seRow-ground-receiveShadow'),
      scale:         rv('seRow-ground-scale'),
    },
    environment: {
      visible: rv('seRow-environment-visible'),
    },
    bloom: {
      enabled:   rv('seRow-bloom-enabled'),
      threshold: rv('seRow-bloom-threshold'),
      strength:  rv('seRow-bloom-strength'),
      radius:    rv('seRow-bloom-radius'),
      exposure:  rv('seRow-bloom-exposure'),
    },
    dof: {
      enabled:  rv('seRow-dof-enabled'),
      focus:    rv('seRow-dof-focus'),
      aperture: rv('seRow-dof-aperture'),
      maxblur:  rv('seRow-dof-maxblur'),
    },
    shadow: {
      keyResolution: rv('seRow-shadow-keyResolution'),
      keyRadius:     rv('seRow-shadow-keyRadius'),
      ptResolution:  rv('seRow-shadow-ptResolution'),
      ptRadius:      rv('seRow-shadow-ptRadius'),
    },
    particles: {
      count:        rv('seRow-particles-count'),
      colorNear:    rv('seRow-particles-colorNear'),
      colorFar:     rv('seRow-particles-colorFar'),
      colorMaxDist: rv('seRow-particles-colorMaxDist'),
      size:         rv('seRow-particles-size'),
      opacity:      rv('seRow-particles-opacity'),
      orbitSpeed:   rv('seRow-particles-orbitSpeed'),
      orbitCurve:   rv('seRow-particles-orbitCurve'),
      turbulence:   rv('seRow-particles-turbulence'),
      lifeMin:      rv('seRow-particles-lifeMin'),
      lifeMax:      rv('seRow-particles-lifeMax'),
      mouseInfluence: rv('seRow-particles-mouseInfluence'),
      mouseRadius:    rv('seRow-particles-mouseRadius'),
      mouseDepth:     rv('seRow-particles-mouseDepth'),
    },
    renderer: {
      clearColor: rv('seRow-renderer-clearColor'),
    },
    reflection: {
      enabled:         rv('seRow-reflection-enabled'),
      resolution:      rv('seRow-reflection-resolution'),
      bodyIntensity:   rv('seRow-reflection-bodyIntensity'),
      groundIntensity: rv('seRow-reflection-groundIntensity'),
      updateEvery:     rv('seRow-reflection-updateEvery'),
    },
    extraLights: _readExtraLights(),
  };
}

// ─── Peupler le formulaire depuis un objet état ───────────────────────────────
// Dispatcheur (cf. _readForm) : la Master Scene peuple le formulaire complet ; une State
// Variation peuple les champs autorisés en partant des valeurs de la Master Scene (référence
// visuelle du type/position de chaque lumière) surchargées par celles propres à la variation.
function _populateForm(state) {
  if (_scopeMode === 'variation') {
    const master = _migrateItem(_states[MASTER_SCENE_ID])?.state || {};
    _populateVariationForm(master, state || {});
  } else {
    _populateMasterForm(state);
  }
}

function _mergeLightForVariationDisplay(masterData, override) {
  const m = masterData || {};
  const o = override || {};
  return {
    ...m,
    intensity:    o.intensity    ?? m.intensity,
    distance:     o.distance     ?? m.distance,
    useLeadColor: o.useLeadColor ?? m.useLeadColor,
    leadColorPos: o.leadColorPos ?? m.leadColorPos,
  };
}

function _populateVariationForm(masterState, variationState) {
  function sv(rowId, value) {
    const row = document.getElementById(rowId);
    if (!row || value === undefined || value === null) return;
    const num = row.querySelector('input[type="number"]');
    const rng = row.querySelector('input[type="range"]');
    const chk = row.querySelector('input[type="checkbox"]');
    if (chk) { chk.checked = !!value; return; }
    if (rng) rng.value = value;
    if (num) num.value = value;
  }
  const m = masterState || {}, v = variationState || {};
  const mc = m.camera || {}, vc = v.camera || {};
  sv('seRow-camera-posX', vc.posX ?? mc.posX);
  sv('seRow-camera-posY', vc.posY ?? mc.posY);
  sv('seRow-camera-posZ', vc.posZ ?? mc.posZ);
  sv('seRow-camera-lookAtOffsetX', vc.lookAtOffsetX ?? mc.lookAtOffsetX ?? 0);
  sv('seRow-camera-lookAtOffsetY', vc.lookAtOffsetY ?? mc.lookAtOffsetY ?? 0);
  sv('seRow-camera-lookAtOffsetZ', vc.lookAtOffsetZ ?? mc.lookAtOffsetZ ?? 0);

  const ml = m.lights || {}, vl = v.lights || {};
  sv('seRow-lights-ambient-intensity', vl.ambient?.intensity ?? ml.ambient?.intensity ?? 1);

  _populateNamedLight('key',      'Key Light',       _mergeLightForVariationDisplay(ml.key, vl.key), true);
  _populateNamedLight('rimLeft',  'Rim Light Left',  _mergeLightForVariationDisplay(ml.rimLeft ?? ml.rim, vl.rimLeft), true);
  _populateNamedLight('rimRight', 'Rim Light Right', _mergeLightForVariationDisplay(ml.rimRight, vl.rimRight), true);

  const masterExtra = m.extraLights || [];
  const overridesById = new Map((v.extraLights || []).map(e => [e.id, e]));
  const mergedExtra = masterExtra.map(me => _mergeLightForVariationDisplay(me, overridesById.get(me.id)));
  _rebuildExtraLightsUI(mergedExtra, true);

  const mll = m.logoLight || {}, vll = v.logoLight || {};
  const stops = Array.isArray(vll.stops) && vll.stops.length > 0 ? vll.stops : (mll.stops || ['#4488ff', '#aa44ff', '#ff6644']);
  const stopPositions = Array.isArray(vll.stopPositions) && vll.stopPositions.length === stops.length ? vll.stopPositions : mll.stopPositions;
  _buildGradientStops(stops, stopPositions);
  sv('seRow-logoLight-gradientSpeed',    vll.gradientSpeed    ?? mll.gradientSpeed    ?? 0.5);
  sv('seRow-logoLight-gradientReverse',  vll.gradientReverse  ?? mll.gradientReverse  ?? false);
  sv('seRow-logoLight-gradientPlayOnce', vll.gradientPlayOnce ?? false);
  sv('seRow-logoLight-uvOffset',         vll.uvOffset         ?? mll.uvOffset         ?? 0);
  sv('seRow-logoLight-lightIntensity',   vll.lightIntensity   ?? mll.lightIntensity   ?? 1.5);
  sv('seRow-logoLight-lightRange',       vll.lightRange       ?? mll.lightRange       ?? 8.0);
  sv('seRow-logoLight-useLeadColor',     vll.useLeadColor     ?? false);
  sv('seRow-logoLight-leadColorPos',     vll.leadColorPos     ?? 0.5);
}

function _populateMasterForm(state) {
  function sv(rowId, value) {
    const row = document.getElementById(rowId);
    if (!row || value === undefined || value === null) return;
    const num = row.querySelector('input[type="number"]');
    const rng = row.querySelector('input[type="range"]');
    const col = row.querySelector('input[type="color"]');
    const chk = row.querySelector('input[type="checkbox"]');
    if (chk) { chk.checked = !!value; return; }
    if (col) { col.value = value; return; }
    if (rng) rng.value = value;
    if (num) num.value = value;
  }
  if (!state) return;

  const c  = state.camera      || {};
  const t  = state.theme       || {};
  const pa = state.parallax    || {};
  const l  = state.lights      || {};
  const g  = state.logo        || {};
  const lb = state.logoBody    || {};
  const ll = state.logoLight   || {};
  const gr = state.ground      || {};
  const ev = state.environment || {};
  const p  = state.particles   || {};
  const r  = state.renderer    || {};
  const al = l.ambient || {}, kl = l.key || {};
  // rétrocompat : anciens états n'ont qu'une clé "rim" (devenue rimLeft)
  const rlLeft  = l.rimLeft  ?? l.rim ?? {};
  const rlRight = l.rimRight ?? {};

  sv('seRow-camera-posX', c.posX); sv('seRow-camera-posY', c.posY); sv('seRow-camera-posZ', c.posZ);
  sv('seRow-camera-fov',  c.fov);  sv('seRow-camera-near', c.near); sv('seRow-camera-far',  c.far);
  sv('seRow-camera-lookAtOffsetX', c.lookAtOffsetX ?? 0);
  sv('seRow-camera-lookAtOffsetY', c.lookAtOffsetY ?? 0);
  sv('seRow-camera-lookAtOffsetZ', c.lookAtOffsetZ ?? 0);

  sv('seRow-theme-wire', t.wire);
  sv('seRow-parallax-strengthX', pa.strengthX ?? 0.7);
  sv('seRow-parallax-strengthY', pa.strengthY ?? 0.45);
  sv('seRow-parallax-mouseSmoothing', pa.mouseSmoothing ?? 0.06);
  sv('seRow-parallax-cameraLerp', pa.cameraLerp ?? 0.04);

  sv('seRow-lights-ambient-color', al.color); sv('seRow-lights-ambient-intensity', al.intensity);

  _populateNamedLight('key', 'Key Light', {
    type: kl.type || 'DirectionalLight', label: kl.label || 'Key Light',
    color: kl.color, intensity: kl.intensity,
    posX: kl.posX, posY: kl.posY, posZ: kl.posZ,
    rotX: kl.rotX ?? 0, rotY: kl.rotY ?? 0, rotZ: kl.rotZ ?? 0,
    castShadow: kl.castShadow !== false,
    useLeadColor: !!kl.useLeadColor, leadColorPos: kl.leadColorPos ?? 0,
  });
  _populateNamedLight('rimLeft', 'Rim Light Left', {
    type: rlLeft.type || 'DirectionalLight', label: rlLeft.label || 'Rim Light Left',
    color: rlLeft.color, intensity: rlLeft.intensity,
    posX: rlLeft.posX, posY: rlLeft.posY, posZ: rlLeft.posZ,
    rotX: rlLeft.rotX ?? 0, rotY: rlLeft.rotY ?? 0, rotZ: rlLeft.rotZ ?? 0,
    castShadow: rlLeft.castShadow ?? false,
    useLeadColor: !!rlLeft.useLeadColor, leadColorPos: rlLeft.leadColorPos ?? 0,
  });
  _populateNamedLight('rimRight', 'Rim Light Right', {
    type: rlRight.type || 'DirectionalLight', label: rlRight.label || 'Rim Light Right',
    color: rlRight.color ?? '#3366ff', intensity: rlRight.intensity ?? 0.35,
    posX: rlRight.posX ?? 4, posY: rlRight.posY ?? -2, posZ: rlRight.posZ ?? -3,
    rotX: rlRight.rotX ?? 0, rotY: rlRight.rotY ?? 0, rotZ: rlRight.rotZ ?? 0,
    castShadow: rlRight.castShadow ?? false,
    useLeadColor: !!rlRight.useLeadColor, leadColorPos: rlRight.leadColorPos ?? 1,
  });

  sv('seRow-logo-scale', g.scale ?? 1);
  sv('seRow-logo-posX', g.posX); sv('seRow-logo-posY', g.posY); sv('seRow-logo-posZ', g.posZ);
  sv('seRow-logo-rotX', g.rotX); sv('seRow-logo-rotY', g.rotY); sv('seRow-logo-rotZ', g.rotZ);

  sv('seRow-logoBody-color', lb.color ?? '#0a0a14');
  sv('seRow-logoBody-metalness', lb.metalness ?? 0.75);
  sv('seRow-logoBody-roughness', lb.roughness ?? 0.30);
  sv('seRow-logoBody-emissiveIntensity', lb.emissiveIntensity ?? 0.22);
  sv('seRow-logoBody-castShadow', lb.castShadow !== false);

  // Gradient stops (rétrocompat colorA/colorB)
  const defaultStops = ['#4488ff', '#aa44ff', '#ff6644'];
  let stops = Array.isArray(ll.stops) && ll.stops.length > 0 ? ll.stops
    : (ll.colorA || ll.colorB) ? [ll.colorA || '#4488ff', ll.colorB || '#ff6644']
    : defaultStops;
  _buildGradientStops(stops, ll.stopPositions);
  sv('seRow-logoLight-gradientSpeed', ll.gradientSpeed ?? 0.5);
  sv('seRow-logoLight-gradientReverse', !!ll.gradientReverse);
  sv('seRow-logoLight-gradientPlayOnce', !!ll.gradientPlayOnce);
  sv('seRow-logoLight-uvOffset', ll.uvOffset ?? 0);
  sv('seRow-logoLight-texScale',      ll.texScale      ?? 1.0);
  sv('seRow-logoLight-emissiveIntensity', ll.emissiveIntensity ?? 2.0);
  sv('seRow-logoLight-lightIntensity', ll.lightIntensity ?? 1.5);
  sv('seRow-logoLight-lightRange', ll.lightRange ?? 8.0);
  sv('seRow-logoLight-normalOffset', ll.normalOffset ?? 0.4);
  sv('seRow-logoLight-castShadow',   ll.castShadow !== false);
  sv('seRow-logoLight-useLeadColor', !!ll.useLeadColor);
  sv('seRow-logoLight-leadColorPos', ll.leadColorPos ?? 0.5);
  sv('seRow-logoLight-rimTintBlend', ll.rimTintBlend ?? 0.0);
  sv('seRow-logoLight-keyTintBlend', ll.keyTintBlend ?? 0.0);

  sv('seRow-ground-color', gr.color ?? '#111122');
  sv('seRow-ground-metalness', gr.metalness ?? 0.0);
  sv('seRow-ground-roughness', gr.roughness ?? 0.85);
  sv('seRow-ground-receiveShadow', gr.receiveShadow !== false);
  sv('seRow-ground-scale', gr.scale ?? 1);

  sv('seRow-environment-visible', ev.visible !== false);

  // Bloom
  const bl = state.bloom || {};
  sv('seRow-bloom-enabled',   bl.enabled   ?? true);
  sv('seRow-bloom-threshold', bl.threshold ?? 0.25);
  sv('seRow-bloom-strength',  bl.strength  ?? 1.2);
  sv('seRow-bloom-radius',    bl.radius    ?? 0.5);
  sv('seRow-bloom-exposure',  bl.exposure  ?? 1.0);

  // Profondeur de champ
  const dof = state.dof || {};
  sv('seRow-dof-enabled',  dof.enabled  ?? false);
  sv('seRow-dof-focus',    dof.focus    ?? 3.5);
  sv('seRow-dof-aperture', dof.aperture ?? 0.003);
  sv('seRow-dof-maxblur',  dof.maxblur  ?? 0.02);

  // Ombres
  const sh = state.shadow || {};
  sv('seRow-shadow-keyResolution', sh.keyResolution ?? 1024);
  sv('seRow-shadow-keyRadius',     sh.keyRadius     ?? 1);
  sv('seRow-shadow-ptResolution',  sh.ptResolution  ?? 512);
  sv('seRow-shadow-ptRadius',      sh.ptRadius      ?? 1);

  sv('seRow-particles-count',       p.count       ?? 1800);
  sv('seRow-particles-colorNear',    p.colorNear ?? p.color ?? '#888888');
  sv('seRow-particles-colorFar',     p.colorFar    ?? '#1a2244');
  sv('seRow-particles-colorMaxDist', p.colorMaxDist ?? 9.0);
  sv('seRow-particles-size',         p.size        ?? 0.03);
  sv('seRow-particles-opacity',      p.opacity     ?? 0.8);
  sv('seRow-particles-orbitSpeed',   p.orbitSpeed  ?? 0.3);
  sv('seRow-particles-orbitCurve',   p.orbitCurve  ?? 1.0);
  sv('seRow-particles-turbulence',   p.turbulence  ?? 0.15);
  sv('seRow-particles-lifeMin',      p.lifeMin     ?? 5.0);
  sv('seRow-particles-lifeMax',      p.lifeMax     ?? 15.0);
  sv('seRow-particles-mouseInfluence', p.mouseInfluence ?? 0.7);
  sv('seRow-particles-mouseRadius',    p.mouseRadius    ?? 2.5);
  sv('seRow-particles-mouseDepth',     p.mouseDepth     ?? 4.0);
  sv('seRow-renderer-clearColor', r.clearColor);

  const rf = state.reflection || {};
  sv('seRow-reflection-enabled',         rf.enabled         ?? false);
  sv('seRow-reflection-resolution',      rf.resolution      ?? 128);
  sv('seRow-reflection-bodyIntensity',   rf.bodyIntensity   ?? 0.3);
  sv('seRow-reflection-groundIntensity', rf.groundIntensity ?? 0.5);
  sv('seRow-reflection-updateEvery',     rf.updateEvery     ?? 3);

  _rebuildExtraLightsUI(state.extraLights || []);
}

// ─── Fusion State Variation → Master Scene ───────────────────────────────────
// Construit l'état "effectif" résultant de l'application d'une variation sur la master scene :
// clone profond de la master scene, puis surcharge UNIQUEMENT les champs que la variation a le
// droit de définir (camera pos/lookAt, intensité/portée/ColorMapLead par lumière, color map du
// logo, transition). Tout champ `undefined` côté variation est ignoré (conserve la valeur de la
// master scene) — c'est pour ça que _readVariationForm()/_readExtraLightGroup(variationMode)
// laissent les champs non autorisés à `undefined` plutôt que de les omettre côté objet.
function _mergeVariationOntoMaster(masterState, variationState) {
  const out = JSON.parse(JSON.stringify(masterState || {}));
  const v = variationState || {};
  function overlay(target, source) {
    if (!source) return;
    Object.entries(source).forEach(([k, val]) => {
      if (val === undefined) return;
      if (Array.isArray(val)) { if (val.length > 0) target[k] = val; return; }
      target[k] = val;
    });
  }
  out.camera = out.camera || {};
  overlay(out.camera, v.camera);

  out.lights = out.lights || {};
  ['ambient', 'key', 'rimLeft', 'rimRight'].forEach(k => {
    out.lights[k] = out.lights[k] || {};
    overlay(out.lights[k], v.lights?.[k]);
  });

  if (Array.isArray(v.extraLights)) {
    const overridesById = new Map(v.extraLights.map(e => [e.id, e]));
    out.extraLights = (out.extraLights || []).map(me => {
      const ov = overridesById.get(me.id);
      if (!ov) return me;
      const merged = { ...me };
      overlay(merged, ov);
      return merged;
    });
  }

  out.logoLight = out.logoLight || {};
  overlay(out.logoLight, v.logoLight);

  return out;
}

// ─── Changement de portée (Master Scene ↔ State Variation) ───────────────────
function _switchScope(mode) {
  _scopeMode = mode;
  const inspector = document.getElementById('seInspector');
  if (inspector) inspector.dataset.scope = mode;
  document.getElementById('seScopeMasterBtn')?.classList.toggle('seScopeBtn--active', mode === 'master');
  document.getElementById('seScopeVariationBtn')?.classList.toggle('seScopeBtn--active', mode === 'variation');
  const animTab = document.querySelector('.seTab[data-tab="animation"]');
  if (animTab) animTab.textContent = mode === 'master' ? 'Master State' : 'Variation';
  _switchTab('animation');

  if (mode === 'master') {
    _rebuildSelect(MASTER_SCENE_ID);
    if (_states[MASTER_SCENE_ID]) {
      _selectState(MASTER_SCENE_ID);
      if (SE.labelInput) SE.labelInput.value = _states[MASTER_SCENE_ID]?.label ?? MASTER_SCENE_ID;
    }
  } else {
    const ids = Object.keys(_states).filter(id => id !== MASTER_SCENE_ID);
    const firstId = ids[0] ?? null;
    _rebuildSelect(firstId);
    if (firstId) {
      _selectState(firstId);
      if (SE.labelInput) SE.labelInput.value = _states[firstId]?.label ?? firstId;
    } else {
      _selectState(null);
      _showStatus('Aucune variation pour l\'instant — cliquez sur « Nouvel état » pour en créer une.');
    }
  }
  _setDirty(false);
}

// ─── Binding de tous les contrôles → mise à jour temps réel ──────────────────
let _controlsBound = false; // garde pour éviter d'empiler les écouteurs des contrôles statiques
function _bindControls() {
  // _bindControls() est appelée à CHAQUE ouverture de l'éditeur (cf. displaySceneEditor() dans
  // navigation.js), mais les éléments qu'elle lie (boutons statiques du template, auto-binder
  // générique des .seRow) ne sont jamais recréés — ce sont les MÊMES nœuds DOM pendant toute la
  // durée de vie de la page (SPA). Sans cette garde, chaque re-visite de l'éditeur empilait un
  // nouvel écouteur sur les mêmes boutons : au bout de N visites, cliquer une fois sur
  // "+ Lumière"/"+ sous-état"/"+ couleur" les ajoutait N fois, "Supprimer" affichait N boîtes de
  // confirmation à la suite, etc. Les listes reconstruites dynamiquement (lumières, stops de
  // gradient, sous-états) gèrent déjà leur propre binding par élément à chaque reconstruction
  // (innerHTML remplacé), donc rien de spécifique à elles n'est perdu en ne liant qu'une fois.
  if (_controlsBound) return;
  _controlsBound = true;

  // Onglets
  document.querySelectorAll('.seTab').forEach(btn => {
    btn.addEventListener('click', () => _switchTab(btn.dataset.tab));
  });

  // Scope bar (Master Scene ↔ State Variation)
  document.getElementById('seScopeMasterBtn')?.addEventListener('click', () => _switchScope('master'));
  document.getElementById('seScopeVariationBtn')?.addEventListener('click', () => _switchScope('variation'));

  // Type d'état : Statique ↔ Animé — bascule l'affichage de la timeline de keyframes du bas.
  document.getElementById('se-state-mode-select')?.addEventListener('change', (e) => {
    _kfMode = e.target.value === 'animated' ? 'animated' : 'static';
    _kfSyncModeUI();
    _setDirty(true);
  });

  // Lecture/Stop de la timeline de keyframes
  document.getElementById('seKfPlayBtn')?.addEventListener('click', () => _kfPlay());
  document.getElementById('seKfStopBtn')?.addEventListener('click', () => _kfStop());

  // Scrubbing du curseur sur la règle (clic + glisser) — désactive la sélection de texte de
  // toute l'interface pendant le glisser (sinon le texte environnant se sélectionne au passage
  // du curseur, cf. retour utilisateur).
  document.getElementById('seKfRuler')?.addEventListener('mousedown', (e) => {
    _kfStop();
    const ruler = e.currentTarget;
    function seek(ev) {
      const rect = ruler.getBoundingClientRect();
      _kfSetPlayheadT((ev.clientX - rect.left) / rect.width);
    }
    seek(e);
    document.body.classList.add('seNoSelectDuringDrag');
    function onMove(ev) { seek(ev); }
    function onUp() {
      document.body.classList.remove('seNoSelectDuringDrag');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // Saisie manuelle du temps du curseur en millisecondes.
  const kfTimeInput = document.getElementById('seKfTimeInput');
  if (kfTimeInput) {
    const commit = () => {
      const dur = _states[_currentId]?.duration ?? 0;
      if (dur <= 0) return;
      const ms = Math.max(0, Math.min(dur, parseFloat(kfTimeInput.value) || 0));
      _kfSetPlayheadT(ms / dur);
      kfTimeInput.value = Math.round(ms);
    };
    kfTimeInput.addEventListener('change', commit);
    kfTimeInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { commit(); kfTimeInput.blur(); } });
  }

  // Menu contextuel (clic droit sur une keyframe) : changer son type de transition ou la supprimer
  document.getElementById('seKfContextMenu')?.addEventListener('click', (e) => {
    const menu = e.currentTarget;
    const rowId = menu.dataset.rowId;
    const idx   = parseInt(menu.dataset.idx ?? '-1');
    const track = _kfTracks[rowId];
    if (track?.[idx]) {
      const easing = e.target.dataset.easing;
      if (easing) track[idx].e = easing;
      if (e.target.dataset.action === 'delete') track.splice(idx, 1);
      if (easing || e.target.dataset.action === 'delete') { _setDirty(true); _kfRenderLane(rowId); }
    }
    menu.style.display = 'none';
  });
  document.addEventListener('mousedown', (e) => {
    const menu = document.getElementById('seKfContextMenu');
    if (menu && menu.style.display !== 'none' && !menu.contains(e.target)) menu.style.display = 'none';
  });

  // Bouton "Prévisualiser la transition" — fondu ENCHAÎNÉ (pas un fondu au noir) entre l'état
  // courant de la scène et la variation en cours d'édition fusionnée sur la master scene :
  // réutilise playAnimation()/_interpAnim() avec juste 2 keyframes (départ/arrivée), comme sur
  // le site public (cf. _crossDissolveToState dans threejs-background.js).
  SE.transitionPreviewBtn?.addEventListener('click', () => {
    if (_scopeMode !== 'variation' || !_currentId) { _showStatus('Sélectionnez une variation.', true); return; }
    const masterItem = _migrateItem(_states[MASTER_SCENE_ID]);
    const masterState = masterItem?.state;
    const from = window.GCABackground?.getSceneState?.();
    if (!masterState || !from) { _showStatus('Master Scene ou scène courante indisponible.', true); return; }
    const variationState = _readForm();
    const merged = _mergeVariationOntoMaster(masterState, variationState);
    const t = _readTransitionGroup();
    const duration = (t.fadeIn || t.fadeOut) ? (t.duration ?? 0) : 0;
    if (duration > 0) {
      window.GCABackground?.playAnimation({
        duration,
        keyframes: [
          { time: 0, easing: 'linear', state: from },
          { time: 1, easing: 'linear', state: merged },
        ],
      });
    } else {
      window.GCABackground?.applyEditorState(merged);
    }
    _showStatus('Prévisualisation de la transition…');
  });

  // Renderbox toggle
  const _rbToggle = document.getElementById('seRenderboxToggle');
  const _rbBody   = document.getElementById('seRenderboxBody');
  const _rbHeader = document.getElementById('seRenderboxHeader');
  function _toggleRenderbox() {
    const isHidden = _rbBody?.style.display === 'none';
    if (_rbBody)   _rbBody.style.display = isHidden ? '' : 'none';
    if (_rbToggle) _rbToggle.textContent  = isHidden ? '▲' : '▼';
  }
  _rbToggle?.addEventListener('click', _toggleRenderbox);
  _rbHeader?.addEventListener('click', e => { if (e.target !== _rbToggle) _toggleRenderbox(); });

  // Chaque seRow : synchronise range↔number et déclenche applyEditorState
  document.querySelectorAll('#seInspector .seRow').forEach(row => {
    const rng = row.querySelector('input[type="range"]');
    const num = row.querySelector('input[type="number"]');
    const col = row.querySelector('input[type="color"]');

    function onInput() {
      _setDirty(true);
      const item = _states[_currentId];
      if (item) item.state = _readForm();
      _applyFormToScene(_readForm());
    }

    if (rng && num) {
      // range → number : toujours synchrone
      rng.addEventListener('input', () => { num.value = rng.value; onInput(); });
      // number → range : ne pas réécrire num.value pendant la frappe (coupe les décimales)
      num.addEventListener('input', () => {
        const v = parseFloat(num.value);
        if (!isNaN(v)) {
          const min = parseFloat(rng.min), max = parseFloat(rng.max);
          rng.value = Math.min(max, Math.max(min, v));
          onInput();
        }
      });
      // Au blur / Enter : normaliser la valeur affichée
      num.addEventListener('change', () => {
        const min = parseFloat(rng.min), max = parseFloat(rng.max);
        const v = Math.min(max, Math.max(min, parseFloat(num.value) || 0));
        rng.value = v; num.value = v; onInput();
      });
    }
    if (col) col.addEventListener('input', onInput);
    const chk = row.querySelector('input[type="checkbox"]');
    if (chk) chk.addEventListener('change', onInput);
  });

  // Éditeur de gradient Logo Light
  const _gradientContainer = document.getElementById('se-logoLight-stops');
  if (_gradientContainer) {
    // Changement d'une couleur (picker), d'un code hex (texte) ou d'une position de stop.
    _gradientContainer.addEventListener('input', e => {
      if (e.target.type === 'color') {
        const hexInput = e.target.closest('.seGradientStop')?.querySelector('.seGradientStopHex');
        if (hexInput) hexInput.value = e.target.value;
        _updateGradientPreview();
        _setDirty(true);
        _applyFormToScene(_readForm());
      } else if (e.target.classList.contains('seGradientStopHex')) {
        const v = e.target.value.trim();
        if (/^#[0-9a-fA-F]{6}$/.test(v)) {
          const colorInput = e.target.closest('.seGradientStop')?.querySelector('input[type="color"]');
          if (colorInput) colorInput.value = v;
          _updateGradientPreview();
          _setDirty(true);
          _applyFormToScene(_readForm());
        }
      } else if (e.target.classList.contains('seGradientStopPos')) {
        _updateGradientPreview();
        _setDirty(true);
        _applyFormToScene(_readForm());
      }
    });
    // Suppression d'un stop
    _gradientContainer.addEventListener('click', e => {
      if (e.target.classList.contains('seGradientRemoveBtn')) {
        const allStops = _gradientContainer.querySelectorAll('.seGradientStop');
        if (allStops.length <= 1) return; // minimum 1 couleur
        e.target.closest('.seGradientStop').remove();
        _updateGradientPreview();
        _setDirty(true);
        _applyFormToScene(_readForm());
      }
    });
    // Réordonnancement des stops par glisser-déposer (poignée ⋮⋮) — la position (0-1) de
    // chaque stop reste inchangée, seul l'ordre d'affichage/lecture dans le tableau change.
    let _dragRow = null;
    _gradientContainer.addEventListener('dragstart', e => {
      if (!e.target.classList.contains('seGradientDragHandle')) return;
      _dragRow = e.target.closest('.seGradientStop');
      e.dataTransfer.effectAllowed = 'move';
      // Nécessaire pour Firefox, qui n'autorise le drag que si des données sont attachées.
      e.dataTransfer.setData('text/plain', '');
      _dragRow.classList.add('seGradientStop--dragging');
    });
    _gradientContainer.addEventListener('dragover', e => {
      if (!_dragRow) return;
      e.preventDefault();
      const overRow = e.target.closest('.seGradientStop');
      if (!overRow || overRow === _dragRow) return;
      const rect = overRow.getBoundingClientRect();
      const before = (e.clientY - rect.top) < rect.height / 2;
      overRow[before ? 'before' : 'after'](_dragRow);
    });
    _gradientContainer.addEventListener('dragend', () => {
      if (_dragRow) {
        _dragRow.classList.remove('seGradientStop--dragging');
        _dragRow = null;
        _updateGradientPreview();
        _setDirty(true);
        _applyFormToScene(_readForm());
      }
    });
  }
  // Ajouter un stop de couleur au gradient (position par défaut : fin du dégradé, ajustable
  // ensuite via le champ de position à côté de la couleur).
  document.getElementById('se-logoLight-addStop')?.addEventListener('click', () => {
    const container = document.getElementById('se-logoLight-stops');
    if (!container) return;
    const lastRow   = container.querySelector('.seGradientStop:last-child');
    const lastColor = lastRow?.querySelector('input[type="color"]')?.value || '#ffffff';
    const row = document.createElement('div');
    row.className = 'seGradientStop';
    row.innerHTML = _gradientStopRowHtml(lastColor, 1);
    container.appendChild(row);
    _updateGradientPreview();
    _setDirty(true);
    _applyFormToScene(_readForm());
  });

  // Ajouter une lumière dynamique
  document.getElementById('se-addLightBtn')?.addEventListener('click', () => {
    const type  = document.getElementById('se-addLightType')?.value || 'PointLight';
    const id    = 'el_' + Date.now();
    const lightData = { id, type, label: type, visible: true, castShadow: false, ...(_LIGHT_DEFAULTS[type] || {}) };
    const list  = document.getElementById('se-extraLights-list');
    if (!list) return;
    list.appendChild(_buildExtraLightGroup(id, lightData));
    _setDirty(true);
    _applyFormToScene(_readForm());
  });

  // Supprimer une lumière dynamique (délégation d'événement)
  document.getElementById('se-extraLights-list')?.addEventListener('click', e => {
    if (e.target.classList.contains('seExtraLightRemoveBtn')) {
      const group = e.target.closest('.seExtraLight');
      if (group && confirm('Supprimer cette lumière ?')) {
        group.remove();
        _setDirty(true);
        _applyFormToScene(_readForm());
      }
    }
  });

  // ── Durée de l'état "Animé" (vit dans la timeline du bas, pas dans la box principale) ─────
  const _animDurRow = document.getElementById('seRow-anim-duration');
  if (_animDurRow) {
    const rng = _animDurRow.querySelector('input[type="range"]');
    const num = _animDurRow.querySelector('input[type="number"]');
    if (rng && num) {
      function _onDurChange() {
        const dur = parseInt(num.value) || 0;
        const item = _states[_currentId];
        if (item) item.duration = dur;
        _kfRebuildRulerTicks();
        _setDirty(true);
      }
      rng.addEventListener('input', () => { num.value = rng.value; _onDurChange(); });
      num.addEventListener('change', () => { rng.value = num.value; _onDurChange(); });
    }
  }

  // ── Contrôles façon lecteur vidéo de la timeline de keyframes ──────────────
  document.getElementById('seKfToStartBtn')?.addEventListener('click', () => _kfJumpToStart());
  document.getElementById('seKfPrevKfBtn')?.addEventListener('click', () => _kfJumpToPrevKeyframe());
  document.getElementById('seKfNextKfBtn')?.addEventListener('click', () => _kfJumpToNextKeyframe());
  document.getElementById('seKfToEndBtn')?.addEventListener('click', () => _kfJumpToEnd());

  // Label input → dirty
  if (SE.labelInput) {
    SE.labelInput.addEventListener('input', () => _setDirty(true));
  }

  // Bouton "Nouvel état"
  SE.newBtn?.addEventListener('click', () => {
    const label = SE.labelInput?.value?.trim() || 'Nouvel état';
    const id    = 'state_' + Date.now();
    const snap  = window.GCABackground?.getSceneState?.() ?? null;
    _states[id] = {
      label,
      mode: 'static',
      duration: 0,
      state: snap,
      exposedParams: [],
      tracks: {},
      assignment: null,
      transition: { ..._KF_DEFAULT_TRANSITION },
    };
    _rebuildSelect(id);
    _selectState(id);
    _setDirty(true);
    _showStatus('Nouvel élément créé. N\'oubliez pas de sauvegarder.');
  });

  // Bouton "Dupliquer l'état" — clone profond de l'état courant sous un nouvel id, pour partir
  // d'une base existante (ex: variations de "Home") sans tout reconfigurer à la main.
  SE.duplicateBtn?.addEventListener('click', () => {
    if (!_currentId || !_states[_currentId]) { _showStatus('Aucun élément sélectionné.', true); return; }
    const source = _states[_currentId];
    const id     = 'state_' + Date.now();
    const label  = (source.label || _currentId) + ' (copie)';
    _states[id] = JSON.parse(JSON.stringify(source));
    _states[id].label = label;
    _rebuildSelect(id);
    _selectState(id);
    if (SE.labelInput) SE.labelInput.value = label;
    _setDirty(true);
    _showStatus('État dupliqué sous « ' + label + ' ». N\'oubliez pas de sauvegarder.');
  });

  // Bouton "Sauvegarder"
  SE.saveBtn?.addEventListener('click', () => {
    if (!_currentId) { _showStatus('Aucun élément sélectionné.', true); return; }
    // Ramène le curseur à t=0 avant de capturer le formulaire : en mode "Animé", les valeurs des
    // champs exposés ont pu être écrasées par un défilement de la timeline (_kfApplySampledValues)
    // — on ne veut jamais sauvegarder un instantané pris en plein scrubbing comme valeur de base.
    if (_kfMode === 'animated') _kfSetPlayheadT(0);
    const item = _states[_currentId];
    item.state = _readForm();
    const label = SE.labelInput?.value?.trim() || _currentId;
    item.label  = label;
    if (_scopeMode === 'variation') {
      // Assignation/transition/mode/keyframes n'existent que pour une State Variation — la
      // Master Scene est la référence globale, pas de notion d'animation interne.
      item.assignment    = SE.assignSelect?.value || null;
      item.transition     = _readTransitionGroup();
      item.mode           = _kfMode;
      item.exposedParams  = Array.from(_kfExposed);
      item.tracks         = _kfTracks;
      item.duration       = parseInt(_animDurRow?.querySelector('input[type="number"]')?.value ?? '0') || 0;
    }
    _saveState(_currentId, item, label);
  });

  // Changement d'assignation → dirty (lu au moment de la sauvegarde, cf. ci-dessus)
  SE.assignSelect?.addEventListener('change', () => _setDirty(true));

  // Bouton "Supprimer"
  SE.deleteBtn?.addEventListener('click', () => {
    if (!_currentId) return;
    if (_currentId === MASTER_SCENE_ID) { _showStatus('La Master Scene ne peut pas être supprimée.', true); return; }
    const label = _states[_currentId]?.label || _currentId;
    if (!confirm('Supprimer l\'état « ' + label + ' » ?')) return;
    _deleteState(_currentId);
  });

  // Bouton "Appliquer à la scène"
  SE.previewBtn?.addEventListener('click', () => {
    _applyFormToScene(_readForm());
    _showStatus('État appliqué à la scène.');
  });

  // Sélecteur d'état
  SE.select?.addEventListener('change', (e) => {
    const id = e.target.value;
    if (!id) return;
    _selectState(id);
    if (SE.labelInput) SE.labelInput.value = _states[id]?.label ?? id;
  });

  // Bouton "Lire scène courante"
  SE.captureBtn?.addEventListener('click', () => {
    const snapshot = window.GCABackground?.getSceneState?.();
    if (!snapshot) {
      _showStatus('Scène non initialisée.', true);
      return;
    }
    if (SE.readoutPre) {
      SE.readoutPre.textContent = JSON.stringify(snapshot, null, 2);
    }
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────
async function initSceneEditor() {
  await _loadStates();
  _populateAssignSelect(); // liste dynamique (pages expertise) — asynchrone, non bloquant

  _bindControls();
  // Toujours ouvrir sur la Master Scene (= "home") — c'est la scène de référence.
  _scopeMode = 'master';
  _switchScope('master');
  _setDirty(false);
}

// ─── Barre d'outils viewport (repérage visuel) ───────────────────────────────
// Liée une seule fois au chargement du script (DOM statique, contrairement aux contrôles
// de _bindControls() qui sont re-liés à chaque ouverture de l'éditeur) : évite d'empiler
// des écouteurs en double sur des éléments qui ne sont jamais reconstruits.
function _bindViewportToolbar() {
  const lightHelpersBtn = document.getElementById('seToggleLightHelpersBtn');
  const axisGuideBtn    = document.getElementById('seToggleAxisGuideBtn');
  const axisGuideEl     = document.getElementById('seAxisGuide');

  lightHelpersBtn?.addEventListener('click', () => {
    const enabled = !lightHelpersBtn.classList.contains('seToolBtn--active');
    lightHelpersBtn.classList.toggle('seToolBtn--active', enabled);
    window.GCABackground?.setLightHelpersVisible?.(enabled);
  });

  axisGuideBtn?.addEventListener('click', () => {
    const enabled = !axisGuideBtn.classList.contains('seToolBtn--active');
    axisGuideBtn.classList.toggle('seToolBtn--active', enabled);
    if (axisGuideEl) axisGuideEl.style.display = enabled ? 'block' : 'none';
  });

  // Vues préréglées top/left/right/front : un seul actif à la fois (groupe exclusif).
  // Réactiver le bouton courant, ou n'en sélectionner aucun, revient à la caméra de l'état.
  const viewBtns = Array.from(document.querySelectorAll('.seViewBtn'));
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const wasActive = btn.classList.contains('seToolBtn--active');
      viewBtns.forEach(b => b.classList.remove('seToolBtn--active'));
      if (wasActive) {
        window.GCABackground?.setCameraViewOverride?.(null);
      } else {
        btn.classList.add('seToolBtn--active');
        window.GCABackground?.setCameraViewOverride?.(btn.dataset.view);
      }
    });
  });
}

_bindViewportToolbar();
_cmlBindDragInteraction();
_cmlStartLoop();
