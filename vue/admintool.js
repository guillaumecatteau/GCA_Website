// ////////////////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////// SETTINGS MANAGEMENT ////////////////////////////////////////////
// ////////////////////////////////////////////////////////////////////////////////////////////////
// Remplace l'ancienne gestion des utilisateurs (cf. Redéfinition des utilisateurs). Un seul
// utilisateur (l'admin) existe désormais ; ses identifiants sont stockés hors base
// (cf. model/model_admin.php) et ne sont affichés/éditables qu'après validation de la double
// condition (date de naissance + prénom du premier chat).

let _settingsInited = false;

function _settingsVerifyGate() {
  const day = document.getElementById('settingsGateDay').value;
  const month = document.getElementById('settingsGateMonth').value;
  const year = document.getElementById('settingsGateYear').value;
  const catName = document.getElementById('settingsGateCatName').value.trim();
  const errorEl = document.getElementById('settingsGateError');
  const fieldsEl = document.getElementById('settingsAccessFields');

  errorEl.style.display = 'none';

  fetch('controller/controller.php?action=admin_settings&sub=verify_gate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ day, month, year, catName }),
  })
    .then((r) => r.json())
    .then((json) => {
      if (!json.success) {
        errorEl.style.display = 'block';
        fieldsEl.style.display = 'none';
        return;
      }
      document.getElementById('settingsAccessMail').value = json.mail;
      document.getElementById('settingsAccessPassword').value = json.password;
      fieldsEl.style.display = 'flex';
      document.getElementById('btnSettingsSave').classList.add('btnOff');
      _settingsAccessInitial = { mail: json.mail, password: json.password };
    })
    .catch(() => { errorEl.style.display = 'block'; });
}

let _settingsAccessInitial = null;

function _settingsUpdateSaveState() {
  const btnSave = document.getElementById('btnSettingsSave');
  if (!_settingsAccessInitial || !btnSave) return;
  const mail = document.getElementById('settingsAccessMail').value.trim();
  const password = document.getElementById('settingsAccessPassword').value;
  const changed = mail !== _settingsAccessInitial.mail || password !== _settingsAccessInitial.password;
  btnSave.classList.toggle('btnOff', !changed || !mail || !password);
}

function _settingsSaveAccess() {
  const btnSave = document.getElementById('btnSettingsSave');
  if (btnSave.classList.contains('btnOff')) return;
  const mail = document.getElementById('settingsAccessMail').value.trim();
  const password = document.getElementById('settingsAccessPassword').value;
  const msgEl = document.getElementById('settingsSaveMessage');
  btnSave.classList.add('btnOff');

  fetch('controller/controller.php?action=admin_settings&sub=update_access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mail, password }),
  })
    .then((r) => r.json())
    .then((json) => {
      msgEl.textContent = json.success
        ? 'Accès mis à jour.'
        : 'Erreur lors de la mise à jour.';
      msgEl.style.display = 'block';
      if (json.success) {
        _settingsAccessInitial = { mail, password };
      } else {
        btnSave.classList.remove('btnOff');
      }
      setTimeout(() => { msgEl.style.display = 'none'; }, 3000);
    })
    .catch(() => {
      msgEl.textContent = 'Erreur technique ! Réessayez.';
      msgEl.style.display = 'block';
      btnSave.classList.remove('btnOff');
    });
}

function _settingsLoadDevMode() {
  fetch('controller/controller.php?action=admin_settings&sub=get_dev_mode')
    .then((r) => r.json())
    .then((json) => {
      if (!json.success) return;
      document.getElementById('settingsDevModeToggle').checked = !!json.dev_mode;
    })
    .catch(() => {});
}

function _settingsSetDevMode(devMode) {
  fetch('controller/controller.php?action=admin_settings&sub=set_dev_mode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dev_mode: devMode }),
  })
    .then((r) => r.json())
    .then((json) => {
      if (json.success) {
        window._devMode = devMode;
        window._updateAdminButtonVisibility?.();
      }
    })
    .catch(() => {});
}

// ── Navigation home (curseurs scroll magnétique) ──
function _settingsLoadScrollSettings() {
  fetch('controller/controller.php?action=admin_settings&sub=get_scroll_settings')
    .then((r) => r.json())
    .then((json) => {
      if (!json.success) return;
      _settingsApplyScrollSliders(json.edgeHoldDelay, json.wheelThreshold, json.swipeThreshold);
    })
    .catch(() => {});
}

function _settingsApplyScrollSliders(edgeHoldDelay, wheelThreshold, swipeThreshold) {
  const delayInput  = document.getElementById('settingsScrollEdgeDelay');
  const wheelInput  = document.getElementById('settingsScrollWheelForce');
  const swipeInput  = document.getElementById('settingsScrollSwipeForce');
  delayInput.value = edgeHoldDelay;
  wheelInput.value = wheelThreshold;
  swipeInput.value = swipeThreshold;
  document.getElementById('settingsScrollEdgeDelayValue').value = edgeHoldDelay;
  document.getElementById('settingsScrollWheelForceValue').value = wheelThreshold;
  document.getElementById('settingsScrollSwipeForceValue').value = swipeThreshold;
}

let _scrollSettingsSaveTimer = null;
function _settingsSaveScrollSettings() {
  const payload = {
    edgeHoldDelay:  +document.getElementById('settingsScrollEdgeDelay').value,
    wheelThreshold: +document.getElementById('settingsScrollWheelForce').value,
    swipeThreshold: +document.getElementById('settingsScrollSwipeForce').value,
  };
  // Reflète la valeur immédiatement (y compris pour cet onglet, si l'admin teste la home
  // juste après) avant même la réponse serveur. Les champs numériques du cursorGroup sont
  // déjà synchronisés par _wireCursorGroup (cf. plus bas) — pas de réécriture ici (sinon
  // la saisie d'une décimale en cours de frappe serait coupée, cf. convention scene-editor).
  window._scrollSettings = payload;

  clearTimeout(_scrollSettingsSaveTimer);
  _scrollSettingsSaveTimer = setTimeout(() => {
    fetch('controller/controller.php?action=admin_settings&sub=update_scroll_settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, 300);
}

// ── Section Accueil (taille titre/sous-titres + gestion des sous-titres) ──
function _settingsLoadHeroSettings() {
  fetch('controller/controller.php?action=admin_settings&sub=get_hero_settings')
    .then((r) => r.json())
    .then((json) => {
      if (!json.success) return;
      _settingsApplyHeroSliders(json);
    })
    .catch(() => {});
}

function _settingsApplyHeroSliders(s) {
  document.getElementById('settingsHeroTitleVh').value = s.titleVh;
  document.getElementById('settingsHeroSubtitleVh').value = s.subtitleVh;
  document.getElementById('settingsHeroTitleOffset').value = s.titleOffsetPct;
  document.getElementById('settingsHeroLetterSpacing').value = s.titleLetterSpacing;
  document.getElementById('settingsHeroSubtitleDistance').value = s.subtitleDistanceVh;
  document.getElementById('settingsHeroSubtitleOpacity').value = s.subtitleOpacity;
  document.getElementById('settingsHeroColorSample').value = s.colorSampleMs;
  document.getElementById('settingsHeroSubtitleHold').value = s.subtitleHoldMs;
  document.getElementById('settingsHeroWelcomeTextTop').value = s.welcomeTextTopPct;
  document.getElementById('settingsHeroTitleVhValue').value = s.titleVh;
  document.getElementById('settingsHeroSubtitleVhValue').value = s.subtitleVh;
  document.getElementById('settingsHeroTitleOffsetValue').value = s.titleOffsetPct;
  document.getElementById('settingsHeroLetterSpacingValue').value = s.titleLetterSpacing;
  document.getElementById('settingsHeroSubtitleDistanceValue').value = s.subtitleDistanceVh;
  document.getElementById('settingsHeroSubtitleOpacityValue').value = s.subtitleOpacity;
  document.getElementById('settingsHeroColorSampleValue').value = s.colorSampleMs;
  document.getElementById('settingsHeroSubtitleHoldValue').value = s.subtitleHoldMs;
  document.getElementById('settingsHeroWelcomeTextTopValue').value = s.welcomeTextTopPct;
}

function _settingsReadHeroPayload() {
  return {
    titleVh:            +document.getElementById('settingsHeroTitleVh').value,
    subtitleVh:         +document.getElementById('settingsHeroSubtitleVh').value,
    titleOffsetPct:     +document.getElementById('settingsHeroTitleOffset').value,
    titleLetterSpacing: +document.getElementById('settingsHeroLetterSpacing').value,
    subtitleDistanceVh: +document.getElementById('settingsHeroSubtitleDistance').value,
    subtitleOpacity:    +document.getElementById('settingsHeroSubtitleOpacity').value,
    colorSampleMs:      +document.getElementById('settingsHeroColorSample').value,
    subtitleHoldMs:     +document.getElementById('settingsHeroSubtitleHold').value,
    welcomeTextTopPct:  +document.getElementById('settingsHeroWelcomeTextTop').value,
  };
}

let _heroSettingsSaveTimer = null;
function _settingsSaveHeroSettings() {
  const payload = _settingsReadHeroPayload();
  // Pas de ré-application des valeurs ici (cf. _settingsSaveScrollSettings) — le
  // cursorGroup (range ↔ number) est déjà synchronisé par _wireCursorGroup.

  clearTimeout(_heroSettingsSaveTimer);
  _heroSettingsSaveTimer = setTimeout(() => {
    fetch('controller/controller.php?action=admin_settings&sub=update_hero_settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, 300);
}

// ── Lancement du site (rideau noir masquant le chargement de la scène 3D) ──
function _settingsLoadLaunchSettings() {
  fetch('controller/controller.php?action=admin_settings&sub=get_launch_settings')
    .then((r) => r.json())
    .then((json) => {
      if (!json.success) return;
      _settingsApplyLaunchSlider(json.launchDelay);
    })
    .catch(() => {});
}

function _settingsApplyLaunchSlider(launchDelay) {
  document.getElementById('settingsLaunchDelay').value = launchDelay;
  document.getElementById('settingsLaunchDelayValue').value = launchDelay;
}

let _launchSettingsSaveTimer = null;
function _settingsSaveLaunchSettings() {
  const payload = { launchDelay: +document.getElementById('settingsLaunchDelay').value };
  window._launchSettings = payload;

  clearTimeout(_launchSettingsSaveTimer);
  _launchSettingsSaveTimer = setTimeout(() => {
    fetch('controller/controller.php?action=admin_settings&sub=update_launch_settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, 300);
}

// ── Chronologie d'intro (tableau Desktop/Tablette/Mobile, cf. Settings admin tool →
// "Lancement du site") — mêmes conventions de chargement/debounce que les blocs ci-dessus.
function _settingsLoadIntroTimeline() {
  fetch('controller/controller.php?action=admin_settings&sub=get_intro_timeline')
    .then((r) => r.json())
    .then((json) => {
      if (!json.success) return;
      _settingsApplyIntroTimeline(json.introTimeline);
    })
    .catch(() => {});
}

function _settingsApplyIntroTimeline(timeline) {
  document.querySelectorAll('#introTimelineTable .introTimelineInput').forEach((input) => {
    const val = timeline?.[input.dataset.key]?.[input.dataset.device];
    if (val !== null && val !== undefined) input.value = val;
  });
}

// Ignore les colonnes "disabled" (élément non applicable à ce device, cf.
// templates/admin/settings.php) — jamais envoyées au serveur, qui les ignorerait de toute
// façon (cf. updateIntroTimelineSettings, model/model_admin.php).
function _settingsReadIntroTimelinePayload() {
  const timeline = {};
  document.querySelectorAll('#introTimelineTable .introTimelineInput').forEach((input) => {
    if (input.disabled) return;
    const key = input.dataset.key;
    timeline[key] = timeline[key] || {};
    timeline[key][input.dataset.device] = +input.value;
  });
  return timeline;
}

let _introTimelineSaveTimer = null;
function _settingsSaveIntroTimeline() {
  const payload = { timeline: _settingsReadIntroTimelinePayload() };
  clearTimeout(_introTimelineSaveTimer);
  _introTimelineSaveTimer = setTimeout(() => {
    fetch('controller/controller.php?action=admin_settings&sub=update_intro_timeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, 300);
}

// ── Sauvegarde globale du right panel (Task 7) — couvre les éditions de texte des
// sous-titres (plus de bouton "Sauvegarder" par entrée) et les liens sociaux, qui ne
// s'enregistrent pas instantanément. Le reste du right panel (accès admin, mode du
// site, sliders Section Accueil, lancement...) garde son enregistrement instantané
// existant, inchangé.
const _settingsDirtySubtitles = new Map(); // id -> { text_fr, text_en }
let _settingsSocialLinksDirty = false;
// Dirty générique (Task 11) — couvre TOUT changement ailleurs sur la page (sliders
// Section Accueil/Navigation home/Lancement, mode Dev) qui s'enregistre déjà
// instantanément (debounce 300ms) via leurs propres handlers : on marque quand même le
// bouton "Sauvegarder" global comme actif pour refléter visuellement le changement, et on
// force un envoi immédiat (sans attendre le debounce) au clic sur Sauvegarder, pour
// garantir que TOUT est bien persisté en un seul clic, même juste après une frappe.
let _settingsOtherDirty = false;

function _settingsMarkOtherDirty() {
  _settingsOtherDirty = true;
  _settingsUpdateSaveAllState();
}

function _settingsUpdateSaveAllState() {
  const btn = document.getElementById('btnSettingsSaveAll');
  if (!btn) return;
  const dirty = _settingsDirtySubtitles.size > 0 || _settingsSocialLinksDirty || _settingsOtherDirty;
  btn.classList.toggle('btnOff', !dirty);
}

function _settingsSaveAll() {
  const btn = document.getElementById('btnSettingsSaveAll');
  const msgEl = document.getElementById('settingsSaveAllMessage');
  if (!btn || btn.classList.contains('btnOff')) return;
  btn.classList.add('btnOff');

  const tasks = [];

  _settingsDirtySubtitles.forEach((edit, id) => {
    tasks.push(
      fetch('controller/controller.php?action=admin_home_subtitles&sub=update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, text_fr: edit.text_fr, text_en: edit.text_en }),
      }).then((r) => r.json())
    );
  });

  if (_settingsSocialLinksDirty) {
    tasks.push(
      fetch('controller/controller.php?action=admin_settings&sub=update_social_links', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: _settingsReadSocialLinksPayload() }),
      }).then((r) => r.json())
    );
  }

  if (_settingsOtherDirty) {
    // Envoi immédiat (sans attendre les debounces respectifs) de tout ce qui s'enregistre
    // normalement en instantané, pour garantir une sauvegarde complète et synchrone.
    clearTimeout(_scrollSettingsSaveTimer);
    clearTimeout(_heroSettingsSaveTimer);
    clearTimeout(_launchSettingsSaveTimer);
    clearTimeout(_introTimelineSaveTimer);
    tasks.push(
      fetch('controller/controller.php?action=admin_settings&sub=update_scroll_settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edgeHoldDelay:  +document.getElementById('settingsScrollEdgeDelay').value,
          wheelThreshold: +document.getElementById('settingsScrollWheelForce').value,
          swipeThreshold: +document.getElementById('settingsScrollSwipeForce').value,
        }),
      }).then((r) => r.json())
    );
    tasks.push(
      fetch('controller/controller.php?action=admin_settings&sub=update_hero_settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(_settingsReadHeroPayload()),
      }).then((r) => r.json())
    );
    tasks.push(
      fetch('controller/controller.php?action=admin_settings&sub=update_launch_settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ launchDelay: +document.getElementById('settingsLaunchDelay').value }),
      }).then((r) => r.json())
    );
    tasks.push(
      fetch('controller/controller.php?action=admin_settings&sub=update_intro_timeline', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeline: _settingsReadIntroTimelinePayload() }),
      }).then((r) => r.json())
    );
  }

  Promise.all(tasks)
    .then((results) => {
      const allOk = results.every((r) => r && r.success);
      msgEl.textContent = allOk ? 'Modifications enregistrées.' : 'Erreur lors de l\'enregistrement.';
      msgEl.style.display = 'block';
      if (allOk) {
        _settingsDirtySubtitles.clear();
        _settingsSocialLinksDirty = false;
        _settingsOtherDirty = false;
        _loadHeroSubtitles();
      } else {
        btn.classList.remove('btnOff');
      }
      setTimeout(() => { msgEl.style.display = 'none'; }, 3000);
    })
    .catch(() => {
      msgEl.textContent = 'Erreur technique ! Réessayez.';
      msgEl.style.display = 'block';
      btn.classList.remove('btnOff');
    });
}

function _loadHeroSubtitles() {
  const list = document.getElementById('heroSubtitlesList');
  if (!list) return;
  fetch('controller/controller.php?action=admin_home_subtitles&sub=list')
    .then((r) => r.json())
    .then((json) => {
      if (!json.success) return;
      list.innerHTML = '';
      _settingsDirtySubtitles.clear();
      _settingsUpdateSaveAllState();
      json.subtitles.forEach((s, index) => list.appendChild(_buildHeroSubtitleEntry(s, index, json.subtitles.length)));
    })
    .catch(() => {});
}

// Entrée restructurée (cf. Task 6) : champs FR/EN sur une même ligne, actions
// monter/descendre/supprimer regroupées en bas à droite, plus de bouton "Sauvegarder"
// individuel — toute édition de texte marque juste le bouton "Sauvegarder" global comme
// actif (cf. _settingsUpdateSaveAllState), persistée par _settingsSaveAll().
function _buildHeroSubtitleEntry(subtitle, index, total) {
  const entry = document.createElement('div');
  entry.className = 'entryBlock entryEditForm heroSubtitleEntry';

  const fieldsRow = document.createElement('div');
  fieldsRow.className = 'heroSubtitleEntryFields';

  const inputFr = document.createElement('input');
  inputFr.className = 'formInput';
  inputFr.value = subtitle.text_fr;
  inputFr.placeholder = 'Texte FR';
  const inputEn = document.createElement('input');
  inputEn.className = 'formInput';
  inputEn.value = subtitle.text_en;
  inputEn.placeholder = 'Texte EN';

  function markDirty() {
    const fr = inputFr.value.trim();
    const en = inputEn.value.trim();
    if (fr === subtitle.text_fr && en === subtitle.text_en) {
      _settingsDirtySubtitles.delete(subtitle.id);
    } else {
      _settingsDirtySubtitles.set(subtitle.id, { text_fr: fr, text_en: en });
    }
    _settingsUpdateSaveAllState();
  }
  inputFr.addEventListener('input', markDirty);
  inputEn.addEventListener('input', markDirty);

  fieldsRow.appendChild(inputFr);
  fieldsRow.appendChild(inputEn);

  const actionsRow = document.createElement('div');
  actionsRow.className = 'heroSubtitleEntryActions';

  const btnUp = document.createElement('button');
  btnUp.type = 'button';
  btnUp.className = 'expActionBtn';
  btnUp.title = 'Monter';
  btnUp.textContent = '↑';
  btnUp.disabled = index === 0;
  btnUp.addEventListener('click', () => _moveHeroSubtitle(index, -1));

  const btnDown = document.createElement('button');
  btnDown.type = 'button';
  btnDown.className = 'expActionBtn';
  btnDown.title = 'Descendre';
  btnDown.textContent = '↓';
  btnDown.disabled = index === total - 1;
  btnDown.addEventListener('click', () => _moveHeroSubtitle(index, 1));

  const btnDelete = document.createElement('button');
  btnDelete.type = 'button';
  btnDelete.className = 'expActionBtn expActionBtnDanger';
  btnDelete.title = 'Supprimer';
  btnDelete.innerHTML = '<span class="icon iconDelete"></span>';
  btnDelete.addEventListener('click', () => {
    if (!confirm('Supprimer ce sous-titre ?')) return;
    fetch('controller/controller.php?action=admin_home_subtitles&sub=delete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: subtitle.id }),
    }).then((r) => r.json()).then((json) => { if (json.success) _loadHeroSubtitles(); });
  });

  actionsRow.appendChild(btnUp);
  actionsRow.appendChild(btnDown);
  actionsRow.appendChild(btnDelete);

  entry.appendChild(fieldsRow);
  entry.appendChild(actionsRow);
  return entry;
}

