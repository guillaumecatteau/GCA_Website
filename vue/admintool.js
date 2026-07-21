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
  const iconAction = document.getElementById('iconCreateTag');
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
    iconAction.className  = 'icon iconAdd';
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
    iconAction.className  = 'icon iconEdit';
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

async function _loadTagList(container) {
  if (!container) return;
  try {
    const res  = await fetch('controller/controller.php?action=admin_tags&sub=list');
    const json = await res.json();
    if (!json.success) return;
    _tagsData = json.tags;
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
              const iconAction= document.getElementById('iconCreateTag');
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
              if (iconAction) iconAction.className  = 'icon iconAdd';
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