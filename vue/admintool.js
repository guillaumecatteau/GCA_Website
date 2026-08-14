// ////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////// ADMIN TOOL MENU ///////////////////////////////////////////////
// ////////////////////////////////////////////////////////////////////////////////////////////////
const BTN_USERSMANAGEMENT        = document.getElementById("btnUsersManagement");
const BTN_TAGSMANAGEMENT         = document.getElementById("btnTagsManagement");
const BTN_MEDIASMANAGEMENT       = document.getElementById("btnMediasManagement");
const BTN_PAGESMANAGEMENT        = document.getElementById("btnPagesManagement");
const BTN_EXPERIENCESMANAGEMENT  = document.getElementById("btnExperiencesManagement");
const BTN_COMMENTSMANAGEMENT     = document.getElementById("btnCommentsManagement");
const BTN_ANALYTICS              = document.getElementById("btnAnalytics");
const BTN_SCENEEDITOR            = document.getElementById("btnSceneEditor");
// ////////////////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////// USERS MANAGEMENT ///////////////////////////////////////////////
// ////////////////////////////////////////////////////////////////////////////////////////////////
const USER_LIST_CONTAINER = document.getElementById("usersListContainer");
const USER_FILTERS = document.getElementById("userEntryFilters");
const USER_TEMPLATE = document.getElementById("userEntryTemplate");
const FILTER_ID           = document.getElementById("userFilterId");
const FILTER_NAME         = document.getElementById("userFilterName");
const FILTER_FIRSTNAME    = document.getElementById("userFilterFirstname");
const FILTER_EMAIL        = document.getElementById("userFilteremail");
const FILTER_SUBSCRIPTION = document.getElementById("subscription");
const FILTER_ROLE         = document.getElementById("userFilterRole");
// ///////////////////// ENTRIES FILTERS /////////////////////////////////////
let currentSortField = "id";
let sortAsc = true;
let usersData = [];
function sortUsers(data, field, asc) {
  const sorted = data.slice(); // clone
  sorted.sort((a, b) => {
    let valA = a[field];
    let valB = b[field];

    // Date au format string
    if (field === "subscription") {
      valA = valA || "";
      valB = valB || "";
    }

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return asc ? -1 : 1;
    if (valA > valB) return asc ? 1 : -1;
    return 0;
  });
  return sorted;
}
function setupFilters() {
  const filters = [
    { el: FILTER_ID,           field: "id" },
    { el: FILTER_NAME,         field: "name" },
    { el: FILTER_FIRSTNAME,    field: "firstname" },
    { el: FILTER_EMAIL,        field: "mail" },
    { el: FILTER_SUBSCRIPTION, field: "subscription" },
    { el: FILTER_ROLE,         field: "role" },
  ];

  filters.forEach(({ el, field }) => {
    el.style.cursor = "pointer";
    el.addEventListener("click", () => {
      if (currentSortField === field) {
        sortAsc = !sortAsc;
      } else {
        currentSortField = field;
        sortAsc = true;
      }
      renderList(currentSortField, sortAsc);
    });
  });
}
// ///////////////////// LIST DISPLAY /////////////////////////////////////
function clearList() {
  return new Promise((resolve) => {
    const entries = Array.from(
      USER_LIST_CONTAINER.querySelectorAll(".entryBlock")
    );
    entries.forEach((entry) => {
      if (
        entry.classList.contains("entryFilters") ||
        entry.id === "userEntryTemplate"
      )
        return;
      entry.style.opacity = "0";
    });
    // Suppression au bout de 300ms et résolution de la promesse
    setTimeout(() => {
      entries.forEach((entry) => {
        if (
          !entry.classList.contains("entryFilters") &&
          entry.id !== "userEntryTemplate"
        ) {
          entry.remove();
        }
      });
      resolve(); // FIN de la promesse, liste vidée
    }, 300);
  });
}
const listSpeed = 50;
async function renderList(sortField, asc) {
  await clearList();
  currentSortField = sortField;
  sortAsc = asc;
  const sortedUsers = sortUsers(userData, sortField, asc);
  for (let i = 0; i < sortedUsers.length; i++) {
    const user = sortedUsers[i];
    const entry = createUserEntry(user);
    entry.style.opacity = "0";
    USER_LIST_CONTAINER.appendChild(entry);
    entry.offsetHeight; 
    entry.style.opacity = "1";
    await new Promise((resolve) => setTimeout(resolve, listSpeed));
  }
}
function loadUsers() {
  fetch("controller/controller.php?action=admin_users&sub=list")
    .then((res) => res.json())
    .then((json) => {
      if (json.success) {
        userData = json.data;
        renderList(currentSortField, sortAsc);
      } else {
        alert("Erreur chargement utilisateurs : " + json.message);
      }
    })
    .catch(() => alert("Erreur réseau lors du chargement des utilisateurs"));
}
// ///////////////////// LIST GENERATION /////////////////////////////////////
function toggleEntryEdition(entry) {
  const iconSettings = entry.querySelector("#btnEntrySettingsIcon");
  const form = entry.querySelector("#formUpdateUser");
  const btnSave = entry.querySelector("#btnSaveUser");
  const inputs = form.querySelectorAll("input");

  const isOpen = entry.classList.toggle("active");

  if (isOpen) {
    iconSettings.classList.add("active");

    // Remplir les champs
    form.inputUpdateName.value =
      entry.querySelector("#userInfoName").textContent;
    form.inputUpdateFirstName.value =
      entry.querySelector("#userInfoFirstname").textContent;
    form.inputUpdateMail.value =
      entry.querySelector("#userInfoMail").textContent;
    form.inputUpdateIsAdmin.checked =
      entry.querySelector("#userInfoIsAdmin").textContent.toLowerCase() ===
      "admin";
    // Stocker les valeurs initiales
    entry._initialValues = {
      name: form.inputUpdateName.value,
      firstname: form.inputUpdateFirstName.value,
      mail: form.inputUpdateMail.value,
      isAdmin: form.inputUpdateIsAdmin.checked,
    };
    // Fonction de vérification des changements
    function checkForChanges() {
      const name = form.inputUpdateName.value.trim();
      const firstname = form.inputUpdateFirstName.value.trim();
      const mail = form.inputUpdateMail.value.trim();
      const isAdmin = form.inputUpdateIsAdmin.checked;
      const hasChanged =
        name !== entry._initialValues.name ||
        firstname !== entry._initialValues.firstname ||
        mail !== entry._initialValues.mail ||
        isAdmin !== entry._initialValues.isAdmin;
      const isValid =
        name.length >= 2 &&
        firstname.length >= 2 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
      const shouldEnableSave = hasChanged && isValid;
      btnSave.classList.toggle("btnOn", shouldEnableSave);
      btnSave.classList.toggle("btnOff", !shouldEnableSave);
    }
    inputs.forEach((input) => {
      input.addEventListener("input", checkForChanges);
    });
    // Vérification initiale (au cas où un champ serait pré-rempli différemment)
    checkForChanges();
  } else {
    iconSettings.classList.remove("active");
    inputs.forEach((input) => {
      input.removeEventListener("input", checkForChanges);
    });
    btnSave.classList.remove("btnOn");
    btnSave.classList.add("btnOff");
  }
}
function showEntryMessage(entry, messageBoxId) {
  const boxUpdate = entry.querySelector("#entryBtnBoxContentUpdate");
  const boxMessage = entry.querySelector(`#${messageBoxId}`);

  if (!boxUpdate || !boxMessage) return;

  boxUpdate.style.display = "none";
  boxMessage.style.display = "flex";

  setTimeout(() => {
    boxMessage.style.display = "none";
    boxUpdate.style.display = "flex";
  }, 2000);
}
function createUserEntry(user) {
  const entry = USER_TEMPLATE.cloneNode(true);
  entry.id = "";
  entry.style.display = "flex";
  entry.querySelector("#userInfoID").textContent = user.id;
  entry.querySelector("#userInfoName").textContent = user.name;
  entry.querySelector("#userInfoFirstname").textContent = user.firstname;
  entry.querySelector("#userInfoMail").textContent = user.mail;
  entry.querySelector("#userInfoSubscription").textContent =
    user.subscription || "";
  entry.querySelector("#userInfoRole").textContent = user.role || "user";
  const form = entry.querySelector("#formUpdateUser");
  form.querySelector("#inputUpdateName").value = user.name;
  form.querySelector("#inputUpdateFirstName").value = user.firstname;
  form.querySelector("#inputUpdateMail").value = user.mail;
  form.querySelector("#inputUpdateRole").value = user.role || "user";
  const btnSettings = entry.querySelector("#btnUserEntrySettings");
  btnSettings.addEventListener("click", () => toggleEntryEdition(entry));
  const btnSave = entry.querySelector("#btnSaveUser");
  const btnDelete = entry.querySelector("#btnDeleteUser");
  const boxUpdate = entry.querySelector("#boxUpdateUser");
  const contentUpdate = entry.querySelector("#entryBtnBoxContentUpdate");
  const contentComplete = entry.querySelector(
    "#entryBtnBoxContentUpdateComplete"
  );
  const contentError = entry.querySelector("#entryBtnBoxContentUpdateError");
  const contentDelete = entry.querySelector("#entryBtnBoxContentDelete");
  const inputName = form.querySelector("#inputUpdateName");
  const inputFirstName = form.querySelector("#inputUpdateFirstName");
  const inputMail = form.querySelector("#inputUpdateMail");
  const initialValues = {
    name: inputName.value.trim(),
    firstname: inputFirstName.value.trim(),
    mail: inputMail.value.trim(),
  };
  function validateInputs() {
    const name = inputName.value.trim();
    const firstname = inputFirstName.value.trim();
    const mail = inputMail.value.trim();
    const nameValid = name.length >= 2;
    const firstNameValid = firstname.length >= 2;
    const mailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
    // Active le bouton uniquement si valide ET modifié
    const isModified =
      name !== initialValues.name ||
      firstname !== initialValues.firstname ||
      mail !== initialValues.mail;

    if (nameValid && firstNameValid && mailValid && isModified) {
      btnSave.classList.remove("btnOff");
    } else {
      btnSave.classList.add("btnOff");
    }
  }
  inputName.addEventListener("input", validateInputs);
  inputFirstName.addEventListener("input", validateInputs);
  inputMail.addEventListener("input", validateInputs);
  btnSave.classList.add("btnOff");
  if (btnSettings) {
    btnSettings.addEventListener("click", () => {
      const isAlreadyOpen = entry.classList.contains("entryUserOpen");
      const allEntries = USER_LIST_CONTAINER.querySelectorAll(".entryBlock");
      allEntries.forEach((e) => {
        if (e !== entry) e.classList.remove("entryUserOpen");
      });
      entry.classList.toggle("entryUserOpen", !isAlreadyOpen);
    });
  }
  function resetMessages() {
    contentUpdate.style.display = "";
    contentComplete.style.display = "none";
    contentError.style.display = "none";
    contentDelete.style.display = "none";
  }
  btnSave.addEventListener("click", () => {
    resetMessages();
    const updatedUser = {
      id: user.id,
      name: form.querySelector("#inputUpdateName").value.trim(),
      firstname: form.querySelector("#inputUpdateFirstName").value.trim(),
      mail: form.querySelector("#inputUpdateMail").value.trim(),
      role: form.querySelector("#inputUpdateRole").value,
    };
    btnSave.classList.add("btnOff");
    fetch("controller/controller.php?action=admin_users&sub=update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          // Met à jour les données locales
          user.name = updatedUser.name;
          user.firstname = updatedUser.firstname;
          user.mail = updatedUser.mail;
          user.isAdmin = updatedUser.isAdmin;
          // Mise à jour visuelle
          entry.querySelector("#userInfoName").textContent = user.name;
          entry.querySelector("#userInfoFirstname").textContent =
            user.firstname;
          entry.querySelector("#userInfoMail").textContent = user.mail;
          entry.querySelector("#userInfoRole").textContent = user.role;
          // Affiche le message temporaire
          showEntryMessage(entry, "entryBtnBoxContentUpdateComplete");
          btnSave.classList.add("btnOff");
        } else {
          // Message d’erreur temporaire
          showEntryMessage(entry, "entryBtnBoxContentUpdateError");
          btnSave.classList.remove("btnOff");
        }
      })
      .catch(() => {
        // Message d’erreur temporaire
        showEntryMessage(entry, "entryBtnBoxContentUpdateError");
        btnSave.classList.remove("btnOff");
      });
  });
  btnDelete.addEventListener("click", () => {
    resetMessages();
    contentUpdate.style.display = "none";
    contentDelete.style.display = "flex";
  });
  const btnDeleteDeny = entry.querySelector("#btnDeleteEntryDeny");
  const btnDeleteValidate = entry.querySelector("#btnDeleteEntryValidation");
  btnDeleteDeny.addEventListener("click", () => {
    resetMessages();
    contentUpdate.style.display = "flex"; //restaure proprement
    contentDelete.style.display = "none";
  });
  btnDeleteValidate.addEventListener("click", () => {
    btnDelete.classList.add("btnOff");
    btnSave.classList.add("btnOff");
    fetch("controller/controller.php?action=admin_users&sub=delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          // Message temporaire de suppression avant disparition
          showEntryMessage(entry, "entryBtnBoxContentDelete");
          entry.style.opacity = "0";

          setTimeout(() => {
            entry.remove();
            usersData = usersData.filter((u) => u.id !== user.id);
          }, 300);
        } else {
          resetMessages();
          alert("Erreur lors de la suppression");
        }
      })
      .catch(() => {
        resetMessages();
        alert("Erreur lors de la suppression");
      });
  });
  return entry;
}
// ///////////////////// SEARCH USERS /////////////////////////////////////
const formSearchUser = document.getElementById("formSearchUser");
const ENTRY_BTN_BOX_SEARCH = document.getElementById("entryBtnBoxSearchUser");
const ENTRY_BTN_BOX_SEARCH_COMPLETE = document.getElementById(
  "entryBtnBoxSearchUserComplete"
);
const ENTRY_BTN_BOX_SEARCH_NO_RESULT = document.getElementById(
  "entryBtnBoxSearchUserNoResult"
);
const ENTRY_BTN_BOX_SEARCH_ERROR = document.getElementById(
  "entryBtnBoxSearchUserError"
);
function getSearchFilters() {
  return {
  idFrom:       document.getElementById('inputSearchUserIdA').value.trim(),
  idTo:         document.getElementById('inputSearchUserIdB').value.trim(),
  name:         document.getElementById('inputSearchUserName').value.trim(),
  firstname:    document.getElementById('inputSearchUserFirstname').value.trim(),
  mail:         document.getElementById('inputSearchUserMail').value.trim(),
  subscription: document.getElementById('inputSearchUserSubscription').value,
  role:         document.getElementById('inputSearchRole').value,
  newsletter:   document.getElementById('inputSearchNewsletter').checked ? 1 : '',
  };
}
function showSearchMessage(type) {
  ENTRY_BTN_BOX_SEARCH.style.display = "none";
  ENTRY_BTN_BOX_SEARCH_COMPLETE.style.display = "none";
  ENTRY_BTN_BOX_SEARCH_NO_RESULT.style.display = "none";
  ENTRY_BTN_BOX_SEARCH_ERROR.style.display = "none";

  let boxToShow;
  switch (type) {
    case "success":
      boxToShow = ENTRY_BTN_BOX_SEARCH_COMPLETE;
      break;
    case "noresult":
      boxToShow = ENTRY_BTN_BOX_SEARCH_NO_RESULT;
      break;
    case "error":
      boxToShow = ENTRY_BTN_BOX_SEARCH_ERROR;
      break;
  }

  if (boxToShow) {
    boxToShow.style.display = "flex";
    setTimeout(() => {
      boxToShow.style.display = "none";
      ENTRY_BTN_BOX_SEARCH.style.display = "flex";
    }, 2000);
  }
}
async function handleUserSearch() {
  const filters = getSearchFilters();
console.log("Filtres envoyés :", filters);
  try {
    const response = await fetch("controller/controller.php?action=admin_users&sub=search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) throw new Error("Réponse réseau incorrecte");

    const data = await response.json();
    console.log("Résultat du fetch :", data);

    if (data.success) {
      if (data.data && data.data.length > 0) {
        userData = data.data; // ✅ mise à jour
        showSearchMessage("success");
        renderList(currentSortField, sortAsc);
      } else {
        showSearchMessage("noresult");
      }
    } else {
      showSearchMessage("error");
    }
  } catch (error) {
    // console.error("Erreur fetch ou JSON :", error);
    showSearchMessage("error");
  }
}
document.getElementById("btnUsersSearch").addEventListener("click", handleUserSearch);
// ///////////////////// USERLIST UPLOAD /////////////////////////////////////
const BTN_UPLOADUSERLIST = document.getElementById("btnUploadUserList");
const INPUT_UPLOAD_CSV = document.getElementById("inputUploadUserCSV");
function showUploadMessage(messageBoxId) {
  const boxDefault = document.getElementById("entryBtnBoxUploadUserList");
  const boxMessage = document.getElementById(messageBoxId);

  if (!boxDefault || !boxMessage) return;

  boxDefault.style.display = "none";
  boxMessage.style.display = "flex";

  setTimeout(() => {
    boxMessage.style.display = "none";
    boxDefault.style.display = "flex";
  }, 2000);
}
BTN_UPLOADUSERLIST.addEventListener("click", () => {
  INPUT_UPLOAD_CSV.click();
});
INPUT_UPLOAD_CSV.addEventListener("change", () => {
  const file = INPUT_UPLOAD_CSV.files[0];
  if (!file) return;
  if (!file.name.toLowerCase().endsWith(".csv")) {
    showUploadMessage("entryBtnBoxUploadUserFormatError");
    return;
  }
  const formData = new FormData();
  formData.append("csvFile", file);

  fetch("controller/upload_users.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.code === "success" || json.code === "none") {
        showUploadMessage("entryBtnBoxUploadUserListComplete");
        // Forcer le tri et rechargement après upload
        currentSortField = "id";
        sortAsc = true;
        loadUsers();
      } else if (json.code === "format") {
        showUploadMessage("entryBtnBoxUploadUserFormatError");
      } else {
        showUploadMessage("entryBtnBoxUploadUserError");
      }
    })
    .catch(() => {
      showUploadMessage("entryBtnBoxUploadUserError");
    });
});
// ///////////////////// INIT /////////////////////////////////////
function initUsersManagement() {
  setupFilters();
  loadUsers();
}