function _moveHeroSubtitle(index, direction) {
  fetch('controller/controller.php?action=admin_home_subtitles&sub=list')
    .then((r) => r.json())
    .then((json) => {
      if (!json.success) return;
      const ids = json.subtitles.map((s) => s.id);
      const target = index + direction;
      if (target < 0 || target >= ids.length) return;
      [ids[index], ids[target]] = [ids[target], ids[index]];
      return fetch('controller/controller.php?action=admin_home_subtitles&sub=reorder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
    })
    .then((r) => r?.json())
    .then((json) => { if (json?.success) _loadHeroSubtitles(); })
    .catch(() => {});
}

// Bouton "Ajouter" : crée directement une nouvelle entrée vide (FR/EN) à éditer sur place
// dans la liste — plus de champs FR/EN à côté du bouton (cf. demande : "pas besoin de
// mettre des champs à gauche du bouton ajouter, crée simplement une nouvelle entrée").
function _addHeroSubtitle() {
  fetch('controller/controller.php?action=admin_home_subtitles&sub=create', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text_fr: '', text_en: '' }),
  })
    .then((r) => r.json())
    .then((json) => { if (json.success) _loadHeroSubtitles(); });
}

// ── Liens sociaux (Task 3) — pas de sauvegarde instantanée, participe au bouton
// "Sauvegarder" global du right panel (cf. _settingsSaveAll ci-dessus).
const _SOCIAL_LINKS_NETWORKS = [
  { key: 'artstation', label: 'ArtStation' },
  { key: 'linkedin',   label: 'LinkedIn' },
  { key: 'youtube',    label: 'YouTube' },
  { key: 'facebook',   label: 'Facebook' },
  { key: 'x',          label: 'X' },
  { key: 'instagram',  label: 'Instagram' },
];
const _socialLinksInputs = {}; // key -> { checkbox, urlInput }

function _settingsReadSocialLinksPayload() {
  const payload = {};
  _SOCIAL_LINKS_NETWORKS.forEach(({ key }) => {
    const refs = _socialLinksInputs[key];
    if (!refs) return;
    payload[key] = { enabled: refs.checkbox.checked, url: refs.urlInput.value.trim() };
  });
  return payload;
}

function _loadSocialLinks() {
  const container = document.getElementById('socialLinksEditor');
  if (!container) return;
  fetch('controller/controller.php?action=admin_settings&sub=get_social_links')
    .then((r) => r.json())
    .then((json) => {
      if (!json.success) return;
      container.innerHTML = '';
      _settingsSocialLinksDirty = false;
      _settingsUpdateSaveAllState();
      _SOCIAL_LINKS_NETWORKS.forEach(({ key, label }) => {
        const data = json.socialLinks[key] || { enabled: false, url: '' };
        const row = document.createElement('div');
        row.className = 'socialLinkEntry';

        const checkboxLabel = document.createElement('label');
        checkboxLabel.className = 'formCheckboxLabel';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = !!data.enabled;
        const checkboxSpan = document.createElement('span');
        checkboxSpan.className = 'formCheckbox';
        const checkboxText = document.createElement('span');
        checkboxText.className = 'formCheckboxText';
        checkboxText.textContent = label;
        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(checkboxSpan);
        checkboxLabel.appendChild(checkboxText);

        const urlInput = document.createElement('input');
        urlInput.className = 'formInput';
        urlInput.type = 'text';
        urlInput.placeholder = 'https://…';
        urlInput.value = data.url || '';

        const markDirty = () => { _settingsSocialLinksDirty = true; _settingsUpdateSaveAllState(); };
        checkbox.addEventListener('change', markDirty);
        urlInput.addEventListener('input', markDirty);

        row.appendChild(checkboxLabel);
        row.appendChild(urlInput);
        container.appendChild(row);
        _socialLinksInputs[key] = { checkbox, urlInput };
      });
    })
    .catch(() => {});
}

