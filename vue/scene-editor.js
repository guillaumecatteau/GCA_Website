// ============================================================================
// Scene Editor — Éditeur d'états de scène Three.js
// Connecté à window.GCABackground via applyEditorState() / getSceneState()
// États persistés dans json/scene-states.json via controller/save_scene_states.php
// ============================================================================

// ─── État interne ─────────────────────────────────────────────────────────────
let _states              = {};     // { [id]: stateObj }
let _currentId           = null;   // ID de l'état sélectionné
let _currentSubStateIdx  = 0;      // Index du sous-état actif
let _isDirty             = false;  // Modifications non sauvegardées
let _animIsPlaying       = false;

// ─── Références UI ────────────────────────────────────────────────────────────
const SE = {
  get select()     { return document.getElementById('seStateSelect'); },
  get labelInput() { return document.getElementById('seStateLabelInput'); },
  get newBtn()     { return document.getElementById('seNewBtn'); },
  get saveBtn()    { return document.getElementById('seSaveBtn'); },
  get deleteBtn()  { return document.getElementById('seDeleteBtn'); },
  get previewBtn() { return document.getElementById('sePreviewBtn'); },
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
function _migrateItem(item) {
  if (!item) return null;
  if (Array.isArray(item.subStates)) return item;
  if (item.type === 'animation') {
    return {
      label: item.label,
      duration: item.duration ?? 2000,
      subStates: (item.keyframes ?? []).map((kf, i) => ({
        id: 'ss_' + i,
        time: Math.round((kf.time ?? 0) * 100),
        easing: kf.easing ?? 'linear',
        state: kf.state ?? null,
      })),
    };
  }
  return {
    label: item.label,
    duration: 0,
    subStates: [{ id: 'ss_0', time: 0, easing: 'linear', state: item }],
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
}

// ─── Sélection / population d'un état ────────────────────────────────────────
function _selectState(id) {
  _currentId = id;
  if (!id || !_states[id]) {
    _populateForm(null);
    _setDirty(false);
    return;
  }
  const item = _migrateItem(_states[id]);
  _states[id] = item;
  if (SE.labelInput) SE.labelInput.value = item.label ?? id;
  const _titleEl = document.getElementById('seAnimStateBoxTitle');
  if (_titleEl) _titleEl.textContent = item.label ?? id;
  _svAnim('seRow-anim-duration', item.duration ?? 0);
  _updateAnimHint(item.duration ?? 0);
  _currentSubStateIdx = 0;
  _rebuildTimeline(item);
  _rebuildSubStatesList(item);
  _populateSubState(0);
  _setDirty(false);
}

function _populateSubState(idx) {
  _currentSubStateIdx = idx;
  const item = _states[_currentId];
  const ss = item?.subStates?.[idx];
  if (ss?.state) {
    _populateForm(ss.state);
    _applyFormToScene(ss.state);
  } else if (!ss?.state && item) {
    // Sous-état sans snapshot : essaie de capturer la scène courante
    const snap = window.GCABackground?.getSceneState?.();
    if (snap && ss) {
      ss.state = snap;
      _populateForm(snap);
      _applyFormToScene(snap);
    }
  }
  document.querySelectorAll('.seSubState').forEach((el, i) => {
    el.classList.toggle('seSubState--active', i === idx);
  });
  document.querySelectorAll('.seAnimKfMarker').forEach((el, i) => {
    el.classList.toggle('seAnimKfMarker--active', i === idx);
  });
}

function _updateAnimHint(dur) {
  const hint     = document.getElementById('seAnimDurationHint');
  const tlg      = document.getElementById('seTimelineGroup');
  const ssg      = document.getElementById('seSubStatesGroup');
  const controls = document.getElementById('seAnimControls');
  if (hint)     hint.textContent = dur > 0 ? dur + ' ms — animation' : '0 ms — état statique';
  if (tlg)      tlg.style.display = dur > 0 ? '' : 'none';
  if (ssg)      ssg.style.display = dur > 0 ? '' : 'none';
  if (controls) controls.style.display = dur > 0 ? '' : 'none';
}

function _rebuildTimeline(item) {
  const tl = document.getElementById('seAnimTimeline');
  if (!tl) return;
  tl.innerHTML = '';
  (item?.subStates ?? []).forEach((ss, i) => {
    const marker = document.createElement('div');
    marker.className = 'seAnimKfMarker' + (i === _currentSubStateIdx ? ' seAnimKfMarker--active' : '');
    marker.style.left = ss.time + '%';
    marker.title = 'Sous-état ' + (i + 1) + ' — ' + ss.time + '%';
    marker.addEventListener('click', () => _populateSubState(i));
    tl.appendChild(marker);
  });
}

function _rebuildSubStatesList(item) {
  const list = document.getElementById('seSubStatesList');
  if (!list) return;
  list.innerHTML = '';
  const subStates = item?.subStates ?? [];
  const duration  = item?.duration ?? 0;
  subStates.forEach((ss, i) => {
    const el = document.createElement('div');
    el.className = 'seSubState' + (i === _currentSubStateIdx ? ' seSubState--active' : '');
    el.dataset.idx = i;
    const showTime = duration > 0;
    const easingOpts = ['linear', 'easeIn', 'easeOut', 'easeInOut'].map(e =>
      `<option value="${e}"${ss.easing === e ? ' selected' : ''}>${e}</option>`
    ).join('');
    el.innerHTML = `
      <div class="seSubStateHeader">
        <span class="seSubStateLabel">Sous-état ${i + 1}</span>
        ${showTime ? `<select class="seKfSelect" data-ssidx="${i}">${easingOpts}</select>` : ''}
        <button class="seBtn seSubStateEditBtn" data-ssidx="${i}">Éditer</button>
        ${subStates.length > 1 ? `<button class="seSubStateRemoveBtn" data-ssidx="${i}" title="Supprimer">×</button>` : ''}
      </div>
      ${showTime ? `<div class="seRow" id="seSubStateTime-${i}">
        <label>Position</label>
        <input type="range" min="0" max="100" step="1" value="${ss.time}">
        <input type="number" min="0" max="100" step="1" value="${ss.time}">
        <span class="seUnit">%</span>
      </div>` : ''}
      <div class="seSubStateStatus">${ss.state ? '✓ état capturé' : "⚠ pas d'état"}</div>`;
    if (showTime) {
      const row = el.querySelector(`#seSubStateTime-${i}`);
      if (row) {
        const rng = row.querySelector('input[type="range"]');
        const num = row.querySelector('input[type="number"]');
        if (rng && num) {
          rng.addEventListener('input', () => { num.value = rng.value; ss.time = parseInt(rng.value); _rebuildTimeline(item); _setDirty(true); });
          num.addEventListener('change', () => { rng.value = num.value; ss.time = parseInt(num.value); _rebuildTimeline(item); _setDirty(true); });
        }
      }
    }
    const easingSel = el.querySelector('.seKfSelect');
    if (easingSel) easingSel.addEventListener('change', e => { ss.easing = e.target.value; _setDirty(true); });
    el.querySelector('.seSubStateEditBtn')?.addEventListener('click', () => {
      _populateSubState(i);
      _rebuildSubStatesList(item);
    });
    el.querySelector('.seSubStateRemoveBtn')?.addEventListener('click', () => {
      item.subStates.splice(i, 1);
      if (_currentSubStateIdx >= item.subStates.length) _currentSubStateIdx = item.subStates.length - 1;
      _rebuildSubStatesList(item);
      _rebuildTimeline(item);
      _setDirty(true);
    });
    list.appendChild(el);
  });
}

// ─── Reconstruction du <select> ───────────────────────────────────────────────
function _rebuildSelect(activeId) {
  const sel = SE.select;
  if (!sel) return;
  sel.innerHTML = '';
  const ids = Object.keys(_states);
  if (ids.length === 0) {
    sel.innerHTML = '<option value="">— Aucun état —</option>';
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
function _updateGradientPreview() {
  const inputs  = Array.from(document.querySelectorAll('#se-logoLight-stops .seGradientStop input[type="color"]'));
  const preview = document.getElementById('se-logoLight-preview');
  if (!preview) return;
  if (inputs.length === 0) { preview.style.background = '#222'; return; }
  const hex = inputs.map(i => i.value);
  preview.style.background = `linear-gradient(to right, ${hex.join(', ')})`;
}

function _buildGradientStops(stops) {
  const container = document.getElementById('se-logoLight-stops');
  if (!container) return;
  container.innerHTML = '';
  (stops && stops.length > 0 ? stops : ['#4488ff', '#aa44ff', '#ff6644']).forEach(hex => {
    const row = document.createElement('div');
    row.className = 'seGradientStop';
    row.innerHTML = `<input type="color" value="${hex}"><button class="seGradientRemoveBtn" title="Supprimer">×</button>`;
    container.appendChild(row);
  });
  _updateGradientPreview();
}

// ─── Helpers lumières additionnelles ─────────────────────────────────────────
function _extraLightFields(type, data, id) {
  const d   = data || {};
  const pfx = `se-el-${id}`;

  const visibleChk = `<div class="seRow seRowCheck" id="${pfx}-visible"><label>Visible</label><input type="checkbox" ${d.visible !== false ? 'checked' : ''}></div>`;

  if (type === 'HemisphereLight') {
    return visibleChk + `
    <div class="seRow seRowColor" id="${pfx}-skyColor"><label>Ciel</label><input type="color" value="${d.skyColor || '#0088ff'}"></div>
    <div class="seRow seRowColor" id="${pfx}-groundColor"><label>Sol</label><input type="color" value="${d.groundColor || '#552200'}"></div>
    <div class="seRow" id="${pfx}-intensity"><label>Intensité</label><input type="range" min="0" max="5" step="0.05" value="${d.intensity ?? 0.5}"><input type="number" min="0" max="5" step="0.05" value="${d.intensity ?? 0.5}"></div>`;
  }

  let html = visibleChk + `
    <div class="seRow seRowColor" id="${pfx}-color"><label>Couleur</label><input type="color" value="${d.color || '#ffffff'}"></div>
    <div class="seRow" id="${pfx}-intensity"><label>Intensité</label><input type="range" min="0" max="20" step="0.05" value="${d.intensity ?? 1}"><input type="number" min="0" max="20" step="0.05" value="${d.intensity ?? 1}"></div>`;

  if (type !== 'AmbientLight') {
    html += `<div class="seRow seRowCheck" id="${pfx}-castShadow"><label>Ombres</label><input type="checkbox" ${d.castShadow ? 'checked' : ''}></div>`;
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

function _buildExtraLightGroup(id, lightData) {
  const type  = lightData.type || 'PointLight';
  const label = lightData.label || type;
  const group = document.createElement('div');
  group.className      = 'seExtraLight';
  group.dataset.lightId   = id;
  group.dataset.lightType = type;
  group.innerHTML = `<div class="seExtraLightHeader">
      <span class="seGroupLabel">${label}</span>
      <button class="seExtraLightRemoveBtn" title="Supprimer">×</button>
    </div>
    ${_extraLightFields(type, lightData, id)}`;

  // Bind range ↔ number + dirty
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

  return group;
}

function _rebuildExtraLightsUI(extraLights) {
  const list = document.getElementById('se-extraLights-list');
  if (!list) return;
  list.innerHTML = '';
  (extraLights || []).forEach(ld => {
    if (!ld?.id) return;
    list.appendChild(_buildExtraLightGroup(ld.id, ld));
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
  const data = { id, type, label: type, visible: gv('visible') !== false };
  if (type === 'HemisphereLight') {
    data.skyColor    = gv('skyColor')    ?? '#0088ff';
    data.groundColor = gv('groundColor') ?? '#552200';
    data.intensity   = gv('intensity')   ?? 0.5;
  } else {
    data.color     = gv('color')     ?? '#ffffff';
    data.intensity = gv('intensity') ?? 1.0;
    if (type !== 'AmbientLight') data.castShadow = gv('castShadow') ?? false;
    if (['PointLight','SpotLight'].includes(type)) {
      data.distance = gv('distance') ?? 10;
      data.decay    = gv('decay')    ?? 2;
    }
    if (['DirectionalLight','PointLight','SpotLight'].includes(type)) {
      data.posX = gv('posX') ?? 0; data.posY = gv('posY') ?? 2; data.posZ = gv('posZ') ?? 0;
    }
    if (type === 'SpotLight') { data.angle = gv('angle') ?? 0.5236; data.penumbra = gv('penumbra') ?? 0.1; }
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
function _readForm() {
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
      glow:  rv('seRow-theme-glow'),
      speed: rv('seRow-theme-speed'),
    },
    lights: {
      ambient: {
        color:     rv('seRow-lights-ambient-color'),
        intensity: rv('seRow-lights-ambient-intensity'),
      },
      key: {
        color:     rv('seRow-lights-key-color'),
        intensity: rv('seRow-lights-key-intensity'),
        posX:      rv('seRow-lights-key-posX'),
        posY:      rv('seRow-lights-key-posY'),
        posZ:      rv('seRow-lights-key-posZ'),
        castShadow:   rv('seRow-lights-key-castShadow'),
        useLeadColor: rv('seRow-lights-key-useLeadColor'),
        leadColorPos: rv('seRow-lights-key-leadColorPos'),
      },
      rim: {
        color:     rv('seRow-lights-rim-color'),
        intensity: rv('seRow-lights-rim-intensity'),
        posX:      rv('seRow-lights-rim-posX'),
        posY:      rv('seRow-lights-rim-posY'),
        posZ:      rv('seRow-lights-rim-posZ'),
        castShadow:   rv('seRow-lights-rim-castShadow'),
        useLeadColor: rv('seRow-lights-rim-useLeadColor'),
        leadColorPos: rv('seRow-lights-rim-leadColorPos'),
      },
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
      gradientSpeed:     rv('seRow-logoLight-gradientSpeed'),
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
function _populateForm(state) {
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
  const l  = state.lights      || {};
  const g  = state.logo        || {};
  const lb = state.logoBody    || {};
  const ll = state.logoLight   || {};
  const gr = state.ground      || {};
  const ev = state.environment || {};
  const p  = state.particles   || {};
  const r  = state.renderer    || {};
  const al = l.ambient || {}, kl = l.key || {}, rl = l.rim || {};

  sv('seRow-camera-posX', c.posX); sv('seRow-camera-posY', c.posY); sv('seRow-camera-posZ', c.posZ);
  sv('seRow-camera-fov',  c.fov);  sv('seRow-camera-near', c.near); sv('seRow-camera-far',  c.far);
  sv('seRow-camera-lookAtOffsetX', c.lookAtOffsetX ?? 0);
  sv('seRow-camera-lookAtOffsetY', c.lookAtOffsetY ?? 0);
  sv('seRow-camera-lookAtOffsetZ', c.lookAtOffsetZ ?? 0);

  sv('seRow-theme-wire', t.wire); sv('seRow-theme-glow', t.glow); sv('seRow-theme-speed', t.speed);

  sv('seRow-lights-ambient-color', al.color); sv('seRow-lights-ambient-intensity', al.intensity);
  sv('seRow-lights-key-color', kl.color);     sv('seRow-lights-key-intensity', kl.intensity);
  sv('seRow-lights-key-posX', kl.posX);       sv('seRow-lights-key-posY', kl.posY); sv('seRow-lights-key-posZ', kl.posZ);
  sv('seRow-lights-key-castShadow',   kl.castShadow !== false);
  sv('seRow-lights-key-useLeadColor', !!kl.useLeadColor);
  sv('seRow-lights-key-leadColorPos', kl.leadColorPos ?? 0);
  sv('seRow-lights-rim-color', rl.color);     sv('seRow-lights-rim-intensity', rl.intensity);
  sv('seRow-lights-rim-posX', rl.posX);       sv('seRow-lights-rim-posY', rl.posY); sv('seRow-lights-rim-posZ', rl.posZ);
  sv('seRow-lights-rim-castShadow',   rl.castShadow ?? false);
  sv('seRow-lights-rim-useLeadColor', !!rl.useLeadColor);
  sv('seRow-lights-rim-leadColorPos', rl.leadColorPos ?? 0);

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
  _buildGradientStops(stops);
  sv('seRow-logoLight-gradientSpeed', ll.gradientSpeed ?? 0.5);
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

// ─── Binding de tous les contrôles → mise à jour temps réel ──────────────────
function _bindControls() {
  // Onglets
  document.querySelectorAll('.seTab').forEach(btn => {
    btn.addEventListener('click', () => _switchTab(btn.dataset.tab));
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
      if (item?.subStates?.[_currentSubStateIdx]) {
        item.subStates[_currentSubStateIdx].state = _readForm();
        const statusEl = document.querySelector(`.seSubState[data-idx="${_currentSubStateIdx}"] .seSubStateStatus`);
        if (statusEl) statusEl.textContent = '✓ état capturé';
      }
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
    // Changement d'une couleur de stop
    _gradientContainer.addEventListener('input', e => {
      if (e.target.type === 'color') {
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
  }
  // Ajouter un stop de couleur au gradient
  document.getElementById('se-logoLight-addStop')?.addEventListener('click', () => {
    const container = document.getElementById('se-logoLight-stops');
    if (!container) return;
    const lastInput = container.querySelector('.seGradientStop:last-child input[type="color"]');
    const lastColor = lastInput?.value || '#ffffff';
    const row = document.createElement('div');
    row.className = 'seGradientStop';
    row.innerHTML = `<input type="color" value="${lastColor}"><button class="seGradientRemoveBtn" title="Supprimer">×</button>`;
    container.appendChild(row);
    _updateGradientPreview();
    _setDirty(true);
    _applyFormToScene(_readForm());
  });

  // Ajouter une lumière dynamique
  const _LIGHT_DEFAULTS = {
    PointLight:       { color:'#ffffff', intensity:1.0, distance:10, decay:2, posX:0, posY:2, posZ:0 },
    DirectionalLight: { color:'#ffffff', intensity:1.0, posX:3, posY:4, posZ:2 },
    SpotLight:        { color:'#ffffff', intensity:1.0, distance:10, angle:0.5236, penumbra:0.1, decay:2, posX:0, posY:3, posZ:0 },
    HemisphereLight:  { skyColor:'#0088ff', groundColor:'#552200', intensity:0.5 },
    AmbientLight:     { color:'#ffffff', intensity:0.3 },
    RectAreaLight:    { color:'#ffffff', intensity:5, width:2, height:2, posX:0, posY:2, posZ:0 },
  };
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

  // ── Durée de l'animation ─────────────────────────────────────────────────
  const _animDurRow = document.getElementById('seRow-anim-duration');
  if (_animDurRow) {
    const rng = _animDurRow.querySelector('input[type="range"]');
    const num = _animDurRow.querySelector('input[type="number"]');
    if (rng && num) {
      function _onDurChange() {
        const dur = parseInt(num.value) || 0;
        const item = _states[_currentId];
        if (item) item.duration = dur;
        _updateAnimHint(dur);
        _rebuildTimeline(item);
        _rebuildSubStatesList(item);
        _setDirty(true);
      }
      rng.addEventListener('input', () => { num.value = rng.value; _onDurChange(); });
      num.addEventListener('change', () => { rng.value = num.value; _onDurChange(); });
    }
  }

  // ── Sous-états ────────────────────────────────────────────────────────────
  document.getElementById('seAddSubStateBtn')?.addEventListener('click', () => {
    const item = _states[_currentId];
    if (!item) return;
    const snap = window.GCABackground?.getSceneState?.() ?? null;
    item.subStates.push({ id: 'ss_' + Date.now(), time: 100, easing: 'linear', state: snap });
    _currentSubStateIdx = item.subStates.length - 1;
    _rebuildSubStatesList(item);
    _rebuildTimeline(item);
    _setDirty(true);
    _showStatus('Sous-état ajouté avec la scène courante.');
  });

  document.getElementById('seAnimPlayBtn')?.addEventListener('click', () => {
    if (_animIsPlaying) return;
    const item = _states[_currentId];
    if (!item || (item.duration ?? 0) <= 0) { _showStatus('Durée = 0, pas d\'animation.', true); return; }
    const animDef = {
      duration: item.duration,
      keyframes: [...item.subStates]
        .filter(ss => ss.state)
        .map(ss => ({ time: ss.time / 100, easing: ss.easing, state: ss.state }))
        .sort((a, b) => a.time - b.time),
    };
    if (animDef.keyframes.length === 0) { _showStatus('Aucun sous-état capturé.', true); return; }
    _animIsPlaying = true;
    window.GCABackground?.playAnimation(animDef, () => { _animIsPlaying = false; });
    _showStatus('Animation en lecture…');
  });

  document.getElementById('seAnimStopBtn')?.addEventListener('click', () => {
    window.GCABackground?.stopAnimation();
    _animIsPlaying = false;
    _showStatus('Animation arrêtée.');
  });

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
      duration: 0,
      subStates: [{ id: 'ss_0', time: 0, easing: 'linear', state: snap }],
    };
    _rebuildSelect(id);
    _selectState(id);
    _setDirty(true);
    _showStatus('Nouvel élément créé. N\'oubliez pas de sauvegarder.');
  });

  // Bouton "Sauvegarder"
  SE.saveBtn?.addEventListener('click', () => {
    if (!_currentId) { _showStatus('Aucun élément sélectionné.', true); return; }
    const item = _states[_currentId];
    if (item?.subStates?.[_currentSubStateIdx]) {
      item.subStates[_currentSubStateIdx].state = _readForm();
    }
    item.duration = parseInt(_animDurRow?.querySelector('input[type="number"]')?.value ?? '0') || 0;
    const label   = SE.labelInput?.value?.trim() || _currentId;
    item.label    = label;
    _saveState(_currentId, item, label);
  });

  // Bouton "Supprimer"
  SE.deleteBtn?.addEventListener('click', () => {
    if (!_currentId) return;
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

  const ids     = Object.keys(_states);
  const firstId = ids.includes('home') ? 'home' : (ids[0] ?? null);
  _rebuildSelect(firstId);

  if (firstId) {
    _selectState(firstId);
    if (SE.labelInput) SE.labelInput.value = _states[firstId]?.label ?? firstId;
  }

  _bindControls();
  _setDirty(false);
}