// ////////////////////////////////////////////////////////////////////////////////////////////////
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

// Calcule le chemin de la miniature _Thumb correspondant à une image
function _getThumbPath(filePath) {
  const lastDot = filePath.lastIndexOf('.');
  if (lastDot === -1) return filePath;
  return filePath.slice(0, lastDot) + '_Thumb' + filePath.slice(lastDot);
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
  const btnSync       = document.getElementById('btnSyncMedias');
  const msgSync       = document.getElementById('msgUploadMedia');
  const btnYoutube    = document.getElementById('btnOpenYoutube');
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

  // ── Synchroniser ──────────────────────────────────────────────────────────
  btnSync.addEventListener('click', async () => {
    const isEn = document.documentElement.lang === 'en';
    btnSync.classList.replace('btnOn', 'btnOff');
    try {
      const res  = await fetch('controller/controller.php?action=admin_medias&sub=import_all', { method: 'POST' });
      const json = await res.json();
      if (json.success && json.imported > 0) {
        _showTagMsg(msgSync, isEn ? `${json.imported} new image(s).` : `${json.imported} nouvelle(s) image(s).`, false);
      }
      await _syncAndLoad(true);
    } catch (_) { _showTagMsg(msgSync, 'Erreur réseau.', true); }
    finally { btnSync.classList.replace('btnOff', 'btnOn'); }
  });

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
    // Le bouton est toujours actif dès qu'un média est sélectionné
    const ok = _selectedMediaIds.size > 0;
    btnSave.classList.toggle('btnOn',  ok);
    btnSave.classList.toggle('btnOff', !ok);
  }
  [inputDescFr, inputDescEn, inputAlt, inputYear].forEach(el => el.addEventListener('input', _checkMediaForm));
  inputGallery.addEventListener('change', _checkMediaForm);

  // ── Right panel ───────────────────────────────────────────────────────────
  function _updateRightPanel() {
    const count = _selectedMediaIds.size;
    const isEn  = document.documentElement.lang === 'en';

    selInfo.textContent = count === 0 ? ''
      : count === 1 ? (isEn ? '1 selected' : '1 sélectionné')
      : (isEn ? `${count} selected` : `${count} sélectionnés`);

    if (count === 0) {
      editorTitle.textContent   = isEn ? 'Select a media' : 'Sélectionner un média';
      editorForm.style.display  = 'none';
      deleteGrp.style.display   = 'none';
      previewWrap.style.display = 'none';
      if (emptyActions) emptyActions.style.display = '';
      return;
    }

    if (emptyActions) emptyActions.style.display = 'none';
    editorForm.style.display = 'flex';

    if (count === 1) {
      const media = _mediasData.find(m => +m.id === [..._selectedMediaIds][0]);
      editorTitle.textContent = isEn ? 'Edit media' : 'Modifier le média';
      if (media?.type === 'image') {
        const thumb = _getThumbPath(media.file_path);
        previewImg.src     = thumb;
        previewImg.onerror = () => { previewImg.src = media.file_path; };
        previewWrap.style.display = 'block';
      } else {
        previewWrap.style.display = 'none';
      }
      inputDescFr.value    = media?.description_fr || '';
      inputDescEn.value    = media?.description_en || '';
      inputAlt.value       = media?.alt_text        || '';
      inputYear.value      = media?.year            || '';
      inputGallery.checked = !!+media?.show_in_gallery;
      altGroup.style.display   = '';
      catTagGrp.style.display  = '';
      techTagGrp.style.display = '';
      deleteGrp.style.display  = 'flex';
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
      altGroup.style.display    = 'none';
      deleteGrp.style.display   = 'flex'; // delete visible aussi en multi-sélection
      catTagGrp.style.display   = '';
      techTagGrp.style.display  = '';
      previewWrap.style.display = 'none';
      // Dropdowns vides en multi : les tags sélectionnés remplaceront ceux de tous les médias
      _mediaCatTags = new Set(); _mediaTechTags = new Set();
      _renderMediaTagSelector(catTagSel,  catTagCount,  _allCatTags,  _mediaCatTags,  isEn);
      _renderMediaTagSelector(techTagSel, techTagCount, _allTechTags, _mediaTechTags, isEn);
    }
    _checkMediaForm();
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
          if (inputDescFr.value.trim()) payload.description_fr = inputDescFr.value.trim();
          if (inputDescEn.value.trim()) payload.description_en = inputDescEn.value.trim();
          if (inputYear.value)          payload.year = +inputYear.value;
          payload.show_in_gallery = inputGallery.checked ? 1 : 0;
          // En multi : les tags sélectionnés remplacent ceux de chaque média
          const combined = [..._mediaCatTags, ..._mediaTechTags];
          if (combined.length > 0) payload.tags = combined;
        } else {
          payload.description_fr  = inputDescFr.value.trim();
          payload.description_en  = inputDescEn.value.trim();
          payload.alt_text        = inputAlt.value.trim();
          payload.year            = inputYear.value ? +inputYear.value : null;
          payload.show_in_gallery = inputGallery.checked ? 1 : 0;
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

  _syncAndLoad();
}

// Synchronise depuis Galleries puis charge la liste
async function _syncAndLoad(skipImport = false) {
  if (!skipImport) {
    try {
      await fetch('controller/controller.php?action=admin_medias&sub=import_all', { method: 'POST' });
    } catch (_) {}
  }
  try {
    const res  = await fetch('controller/controller.php?action=admin_medias&sub=list&per_page=1000');
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
  medias.forEach(media => {
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
    } else {
      const badge = document.createElement('span');
      badge.className = 'mediaTypeBadge'; badge.textContent = media.type.toUpperCase();
      thumb.appendChild(badge);
    }

    thumb.addEventListener('click', e => window._mediaSelectHandler?.(media.id, e.ctrlKey || e.metaKey));
    grid.appendChild(thumb);
  });
}



// Re-rendre les listes sans refetch quand la langue change
document.addEventListener('languagechange', () => {
  if (_tagsInited) {
    const c = document.getElementById('tagsListContainer');
    if (c) _loadTagList(c, true);
  }
  if (_expInited) _loadExpList(true);
});