// ── .cursorGroup — curseur + champ numérique synchronisés bidirectionnellement ──
// Pattern généralisé à partir de .seRow (cf. vue/scene-editor.js) : glisser le curseur
// met à jour le champ ; taper une valeur dans le champ met à jour le curseur (borné aux
// mêmes min/max). Le champ numérique n'est PAS réécrit pendant la frappe (seulement au
// blur/Enter, via 'change') pour ne jamais couper une décimale en cours de saisie.
function _wireCursorGroup(group) {
  const rng = group.querySelector('.cursorRange');
  const num = group.querySelector('.cursorValue');
  if (!rng || !num) return;

  rng.addEventListener('input', () => { num.value = rng.value; });

  num.addEventListener('input', () => {
    const v = parseFloat(num.value);
    if (isNaN(v)) return;
    const min = parseFloat(rng.min), max = parseFloat(rng.max);
    rng.value = Math.min(max, Math.max(min, v));
    rng.dispatchEvent(new Event('input', { bubbles: true }));
  });

  num.addEventListener('change', () => {
    const min = parseFloat(rng.min), max = parseFloat(rng.max);
    const v = Math.min(max, Math.max(min, parseFloat(num.value) || min));
    rng.value = v;
    num.value = v;
    rng.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

window._initSettingsManagement = function () {
  if (_settingsInited) return;
  _settingsInited = true;

  document.querySelectorAll('#cntSETTINGS .cursorGroup').forEach(_wireCursorGroup);

  document.getElementById('btnSettingsVerify').addEventListener('click', _settingsVerifyGate);
  document.getElementById('settingsAccessMail').addEventListener('input', _settingsUpdateSaveState);
  document.getElementById('settingsAccessPassword').addEventListener('input', _settingsUpdateSaveState);
  document.getElementById('btnSettingsSave').addEventListener('click', _settingsSaveAccess);

  ['settingsGateDay', 'settingsGateMonth', 'settingsGateYear', 'settingsGateCatName'].forEach((id) => {
    document.getElementById(id).addEventListener('input', () => {
      const allFilled = ['settingsGateDay', 'settingsGateMonth', 'settingsGateYear'].every(
        (selId) => document.getElementById(selId).value
      ) && document.getElementById('settingsGateCatName').value.trim().length > 0;
      document.getElementById('btnSettingsVerify').classList.toggle('btnOff', !allFilled);
    });
  });

  document.getElementById('settingsDevModeToggle').addEventListener('change', (e) => {
    _settingsSetDevMode(e.target.checked);
    _settingsMarkOtherDirty();
  });
  _settingsLoadDevMode();

  ['settingsScrollEdgeDelay', 'settingsScrollWheelForce', 'settingsScrollSwipeForce'].forEach((id) => {
    document.getElementById(id).addEventListener('input', () => {
      _settingsSaveScrollSettings();
      _settingsMarkOtherDirty();
    });
  });
  _settingsLoadScrollSettings();

  document.getElementById('settingsLaunchDelay').addEventListener('input', () => {
    _settingsSaveLaunchSettings();
    _settingsMarkOtherDirty();
  });
  _settingsLoadLaunchSettings();

  document.querySelectorAll('#introTimelineTable .introTimelineInput').forEach((input) => {
    input.addEventListener('input', () => {
      _settingsSaveIntroTimeline();
      _settingsMarkOtherDirty();
    });
  });
  _settingsLoadIntroTimeline();

  [
    'settingsHeroTitleVh', 'settingsHeroSubtitleVh', 'settingsHeroTitleOffset',
    'settingsHeroLetterSpacing', 'settingsHeroSubtitleDistance', 'settingsHeroSubtitleOpacity',
    'settingsHeroColorSample', 'settingsHeroSubtitleHold', 'settingsHeroWelcomeTextTop',
  ].forEach((id) => {
    document.getElementById(id).addEventListener('input', () => {
      _settingsSaveHeroSettings();
      _settingsMarkOtherDirty();
    });
  });
  _settingsLoadHeroSettings();

  document.getElementById('btnAddHeroSubtitle').addEventListener('click', _addHeroSubtitle);
  _loadHeroSubtitles();

  _loadSocialLinks();
  document.getElementById('btnSettingsSaveAll').addEventListener('click', _settingsSaveAll);
};


// /////////////////////////////// TAGS MANAGEMENT ////////////////////////////////////////////////
// ////////////////////////////////////////////////////////////////////////////////////////////////

const _TAG_CATEGORIES = {
  category:   { fr: 'Catégories',   en: 'Categories'   },
  job:        { fr: 'Métiers',       en: 'Jobs'          },
  technology: { fr: 'Technologies', en: 'Technologies' },
};

let _tagsData       = [];
let _selectedTagId  = null;
let _tagsInited     = false; // garde contre les listeners dupliqués

function initTagsManagement() {
  if (_tagsInited) {
    // Re-visite du panel : juste recharger la liste, pas re-binder les listeners
    _loadTagList(document.getElementById('tagsListContainer'));
    return;
  }
  _tagsInited = true;
  const inputFr    = document.getElementById('inputTagTitleFr');
  const inputEn    = document.getElementById('inputTagTitleEn');
  const selectCat  = document.getElementById('selectTagCategory');
  const inputId    = document.getElementById('inputTagId');
  const inputIcon  = document.getElementById('inputTagIconPath');
  const btnAction  = document.getElementById('btnCreateTag');
  const lblAction  = document.getElementById('lblCreateTag');
  // iconCreateTag supprimé du HTML (bouton créer sans icône)
  const msgBox     = document.getElementById('msgTagCreate');
  const listCnt    = document.getElementById('tagsListContainer');
  const btnDelete  = document.getElementById('btnDeleteTag');
  const deleteGrp  = document.getElementById('tagDeleteGroup');
  // Icône
  const previewImg  = document.getElementById('tagIconPreviewImg');
  const previewEmpty= document.getElementById('tagIconPreviewEmpty');
  const btnPick     = document.getElementById('btnPickTagIcon');
  const btnClearIco = document.getElementById('btnClearTagIcon');
  // Popups
  const confirmOverlay  = document.getElementById('tagDeleteConfirm');
  const btnConfirmDel   = document.getElementById('btnConfirmDeleteTag');
  const btnCancelDel    = document.getElementById('btnCancelDeleteTag');
  const iconBrowser     = document.getElementById('tagIconBrowser');
  const iconGrid        = document.getElementById('tagIconBrowserGrid');
  const btnCloseIco     = document.getElementById('btnCloseIconBrowser');

  const btnReset  = document.getElementById('btnResetTag');

  if (!inputFr || !btnAction) return;

  // ── Helpers icône preview ───────────────────────────────────────────────
  function _setIconPreview(path) {
    if (path) {
      previewImg.src           = path;
      previewImg.style.display = 'block';
      previewEmpty.style.display = 'none';
      btnClearIco.style.display  = 'inline-flex';
    } else {
      previewImg.src           = '';
      previewImg.style.display = 'none';
      previewEmpty.style.display = 'inline';
      btnClearIco.style.display  = 'none';
    }
  }

  btnClearIco.addEventListener('click', () => {
    inputIcon.value = '';
    _setIconPreview('');
  });

  // ── Validation formulaire ───────────────────────────────────────────────
  // Le bouton s'active si au moins un champ texte est rempli
  function _checkForm() {
    const hasContent = inputFr.value.trim().length > 0
                    || inputEn.value.trim().length > 0
                    || inputIcon.value.trim().length > 0;
    btnAction.classList.toggle('btnOn',  hasContent);
    btnAction.classList.toggle('btnOff', !hasContent);
    btnReset.classList.toggle('btnOn',   hasContent);
    btnReset.classList.toggle('btnOff',  !hasContent);
  }
  inputFr.addEventListener('input',   _checkForm);
  inputEn.addEventListener('input',   _checkForm);

  // ── Reset (mode création) ────────────────────────────────────────────────
  function _resetForm() {
    inputFr.value    = '';
    inputEn.value    = '';
    inputId.value    = '';
    inputIcon.value  = '';
    _selectedTagId   = null;
    _setIconPreview('');
    deleteGrp.style.display = 'none';
    const isEn = document.documentElement.lang === 'en';
    lblAction.textContent = isEn ? 'Create' : 'Créer';
    listCnt.querySelectorAll('.tagItem--active').forEach(el => el.classList.remove('tagItem--active'));
    _checkForm();
  }

  // ── Bouton reset ─────────────────────────────────────────────────────────
  btnReset.addEventListener('click', () => {
    if (btnReset.classList.contains('btnOff')) return;
    _resetForm();
  });

  // ── Sélectionner un tag ─────────────────────────────────────────────────
  window._selectTag = function(tag) {
    inputFr.value    = tag.title_fr;
    inputEn.value    = tag.title_en || '';
    selectCat.value  = tag.category;
    inputId.value    = tag.id;
    inputIcon.value  = tag.icon_path || '';
    _selectedTagId   = tag.id;
    _setIconPreview(tag.icon_path || '');
    deleteGrp.style.display = 'flex';
    const isEn = document.documentElement.lang === 'en';
    lblAction.textContent = isEn ? 'Edit' : 'Éditer';
    listCnt.querySelectorAll('.tagItem--active').forEach(el => el.classList.remove('tagItem--active'));
    const activeItem = listCnt.querySelector(`[data-tag-id="${tag.id}"]`);
    if (activeItem) activeItem.classList.add('tagItem--active');
    _checkForm();
  };

  // ── Action principale (créer ou éditer) ─────────────────────────────────
  btnAction.addEventListener('click', async () => {
    if (btnAction.classList.contains('btnOff')) return;
    const isEdit = !!inputId.value;
    const payload = {
      title_fr:  inputFr.value.trim(),
      title_en:  inputEn.value.trim(),
      category:  selectCat.value,
      icon_path: inputIcon.value.trim() || null,
    };
    if (isEdit) payload.id = parseInt(inputId.value);
    const sub = isEdit ? 'update' : 'create';
    try {
      const res  = await fetch(`controller/controller.php?action=admin_tags&sub=${sub}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        const isEn = document.documentElement.lang === 'en';
        _showTagMsg(msgBox, isEdit ? (isEn ? 'Tag updated.' : 'Tag modifié.') : (isEn ? 'Tag created.' : 'Tag créé.'), false);
        _resetForm();
        await _loadTagList(listCnt);
      } else {
        _showTagMsg(msgBox, 'Erreur : ' + (json.code ?? 'inconnu'), true);
      }
    } catch (_) { _showTagMsg(msgBox, 'Erreur réseau.', true); }
  });

  // ── Supprimer avec confirmation ─────────────────────────────────────────
  btnDelete.addEventListener('click', () => {
    confirmOverlay.style.display = 'flex';
  });
  btnCancelDel.addEventListener('click', () => {
    confirmOverlay.style.display = 'none';
  });
  confirmOverlay.addEventListener('click', (e) => {
    if (e.target === confirmOverlay) confirmOverlay.style.display = 'none';
  });
  btnConfirmDel.addEventListener('click', async () => {
    confirmOverlay.style.display = 'none';
    const id = parseInt(inputId.value);
    if (!id) return;
    try {
      const res  = await fetch('controller/controller.php?action=admin_tags&sub=delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success) {
        const isEn = document.documentElement.lang === 'en';
        _showTagMsg(msgBox, isEn ? 'Tag deleted.' : 'Tag supprimé.', false);
        _resetForm();
        await _loadTagList(listCnt);
      } else {
        _showTagMsg(msgBox, 'Erreur suppression.', true);
      }
    } catch (_) { _showTagMsg(msgBox, 'Erreur réseau.', true); }
  });

  // ── Browser d'icônes ────────────────────────────────────────────────────
  let _currentIconFolder = 'vue/assets/images/icons';

  async function _loadIconBrowser(folder) {
    _currentIconFolder = folder;
    iconGrid.innerHTML = '<p class="adminPlaceholder">Chargement…</p>';
    // Mettre à jour les boutons de dossier
    document.querySelectorAll('.iconFolderBtn').forEach(btn => {
      btn.classList.toggle('iconFolderBtn--active', btn.dataset.folder === folder);
    });
    try {
      const res  = await fetch(`controller/controller.php?action=admin_tags&sub=icons&folder=${encodeURIComponent(folder)}`);
      const json = await res.json();
      if (!json.success || !json.files.length) {
        iconGrid.innerHTML = '<p class="adminPlaceholder">Aucune image.</p>'; return;
      }
      iconGrid.innerHTML = '';
      json.files.forEach(file => {
        const path = folder + '/' + file;
        const item = document.createElement('div');
        item.className = 'iconBrowserItem';
        item.title     = file;
        const img = document.createElement('img');
        img.src = path; img.alt = file; img.loading = 'lazy';
        item.appendChild(img);
        item.addEventListener('click', () => {
          inputIcon.value = path;
          _setIconPreview(path);
          iconBrowser.style.display = 'none';
        });
        iconGrid.appendChild(item);
      });
    } catch (_) { iconGrid.innerHTML = '<p class="adminPlaceholder">Erreur.</p>'; }
  }

  btnPick.addEventListener('click', () => {
    iconBrowser.style.display = 'flex';
    _loadIconBrowser(_currentIconFolder);
  });
  btnCloseIco.addEventListener('click', () => { iconBrowser.style.display = 'none'; });
  iconBrowser.addEventListener('click', (e) => {
    if (e.target === iconBrowser) iconBrowser.style.display = 'none';
  });
  document.querySelectorAll('.iconFolderBtn').forEach(btn => {
    btn.addEventListener('click', () => _loadIconBrowser(btn.dataset.folder));
  });

  _resetForm();
  _loadTagList(listCnt);
}

async function _loadTagList(container, skipFetch = false) {
  if (!container) return;
  try {
    if (!skipFetch) {
      const res  = await fetch('controller/controller.php?action=admin_tags&sub=list');
      const json = await res.json();
      if (!json.success) return;
      _tagsData = json.tags;
    }
    if (!_tagsData.length) return;
    const isEn = document.documentElement.lang === 'en';
    container.innerHTML = '';
    const groups = ['category', 'job', 'technology'];
    groups.forEach(cat => {
      const tags    = _tagsData.filter(t => t.category === cat);
      const catDef  = _TAG_CATEGORIES[cat];
      const label   = isEn ? catDef.en : catDef.fr;
      const section = document.createElement('div');
      section.className = 'basicBlock tagGroup';
      section.innerHTML = `<span class="blockTitle tagGroupTitle">${label}</span>`;
      if (tags.length === 0) {
        const empty = document.createElement('p');
        empty.className   = 'adminPlaceholder';
        empty.textContent = isEn ? 'No tags yet.' : 'Aucun tag.';
        section.appendChild(empty);
      } else {
        const list = document.createElement('div');
        list.className = 'tagItemList';
        tags.forEach(tag => {
          const item = document.createElement('div');
          item.className     = 'tagItem';
          item.dataset.tagId = tag.id;
          // Afficher icône si disponible
          if (tag.icon_path) {
            const ico = document.createElement('img');
            ico.src = tag.icon_path; ico.alt = ''; ico.className = 'tagItemIcon';
            item.appendChild(ico);
          }
          const lbl = document.createElement('span');
          lbl.textContent = isEn ? (tag.title_en || tag.title_fr) : (tag.title_fr || tag.title_en);
          item.appendChild(lbl);
          if (tag.id === _selectedTagId) item.classList.add('tagItem--active');
          item.addEventListener('click', () => {
            if (item.classList.contains('tagItem--active')) {
              // Désélectionner
              _selectedTagId = null;
              item.classList.remove('tagItem--active');
              const inputFr   = document.getElementById('inputTagTitleFr');
              const inputEn   = document.getElementById('inputTagTitleEn');
              const inputId   = document.getElementById('inputTagId');
              const inputIcon = document.getElementById('inputTagIconPath');
              const lblAction = document.getElementById('lblCreateTag');
              const deleteGrp = document.getElementById('tagDeleteGroup');
              const previewImg = document.getElementById('tagIconPreviewImg');
              const previewEmpty = document.getElementById('tagIconPreviewEmpty');
              const btnClearIco  = document.getElementById('btnClearTagIcon');
              if (inputFr)  inputFr.value  = '';
              if (inputEn)  inputEn.value  = '';
              if (inputId)  inputId.value  = '';
              if (inputIcon) inputIcon.value = '';
              if (deleteGrp) deleteGrp.style.display = 'none';
              if (previewImg)   { previewImg.style.display = 'none'; previewImg.src = ''; }
              if (previewEmpty) previewEmpty.style.display = 'inline';
              if (btnClearIco)  btnClearIco.style.display  = 'none';
              const isEn2 = document.documentElement.lang === 'en';
              if (lblAction)  lblAction.textContent = isEn2 ? 'Create' : 'Créer';
              document.getElementById('btnCreateTag')?.classList.replace('btnOn', 'btnOff');
            } else {
              window._selectTag(tag);
            }
          });
          list.appendChild(item);
        });
        section.appendChild(list);
      }
      container.appendChild(section);
    });
  } catch (_) {}
}

function _showTagMsg(box, text, isError) {
  if (!box) return;
  box.textContent   = text;
  box.className     = 'formMessage' + (isError ? ' formMessage--error' : ' formMessage--success');
  box.style.display = 'flex';
  setTimeout(() => { box.style.display = 'none'; }, 3000);
}

// ================================================================================================
// /////////////////////////////// EXPERIENCES MANAGEMENT /////////////////////////////////////////
// ================================================================================================

let _expData          = [];
let _selectedExpId    = null;
let _expInited        = false;
let _selectedExpTags  = new Set(); // IDs des tags job sélectionnés
let _expCurrentFolder = 'vue/assets/images/icons';

function initExperiencesManagement() {
  if (_expInited) {
    _loadExpList();
    _loadJobTags(document.getElementById('expTagSelector'));
    return;
  }
  _expInited = true;

  // ── Refs DOM ─────────────────────────────────────────────────────────────
  const inputTitleFr  = document.getElementById('inputExpTitleFr');
  const inputTitleEn  = document.getElementById('inputExpTitleEn');
  const inputDateSt   = document.getElementById('inputExpDateStart');
  const inputDateEnd  = document.getElementById('inputExpDateEnd');
  const inputOngoing  = document.getElementById('inputExpOngoing');
  const inputDescFr   = document.getElementById('inputExpDescFr');
  const inputDescEn   = document.getElementById('inputExpDescEn');
  const inputStatus   = document.getElementById('inputExpStatus');
  const inputTimeline = document.getElementById('inputExpTimeline');
  const inputLogo     = document.getElementById('inputExpLogoPath');
  const inputId       = document.getElementById('inputExpId');
  const inputDipFr    = document.getElementById('inputExpDiplomaFr');
  const inputDipEn    = document.getElementById('inputExpDiplomaEn');
  const diplomaGroup  = document.getElementById('expDiplomaGroup');
  const btnCreate     = document.getElementById('btnCreateExp');
  const btnReset      = document.getElementById('btnResetExp');
  const lblCreate     = document.getElementById('lblCreateExp');
  const msgBox        = document.getElementById('msgExpCreate');
  const listCnt       = document.getElementById('expListContainer');
  const tagSelector   = document.getElementById('expTagSelector');
  // Logo preview
  const previewImg    = document.getElementById('expLogoPreviewImg');
  const previewEmpty  = document.getElementById('expLogoPreviewEmpty');
  const btnPickLogo   = document.getElementById('btnPickExpLogo');
  const btnClearLogo  = document.getElementById('btnClearExpLogo');
  // Logo browser
  const logoBrowser   = document.getElementById('expLogoBrowser');
  const logoGrid      = document.getElementById('expLogoBrowserGrid');
  const btnCloseLogo  = document.getElementById('btnCloseExpLogoBrowser');
  // Confirm delete
  const confirmDel    = document.getElementById('expDeleteConfirm');
  const btnConfirmDel = document.getElementById('btnConfirmDeleteExp');
  const btnCancelDel  = document.getElementById('btnCancelDeleteExp');

  if (!inputTitleFr || !btnCreate) return;

  // ── Logo preview helpers ─────────────────────────────────────────────────
  function _setLogoPreview(path) {
    if (path) {
      previewImg.src = path; previewImg.style.display = 'block';
      previewEmpty.style.display = 'none'; btnClearLogo.style.display = 'inline-flex';
    } else {
      previewImg.src = ''; previewImg.style.display = 'none';
      previewEmpty.style.display = 'inline'; btnClearLogo.style.display = 'none';
    }
  }
  btnClearLogo.addEventListener('click', () => { inputLogo.value = ''; _setLogoPreview(''); });

  function _showDiploma() {
    const hasDiploma = inputStatus.value === 'formation' || inputStatus.value === 'school';
    if (diplomaGroup) diplomaGroup.style.display = hasDiploma ? '' : 'none';
    if (!hasDiploma && inputDipFr) { inputDipFr.value = ''; inputDipEn.value = ''; }
  }
  inputStatus.addEventListener('change', _showDiploma);

  // Case "En cours" : vide et désactive la date de fin
  inputOngoing.addEventListener('change', () => {
    if (inputOngoing.checked) {
      inputDateEnd.value    = '';
      inputDateEnd.disabled = true;
    } else {
      inputDateEnd.disabled = false;
    }
  });

  // Fermer le dropdown tags quand on clique en dehors
  document.addEventListener('click', (e) => {
    const dd = document.getElementById('expTagDropdown');
    if (dd?.open && !dd.contains(e.target)) dd.open = false;
  }, { capture: true });
  function _checkForm() {
    const ok = inputTitleFr.value.trim().length > 0 && inputDateSt.value.length > 0;
    btnCreate.classList.toggle('btnOn',  ok);
    btnCreate.classList.toggle('btnOff', !ok);
    btnReset.classList.toggle('btnOn',  inputTitleFr.value.trim().length > 0
                                          || inputDateSt.value.length > 0);
    btnReset.classList.toggle('btnOff', !(inputTitleFr.value.trim().length > 0
                                          || inputDateSt.value.length > 0));
  }
  [inputTitleFr, inputTitleEn, inputDateSt].forEach(el => el.addEventListener('input', _checkForm));

  // ── Reset ────────────────────────────────────────────────────────────────
  let _outsideClickHandler = null;

  function _detachOutside() {
    if (_outsideClickHandler) {
      document.removeEventListener('click', _outsideClickHandler);
      _outsideClickHandler = null;
    }
  }

  function _attachOutside() {
    _detachOutside();
    _outsideClickHandler = (e) => {
      const sideBlock = document.querySelector('.experiencesContent .sideBlock');
      const confirmDel = document.getElementById('expDeleteConfirm');
      const logoBrowser = document.getElementById('expLogoBrowser');
      if (!sideBlock) return;
      if (sideBlock.contains(e.target)) return;
      if (confirmDel?.contains(e.target)) return;
      if (logoBrowser?.contains(e.target)) return;
      _resetForm();
    };
    setTimeout(() => document.addEventListener('click', _outsideClickHandler), 50);
  }

  function _resetForm() {
    _detachOutside();
    inputTitleFr.value = ''; inputTitleEn.value = '';
    inputDateSt.value  = ''; inputDateEnd.value = '';
    inputDescFr.value  = ''; inputDescEn.value  = '';
    inputStatus.value  = '';
    inputOngoing.checked  = false;
    inputDateEnd.disabled = false;
    inputTimeline.checked = false;
    inputLogo.value    = ''; inputId.value = '';
    if (inputDipFr) inputDipFr.value = '';
    if (inputDipEn) inputDipEn.value = '';
    if (diplomaGroup) diplomaGroup.style.display = 'none';
    _selectedExpId     = null;
    _selectedExpTags   = new Set();
    _setLogoPreview('');
    const isEn = document.documentElement.lang === 'en';
    lblCreate.textContent = isEn ? 'Create' : 'Créer';
    _renderTagSelector(tagSelector, []);
    listCnt.querySelectorAll('.expCard--active').forEach(el => el.classList.remove('expCard--active'));
    _checkForm();
  }
  btnReset.addEventListener('click', () => { if (btnReset.classList.contains('btnOff')) return; _resetForm(); });

  // ── Sélectionner une expérience ──────────────────────────────────────────
  function _selectExp(exp) {
    inputTitleFr.value = exp.title_fr || '';
    inputTitleEn.value = exp.title_en || '';
    inputDateSt.value  = exp.date_start || '';
    inputDateEnd.value = exp.date_end   || '';
    inputDescFr.value  = exp.description_fr || '';
    inputDescEn.value  = exp.description_en || '';
    inputStatus.value  = exp.status || '';
    inputOngoing.checked  = !exp.date_end;
    inputDateEnd.disabled = !exp.date_end;
    inputTimeline.checked = !!+exp.show_in_timeline;
    if (inputDipFr) inputDipFr.value = exp.diploma_fr || '';
    if (inputDipEn) inputDipEn.value = exp.diploma_en || '';
    if (diplomaGroup) diplomaGroup.style.display = (exp.status === 'formation' || exp.status === 'school') ? '' : 'none';
    inputLogo.value    = exp.logo_path || '';
    inputId.value      = exp.id;
    _selectedExpId     = exp.id;
    _selectedExpTags   = new Set((exp.tags || []).map(t => t.id));
    _setLogoPreview(exp.logo_path || '');
    const isEn = document.documentElement.lang === 'en';
    lblCreate.textContent = isEn ? 'Save' : 'Sauvegarder';
    listCnt.querySelectorAll('.expCard--active').forEach(el => el.classList.remove('expCard--active'));
    const card = listCnt.querySelector(`[data-exp-id="${exp.id}"]`);
    if (card) card.classList.add('expCard--active');
    _renderTagSelector(tagSelector, exp.tags || []);
    _checkForm();
    _attachOutside();
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────
  btnCreate.addEventListener('click', async () => {
    if (btnCreate.classList.contains('btnOff')) return;
    const isEdit = !!inputId.value;
    const payload = {
      title_fr:       inputTitleFr.value.trim(),
      title_en:       inputTitleEn.value.trim(),
      date_start:     inputDateSt.value  || null,
      date_end:       inputOngoing.checked ? null : (inputDateEnd.value || null),
      description_fr: inputDescFr.value.trim(),
      description_en: inputDescEn.value.trim(),
      status:         inputStatus.value || null,
      show_in_timeline: inputTimeline.checked ? 1 : 0,
      diploma_fr:     (inputDipFr?.value.trim()) || null,
      diploma_en:     (inputDipEn?.value.trim()) || null,
      logo_path:      inputLogo.value.trim() || null,
      tags:           [..._selectedExpTags],
    };
    if (isEdit) payload.id = parseInt(inputId.value);
    const sub = isEdit ? 'update' : 'create';
    try {
      const res  = await fetch(`controller/controller.php?action=admin_experiences&sub=${sub}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        const isEn = document.documentElement.lang === 'en';
        _showTagMsg(msgBox, isEdit ? (isEn ? 'Updated.' : 'Modifié.') : (isEn ? 'Created.' : 'Créé.'), false);
        _resetForm();
        await _loadExpList();
      } else {
        _showTagMsg(msgBox, 'Erreur : ' + (json.code ?? ''), true);
      }
    } catch (_) { _showTagMsg(msgBox, 'Erreur réseau.', true); }
  });

  // Suppression avec confirmation (déclenchée depuis les boutons des cards)
  btnCancelDel.addEventListener('click', () => { confirmDel.style.display = 'none'; });
  confirmDel.addEventListener('click', e => { if (e.target === confirmDel) confirmDel.style.display = 'none'; });
  btnConfirmDel.addEventListener('click', async () => {
    confirmDel.style.display = 'none';
    const id = parseInt(inputId.value);
    if (!id) return;
    try {
      const res  = await fetch('controller/controller.php?action=admin_experiences&sub=delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success) {
        _showTagMsg(msgBox, document.documentElement.lang === 'en' ? 'Deleted.' : 'Supprimé.', false);
        _resetForm();
        await _loadExpList();
      }
    } catch (_) {}
  });

  // ── Logo browser ─────────────────────────────────────────────────────────
  async function _loadLogoBrowser(folder) {
    _expCurrentFolder = folder;
    logoGrid.innerHTML = '<p class="adminPlaceholder">Chargement…</p>';
    document.querySelectorAll('#expLogoBrowser .iconFolderBtn').forEach(btn => {
      btn.classList.toggle('iconFolderBtn--active', btn.dataset.folder === folder);
    });
    try {
      const res  = await fetch(`controller/controller.php?action=admin_tags&sub=icons&folder=${encodeURIComponent(folder)}`);
      const json = await res.json();
      logoGrid.innerHTML = '';
      if (!json.success || !json.files.length) { logoGrid.innerHTML = '<p class="adminPlaceholder">Aucune image.</p>'; return; }
      json.files.forEach(file => {
        const path = folder + '/' + file;
        const item = document.createElement('div');
        item.className = 'iconBrowserItem'; item.title = file;
        const img = document.createElement('img'); img.src = path; img.alt = file; img.loading = 'lazy';
        item.appendChild(img);
        item.addEventListener('click', () => { inputLogo.value = path; _setLogoPreview(path); logoBrowser.style.display = 'none'; });
        logoGrid.appendChild(item);
      });
    } catch (_) { logoGrid.innerHTML = '<p class="adminPlaceholder">Erreur.</p>'; }
  }
  btnPickLogo.addEventListener('click', () => { logoBrowser.style.display = 'flex'; _loadLogoBrowser(_expCurrentFolder); });
  btnCloseLogo.addEventListener('click', () => { logoBrowser.style.display = 'none'; });
  logoBrowser.addEventListener('click', e => { if (e.target === logoBrowser) logoBrowser.style.display = 'none'; });
  document.querySelectorAll('#expLogoBrowser .iconFolderBtn').forEach(btn => {
    btn.addEventListener('click', () => _loadLogoBrowser(btn.dataset.folder));
  });

  // ── Chargement initial ───────────────────────────────────────────────────
  _expSelectHandler = _selectExp; // relier le handler aux cards
  _resetForm();
  _loadExpList();

  _loadJobTags(document.getElementById('expTagSelector'));
}

// ── Helpers date ────────────────────────────────────────────────────────────
const _MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const _MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function _fmtDate(iso, isEn) {
  if (!iso) return null;
  const [y, m] = iso.split('-');
  if (!y) return null;
  if (!m) return y;
  const idx = parseInt(m, 10) - 1;
  return isEn ? `${_MONTHS_EN[idx]} ${y}` : `${_MONTHS_FR[idx]} ${y}`;
}

function _fmtDateRange(start, end, isEn) {
  const s = _fmtDate(start, isEn);
  if (!s) return '';
  if (!end) return isEn ? `since ${s}` : `depuis ${s}`;
  const e = _fmtDate(end, isEn);
  return isEn ? `${s} → ${e}` : `de ${s} à ${e}`;
}

// ── Rendu liste expériences ───────────────────────────────────────────────────
async function _loadExpList(skipFetch = false) {
  const listCnt = document.getElementById('expListContainer');
  if (!listCnt) return;
  try {
    if (!skipFetch) {
      const res  = await fetch('controller/controller.php?action=admin_experiences&sub=list');
      const json = await res.json();
      if (!json.success) return;

      // Charger les détails (tags) pour chaque expérience
      const full = await Promise.all(json.experiences.map(async e => {
        const r2 = await fetch(`controller/controller.php?action=admin_experiences&sub=get&id=${e.id}`);
        const j2 = await r2.json();
        return j2.success ? j2.experience : e;
      }));
      _expData = full;
    }
    if (!_expData.length && skipFetch) { listCnt.innerHTML = ''; return; }

    const isEn      = document.documentElement.lang === 'en';
    const regular   = _expData.filter(e => !e.status || e.status === 'freelance');
    const formation = _expData.filter(e =>  e.status === 'formation');
    const etude     = _expData.filter(e =>  e.status === 'school');

    // En cours en premier, puis par date_start décroissante
    const _sort = arr => [...arr].sort((a, b) => {
      const aOn = !a.date_end, bOn = !b.date_end;
      if (aOn !== bOn) return aOn ? -1 : 1;
      return (b.date_start || '').localeCompare(a.date_start || '');
    });

    listCnt.innerHTML = '';

    function _renderGroup(items, label) {
      if (!items.length) return;
      const grp = document.createElement('div');
      grp.className = 'basicBlock tagGroup';
      grp.innerHTML = `<span class="blockTitle tagGroupTitle">${label}</span>`;
      items.forEach(exp => grp.appendChild(_buildExpCard(exp, isEn)));
      listCnt.appendChild(grp);
    }

    _renderGroup(_sort(regular),   isEn ? 'Experiences' : 'Expériences');
    _renderGroup(_sort(formation), isEn ? 'Training'    : 'Formations');
    _renderGroup(_sort(etude),     isEn ? 'Studies'     : 'Études');

    if (!_expData.length) listCnt.innerHTML = '<p class="adminPlaceholder">Aucune expérience.</p>';
  } catch (_) {}
}

function _buildExpCard(exp, isEn) {
  const card = document.createElement('div');
  card.className     = 'expCard';
  card.dataset.expId = exp.id;
  if (exp.id === _selectedExpId) card.classList.add('expCard--active');

  const dates  = _fmtDateRange(exp.date_start, exp.date_end, isEn);
  const rawTitle = isEn ? (exp.title_en || exp.title_fr) : (exp.title_fr || exp.title_en);
  const dip      = (exp.status === 'formation' || exp.status === 'school')
    ? (isEn ? (exp.diploma_en || exp.diploma_fr) : (exp.diploma_fr || exp.diploma_en))
    : null;
  // Formation/étude : diplôme en couleur titre, " – établissement" en couleur description
  const titleHtml = dip
    ? `<span class="expCardTitle">${dip}</span><span class="expCardTitleSub"> – ${rawTitle}</span>`
    : `<span class="expCardTitle">${rawTitle}</span>`;
  const desc     = isEn ? (exp.description_en || exp.description_fr) : (exp.description_fr || exp.description_en);

  const logoHtml  = exp.logo_path ? `<img class="expCardLogo" src="${exp.logo_path}" alt="" />` : '';
  // Seul le statut freelance affiche un badge, inline avec le titre
  const badgeHtml = exp.status === 'freelance'
    ? `<span class="expBadge expBadgeFreelance">Freelance</span>` : '';
  const descHtml  = desc ? `<p class="expCardDesc">${desc}</p>` : '';
  const tagsHtml   = (exp.tags || []).map(t => {
    const tl = isEn ? (t.title_en || t.title_fr) : (t.title_fr || t.title_en);
    return `<span class="expCardTag">${tl}</span>`;
  }).join('');

  card.innerHTML = `
    <div class="expCardHeader">
      ${logoHtml}
      <div class="expCardInfo">
        <div class="expCardTitleRow">
          ${titleHtml}
          ${badgeHtml}
        </div>
        <span class="expCardDates">${dates}</span>
      </div>
      <div class="expCardActionBtns">
        <button type="button" class="expActionBtn" data-action="edit" title="${isEn ? 'Edit' : 'Modifier'}">
          <span class="icon iconSettings"></span>
        </button>
        <button type="button" class="expActionBtn expActionBtnDanger" data-action="delete" title="${isEn ? 'Delete' : 'Supprimer'}">
          <span class="icon iconDelete"></span>
        </button>
      </div>
    </div>
    ${descHtml}
    ${tagsHtml ? `<div class="expCardTags">${tagsHtml}</div>` : ''}`;
  // Bouton éditer
  card.querySelector('[data-action="edit"]').addEventListener('click', e => {
    e.stopPropagation();
    const full = _expData.find(ex => ex.id === exp.id) || exp;
    if (typeof _expSelectHandler === 'function') _expSelectHandler(full);
  });

  // Bouton supprimer : set l'id et ouvre la confirmation directement
  card.querySelector('[data-action="delete"]').addEventListener('click', e => {
    e.stopPropagation();
    const inputId = document.getElementById('inputExpId');
    if (inputId) inputId.value = exp.id;
    const confirmDel = document.getElementById('expDeleteConfirm');
    if (confirmDel) confirmDel.style.display = 'flex';
  });

  return card;
}

// Stocker la ref _selectExp pour les cards
let _expSelectHandler = null;

// ── Chargement et rendu du sélecteur de tags job ──────────────────────────────
async function _loadJobTags(container) {
  if (!container) return;
  try {
    const res  = await fetch('controller/controller.php?action=admin_tags&sub=list&category=job');
    const json = await res.json();
    if (!json.success) return;
    container.dataset.allTags = JSON.stringify(json.tags);
    _renderTagSelector(container, []);
  } catch (_) {}
}

function _renderTagSelector(container, selectedTags) {
  if (!container) return;
  const allTags = JSON.parse(container.dataset.allTags || '[]');
  const isEn    = document.documentElement.lang === 'en';
  container.innerHTML = '';

  allTags.forEach(tag => {
    const isSelected = _selectedExpTags.has(tag.id) || selectedTags.some(t => t.id === tag.id);
    if (isSelected) _selectedExpTags.add(tag.id);
    const item = document.createElement('div');
    item.className = 'tagItem' + (isSelected ? ' tagItem--active' : '');
    item.dataset.tagId = tag.id;
    item.textContent   = isEn ? (tag.title_en || tag.title_fr) : (tag.title_fr || tag.title_en);
    item.addEventListener('click', () => {
      if (_selectedExpTags.has(tag.id)) {
        _selectedExpTags.delete(tag.id);
        item.classList.remove('tagItem--active');
      } else {
        _selectedExpTags.add(tag.id);
        item.classList.add('tagItem--active');
      }
      _updateTagCount();
    });
    container.appendChild(item);
  });
  _updateTagCount();
}

function _updateTagCount() {
  const counter = document.getElementById('expTagCount');
  if (counter) counter.textContent = _selectedExpTags.size > 0 ? `(${_selectedExpTags.size})` : '';
}

// ================================================================================================
// /////////////////////////////// MEDIAS MANAGEMENT /////////////////////////////////////////////
// ================================================================================================

let _mediasData       = [];
let _mediasInited     = false;
let _selectedMediaIds = new Set();
let _mediaPanelUpdate = null;
let _mediaProjectOptionsUpdate = null;
let _mediasPage       = 1;
const _MEDIAS_PER_PAGE = 100; // grille 10×10

// Calcule le chemin de la miniature _Thumb correspondant à une image
function _getThumbPath(filePath) {
  const lastDot = filePath.lastIndexOf('.');
  if (lastDot === -1) return filePath;
  return filePath.slice(0, lastDot) + '_Thumb' + filePath.slice(lastDot);
}

// Miniature officielle fournie par YouTube à partir de l'URL stockée en file_path
function _getYoutubeThumb(url) {
  const m = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : '';
}

function initMediasManagement() {
  if (_mediasInited) { _syncAndLoad(); return; }
  _mediasInited = true;

  const grid          = document.getElementById('mediasGrid');
  const editorTitle   = document.getElementById('mediaEditorTitle');
  const editorForm    = document.getElementById('formEditMedia');
  const previewWrap   = document.getElementById('mediaPreview');
  const previewImg    = document.getElementById('mediaPreviewImg');
  const inputDescFr   = document.getElementById('inputMediaDescFr');
  const inputDescEn   = document.getElementById('inputMediaDescEn');
  const inputAlt      = document.getElementById('inputMediaAlt');
  const altGroup      = document.getElementById('mediaAltGroup');
  const inputYear     = document.getElementById('inputMediaYear');
  const inputGallery  = document.getElementById('inputMediaGallery');
  const inputCard     = document.getElementById('inputMediaCard');
  const urlGrp        = document.getElementById('mediaUrlGroup');
  const inputUrl      = document.getElementById('inputMediaUrl');
  const catTagGrp     = document.getElementById('mediaCatTagGroup');
  const techTagGrp    = document.getElementById('mediaTechTagGroup');
  const catTagSel     = document.getElementById('mediaCatTagSelector');
  const techTagSel    = document.getElementById('mediaTechTagSelector');
  const catTagCount   = document.getElementById('mediaCatTagCount');
  const techTagCount  = document.getElementById('mediaTechTagCount');
  const emptyActions  = document.getElementById('mediaEmptyActions');
  const btnSave       = document.getElementById('btnSaveMedia');
  const msgBox        = document.getElementById('msgMediaSave');
  const deleteGrp     = document.getElementById('mediaDeleteGroup');
  const btnDelete     = document.getElementById('btnDeleteMedia');
  const confirmDel    = document.getElementById('mediaDeleteConfirm');
  const btnConfirmDel = document.getElementById('btnConfirmDeleteMedia');
  const btnCancelDel  = document.getElementById('btnCancelDeleteMedia');
  const selInfo       = document.getElementById('mediaSelInfo');
  const msgSync       = document.getElementById('msgUploadMedia');
  const inputPage     = document.getElementById('inputMediaPage');
  const btnYoutube    = document.getElementById('btnOpenYoutube');
  const btnUpload     = document.getElementById('btnOpenUpload');
  const inputUpload   = document.getElementById('inputUploadMedia');
  const youtubePop    = document.getElementById('youtubePopup');
  const inputYtUrl    = document.getElementById('inputYoutubeUrl');
  const btnAddYt      = document.getElementById('btnAddYoutube');
  const btnCancelYt   = document.getElementById('btnCancelYoutube');
  const msgYt         = document.getElementById('msgYoutube');

  if (!grid || !btnSave) return;

  // Tags sélectionnés pour le média en cours d'édition
  let _mediaCatTags  = new Set();
  let _mediaTechTags = new Set();
  let _allCatTags    = [];
  let _allTechTags   = [];
  let _allPages      = [];
  let _mediaDirty    = false;
  // Champs explicitement modifiés par l'utilisateur durant l'édition en cours.
  // Permet, en sélection multiple, de ne sauvegarder que les champs réellement
  // édités et de ne jamais écraser les autres métadonnées déjà communes au groupe.
  let _touchedFields = new Set();

  // Charger les tags catégorie et technologie une seule fois
  (async () => {
    try {
      const res  = await fetch('controller/controller.php?action=admin_tags&sub=list');
      const json = await res.json();
      if (json.success) {
        _allCatTags  = json.tags.filter(t => t.category === 'category');
        _allTechTags = json.tags.filter(t => t.category === 'technology');
      }
    } catch (_) {}
  })();

  // Charger la liste des projets (pages de type "projet") pour le menu « Projet lié »
  function _renderMediaProjectOptions() {
    if (!inputPage) return;
    const isEn    = document.documentElement.lang === 'en';
    const current = inputPage.value;
    inputPage.innerHTML = '';
    const noneOpt = document.createElement('option');
    noneOpt.value       = '';
    noneOpt.textContent = isEn ? 'None' : '(Aucun)';
    inputPage.appendChild(noneOpt);
    _allPages.forEach(p => {
      const opt = document.createElement('option');
      opt.value       = p.id;
      opt.textContent = isEn ? (p.title_en || p.title_fr) : (p.title_fr || p.title_en);
      inputPage.appendChild(opt);
    });
    inputPage.value = current;
  }
  _mediaProjectOptionsUpdate = _renderMediaProjectOptions;
  (async () => {
    try {
      const res  = await fetch('controller/controller.php?action=admin_pages&sub=list&type=projet');
      const json = await res.json();
      if (json.success) {
        _allPages = json.pages.map(p => ({ id: p.id, title_fr: p.title_fr, title_en: p.title_en }));
      }
    } catch (_) {}
    _renderMediaProjectOptions();
  })();

  // ── Sélection (click = seul, Ctrl+click = multi) ─────────────────────────
  function _selectMedia(id, ctrlKey) {
    const nid = +id;
    if (ctrlKey) {
      _selectedMediaIds.has(nid) ? _selectedMediaIds.delete(nid) : _selectedMediaIds.add(nid);
    } else {
      _selectedMediaIds = new Set([nid]);
    }
    grid.querySelectorAll('[data-media-id]').forEach(el => {
      el.classList.toggle('mediaThumb--selected', _selectedMediaIds.has(+el.dataset.mediaId));
    });
    _updateRightPanel();
  }

  function _checkMediaForm() {
    btnSave.classList.toggle('btnOn',  _mediaDirty);
    btnSave.classList.toggle('btnOff', !_mediaDirty);
  }
  [inputDescFr, inputDescEn, inputAlt, inputYear, inputUrl].filter(Boolean).forEach(el =>
    el.addEventListener('input', () => { _mediaDirty = true; _touchedFields.add(el); _checkMediaForm(); })
  );
  [inputGallery, inputCard, inputPage].filter(Boolean).forEach(el =>
    el.addEventListener('change', () => { _mediaDirty = true; _touchedFields.add(el); _checkMediaForm(); })
  );

  // ── Right panel ───────────────────────────────────────────────────────────
  function _updateRightPanel() {
    _touchedFields = new Set();
    const count = _selectedMediaIds.size;
    const isEn  = document.documentElement.lang === 'en';

    if (count === 0) {
      editorTitle.textContent   = isEn ? 'Select a media' : 'Sélectionner un média';
      editorForm.style.display  = 'none';
      deleteGrp.style.display   = 'none';
      previewImg.style.display  = 'none';
      previewWrap.querySelector('.mediaPreviewPlaceholder')?.remove();
      if (emptyActions) emptyActions.style.display = '';
      return;
    }

    if (emptyActions) emptyActions.style.display = 'none';
    editorForm.style.display = 'flex';

    if (count === 1) {
      const media = _mediasData.find(m => +m.id === [..._selectedMediaIds][0]);
      editorTitle.textContent = isEn ? 'Edit media' : 'Modifier le média';
      if (media?.type === 'image') {
        previewImg.src   = media.file_path;
        previewImg.onerror = null;
        previewImg.style.display = 'block';
      } else {
        previewImg.style.display = 'none';
      }
      previewWrap.style.display = '';
      previewWrap.querySelector('.mediaPreviewPlaceholder')?.remove();
      inputDescFr.value    = media?.description_fr || '';
      inputDescEn.value    = media?.description_en || '';
      inputAlt.value       = media?.alt_text        || '';
      inputYear.value      = media?.year            || '';
      inputGallery.checked = !!+media?.show_in_gallery;
      if (inputCard) inputCard.checked = !!+media?.is_card_media;
      if (inputPage) inputPage.value = media?.project_id || '';
      // Adresse du lien — visible et éditable pour les médias vidéo (fichier ou YouTube)
      if (urlGrp) {
        const isLinkType = media?.type === 'video' || media?.type === 'youtube';
        urlGrp.style.display = isLinkType ? '' : 'none';
        if (inputUrl) inputUrl.value = isLinkType ? (media.file_path || '') : '';
      }
      altGroup.style.display   = '';
      catTagGrp.style.display  = '';
      techTagGrp.style.display = '';
      deleteGrp.style.display  = 'flex';
      _mediaDirty = false; _checkMediaForm();
      // Charger les tags du média et rendre les sélecteurs
      fetch(`controller/controller.php?action=admin_medias&sub=get&id=${media.id}`)
        .then(r => r.json())
        .then(j => {
          const tags = j.success ? (j.media.tags || []) : [];
          _mediaCatTags  = new Set(tags.filter(t => t.category === 'category').map(t => +t.id));
          _mediaTechTags = new Set(tags.filter(t => t.category === 'technology').map(t => +t.id));
          _renderMediaTagSelector(catTagSel,  catTagCount,  _allCatTags,  _mediaCatTags,  isEn);
          _renderMediaTagSelector(techTagSel, techTagCount, _allTechTags, _mediaTechTags, isEn);
        })
        .catch(() => { _renderMediaTagSelector(catTagSel, catTagCount, _allCatTags, _mediaCatTags, isEn); });
    } else {
      editorTitle.textContent   = isEn ? `${count} medias selected` : `${count} médias sélectionnés`;
      inputDescFr.value = ''; inputDescEn.value = ''; inputAlt.value = '';
      inputYear.value = ''; inputGallery.checked = false;
      if (inputCard) inputCard.checked = false;
      if (urlGrp) urlGrp.style.display = 'none';
      if (inputPage) inputPage.value = '';
      altGroup.style.display    = 'none';
      deleteGrp.style.display   = 'flex';
      catTagGrp.style.display   = '';
      techTagGrp.style.display  = '';
      previewWrap.style.display = '';
      previewImg.style.display  = 'none';
      previewWrap.querySelector('.mediaPreviewPlaceholder')?.remove();
      const ph = document.createElement('span');
      ph.className   = 'mediaPreviewPlaceholder';
      ph.textContent = isEn ? 'Multiple selection' : 'Sélection multiple';
      previewWrap.appendChild(ph);
      _mediaCatTags = new Set(); _mediaTechTags = new Set();
      _renderMediaTagSelector(catTagSel,  catTagCount,  _allCatTags,  _mediaCatTags,  isEn);
      _renderMediaTagSelector(techTagSel, techTagCount, _allTechTags, _mediaTechTags, isEn);
      _mediaDirty = false; _checkMediaForm();
    }
  }
  _mediaPanelUpdate = _updateRightPanel;
  window._mediaSelectHandler = _selectMedia;

  // ── Sauvegarder ───────────────────────────────────────────────────────────
  btnSave.addEventListener('click', async () => {
    if (btnSave.classList.contains('btnOff')) return;
    const isMulti = _selectedMediaIds.size > 1;
    const isEn    = document.documentElement.lang === 'en';
    try {
      await Promise.all([..._selectedMediaIds].map(id => {
        const payload = { id };
        if (isMulti) {
          // En multi-sélection, on n'envoie que les champs explicitement modifiés
          // par l'utilisateur durant cette édition : les autres métadonnées déjà
          // présentes sur chaque média (ex. année déjà appliquée en masse) ne
          // doivent jamais être écrasées par une valeur vide.
          if (_touchedFields.has(inputDescFr)) payload.description_fr = inputDescFr.value.trim();
          if (_touchedFields.has(inputDescEn)) payload.description_en = inputDescEn.value.trim();
          if (_touchedFields.has(inputYear))   payload.year = inputYear.value ? +inputYear.value : null;
          if (_touchedFields.has(inputGallery)) payload.show_in_gallery = inputGallery.checked ? 1 : 0;
          if (inputCard && _touchedFields.has(inputCard)) payload.is_card_media = inputCard.checked ? 1 : 0;
          if (inputPage && _touchedFields.has(inputPage)) payload.project_id = inputPage.value ? +inputPage.value : null;
          // En multi : les tags sélectionnés remplacent ceux de chaque média
          const combined = [..._mediaCatTags, ..._mediaTechTags];
          if (combined.length > 0) payload.tags = combined;
        } else {
          payload.description_fr  = inputDescFr.value.trim();
          payload.description_en  = inputDescEn.value.trim();
          payload.alt_text        = inputAlt.value.trim();
          payload.year            = inputYear.value ? +inputYear.value : null;
          payload.show_in_gallery = inputGallery.checked ? 1 : 0;
          payload.is_card_media   = inputCard?.checked ? 1 : 0;
          payload.project_id      = inputPage?.value ? +inputPage.value : null;
          if (urlGrp && urlGrp.style.display !== 'none' && inputUrl?.value.trim()) {
            payload.file_path = inputUrl.value.trim();
          }
          payload.tags            = [..._mediaCatTags, ..._mediaTechTags];
        }
        return fetch('controller/controller.php?action=admin_medias&sub=update', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
      }));
      _showTagMsg(msgBox, isEn ? 'Saved.' : 'Sauvegardé.', false);
      await _syncAndLoad(true);
    } catch (_) { _showTagMsg(msgBox, 'Erreur réseau.', true); }
  });

  // ── Supprimer ─────────────────────────────────────────────────────────────
  btnDelete.addEventListener('click', () => { confirmDel.style.display = 'flex'; });
  btnCancelDel.addEventListener('click', () => { confirmDel.style.display = 'none'; });
  confirmDel.addEventListener('click', e => { if (e.target === confirmDel) confirmDel.style.display = 'none'; });
  btnConfirmDel.addEventListener('click', async () => {
    confirmDel.style.display = 'none';
    const ids = [..._selectedMediaIds];
    if (!ids.length) return;
    try {
      await Promise.all(ids.map(id =>
        fetch('controller/controller.php?action=admin_medias&sub=delete', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
        })
      ));
      _selectedMediaIds.clear();
      _showTagMsg(msgBox, document.documentElement.lang === 'en' ? 'Deleted.' : 'Supprimé(s).', false);
      await _syncAndLoad(true);
      _updateRightPanel();
    } catch (_) {}
  });

  // ── Upload direct de médias (image / vidéo / audio) ────────────────────────
  btnUpload.addEventListener('click', () => { inputUpload.click(); });
  inputUpload.addEventListener('change', async () => {
    const files = [...inputUpload.files];
    inputUpload.value = '';
    if (!files.length) return;
    const isEn = document.documentElement.lang === 'en';
    let okCount = 0, errCount = 0;
    for (const file of files) {
      const type = file.type.startsWith('image/') ? 'image'
        : file.type.startsWith('video/') ? 'video'
        : file.type.startsWith('audio/') ? 'audio' : null;
      if (!type) { errCount++; continue; }
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', type);
      try {
        const res  = await fetch('controller/controller.php?action=admin_medias&sub=upload', { method: 'POST', body: fd });
        const json = await res.json();
        if (json.success) okCount++; else errCount++;
      } catch (_) { errCount++; }
    }
    if (okCount) _showTagMsg(msgSync, isEn ? `${okCount} media(s) uploaded.` : `${okCount} média(s) importé(s).`, false);
    if (errCount) _showTagMsg(msgSync, isEn ? `${errCount} error(s).` : `${errCount} erreur(s).`, true);
    if (okCount) await _syncAndLoad(true);
  });

  // ── Popup YouTube ─────────────────────────────────────────────────────────────
  btnYoutube.addEventListener('click', () => {
    inputYtUrl.value = '';
    btnAddYt.classList.replace('btnOn','btnOff');
    youtubePop.style.display = 'flex';
  });
  btnCancelYt.addEventListener('click', () => { youtubePop.style.display = 'none'; });
  youtubePop.addEventListener('click', e => { if (e.target === youtubePop) youtubePop.style.display = 'none'; });
  inputYtUrl.addEventListener('input', () => {
    btnAddYt.classList.toggle('btnOn',  inputYtUrl.value.trim().length > 0);
    btnAddYt.classList.toggle('btnOff', inputYtUrl.value.trim().length === 0);
  });
  btnAddYt.addEventListener('click', async () => {
    if (btnAddYt.classList.contains('btnOff')) return;
    const isEn = document.documentElement.lang === 'en';
    const payload = {
      type: 'youtube',
      url:  inputYtUrl.value.trim(),
    };
    try {
      const res  = await fetch('controller/controller.php?action=admin_medias&sub=add_link', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        _showTagMsg(msgYt, isEn ? 'Added.' : 'Ajouté.', false);
        setTimeout(() => { youtubePop.style.display = 'none'; }, 1200);
        await _syncAndLoad(true);
      } else {
        _showTagMsg(msgYt, 'Erreur : ' + (json.code ?? ''), true);
      }
    } catch (_) { _showTagMsg(msgYt, 'Erreur réseau.', true); }
  });

  // ── Helper : sélecteur de tags (expTagSelector) + compteur ───────────────────────
  function _renderMediaTagSelector(container, countEl, allTags, selectedSet, isEn) {
    if (!container) return;
    container.innerHTML = '';
    if (!allTags.length) return;
    allTags.forEach(tag => {
      const item = document.createElement('div');
      item.className   = 'tagItem' + (selectedSet.has(+tag.id) ? ' tagItem--active' : '');
      item.dataset.tagId = tag.id;
      item.textContent = isEn ? (tag.title_en || tag.title_fr) : (tag.title_fr || tag.title_en);
      item.addEventListener('click', () => {
        if (selectedSet.has(+tag.id)) { selectedSet.delete(+tag.id); item.classList.remove('tagItem--active'); }
        else { selectedSet.add(+tag.id); item.classList.add('tagItem--active'); }
        if (countEl) countEl.textContent = selectedSet.size > 0 ? `(${selectedSet.size})` : '';
        _mediaDirty = true; _checkMediaForm(); // tag modifié = formulaire dirty
      });
      container.appendChild(item);
    });
    if (countEl) countEl.textContent = selectedSet.size > 0 ? `(${selectedSet.size})` : '';
  }

  // ── Désélectionner en cliquant en dehors de la grille et du right panel ─────────
  document.addEventListener('click', e => {
    const g  = document.getElementById('mediasGrid');
    const sb = document.querySelector('.mediasContent .sideBlock');
    if (!g || !sb) return;
    if (g.contains(e.target) || sb.contains(e.target)) return;
    if (_selectedMediaIds.size > 0) {
      _selectedMediaIds.clear();
      const grid = document.getElementById('mediasGrid');
      if (grid) _renderMediasGrid(grid, _mediasData);
      _updateRightPanel();
    }
  });

  // ── Navigation pagination grille ───────────────────────────────────────
  const btnPrev  = document.getElementById('btnMediasPrev');
  const btnNext  = document.getElementById('btnMediasNext');
  const btnFirst = document.getElementById('btnMediasFirst');
  const btnLast  = document.getElementById('btnMediasLast');
  function _goPage(n) { _mediasPage = n; _renderMediasGrid(grid, _mediasData); }
  function _bindPagIcon(el, fn) {
    if (!el) return;
    el.addEventListener('click', () => { if (!el.classList.contains('btnOff')) fn(); });
  }
  _bindPagIcon(btnFirst, () => _goPage(1));
  _bindPagIcon(btnPrev,  () => _goPage(_mediasPage - 1));
  _bindPagIcon(btnNext,  () => _goPage(_mediasPage + 1));
  _bindPagIcon(btnLast,  () => _goPage(Math.max(1, Math.ceil(_mediasData.length / _MEDIAS_PER_PAGE))));

  _syncAndLoad();
}

// Synchronise depuis Galleries puis charge la liste
// (conserve volontairement la page de pagination courante : un rechargement après
// sauvegarde/suppression ne doit pas ramener l'utilisateur en début de liste)
async function _syncAndLoad(skipImport = false) {
  if (!skipImport) {
    try {
      await fetch('controller/controller.php?action=admin_medias&sub=import_all', { method: 'POST' });
    } catch (_) {}
  }
  try {
    const res  = await fetch('controller/controller.php?action=admin_medias&sub=list&per_page=99999');
    const json = await res.json();
    if (json.success) {
      _mediasData = json.medias;
      const grid = document.getElementById('mediasGrid');
      if (grid) _renderMediasGrid(grid, _mediasData);
      _mediaPanelUpdate?.();
    }
  } catch (_) {}
}

function _renderMediasGrid(grid, medias) {
  grid.innerHTML = '';
  if (!medias.length) {
    grid.innerHTML = '<p class="adminPlaceholder">Aucun média.</p>';
    return;
  }

  // Tri alphabétique par nom de fichier
  const sorted = [...medias].sort((a, b) => {
    const na = a.file_path.split('/').pop().toLowerCase();
    const nb = b.file_path.split('/').pop().toLowerCase();
    return na.localeCompare(nb);
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / _MEDIAS_PER_PAGE));
  _mediasPage      = Math.min(Math.max(1, _mediasPage), totalPages);
  const start      = (_mediasPage - 1) * _MEDIAS_PER_PAGE;
  const pageItems  = sorted.slice(start, start + _MEDIAS_PER_PAGE);

  pageItems.forEach(media => {
    const thumb = document.createElement('div');
    thumb.className       = 'mediaThumb';
    thumb.dataset.mediaId = media.id;
    if (_selectedMediaIds.has(+media.id)) thumb.classList.add('mediaThumb--selected');

    if (media.type === 'image') {
      const img = document.createElement('img');
      img.src     = _getThumbPath(media.file_path);
      img.onerror = () => { img.src = media.file_path; };
      img.alt = media.alt_text || ''; img.loading = 'lazy';
      thumb.appendChild(img);
    } else if (media.type === 'youtube') {
      // Miniature fournie automatiquement par YouTube — pas de cover manuelle
      const thumbUrl = _getYoutubeThumb(media.file_path);
      if (thumbUrl) {
        const img = document.createElement('img');
        img.src = thumbUrl; img.loading = 'lazy';
        thumb.appendChild(img);
      }
      const badge = document.createElement('span');
      badge.className = 'icon iconVideo mediaVideoBadge';
      thumb.appendChild(badge);
    } else {
      const badge = document.createElement('span');
      badge.className = 'mediaTypeBadge'; badge.textContent = media.type.toUpperCase();
      thumb.appendChild(badge);
    }

    thumb.addEventListener('click', e => window._mediaSelectHandler?.(media.id, e.ctrlKey || e.metaKey));
    grid.appendChild(thumb);
  });

  // Mise à jour pagination
  const pagNav  = document.getElementById('mediasPagination');
  const pagInfo = document.getElementById('mediasPageInfo');
  const btnPrev = document.getElementById('btnMediasPrev');
  const btnNext = document.getElementById('btnMediasNext');
  const btnFirst = document.getElementById('btnMediasFirst');
  const btnLast  = document.getElementById('btnMediasLast');
  const first    = _mediasPage <= 1;
  const last     = _mediasPage >= totalPages;
  if (pagNav)   pagNav.style.display  = totalPages > 1 ? 'flex' : 'none';
  if (pagInfo)  pagInfo.textContent   = `${_mediasPage} / ${totalPages}`;
  // Spans d'icônes — .btnOff (existant) pour l'état inactif, .btnOn pour actif
  [btnFirst, btnPrev].forEach(el => { el?.classList.toggle('btnOn', !first); el?.classList.toggle('btnOff', first); });
  [btnNext, btnLast].forEach(el  => { el?.classList.toggle('btnOn', !last);  el?.classList.toggle('btnOff', last); });
}



// Re-rendre les listes sans refetch quand la langue change
document.addEventListener('languagechange', () => {
  if (_tagsInited) {
    const c = document.getElementById('tagsListContainer');
    if (c) _loadTagList(c, true);
  }
  if (_expInited) _loadExpList(true);
  if (_mediasInited) {
    _mediaProjectOptionsUpdate?.();
    _mediaPanelUpdate?.();
  }
});

// ================================================================================================
// /////////////////////////////// PAGES MANAGEMENT //////////////////////////////////////////////
// ================================================================================================

let _pagesInited  = false;
let _pagesData    = [];
let _editingPage  = null;   // page en cours d'édition
let _editingBlocks = [];    // blocs du builder
let _insertAfterIdx  = -1; // index après lequel insérer un nouveau bloc
let _mediaPickerCb   = null; // callback du sélecteur de média
let _selectedPageTags        = new Set(); // IDs des tags sélectionnés pour la page en édition
let _selectedPageExperiences = new Set(); // IDs des expériences liées à la page en édition
let _selectedPageRelated     = new Set(); // IDs des pages projet liées (pages de type "blog")
// Right panel display — pour le type "expertise" (système générique, réutilisable pour d'autres types)
let _selectedPageRPExperiences = new Set(); // IDs des expériences affichées en timeline (box 1)
let _selectedPageRPProjects    = new Set(); // IDs des pages projet affichées en carrousel (box 2)
let _selectedPageRPTags        = new Set(); // IDs des tags catégorie pilotant le carrousel d'articles (box 3)

// Ferme n'importe quel dropdown de sélection (tags/expériences) ouvert au clic extérieur
document.addEventListener('click', (e) => {
  document.querySelectorAll('details.expTagDropdown[open]').forEach(dd => {
    if (!dd.contains(e.target)) dd.open = false;
  });
}, { capture: true });

// ── Rich text — gras/italique par sélection dans les blocs de contenu ────────

// Convertit un contenu stocké (texte brut legacy ou HTML riche) en HTML sûr à afficher
function _richHtmlFromStored(raw) {
  if (!raw) return '';
  if (/<[a-z][\s\S]*>/i.test(raw)) return _sanitizeRichHtml(raw);
  const div = document.createElement('div');
  div.textContent = raw;
  return div.innerHTML.replace(/\n/g, '<br>');
}

// Ne conserve que les balises de formatage autorisées (gras/italique/saut de ligne/lien)
function _sanitizeRichHtml(html) {
  const allowedTags = new Set(['B', 'STRONG', 'I', 'EM', 'BR', 'A', 'UL', 'LI']);
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  (function walk(node) {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
        if (!allowedTags.has(child.tagName)) {
          while (child.firstChild) node.insertBefore(child.firstChild, child);
          node.removeChild(child);
        } else if (child.tagName === 'A') {
          // N'autorise que http(s)/mailto — bloque javascript: et autres schémas dangereux
          const href = (child.getAttribute('href') || '').trim();
          [...child.attributes].forEach(attr => child.removeAttribute(attr.name));
          if (/^(https?:|mailto:)/i.test(href)) {
            child.setAttribute('href', href);
            child.setAttribute('target', '_blank');
            child.setAttribute('rel', 'noopener noreferrer');
          } else {
            while (child.firstChild) node.insertBefore(child.firstChild, child);
            node.removeChild(child);
          }
        } else {
          [...child.attributes].forEach(attr => child.removeAttribute(attr.name));
        }
      } else if (child.nodeType !== Node.TEXT_NODE) {
        node.removeChild(child);
      }
    });
  })(tmp);
  return tmp.innerHTML;
}

let _richLinkTarget = null; // { editable, range, onDone } — en attente de confirmation dans la popup

function _buildRichToolbar(getEditable) {
  const bar = document.createElement('div');
  bar.className = 'richTextToolbar';
  [['bold', '<b>B</b>'], ['italic', '<i>I</i>'], ['insertUnorderedList', '&#8226;&#8226;&#8226;']].forEach(([cmd, label]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'richTextBtn';
    btn.dataset.cmd = cmd;
    btn.innerHTML = label;
    // Empêche la perte de la sélection en cours dans le contenteditable
    btn.addEventListener('mousedown', e => e.preventDefault());
    btn.addEventListener('click', () => {
      const editable = getEditable();
      editable.focus();
      document.execCommand(cmd);
      _updateRichToolbarState(bar, editable);
      editable.dispatchEvent(new Event('input'));
    });
    bar.appendChild(btn);
  });

  const linkBtn = document.createElement('button');
  linkBtn.type = 'button';
  linkBtn.className = 'richTextBtn';
  linkBtn.innerHTML = '&#128279;';
  linkBtn.title = 'Lien';
  linkBtn.addEventListener('mousedown', e => e.preventDefault());
  linkBtn.addEventListener('click', () => {
    const editable = getEditable();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    if (!editable.contains(range.commonAncestorContainer)) return;
    _richLinkTarget = {
      range,
      onDone: () => { editable.dispatchEvent(new Event('input')); _updateRichToolbarState(bar, editable); },
    };
    const popup = document.getElementById('richLinkPopup');
    const input = document.getElementById('inputRichLinkUrl');
    if (popup && input) { input.value = ''; popup.style.display = 'flex'; input.focus(); }
  });
  bar.appendChild(linkBtn);

  return bar;
}

// Insère un <a> autour de la sélection sauvegardée, sans remplacer le texte sélectionné
function _insertRichLink(range, url) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  try {
    range.surroundContents(a);
  } catch (_) {
    const frag = range.extractContents();
    a.appendChild(frag);
    range.insertNode(a);
  }
}

function _updateRichToolbarState(bar, editable) {
  bar.querySelectorAll('.richTextBtn[data-cmd]').forEach(btn => {
    let active = false;
    try { active = document.queryCommandState(btn.dataset.cmd); } catch (_) {}
    btn.classList.toggle('richTextBtn--active', active);
  });
}

// Construit le champ éditable riche (toolbar + contenteditable) pour une langue donnée
function _buildRichField(block, idx, lang, placeholder, visible, btnSave) {
  const field = document.createElement('div');
  field.className = 'langField' + (visible ? ' langField--visible' : '');
  field.dataset.lang = lang;

  const editable = document.createElement('div');
  editable.className = 'formRichText';
  editable.contentEditable = 'true';
  editable.dataset.placeholder = placeholder;
  editable.innerHTML = _richHtmlFromStored(block[`content_${lang}`] || '');

  const toolbar = _buildRichToolbar(() => editable);

  editable.addEventListener('input', () => {
    _editingBlocks[idx][`content_${lang}`] = _sanitizeRichHtml(editable.innerHTML);
    btnSave.classList.replace('btnOff', 'btnOn');
  });
  // Le collage ne doit jamais importer la mise en forme/couleur de la source (ex: texte noir copié depuis Word/Docs)
  editable.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
  });
  // Entrée = <br> forcé, inséré directement via Range (pas execCommand) : Chrome
  // fusionne/ignore un 2e <br> consécutif inséré via execCommand('insertHTML'),
  // ce qui supprimait les retours à la ligne vides entre deux paragraphes.
  editable.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    // À l'intérieur d'une liste à puce, laisser le navigateur créer un nouvel <li>
    // (notre insertion manuelle de <br> casserait la structure de liste).
    const sel0 = window.getSelection();
    if (sel0 && sel0.rangeCount) {
      const node = sel0.getRangeAt(0).startContainer;
      const startEl = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      if (startEl && startEl.closest('li') && editable.contains(startEl)) return;
    }
    e.preventDefault();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const br = document.createElement('br');
    range.insertNode(br);
    range.setStartAfter(br);
    range.setEndAfter(br);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    editable.dispatchEvent(new Event('input'));
  });
  editable.addEventListener('focus', () => {
    document.execCommand('defaultParagraphSeparator', false, 'br');
    _updateRichToolbarState(toolbar, editable);
  });
  editable.addEventListener('keyup', () => _updateRichToolbarState(toolbar, editable));
  editable.addEventListener('mouseup', () => _updateRichToolbarState(toolbar, editable));

  field.appendChild(toolbar);
  field.appendChild(editable);
  return field;
}

// ── Sélecteur de tags pour les pages (catégories confondues) ────────────────
async function _loadPageTagsList(container) {
  if (!container) return;
  try {
    const res  = await fetch('controller/controller.php?action=admin_tags&sub=list');
    const json = await res.json();
    if (!json.success) return;
    container.dataset.allTags = JSON.stringify(json.tags);
    _renderPageTagSelector(container, []);
  } catch (_) {}
}

function _renderPageTagSelector(container, selectedTags) {
  if (!container) return;
  const allTags = JSON.parse(container.dataset.allTags || '[]');
  const isEn    = document.documentElement.lang === 'en';
  container.innerHTML = '';
  ['category', 'job', 'technology'].forEach(cat => {
    const tags = allTags.filter(t => t.category === cat);
    if (!tags.length) return;
    const catDef = _TAG_CATEGORIES[cat];
    const group  = document.createElement('div');
    group.className = 'expTagGroup';
    group.innerHTML = `<span class="expTagGroupTitle">${isEn ? catDef.en : catDef.fr}</span>`;
    const list = document.createElement('div');
    list.className = 'expTagGroupList';
    tags.forEach(tag => {
      const isSelected = _selectedPageTags.has(+tag.id) || selectedTags.some(t => t.id === tag.id);
      if (isSelected) _selectedPageTags.add(+tag.id);
      const item = document.createElement('div');
      item.className = 'tagItem' + (isSelected ? ' tagItem--active' : '');
      item.dataset.tagId = tag.id;
      item.textContent   = isEn ? (tag.title_en || tag.title_fr) : (tag.title_fr || tag.title_en);
      item.addEventListener('click', () => {
        if (_selectedPageTags.has(+tag.id)) { _selectedPageTags.delete(+tag.id); item.classList.remove('tagItem--active'); }
        else { _selectedPageTags.add(+tag.id); item.classList.add('tagItem--active'); }
        _updatePageTagCount();
        document.getElementById('btnSavePage')?.classList.replace('btnOff', 'btnOn');
      });
      list.appendChild(item);
    });
    group.appendChild(list);
    container.appendChild(group);
  });
  _updatePageTagCount();
}

function _updatePageTagCount() {
  const counter = document.getElementById('pageTagCount');
  if (counter) counter.textContent = _selectedPageTags.size > 0 ? `(${_selectedPageTags.size})` : '';
}

// ── Sélecteur d'expériences liées pour les pages ─────────────────────────────
async function _loadPageExperiencesList(container) {
  if (!container) return;
  try {
    const res  = await fetch('controller/controller.php?action=admin_experiences&sub=list');
    const json = await res.json();
    if (!json.success) return;
    container.dataset.allExps = JSON.stringify(json.experiences.map(e => ({ id: e.id, title_fr: e.title_fr, title_en: e.title_en })));
    _renderPageExpSelector(container, []);
  } catch (_) {}
}

function _renderPageExpSelector(container, selectedExps) {
  if (!container) return;
  const allExps = JSON.parse(container.dataset.allExps || '[]');
  const isEn    = document.documentElement.lang === 'en';
  container.innerHTML = '';
  allExps.forEach(exp => {
    const isSelected = _selectedPageExperiences.has(+exp.id) || selectedExps.some(e => e.id === exp.id);
    if (isSelected) _selectedPageExperiences.add(+exp.id);
    const item = document.createElement('div');
    item.className = 'tagItem' + (isSelected ? ' tagItem--active' : '');
    item.dataset.expId = exp.id;
    item.textContent   = isEn ? (exp.title_en || exp.title_fr) : (exp.title_fr || exp.title_en);
    item.addEventListener('click', () => {
      if (_selectedPageExperiences.has(+exp.id)) { _selectedPageExperiences.delete(+exp.id); item.classList.remove('tagItem--active'); }
      else { _selectedPageExperiences.add(+exp.id); item.classList.add('tagItem--active'); }
      _updatePageExpCount();
      document.getElementById('btnSavePage')?.classList.replace('btnOff', 'btnOn');
    });
    container.appendChild(item);
  });
  _updatePageExpCount();
}

function _updatePageExpCount() {
  const counter = document.getElementById('pageExpCount');
  if (counter) counter.textContent = _selectedPageExperiences.size > 0 ? `(${_selectedPageExperiences.size})` : '';
}

// ── Sélecteur de pages projet liées — pour les pages de type "blog" ─────────
async function _loadPageRelatedList(container) {
  if (!container) return;
  try {
    const res  = await fetch('controller/controller.php?action=admin_pages&sub=list&type=projet');
    const json = await res.json();
    if (!json.success) return;
    container.dataset.allPages = JSON.stringify(json.pages.map(p => ({ id: p.id, title_fr: p.title_fr, title_en: p.title_en })));
    _renderPageRelatedSelector(container, []);
  } catch (_) {}
}

function _renderPageRelatedSelector(container, selectedPages) {
  if (!container) return;
  const allPages = JSON.parse(container.dataset.allPages || '[]');
  const isEn     = document.documentElement.lang === 'en';
  container.innerHTML = '';
  allPages.forEach(p => {
    const isSelected = _selectedPageRelated.has(+p.id) || selectedPages.some(sp => sp.id === p.id);
    if (isSelected) _selectedPageRelated.add(+p.id);
    const item = document.createElement('div');
    item.className = 'tagItem' + (isSelected ? ' tagItem--active' : '');
    item.dataset.pageId = p.id;
    item.textContent    = isEn ? (p.title_en || p.title_fr) : (p.title_fr || p.title_en);
    item.addEventListener('click', () => {
      if (_selectedPageRelated.has(+p.id)) { _selectedPageRelated.delete(+p.id); item.classList.remove('tagItem--active'); }
      else { _selectedPageRelated.add(+p.id); item.classList.add('tagItem--active'); }
      _updatePageRelatedCount();
      document.getElementById('btnSavePage')?.classList.replace('btnOff', 'btnOn');
    });
    container.appendChild(item);
  });
  _updatePageRelatedCount();
}

function _updatePageRelatedCount() {
  const counter = document.getElementById('pageRelatedCount');
  if (counter) counter.textContent = _selectedPageRelated.size > 0 ? `(${_selectedPageRelated.size})` : '';
}

// ── Right panel display — Expériences liées (box 1, timeline) — pour le type "expertise" ──
async function _loadPageRPExpList(container) {
  if (!container) return;
  try {
    const res  = await fetch('controller/controller.php?action=admin_experiences&sub=list');
    const json = await res.json();
    if (!json.success) return;
    container.dataset.allExps = JSON.stringify(json.experiences.map(e => ({ id: e.id, title_fr: e.title_fr, title_en: e.title_en })));
    _renderPageRPExpSelector(container, []);
  } catch (_) {}
}

function _renderPageRPExpSelector(container, selectedExps) {
  if (!container) return;
  const allExps = JSON.parse(container.dataset.allExps || '[]');
  const isEn    = document.documentElement.lang === 'en';
  container.innerHTML = '';
  allExps.forEach(exp => {
    const isSelected = _selectedPageRPExperiences.has(+exp.id) || selectedExps.some(e => e.id === exp.id);
    if (isSelected) _selectedPageRPExperiences.add(+exp.id);
    const item = document.createElement('div');
    item.className = 'tagItem' + (isSelected ? ' tagItem--active' : '');
    item.dataset.expId = exp.id;
    item.textContent   = isEn ? (exp.title_en || exp.title_fr) : (exp.title_fr || exp.title_en);
    item.addEventListener('click', () => {
      if (_selectedPageRPExperiences.has(+exp.id)) { _selectedPageRPExperiences.delete(+exp.id); item.classList.remove('tagItem--active'); }
      else { _selectedPageRPExperiences.add(+exp.id); item.classList.add('tagItem--active'); }
      _updatePageRPExpCount();
      document.getElementById('btnSavePage')?.classList.replace('btnOff', 'btnOn');
    });
    container.appendChild(item);
  });
  _updatePageRPExpCount();
}

function _updatePageRPExpCount() {
  const counter = document.getElementById('pageRPExpCount');
  if (counter) counter.textContent = _selectedPageRPExperiences.size > 0 ? `(${_selectedPageRPExperiences.size})` : '';
}

// ── Right panel display — Projets liés (box 2, carrousel) — pour le type "expertise" ──
async function _loadPageRPProjList(container) {
  if (!container) return;
  try {
    const res  = await fetch('controller/controller.php?action=admin_pages&sub=list&type=projet');
    const json = await res.json();
    if (!json.success) return;
    container.dataset.allPages = JSON.stringify(json.pages.map(p => ({ id: p.id, title_fr: p.title_fr, title_en: p.title_en })));
    _renderPageRPProjSelector(container, []);
  } catch (_) {}
}

function _renderPageRPProjSelector(container, selectedPages) {
  if (!container) return;
  const allPages = JSON.parse(container.dataset.allPages || '[]');
  const isEn     = document.documentElement.lang === 'en';
  container.innerHTML = '';
  allPages.forEach(p => {
    const isSelected = _selectedPageRPProjects.has(+p.id) || selectedPages.some(sp => sp.id === p.id);
    if (isSelected) _selectedPageRPProjects.add(+p.id);
    const item = document.createElement('div');
    item.className = 'tagItem' + (isSelected ? ' tagItem--active' : '');
    item.dataset.pageId = p.id;
    item.textContent    = isEn ? (p.title_en || p.title_fr) : (p.title_fr || p.title_en);
    item.addEventListener('click', () => {
      if (_selectedPageRPProjects.has(+p.id)) { _selectedPageRPProjects.delete(+p.id); item.classList.remove('tagItem--active'); }
      else { _selectedPageRPProjects.add(+p.id); item.classList.add('tagItem--active'); }
      _updatePageRPProjCount();
      document.getElementById('btnSavePage')?.classList.replace('btnOff', 'btnOn');
    });
    container.appendChild(item);
  });
  _updatePageRPProjCount();
}

function _updatePageRPProjCount() {
  const counter = document.getElementById('pageRPProjCount');
  if (counter) counter.textContent = _selectedPageRPProjects.size > 0 ? `(${_selectedPageRPProjects.size})` : '';
}

// ── Right panel display — Articles liés (box 3, carrousel piloté par tags catégorie) ──
async function _loadPageRPTagList(container) {
  if (!container) return;
  try {
    const res  = await fetch('controller/controller.php?action=admin_tags&sub=list');
    const json = await res.json();
    if (!json.success) return;
    container.dataset.allTags = JSON.stringify(json.tags.filter(t => t.category === 'category'));
    _renderPageRPTagSelector(container, []);
  } catch (_) {}
}

function _renderPageRPTagSelector(container, selectedTags) {
  if (!container) return;
  const allTags = JSON.parse(container.dataset.allTags || '[]');
  const isEn    = document.documentElement.lang === 'en';
  container.innerHTML = '';
  allTags.forEach(tag => {
    const isSelected = _selectedPageRPTags.has(+tag.id) || selectedTags.some(t => t.id === tag.id);
    if (isSelected) _selectedPageRPTags.add(+tag.id);
    const item = document.createElement('div');
    item.className = 'tagItem' + (isSelected ? ' tagItem--active' : '');
    item.dataset.tagId = tag.id;
    item.textContent   = isEn ? (tag.title_en || tag.title_fr) : (tag.title_fr || tag.title_en);
    item.addEventListener('click', () => {
      if (_selectedPageRPTags.has(+tag.id)) { _selectedPageRPTags.delete(+tag.id); item.classList.remove('tagItem--active'); }
      else { _selectedPageRPTags.add(+tag.id); item.classList.add('tagItem--active'); }
      _updatePageRPTagCount();
      document.getElementById('btnSavePage')?.classList.replace('btnOff', 'btnOn');
    });
    container.appendChild(item);
  });
  _updatePageRPTagCount();
}

function _updatePageRPTagCount() {
  const counter = document.getElementById('pageRPTagCount');
  if (counter) counter.textContent = _selectedPageRPTags.size > 0 ? `(${_selectedPageRPTags.size})` : '';
}

let _galleryPickerBlockIdx = -1; // pour la sélection de médias galerie

// ── Cover média — pan/zoom (l'image occupe toujours 100% de sa box) ────────
const _COVER_MAX_SCALE = 4;
let _coverDragState = null; // { mode: 'pan'|'resize', wrap, img, btnSave, startMouseX, startMouseY, startPosX, startPosY, startScale }

function _clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

// Dimensionne/positionne l'image pour couvrir exactement la box (échelle mini) + zoom/pan utilisateur
function _layoutCoverImage(wrap, img) {
  if (!img.naturalWidth || !img.naturalHeight) return;
  const boxW = wrap.clientWidth, boxH = wrap.clientHeight;
  if (!boxW || !boxH) return;
  const baseScale = Math.max(boxW / img.naturalWidth, boxH / img.naturalHeight);
  const userScale = _editingPage?.cover_scale ?? 1;
  const effScale  = baseScale * userScale;
  const renderedW = img.naturalWidth  * effScale;
  const renderedH = img.naturalHeight * effScale;
  const slackX = Math.max(0, renderedW - boxW);
  const slackY = Math.max(0, renderedH - boxH);
  const posX = _editingPage?.cover_pos_x ?? 0.5;
  const posY = _editingPage?.cover_pos_y ?? 0.5;
  img.style.width  = renderedW + 'px';
  img.style.height = renderedH + 'px';
  img.style.left   = (-posX * slackX) + 'px';
  img.style.top    = (-posY * slackY) + 'px';
}

// Recalcule la position à partir d'un déplacement souris (pan) ou d'une échelle (resize)
document.addEventListener('mousemove', (e) => {
  if (!_coverDragState) return;
  const { mode, wrap, img, btnSave, startMouseX, startMouseY, startPosX, startPosY, startScale } = _coverDragState;
  if (mode === 'resize') {
    const boxH = wrap.clientHeight || 1;
    const delta = startMouseY - e.clientY; // vers le haut = zoom avant
    _editingPage.cover_scale = _clamp(startScale + delta / boxH, 1, _COVER_MAX_SCALE);
  } else {
    const boxW = wrap.clientWidth, boxH = wrap.clientHeight;
    const baseScale = Math.max(boxW / img.naturalWidth, boxH / img.naturalHeight);
    const effScale  = baseScale * (_editingPage?.cover_scale ?? 1);
    const slackX = Math.max(0, img.naturalWidth  * effScale - boxW);
    const slackY = Math.max(0, img.naturalHeight * effScale - boxH);
    const dx = e.clientX - startMouseX, dy = e.clientY - startMouseY;
    _editingPage.cover_pos_x = slackX > 0 ? _clamp(startPosX - dx / slackX, 0, 1) : 0.5;
    _editingPage.cover_pos_y = slackY > 0 ? _clamp(startPosY - dy / slackY, 0, 1) : 0.5;
  }
  _layoutCoverImage(wrap, img);
  btnSave.classList.replace('btnOff', 'btnOn');
});
document.addEventListener('mouseup', () => {
  if (_coverDragState) {
    _coverDragState.wrap.classList.remove('pageBuilderCover--dragging');
    _coverDragState = null;
  }
});
// Recalcule la mise en page de la cover affichée si la fenêtre est redimensionnée
window.addEventListener('resize', () => {
  const wrap = document.querySelector('.pageBuilderCover');
  const img  = wrap?.querySelector('.pageBlock0CoverImg');
  if (wrap && img) _layoutCoverImage(wrap, img);
});

// Attache le pan (glisser la box) et le zoom (poignée coin bas-droit) sur la cover
function _initCoverInteractions(wrap, img, btnSave) {
  if (img.complete) _layoutCoverImage(wrap, img);
  img.addEventListener('load', () => _layoutCoverImage(wrap, img));

  wrap.addEventListener('mousedown', (e) => {
    if (e.target.closest('.pageCoverResizeHandle') || !img.naturalWidth) return;
    _coverDragState = {
      mode: 'pan', wrap, img, btnSave,
      startMouseX: e.clientX, startMouseY: e.clientY,
      startPosX: _editingPage?.cover_pos_x ?? 0.5, startPosY: _editingPage?.cover_pos_y ?? 0.5,
    };
    wrap.classList.add('pageBuilderCover--dragging');
    e.preventDefault();
  });

  const handle = document.createElement('div');
  handle.className = 'pageCoverResizeHandle';
  handle.addEventListener('mousedown', (e) => {
    if (!img.naturalWidth) return;
    _coverDragState = {
      mode: 'resize', wrap, img, btnSave,
      startMouseX: e.clientX, startMouseY: e.clientY,
      startScale: _editingPage?.cover_scale ?? 1,
    };
    e.preventDefault();
    e.stopPropagation();
  });
  wrap.appendChild(handle);
}

function initPagesManagement() {
  if (_pagesInited) {
    _loadPageList();
    _loadPageTagsList(document.getElementById('pageTagSelector'));
    _loadPageExperiencesList(document.getElementById('pageExpSelector'));
    _loadPageRelatedList(document.getElementById('pageRelatedSelector'));
    _loadPageRPExpList(document.getElementById('pageRPExpSelector'));
    _loadPageRPProjList(document.getElementById('pageRPProjSelector'));
    _loadPageRPTagList(document.getElementById('pageRPTagSelector'));
    return;
  }
  _pagesInited = true;

  // ── Refs DOM ──────────────────────────────────────────────────────────────
  const listMode       = document.getElementById('pagesListMode');
  const editMode       = document.getElementById('pagesEditMode');
  const listCnt        = document.getElementById('pagesListContainer');
  // Filtre
  const typeFilter     = document.getElementById('selectPageTypeFilter');
  const qFilter        = document.getElementById('inputSearchPageQ');
  const btnSearch      = document.getElementById('btnSearchPages');
  const msgSearch      = document.getElementById('msgPageSearch');
  // Créer
  const titleFrNew     = document.getElementById('inputNewPageTitleFr');
  const titleEnNew     = document.getElementById('inputNewPageTitleEn');
  const typeNew        = document.getElementById('selectNewPageType');
  const btnCreate      = document.getElementById('btnCreatePage');
  const msgCreate      = document.getElementById('msgPageCreate');
  // Builder (mode édition)
  const blocksCnt      = document.getElementById('pageBlocksContainer');
  // Propriétés (mode édition)
  const editorTitle    = document.getElementById('pageEditorTitle');
  const titleFrEdit    = document.getElementById('inputPageTitleFr');
  const titleEnEdit    = document.getElementById('inputPageTitleEn');
  const typeEdit       = document.getElementById('selectEditPageType');
  const inputCoverId   = document.getElementById('inputPageCoverId');
  const coverPrvImg    = document.getElementById('pageCoverPickerImg');
  const coverPrvEmpty  = document.getElementById('pageCoverPickerEmpty');
  const btnPickCover   = document.getElementById('btnPickPageCover');
  const inputCoverVideoUrl = document.getElementById('inputPageCoverVideoUrl');
  const inputCardId    = document.getElementById('inputPageCardId');
  const cardPrvImg     = document.getElementById('pageCardPickerImg');
  const cardPrvEmpty   = document.getElementById('pageCardPickerEmpty');
  const btnPickCard    = document.getElementById('btnPickPageCard');
  const inputDateStart = document.getElementById('inputPageDateStart');
  const inputDateEnd   = document.getElementById('inputPageDateEnd');
  const inputDatePublication = document.getElementById('inputPageDatePublication');
  const pageTagSelector = document.getElementById('pageTagSelector');
  const pageExpSelector = document.getElementById('pageExpSelector');
  const pageRelatedSelector = document.getElementById('pageRelatedSelector');
  const pageRPExpSelector  = document.getElementById('pageRPExpSelector');
  const pageRPProjSelector = document.getElementById('pageRPProjSelector');
  const pageRPTagSelector  = document.getElementById('pageRPTagSelector');
  const inputSubtitleFr = document.getElementById('inputPageSubtitleFr');
  const inputSubtitleEn = document.getElementById('inputPageSubtitleEn');
  const inputExpIconPath = document.getElementById('inputPageExpIconPath');
  const expIconPrvImg   = document.getElementById('pageExpIconPreviewImg');
  const expIconPrvEmpty = document.getElementById('pageExpIconPreviewEmpty');
  const btnPickExpIcon  = document.getElementById('btnPickPageExpIcon');
  const inputVisible   = document.getElementById('inputPageVisible');
  const btnSave        = document.getElementById('btnSavePage');
  const btnDelete      = document.getElementById('btnDeletePage');
  const msgSave        = document.getElementById('msgPageSave');
  const inputPageId    = document.getElementById('inputPageId');
  const btnExitEdit    = document.getElementById('btnExitEditMode');
  const confirmDel     = document.getElementById('pageDeleteConfirm');
  const btnConfirmDel  = document.getElementById('btnConfirmDeletePage');
  const btnCancelDel   = document.getElementById('btnCancelDeletePage');
  // Popup type de bloc
  const blockTypePopup = document.getElementById('blockTypePopup');
  const btnCancelBlock = document.getElementById('btnCancelBlockType');
  // Popup sélecteur de média
  // Popup sélecteur de média — géré par _openMediaPicker (module-level)
  const btnCancelMedia = document.getElementById('btnCancelMediaPicker');

  if (!listCnt) return;

  // ── Helpers media preview ─────────────────────────────────────────────────
  function _setMediaPreview(img, empty, path) {
    if (path) {
      img.onerror = () => { img.onerror = null; img.src = path; };
      img.src = _getThumbPath(path); img.style.display = 'block'; empty.style.display = 'none';
    } else { img.src = ''; img.style.display = 'none'; empty.style.display = 'inline'; }
  }
  // Preview d'un icône statique (pas de miniature _Thumb, chemin direct)
  function _setIconFieldPreview(img, empty, path) {
    if (path) { img.src = path; img.style.display = 'block'; empty.style.display = 'none'; }
    else      { img.src = ''; img.style.display = 'none'; empty.style.display = 'inline'; }
  }
  // Met à jour la preview cover dans le premier bloc du builder
  function _updateBuilderCover() {
    const img = blocksCnt?.querySelector('.pageBlock0CoverImg');
    const ph  = blocksCnt?.querySelector('.pageBlock0CoverEmpty');
    const path = _editingPage?.main_visual_path || '';
    if (img) { img.src = path || ''; img.style.display = path ? 'block' : 'none'; }
    if (ph)  ph.style.display = path ? 'none' : 'inline';
  }

  // ── Activer le bouton créer si type sélectionné ───────────────────────────
  typeNew.addEventListener('change', () => {
    const ok = !!typeNew.value;
    btnCreate.classList.toggle('btnOn',  ok);
    btnCreate.classList.toggle('btnOff', !ok);
  });

  // ── Champs conditionnels selon le type de page ────────────────────────────
  function _updatePageFieldVisibility() {
    const t = typeEdit.value;
    const isProjet    = t === 'projet';
    const isBlog      = t === 'blog';
    const isExpertise = t === 'expertise';
    const showTagsExp = t === 'projet' || t === 'blog';
    document.querySelectorAll('.pageProjectOnly').forEach(el => { el.style.display = isProjet ? '' : 'none'; });
    document.querySelectorAll('.pageTagsExpOnly').forEach(el => { el.style.display = showTagsExp ? '' : 'none'; });
    document.querySelectorAll('.pageBlogOnly').forEach(el => { el.style.display = isBlog ? '' : 'none'; });
    document.querySelectorAll('.pageExpertiseOnly').forEach(el => { el.style.display = isExpertise ? '' : 'none'; });
  }
  typeEdit.addEventListener('change', _updatePageFieldVisibility);

  // ── Filtre / recherche ────────────────────────────────────────────────────
  btnSearch.addEventListener('click', async () => {
    try {
      const res  = await fetch(
        `controller/controller.php?action=admin_pages&sub=search`,
        { method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ type: typeFilter.value, q: qFilter.value.trim() }) }
      );
      const json = await res.json();
      if (json.success) { _pagesData = json.pages; _renderPageList(listCnt, _pagesData); }
    } catch (_) { _showTagMsg(msgSearch, 'Erreur réseau.', true); }
  });

  // ── Créer une page ────────────────────────────────────────────────────────
  btnCreate.addEventListener('click', async () => {
    if (btnCreate.classList.contains('btnOff')) return;
    const isEn = document.documentElement.lang === 'en';
    try {
      const res  = await fetch('controller/controller.php?action=admin_pages&sub=create', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ type: typeNew.value, title_fr: titleFrNew.value.trim(), title_en: titleEnNew.value.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        titleFrNew.value = ''; titleEnNew.value = ''; typeNew.value = '';
        btnCreate.classList.replace('btnOn','btnOff');
        await _loadPageList();
        _enterEditMode(json.id);
      } else {
        _showTagMsg(msgCreate, 'Erreur : ' + (json.code ?? ''), true);
      }
    } catch (_) { _showTagMsg(msgCreate, 'Erreur réseau.', true); }
  });

  // ── Sauvegarder ───────────────────────────────────────────────────────────
  btnSave.addEventListener('click', async () => {
    if (btnSave.classList.contains('btnOff')) return;
    const isEn = document.documentElement.lang === 'en';
    const id   = parseInt(inputPageId.value);
    if (!id) return;
    try {
      const pageRes = await fetch('controller/controller.php?action=admin_pages&sub=update', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          id,
          title_fr: titleFrEdit.value.trim(),
          title_en: titleEnEdit.value.trim(),
          type:     typeEdit.value,
          main_visual_id: inputCoverId.value || null,
          thumbnail_id:   inputCardId.value  || null,
          is_visible: inputVisible.checked ? 1 : 0,
          date_start: typeEdit.value === 'projet' ? (inputDateStart.value || null) : null,
          date_end:   typeEdit.value === 'projet' ? (inputDateEnd.value   || null) : null,
          cover_pos_x: _editingPage?.cover_pos_x ?? 0.5,
          cover_pos_y: _editingPage?.cover_pos_y ?? 0.5,
          cover_scale: _editingPage?.cover_scale ?? 1,
          cover_video_url: inputCoverVideoUrl.value.trim() || null,
          subtitle_fr: inputSubtitleFr.value.trim(),
          subtitle_en: inputSubtitleEn.value.trim(),
          expertise_icon_path: inputExpIconPath.value || null,
          date_publication: typeEdit.value === 'blog'
            ? (inputDatePublication.value || _editingPage?.created_at?.slice(0, 10) || null)
            : null,
          tags:        (typeEdit.value === 'projet' || typeEdit.value === 'blog') ? [..._selectedPageTags]        : [],
          experiences: (typeEdit.value === 'projet' || typeEdit.value === 'blog') ? [..._selectedPageExperiences]
                     : typeEdit.value === 'expertise' ? [..._selectedPageRPExperiences] : [],
          related:     typeEdit.value === 'blog' ? [..._selectedPageRelated]
                     : typeEdit.value === 'expertise' ? [..._selectedPageRPProjects] : [],
          related_tags: typeEdit.value === 'expertise' ? [..._selectedPageRPTags] : [],
        }),
      });
      const blocksRes = await fetch('controller/controller.php?action=admin_pages&sub=save_blocks', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ page_id: id, blocks: _editingBlocks }),
      });
      const pj = await pageRes.json(); const bj = await blocksRes.json();
      if (pj.success && bj.success) {
        _showTagMsg(msgSave, isEn ? 'Saved.' : 'Sauvegardé.', false);
        await _loadPageList();
        btnSave.classList.replace('btnOn','btnOff');
      } else {
        _showTagMsg(msgSave, 'Erreur.', true);
      }
    } catch (_) { _showTagMsg(msgSave, 'Erreur réseau.', true); }
  });

  // Activer save dès que n'importe quel champ change
  [titleFrEdit, titleEnEdit, inputDateStart, inputDateEnd, inputCoverVideoUrl, inputSubtitleFr, inputSubtitleEn, inputDatePublication].forEach(el =>
    el.addEventListener('input', () => { btnSave.classList.replace('btnOff','btnOn'); })
  );
  [typeEdit, inputVisible].forEach(el =>
    el.addEventListener('change', () => { btnSave.classList.replace('btnOff','btnOn'); })
  );

  // ── Supprimer ─────────────────────────────────────────────────────────────
  btnDelete.addEventListener('click', () => { confirmDel.style.display = 'flex'; });
  btnCancelDel.addEventListener('click', () => { confirmDel.style.display = 'none'; });
  confirmDel.addEventListener('click', e => { if (e.target === confirmDel) confirmDel.style.display = 'none'; });
  btnConfirmDel.addEventListener('click', async () => {
    confirmDel.style.display = 'none';
    const id = parseInt(inputPageId.value);
    if (!id) return;
    try {
      const res  = await fetch('controller/controller.php?action=admin_pages&sub=delete', {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success) { _exitEditMode(); await _loadPageList(); }
    } catch (_) {}
  });

  // ── Quitter le mode édition ───────────────────────────────────────────────
  btnExitEdit.addEventListener('click', () => _exitEditMode());

  // ── Sélecteurs de média (cover + card) ───────────────────────────────────
  btnPickCover.addEventListener('click', () => {
    _openMediaPicker(media => {
      inputCoverId.value = media.id;
      const path = media.file_path;
        _setMediaPreview(coverPrvImg, coverPrvEmpty, path);
        if (_editingPage) {
          _editingPage.main_visual_path = path;
          // Nouveau média : repartir d'un cadrage centré par défaut
          _editingPage.cover_pos_x = 0.5;
          _editingPage.cover_pos_y = 0.5;
          _editingPage.cover_scale = 1;
        }
        _updateBuilderCover();
        btnSave.classList.replace('btnOff','btnOn');
      });
  });
  btnPickCard.addEventListener('click', () => {
    _openMediaPicker(media => {
      inputCardId.value = media.id;
      _setMediaPreview(cardPrvImg, cardPrvEmpty, media.file_path);
      btnSave.classList.replace('btnOff','btnOn');
    }, { cardOnly: true });
  });

  // ── Popup type de bloc ────────────────────────────────────────────────────
  blockTypePopup.addEventListener('click', e => {
    const btn = e.target.closest('[data-block-type]');
    if (btn) {
      const type = btn.dataset.blockType;
      blockTypePopup.style.display = 'none';
      _insertBlock(type, _insertAfterIdx);
    }
  });
  btnCancelBlock.addEventListener('click', () => { blockTypePopup.style.display = 'none'; });
  blockTypePopup.addEventListener('click', e => { if (e.target === blockTypePopup) blockTypePopup.style.display = 'none'; });

  // ── Popup sélecteur de média — utilise _openMediaPicker module-level ──────
  const _pm = () => document.getElementById('pageMediaPicker');
  const _pg = () => document.getElementById('pageMediaPickerGrid');
  btnCancelMedia.addEventListener('click', () => { _pm().style.display = 'none'; _mediaPickerCb = null; });
  _pm().addEventListener('click', e => { if (e.target.id === 'pageMediaPicker') { e.target.style.display = 'none'; _mediaPickerCb = null; } });
  document.getElementById('btnConfirmMediaPicker')?.addEventListener('click', () => {
    _pm().style.display = 'none';
    const selected = _pickerMedias.filter(m => _pickerSelected.has(+m.id));
    if (_mediaPickerCb) { _mediaPickerCb(selected); _mediaPickerCb = null; }
  });
  _pm().querySelectorAll('[data-picdir]').forEach(el => {
    el.addEventListener('click', () => {
      if (el.classList.contains('btnOff')) return;
      const d = el.dataset.picdir, total = Math.max(1, Math.ceil(_pickerMedias.length / _PK));
      if (d === 'f') _pickerPage = 1;
      else if (d === 'p') _pickerPage = Math.max(1, _pickerPage - 1);
      else if (d === 'n') _pickerPage = Math.min(total, _pickerPage + 1);
      else if (d === 'l') _pickerPage = total;
      _renderPickerGrid(_pg(), _pm());
    });
  });

  // ── Popup insertion de lien (éditeur de texte riche) ──────────────────────
  const richLinkPopup = document.getElementById('richLinkPopup');
  const inputRichLinkUrl = document.getElementById('inputRichLinkUrl');
  const btnCancelRichLink = document.getElementById('btnCancelRichLink');
  const btnConfirmRichLink = document.getElementById('btnConfirmRichLink');
  const _closeRichLinkPopup = () => { richLinkPopup.style.display = 'none'; _richLinkTarget = null; };
  btnCancelRichLink?.addEventListener('click', _closeRichLinkPopup);
  richLinkPopup?.addEventListener('click', e => { if (e.target === richLinkPopup) _closeRichLinkPopup(); });
  btnConfirmRichLink?.addEventListener('click', () => {
    const url = inputRichLinkUrl.value.trim();
    if (!url || !_richLinkTarget) { _closeRichLinkPopup(); return; }
    _insertRichLink(_richLinkTarget.range, url);
    _richLinkTarget.onDone();
    _closeRichLinkPopup();
  });

  // ── Popup sélecteur d'icône d'expertise (uniquement les icônes "_grey") ────
  const EXP_ICON_FOLDER = 'vue/assets/images/icons';
  const expIconBrowser  = document.getElementById('expIconBrowser');
  const expIconGrid     = document.getElementById('expIconBrowserGrid');
  const btnCloseExpIcon = document.getElementById('btnCloseExpIconBrowser');
  btnPickExpIcon?.addEventListener('click', async () => {
    expIconBrowser.style.display = 'flex';
    expIconGrid.innerHTML = '<p class="adminPlaceholder">Chargement&hellip;</p>';
    try {
      const res  = await fetch(`controller/controller.php?action=admin_tags&sub=icons&folder=${encodeURIComponent(EXP_ICON_FOLDER)}`);
      const json = await res.json();
      const files = (json.files || []).filter(f => f.toLowerCase().includes('_grey'));
      if (!files.length) { expIconGrid.innerHTML = '<p class="adminPlaceholder">Aucune ic&ocirc;ne.</p>'; return; }
      expIconGrid.innerHTML = '';
      files.forEach(file => {
        const path = `${EXP_ICON_FOLDER}/${file}`;
        const item = document.createElement('div');
        item.className = 'iconBrowserItem';
        item.title     = file;
        const img = document.createElement('img');
        img.src = path; img.alt = file; img.loading = 'lazy';
        item.appendChild(img);
        item.addEventListener('click', () => {
          inputExpIconPath.value = path;
          _setIconFieldPreview(expIconPrvImg, expIconPrvEmpty, path);
          expIconBrowser.style.display = 'none';
          btnSave.classList.replace('btnOff','btnOn');
        });
        expIconGrid.appendChild(item);
      });
    } catch (_) { expIconGrid.innerHTML = '<p class="adminPlaceholder">Erreur.</p>'; }
  });
  btnCloseExpIcon?.addEventListener('click', () => { expIconBrowser.style.display = 'none'; });
  expIconBrowser?.addEventListener('click', e => { if (e.target === expIconBrowser) expIconBrowser.style.display = 'none'; });

  // ── Helpers mode édition ──────────────────────────────────────────────────
  function _enterEditMode(pageId) {
    fetch(`controller/controller.php?action=admin_pages&sub=get&id=${pageId}`)
      .then(r => r.json())
      .then(json => {
        if (!json.success) return;
        const page = json.page;
        _editingPage   = page;
        _editingBlocks = (page.blocks || []).map(b => ({...b}));
        inputPageId.value    = page.id;
        titleFrEdit.value    = page.title_fr  || '';
        titleEnEdit.value    = page.title_en  || '';
        typeEdit.value       = page.type      || 'projet';
        inputVisible.checked = !!+page.is_visible;
        inputCoverId.value   = page.main_visual_id || '';
        inputCoverVideoUrl.value = page.cover_video_url || '';
        inputCardId.value    = page.thumbnail_id   || '';
        inputDateStart.value = page.date_start || '';
        inputDateEnd.value   = page.date_end   || '';
        // Si aucune date de publication n'a été entrée manuellement, on préremplit
        // avec la date de création — reste modifiable, et c'est cette valeur qui
        // sera sauvegardée si l'utilisateur ne la modifie pas.
        inputDatePublication.value = page.date_publication || (page.created_at ? page.created_at.slice(0, 10) : '');
        inputSubtitleFr.value = page.subtitle_fr || '';
        inputSubtitleEn.value = page.subtitle_en || '';
        inputExpIconPath.value = page.expertise_icon_path || '';
        _setIconFieldPreview(expIconPrvImg, expIconPrvEmpty, page.expertise_icon_path || '');
        _selectedPageTags        = new Set();
        _selectedPageExperiences = new Set();
        _selectedPageRelated     = new Set();
        _selectedPageRPExperiences = new Set();
        _selectedPageRPProjects    = new Set();
        _selectedPageRPTags        = new Set();
        _renderPageTagSelector(pageTagSelector, page.tags || []);
        _renderPageExpSelector(pageExpSelector, page.experiences || []);
        _renderPageRelatedSelector(pageRelatedSelector, page.related || []);
        _renderPageRPExpSelector(pageRPExpSelector, page.experiences || []);
        _renderPageRPProjSelector(pageRPProjSelector, page.related || []);
        _renderPageRPTagSelector(pageRPTagSelector, page.related_tags || []);
        _updatePageFieldVisibility();
        btnSave.classList.replace('btnOn','btnOff');
        // Résoudre les chemins des médias cover/card
        const isEn = document.documentElement.lang === 'en';
        if (page.main_visual_id) {
          fetch(`controller/controller.php?action=admin_medias&sub=get&id=${page.main_visual_id}`)
            .then(r => r.json()).then(mj => {
              if (mj.success) {
                page.main_visual_path = mj.media.file_path;
                _setMediaPreview(coverPrvImg, coverPrvEmpty, mj.media.file_path);
                _updateBuilderCover();
              }
            }).catch(() => {});
        } else {
          _setMediaPreview(coverPrvImg, coverPrvEmpty, '');
          _updateBuilderCover();
        }
        if (page.thumbnail_id) {
          fetch(`controller/controller.php?action=admin_medias&sub=get&id=${page.thumbnail_id}`)
            .then(r => r.json()).then(mj => {
              if (mj.success) _setMediaPreview(cardPrvImg, cardPrvEmpty, mj.media.file_path);
            }).catch(() => {});
        } else {
          _setMediaPreview(cardPrvImg, cardPrvEmpty, '');
        }
        const title = isEn ? (page.title_en || page.title_fr) : (page.title_fr || page.title_en);
        editorTitle.textContent = title || (isEn ? 'Edit page' : 'Éditer la page');
        listMode.style.display = 'none';
        editMode.style.display = '';
        _renderBuilder();
      }).catch(() => {});
  }

  function _exitEditMode() {
    editMode.style.display = 'none';
    listMode.style.display = '';
    _editingPage   = null;
    _editingBlocks = [];
  }

  // ── Builder de contenu ────────────────────────────────────────────────────
  function _renderBuilder() {
    blocksCnt.innerHTML = '';
    const isEn = document.documentElement.lang === 'en';
    // Si aucun bloc, créer un premier bloc texte vide
    if (!_editingBlocks.length) {
      _editingBlocks.push({ block_type: 'text', content_fr: '', content_en: '', media_id: null });
    }
    _editingBlocks.forEach((block, i) => {
      const isFirst = i === 0;
      const group = document.createElement('div');
      group.className = 'pageBlockGroup';
      group.appendChild(_buildBlockEl(block, i, isFirst));
      group.appendChild(_buildBlockActionsBar(i, isFirst));
      blocksCnt.appendChild(group);
    });
  }

  function _buildBlockEl(block, idx, isFirst) {
    const el   = document.createElement('div');
    el.className = 'pageBlock';
    el.dataset.blockIdx = idx;
    const isEn = document.documentElement.lang === 'en';

    // Premier bloc : cover fusionnée + texte — pas de déplacement ni suppression
    if (isFirst) {
      // Preview cover (mise à jour par _updateBuilderCover)
      const coverWrap = document.createElement('div');
      coverWrap.className = 'pageBuilderCover';
      const coverImg = document.createElement('img');
      coverImg.className = 'pageBlock0CoverImg';
      const path = _editingPage?.main_visual_path || '';
      coverImg.src = path; coverImg.style.display = path ? 'block' : 'none';
      const coverPh = document.createElement('span');
      coverPh.className = 'adminPlaceholder pageBlock0CoverEmpty';
      coverPh.textContent = isEn ? 'No cover media' : 'Aucun média cover';
      coverPh.style.display = path ? 'none' : 'inline';
      coverWrap.appendChild(coverImg); coverWrap.appendChild(coverPh);
      el.appendChild(coverWrap);
      _initCoverInteractions(coverWrap, coverImg, btnSave);
    }

    // Contenu selon le type
    if (block.block_type === 'text') {
      el.appendChild(_buildTextBlock(block, idx, isFirst));
    } else if (block.block_type === 'media') {
      el.appendChild(_buildMediaBlock(block, idx));
    } else if (block.block_type === 'gallery') {
      el.appendChild(_buildGalleryBlock(block, idx));
    }

    return el;
  }

  // Barre d'actions — toujours affichée en dehors et sous la carte du bloc
  function _buildBlockActionsBar(idx, isFirst) {
    const actions = document.createElement('div');
    actions.className = 'pageBlockActions';
    actions.appendChild(_makeBlockBtn('iconPlus', () => {
      _insertAfterIdx = idx;
      blockTypePopup.style.display = 'flex';
    }));
    if (!isFirst) {
      if (idx > 1) {
        actions.appendChild(_makeBlockBtn('iconPrevious', () => { _moveBlock(idx, -1); }));
      }
      if (idx < _editingBlocks.length - 1) {
        actions.appendChild(_makeBlockBtn('iconNext', () => { _moveBlock(idx, 1); }));
      }
      actions.appendChild(_makeBlockBtn('iconDelete', () => { _deleteBlock(idx); }, true));
    }
    return actions;
  }

  function _makeBlockBtn(iconClass, cb, isDanger = false) {
    const btn = document.createElement('div');
    btn.className = 'pageBlockActionBtn' + (isDanger ? ' pageBlockActionBtn--danger' : '');
    btn.innerHTML = `<span class="icon ${iconClass}"></span>`;
    btn.addEventListener('click', cb);
    return btn;
  }

  function _buildTextBlock(block, idx, isFirst = false) {
    const wrap = document.createElement('div');
    wrap.className = 'formGroup langGroup';
    const sw = document.createElement('div');
    sw.className = 'langSwitch';
    sw.innerHTML = `<label class="formLabel" lang="FR" data-en="Content">Contenu</label>
      <button type="button" class="langBtn langBtn--active" data-lang="fr">FR</button>
      <button type="button" class="langBtn" data-lang="en">EN</button>`;
    const fieldFr = _buildRichField(block, idx, 'fr', 'Contenu français…', true,  btnSave);
    const fieldEn = _buildRichField(block, idx, 'en', 'English content…',  false, btnSave);
    wrap.appendChild(sw); wrap.appendChild(fieldFr); wrap.appendChild(fieldEn);
    // Checkbox "Intro text" uniquement sur le premier bloc
    if (isFirst) {
      const chkWrap = document.createElement('label');
      chkWrap.className = 'formCheckboxLabel';
      const chk = document.createElement('input'); chk.type = 'checkbox';
      chk.checked = !!+block.is_intro;
      chk.addEventListener('change', () => {
        _editingBlocks[idx].is_intro = chk.checked ? 1 : 0;
        btnSave.classList.replace('btnOff','btnOn');
      });
      const box  = document.createElement('span'); box.className  = 'formCheckbox';
      const txt  = document.createElement('span'); txt.className  = 'formCheckboxText';
      txt.setAttribute('lang', 'FR'); txt.setAttribute('data-en', 'Intro text (bold)');
      txt.textContent = 'Texte d\'intro (gras)';
      chkWrap.appendChild(chk); chkWrap.appendChild(box); chkWrap.appendChild(txt);
      wrap.appendChild(chkWrap);
    }
    return wrap;
  }

  function _buildMediaBlock(block, idx) {
    const wrap = document.createElement('div');
    wrap.className = 'formGroup';
    const lbl = document.createElement('label');
    lbl.className = 'formLabel';
    lbl.textContent = document.documentElement.lang === 'en' ? 'Isolated media' : 'Média isolé';
    wrap.appendChild(lbl);
    const preview = document.createElement('div');
    preview.className = 'mediaPreviewWrap';
    preview.style.aspectRatio = '16/9';
    const img = document.createElement('img');
    img.style.display = 'none';
    img.onerror = () => { img.onerror = null; img.src = block._media_path || img.src; };
    if (block.media_id && block._media_path) { img.src = _getThumbPath(block._media_path); img.style.display = 'block'; }
    preview.appendChild(img);
    const btnPick = document.createElement('div');
    btnPick.className = 'btnMedium btnOn';
    btnPick.innerHTML = `<div class="btnLabel"><span class="btnText" lang="FR" data-en="Choose media">Choisir un m&eacute;dia</span></div>`;
    btnPick.addEventListener('click', () => {
      _openMediaPicker(media => {
        _editingBlocks[idx].media_id = media.id;
        _editingBlocks[idx]._media_path = media.file_path;
        img.src = _getThumbPath(media.file_path); img.style.display = 'block';
        btnSave.classList.replace('btnOff','btnOn');
      });
    });
    wrap.appendChild(preview);
    wrap.appendChild(btnPick);
    // Si un media_id existe mais pas le chemin, charger
    if (block.media_id && !block._media_path) {
      fetch(`controller/controller.php?action=admin_medias&sub=get&id=${block.media_id}`)
        .then(r => r.json()).then(mj => {
          if (mj.success) { block._media_path = mj.media.file_path; img.src = _getThumbPath(mj.media.file_path); img.style.display = 'block'; }
        }).catch(() => {});
    }
    return wrap;
  }

  function _buildGalleryBlock(block, idx) {
    const wrap = document.createElement('div');
    wrap.className = 'formGroup';
    const lbl = document.createElement('span');
    lbl.className = 'blockTitle';
    lbl.textContent = document.documentElement.lang === 'en' ? 'Gallery' : 'Galerie';
    wrap.appendChild(lbl);
    const gallery = document.createElement('div');
    gallery.className = 'pageBlockGallery';
    wrap.appendChild(gallery);
    // Rendre les médias existants
    const ids = (block.gallery || []).map(g => g.media_id);
    block._galleryPaths = block._galleryPaths || {};
    let _dragFromIdx = -1;
    const renderGallery = () => {
      gallery.innerHTML = '';
      ids.forEach((mid, gi) => {
        const th = document.createElement('div');
        th.className = 'pageBlockGalleryThumb';
        th.draggable = true;
        const im = document.createElement('img'); im.loading = 'lazy';
        im.onerror = () => { im.onerror = null; im.src = block._galleryPaths[mid] || im.src; };
        if (block._galleryPaths[mid]) im.src = _getThumbPath(block._galleryPaths[mid]);
        else {
          fetch(`controller/controller.php?action=admin_medias&sub=get&id=${mid}`)
            .then(r => r.json()).then(mj => { if (mj.success) { block._galleryPaths[mid] = mj.media.file_path; im.src = _getThumbPath(mj.media.file_path); } }).catch(() => {});
        }
        // Clic = retirer de la galerie
        th.addEventListener('click', () => { ids.splice(gi, 1); _editingBlocks[idx].gallery = ids.map(id => ({ media_id: id })); renderGallery(); btnSave.classList.replace('btnOff','btnOn'); });
        // Glisser-déposer = réordonner
        th.addEventListener('dragstart', (e) => {
          _dragFromIdx = gi;
          e.dataTransfer.effectAllowed = 'move';
          th.classList.add('pageBlockGalleryThumb--dragging');
        });
        th.addEventListener('dragend', () => th.classList.remove('pageBlockGalleryThumb--dragging'));
        th.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
        th.addEventListener('drop', (e) => {
          e.preventDefault();
          if (_dragFromIdx === -1 || _dragFromIdx === gi) return;
          const [moved] = ids.splice(_dragFromIdx, 1);
          ids.splice(gi, 0, moved);
          _dragFromIdx = -1;
          _editingBlocks[idx].gallery = ids.map(id => ({ media_id: id }));
          renderGallery();
          btnSave.classList.replace('btnOff','btnOn');
        });
        th.appendChild(im); gallery.appendChild(th);
      });
    };
    renderGallery();
    const actions = document.createElement('div');
    actions.className = 'pageBlockGalleryActions';
    const btnAdd = document.createElement('div');
    btnAdd.className = 'btnMedium btnOn';
    btnAdd.innerHTML = `<div class="btnLabel"><span class="btnText" lang="FR" data-en="Add media">Ajouter un m&eacute;dia</span></div>`;
    btnAdd.addEventListener('click', () => {
      _openMediaPicker(mediaList => {
        mediaList.forEach(media => {
          if (!ids.includes(media.id)) {
            ids.push(media.id);
            block._galleryPaths[media.id] = media.file_path;
          }
        });
        _editingBlocks[idx].gallery = ids.map(id => ({ media_id: id }));
        renderGallery();
        btnSave.classList.replace('btnOff','btnOn');
      }, { multi: true });
    });
    actions.appendChild(btnAdd);
    wrap.appendChild(actions);
    return wrap;
  }

  function _insertBlock(type, afterIdx) {
    const block = { block_type: type, content_fr: '', content_en: '', media_id: null, gallery: [] };
    if (afterIdx < 0 || afterIdx >= _editingBlocks.length - 1) {
      _editingBlocks.push(block);
    } else {
      _editingBlocks.splice(afterIdx + 1, 0, block);
    }
    _renderBuilder();
    btnSave.classList.replace('btnOff','btnOn');
  }

  function _moveBlock(idx, dir) {
    const newIdx = idx + dir;
    if (newIdx < 1 || newIdx >= _editingBlocks.length) return;
    [_editingBlocks[idx], _editingBlocks[newIdx]] = [_editingBlocks[newIdx], _editingBlocks[idx]];
    _renderBuilder();
    btnSave.classList.replace('btnOff','btnOn');
  }

  function _deleteBlock(idx) {
    if (idx === 0) return;
    _editingBlocks.splice(idx, 1);
    _renderBuilder();
    btnSave.classList.replace('btnOff','btnOn');
  }

  // ── Chargement initial ────────────────────────────────────────────────────
  _pagesEnterEditMode = _enterEditMode;
  _loadPageList();
  _loadPageTagsList(pageTagSelector);
  _loadPageExperiencesList(pageExpSelector);
  _loadPageRelatedList(pageRelatedSelector);
  _loadPageRPExpList(pageRPExpSelector);
  _loadPageRPProjList(pageRPProjSelector);
  _loadPageRPTagList(pageRPTagSelector);
}

// ── Sélecteur de média paginé — niveau module (accessible depuis tous les panels) ──
let _pickerPage   = 1;
let _pickerMedias = [];
let _pickerOpts   = {};
let _pickerSelected = new Set(); // sélection multiple (galeries)
const _PK         = 100; // grille 10×10

function _openMediaPicker(cb, opts = {}) {
  _mediaPickerCb  = cb;
  _pickerPage     = 1;
  _pickerOpts     = opts;
  _pickerSelected = new Set();
  const popup = document.getElementById('pageMediaPicker');
  const grid  = document.getElementById('pageMediaPickerGrid');
  const btnConfirm = document.getElementById('btnConfirmMediaPicker');
  if (!popup || !grid) return;
  popup.style.display = 'flex';
  if (btnConfirm) btnConfirm.style.display = opts.multi ? '' : 'none';
  grid.innerHTML = '<p class="adminPlaceholder">Chargement\u2026</p>';
  fetch('controller/controller.php?action=admin_medias&sub=list&per_page=99999')
    .then(r => r.json()).then(json => {
      if (!json.success) return;
      _pickerMedias = [...json.medias]
        .filter(m => m.type === 'image')
        .filter(m => !opts.cardOnly || +m.is_card_media === 1)
        .sort((a, b) => a.file_path.split('/').pop().localeCompare(b.file_path.split('/').pop()));
      _renderPickerGrid(grid, popup);
    }).catch(() => { grid.innerHTML = '<p class="adminPlaceholder">Erreur.</p>'; });
}

function _renderPickerGrid(grid, popup) {
  const total = Math.max(1, Math.ceil(_pickerMedias.length / _PK));
  _pickerPage = Math.min(Math.max(1, _pickerPage), total);
  const items = _pickerMedias.slice((_pickerPage - 1) * _PK, _pickerPage * _PK);
  grid.innerHTML = '';
  items.forEach(media => {
    const th = document.createElement('div'); th.className = 'mediaThumb';
    if (_pickerOpts.multi && _pickerSelected.has(+media.id)) th.classList.add('mediaThumb--selected');
    const img = document.createElement('img');
    img.src = _getThumbPath(media.file_path);
    img.onerror = () => { img.src = media.file_path; }; img.loading = 'lazy';
    th.appendChild(img);
    th.addEventListener('click', (e) => {
      if (_pickerOpts.multi) {
        const nid = +media.id;
        if (e.ctrlKey || e.metaKey) {
          if (_pickerSelected.has(nid)) { _pickerSelected.delete(nid); th.classList.remove('mediaThumb--selected'); }
          else { _pickerSelected.add(nid); th.classList.add('mediaThumb--selected'); }
        } else {
          _pickerSelected = new Set([nid]);
          grid.querySelectorAll('.mediaThumb--selected').forEach(el => el.classList.remove('mediaThumb--selected'));
          th.classList.add('mediaThumb--selected');
        }
        return;
      }
      popup.style.display = 'none';
      if (_mediaPickerCb) { _mediaPickerCb(media); _mediaPickerCb = null; }
    });
    grid.appendChild(th);
  });
  const pNav = popup.querySelector('.mediasPagination');
  if (!pNav) return;
  pNav.style.display = total > 1 ? 'flex' : 'none';
  const pInfo = pNav.querySelector('.mediasPageInfo');
  if (pInfo) pInfo.textContent = `${_pickerPage} / ${total}`;
  const isFirst = _pickerPage <= 1, isLast = _pickerPage >= total;
  pNav.querySelectorAll('[data-picdir]').forEach(el => {
    const d = el.dataset.picdir;
    const off = (d === 'f' || d === 'p') ? isFirst : isLast;
    el.classList.toggle('btnOff', off); el.classList.toggle('btnOn', !off);
  });
}

async function _loadPageList() {
  const listCnt = document.getElementById('pagesListContainer');
  if (!listCnt) return;
  try {
    const res  = await fetch('controller/controller.php?action=admin_pages&sub=list');
    const json = await res.json();
    if (json.success) {
      _pagesData = json.pages;
      _renderPageList(listCnt, _pagesData);
    }
  } catch (_) {}
}

function _renderPageList(container, pages) {
  container.innerHTML = '';
  if (!pages.length) {
    container.innerHTML = '<p class="adminPlaceholder">Aucune page.</p>';
    return;
  }
  const isEn = document.documentElement.lang === 'en';
  const typeLabels = { projet: isEn ? 'Project' : 'Projet', expertise: 'Expertise', blog: 'Blog' };
  pages.forEach(page => {
    const card = document.createElement('div');
    card.className = 'expCard expCard--pageList'; card.dataset.pageId = page.id;
    const title = isEn ? (page.title_en || page.title_fr) : (page.title_fr || page.title_en);
    const date  = page.updated_at ? page.updated_at.slice(0, 10) : '';
    let logoHtml = '';
    if (page.type === 'expertise') {
      // Icône d'expertise en variante "_dark", centrée sur un fond gris clair
      const darkPath = page.expertise_icon_path
        ? page.expertise_icon_path.replace(/_grey(\.\w+)$/i, '_dark$1')
        : '';
      logoHtml = `<div class="expCardIconBox">${darkPath ? `<img src="${darkPath}" alt="" />` : ''}</div>`;
    } else {
      // Média card en priorité, sinon média cover
      const rawPath   = page.card_path || page.cover_path || '';
      const thumbPath = rawPath ? _getThumbPath(rawPath) : null;
      logoHtml = thumbPath ? `<img class="expCardLogo" src="${thumbPath}" alt="" onerror="this.onerror=null;this.src='${rawPath}';" />` : '';
    }
    card.innerHTML = `
      <div class="expCardHeader">
        ${logoHtml}
        <div class="expCardInfo">
          <div class="expCardTitleRow">
            <span class="expCardTitle">${title}</span>
            <span class="expBadge">${typeLabels[page.type] || page.type}</span>
          </div>
          <span class="expCardDates">${date}</span>
        </div>
        <div class="expCardActionBtns">
          <button type="button" class="expActionBtn" data-action="edit" title="${isEn ? 'Edit' : 'Modifier'}">
            <span class="icon iconSettings"></span>
          </button>
          <button type="button" class="expActionBtn expActionBtnDanger" data-action="delete" title="${isEn ? 'Delete' : 'Supprimer'}">
            <span class="icon iconDelete"></span>
          </button>
        </div>
      </div>`;
    card.querySelector('[data-action="edit"]').addEventListener('click', e => {
      e.stopPropagation();
      // Chercher initPagesManagement's _enterEditMode via fermeture — invoquer en re-entrant
      const lm = document.getElementById('pagesListMode');
      const em = document.getElementById('pagesEditMode');
      if (lm && em && typeof _pagesEnterEditMode === 'function') _pagesEnterEditMode(page.id);
    });
    card.querySelector('[data-action="delete"]').addEventListener('click', e => {
      e.stopPropagation();
      document.getElementById('inputPageId').value = page.id;
      document.getElementById('pageDeleteConfirm').style.display = 'flex';
    });
    container.appendChild(card);
  });
}

// Exposé pour les cards de la liste
let _pagesEnterEditMode = null;

// ================================================================================================
// /////////////////////////////// COMMENTS MANAGEMENT (modération) //////////////////////////////
// ================================================================================================

let _commentsInited = false;
let _commentsPagesLoaded = false;

function _commentsFilters() {
  const params = {
    id:        document.getElementById('inputSearchCommentId').value.trim(),
    username:  document.getElementById('inputSearchCommentUsername').value.trim(),
    mail:      document.getElementById('inputSearchCommentMail').value.trim(),
    page_id:   document.getElementById('inputSearchCommentPage').value,
    date_from: document.getElementById('inputSearchCommentFrom').value,
    date_to:   document.getElementById('inputSearchCommentTo').value,
    q:         document.getElementById('inputSearchCommentQ').value.trim(),
    is_hidden: document.getElementById('inputSearchCommentHidden').checked ? '1' : '',
  };
  Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
  return params;
}

function _loadCommentsBlogPages() {
  const select = document.getElementById('inputSearchCommentPage');
  if (!select || _commentsPagesLoaded) return;
  _commentsPagesLoaded = true;
  fetch('controller/controller.php?action=admin_pages&sub=list&type=blog')
    .then(r => r.json())
    .then(json => {
      if (!json.success) return;
      const isEn = document.documentElement.lang === 'en';
      json.pages.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = isEn ? (p.title_en || p.title_fr) : (p.title_fr || p.title_en);
        select.appendChild(opt);
      });
    })
    .catch(() => {});
}

function _loadComments() {
  const listCnt = document.getElementById('commentsListContainer');
  if (!listCnt) return;
  const params = new URLSearchParams(_commentsFilters());
  fetch(`controller/controller.php?action=admin_comments&sub=list&${params.toString()}`)
    .then(r => r.json())
    .then(json => {
      if (!json.success) return;
      listCnt.innerHTML = '';
      if (!json.comments.length) {
        listCnt.innerHTML = '<p class="adminPlaceholder">Aucun commentaire.</p>';
        return;
      }
      json.comments.forEach(c => listCnt.appendChild(_buildCommentEntry(c)));
    })
    .catch(() => {});
}

function _buildCommentEntry(c) {
  const entry = document.createElement('div');
  entry.className = 'commentEntry';

  const top = document.createElement('div');
  top.className = 'commentEntryTop';
  const meta = document.createElement('span');
  meta.className = 'entryTXT';
  const when = new Date(c.created_at).toLocaleString('fr-FR');
  const authorLabel = c.username + (c.is_admin ? ' (admin)' : '') + (c.mail ? ` <${c.mail}>` : '');
  meta.textContent = `${authorLabel} · ${c.page_title || '—'} · ${when}`;
  top.appendChild(meta);

  const actions = document.createElement('div');
  actions.className = 'commentEntryActions';

  const btnEdit = document.createElement('div');
  btnEdit.className = 'expActionBtn';
  btnEdit.title = 'Modifier';
  btnEdit.innerHTML = '<span class="icon iconSettings"></span>';

  const btnToggle = document.createElement('div');
  btnToggle.className = 'expActionBtn';
  btnToggle.title = +c.is_hidden ? 'Afficher' : 'Masquer';
  btnToggle.innerHTML = `<span class="icon ${+c.is_hidden ? 'iconEyeClosed' : 'iconEye'}"></span>`;
  btnToggle.addEventListener('click', () => {
    fetch('controller/controller.php?action=admin_comments&sub=toggle_hidden', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: c.id, is_hidden: !+c.is_hidden }),
    }).then(r => r.json()).then(json => { if (json.success) _loadComments(); });
  });
  const btnDelete = document.createElement('div');
  btnDelete.className = 'expActionBtn expActionBtnDanger';
  btnDelete.title = 'Supprimer';
  btnDelete.innerHTML = '<span class="icon iconDelete"></span>';
  btnDelete.addEventListener('click', () => {
    if (!confirm('Supprimer ce commentaire (et ses réponses) ?')) return;
    fetch('controller/controller.php?action=admin_comments&sub=delete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: c.id }),
    }).then(r => r.json()).then(json => { if (json.success) _loadComments(); });
  });
  actions.appendChild(btnEdit);
  actions.appendChild(btnToggle);
  actions.appendChild(btnDelete);
  top.appendChild(actions);

  const text = document.createElement('p');
  text.className = 'commentEntryMessage';
  text.textContent = c.message;

  // ── Mode édition (textarea + sauvegarder/annuler) ──
  const editBox = document.createElement('div');
  editBox.className = 'commentEntryEditBox';
  editBox.style.display = 'none';
  const textarea = document.createElement('textarea');
  textarea.className = 'formTextarea';
  textarea.value = c.message;
  const editActions = document.createElement('div');
  editActions.className = 'commentEntryActions';
  const btnSave = document.createElement('div');
  btnSave.className = 'btnMedium';
  btnSave.innerHTML = '<div class="btnLabel"><span class="btnText">Sauvegarder</span></div>';
  const btnCancel = document.createElement('div');
  btnCancel.className = 'btnMedium';
  btnCancel.innerHTML = '<div class="btnLabel"><span class="btnText">Annuler</span></div>';
  btnSave.addEventListener('click', () => {
    const newMsg = textarea.value.trim();
    if (!newMsg) return;
    fetch('controller/controller.php?action=admin_comments&sub=update', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: c.id, message: newMsg }),
    }).then(r => r.json()).then(json => { if (json.success) _loadComments(); });
  });
  btnCancel.addEventListener('click', () => {
    editBox.style.display = 'none';
    text.style.display = '';
  });
  editActions.appendChild(btnSave);
  editActions.appendChild(btnCancel);
  editBox.appendChild(textarea);
  editBox.appendChild(editActions);

  btnEdit.addEventListener('click', () => {
    const editing = editBox.style.display === 'flex';
    editBox.style.display = editing ? 'none' : 'flex';
    text.style.display = editing ? '' : 'none';
  });

  entry.appendChild(top);
  entry.appendChild(text);
  entry.appendChild(editBox);
  return entry;
}

function initCommentsManagement() {
  const listCnt = document.getElementById('commentsListContainer');
  if (!listCnt) return;
  _loadCommentsBlogPages();
  if (_commentsInited) { _loadComments(); return; }
  _commentsInited = true;

  document.getElementById('btnSearchComments')?.addEventListener('click', (e) => {
    e.preventDefault();
    _loadComments();
  });
  _loadComments();
}
