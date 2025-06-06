// ////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////// ADMIN TOOL MENU ///////////////////////////////////////////////
// ////////////////////////////////////////////////////////////////////////////////////////////////
const BTN_CONTENTCREATION = document.getElementById("btnContentCreation");
const BTN_CONTENTMANAGEMENT = document.getElementById("btnContentManagement");
const BTN_IMAGESMANAGEMENT = document.getElementById("btnImagesManagement");
const BTN_USERSMANAGEMENT = document.getElementById("btnUsersManagement");
const BTN_COMMENTSMANAGEMENT = document.getElementById("btnUsersManagement");
const BTN_ANALYTICS = document.getElementById("btnAnalytics");
// ////////////////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////// USERS MANAGEMENT ///////////////////////////////////////////////
// ////////////////////////////////////////////////////////////////////////////////////////////////
const USER_LIST_CONTAINER = document.getElementById("usersListContainer");
const USER_FILTERS = document.getElementById("userEntryFilters");
const USER_TEMPLATE = document.getElementById("userEntryTemplate");
const FILTER_ID = document.getElementById("userFilterId");
const FILTER_NAME = document.getElementById("userFilterName");
const FILTER_FIRSTNAME = document.getElementById("userFilterFirstname");
const FILTER_EMAIL = document.getElementById("userFilteremail");
const FILTER_SUBSCRIPTION = document.getElementById("subscription");
const FILTER_ISADMIN = document.getElementById("userFilterIsAdmin");
// ///////////////////// ENTRIES FILTERS /////////////////////////////////////
// Variables tri
let currentSortField = "id";
let sortAsc = true;
let usersData = [];
// Fonction de tri
function sortUsers(data, field, asc) {
  const sorted = data.slice(); // clone
  sorted.sort((a, b) => {
    let valA = a[field];
    let valB = b[field];

    // Gérer les booléens
    if (field === "isAdmin") {
      valA = a[field] ? 1 : 0;
      valB = b[field] ? 1 : 0;
    }

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
// ///////////////////// LIST DISPLAY /////////////////////////////////////
// Fonction pour vider la liste avec animation
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
// Affiche la liste triée
const listSpeed = 50; // délai entre chaque entrée en ms (ajuste ici)

async function renderList(sortField, asc) {
  await clearList();
  currentSortField = sortField;
  sortAsc = asc;
  const sortedUsers = sortUsers(usersData, sortField, asc);
  for (let i = 0; i < sortedUsers.length; i++) {
    const user = sortedUsers[i];
    const entry = createUserEntry(user);
    entry.style.opacity = "0";
    USER_LIST_CONTAINER.appendChild(entry);
    entry.offsetHeight; // Forcer un reflow pour que le navigateur prenne en compte le style opacity = 0
    entry.style.opacity = "1";
    await new Promise((resolve) => setTimeout(resolve, listSpeed));
  }
}
// Charge la liste depuis l’API
function loadUsers() {
  fetch("controller/user.php")
    .then((res) => res.json())
    .then((json) => {
      if (json.success) {
        usersData = json.data;
        renderList(currentSortField, sortAsc);
      } else {
        alert("Erreur chargement utilisateurs : " + json.message);
      }
    })
    .catch(() => alert("Erreur réseau lors du chargement des utilisateurs"));
}
// Gestion des clics sur filtres pour tri
function setupFilters() {
  const filters = [
    { el: FILTER_ID, field: "id" },
    { el: FILTER_NAME, field: "name" },
    { el: FILTER_FIRSTNAME, field: "firstname" },
    { el: FILTER_EMAIL, field: "mail" },
    { el: FILTER_SUBSCRIPTION, field: "subscription" },
    { el: FILTER_ISADMIN, field: "isAdmin" },
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
// ///////////////////// LIST GENERATION /////////////////////////////////////
// Vérification des champs du formulaire et toogle du boutton "save"
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
// Affichage des messages update utilisateur
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
// Générer une entrée utilisateur dans la liste
function createUserEntry(user) {
  const entry = USER_TEMPLATE.cloneNode(true);
  entry.id = "";
  entry.style.display = "flex";
  // Mise à jour textes
  entry.querySelector("#userInfoID").textContent = user.id;
  entry.querySelector("#userInfoName").textContent = user.name;
  entry.querySelector("#userInfoFirstname").textContent = user.firstname;
  entry.querySelector("#userInfoMail").textContent = user.mail;
  entry.querySelector("#userInfoSubscription").textContent =
    user.subscription || "";
  entry.querySelector("#userInfoIsAdmin").textContent = user.isAdmin
    ? "Admin"
    : "User";
  // Inputs du formulaire
  const form = entry.querySelector("#formUpdateUser");
  form.querySelector("#inputUpdateName").value = user.name;
  form.querySelector("#inputUpdateFirstName").value = user.firstname;
  form.querySelector("#inputUpdateMail").value = user.mail;
  form.querySelector("#inputUpdateIsAdmin").checked = user.isAdmin;
  // Boutons
  const btnSettings = entry.querySelector("#btnUserEntrySettings");
  btnSettings.addEventListener("click", () => toggleEntryEdition(entry));
  const btnSave = entry.querySelector("#btnSaveUser");
  const btnDelete = entry.querySelector("#btnDeleteUser");
  // Zones d'affichage messages / confirmations
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
  // Controle des champs pour toggle save button
  // Sauvegarde des valeurs initiales pour comparaison
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
  // Écouteurs sur les inputs pour valider en temps réel
  inputName.addEventListener("input", validateInputs);
  inputFirstName.addEventListener("input", validateInputs);
  inputMail.addEventListener("input", validateInputs);
  // Au départ, bouton désactivé
  btnSave.classList.add("btnOff");
  // Comportement du bouton settings : toggle de entryUserOpen
  if (btnSettings) {
    btnSettings.addEventListener("click", () => {
      const isAlreadyOpen = entry.classList.contains("entryUserOpen");
      // Fermer toutes les autres entrées du même conteneur
      const allEntries = USER_LIST_CONTAINER.querySelectorAll(".entryBlock");
      allEntries.forEach((e) => {
        if (e !== entry) e.classList.remove("entryUserOpen");
      });
      // Toggle uniquement l’entrée cliquée
      entry.classList.toggle("entryUserOpen", !isAlreadyOpen);
    });
  }
  // Afficher / masquer messages
  function resetMessages() {
    contentUpdate.style.display = "";
    contentComplete.style.display = "none";
    contentError.style.display = "none";
    contentDelete.style.display = "none";
  }
  // Sauvegarder modifications
  btnSave.addEventListener("click", () => {
    resetMessages();
    const updatedUser = {
      action: "update",
      id: user.id,
      name: form.querySelector("#inputUpdateName").value.trim(),
      firstname: form.querySelector("#inputUpdateFirstName").value.trim(),
      mail: form.querySelector("#inputUpdateMail").value.trim(),
      isAdmin: form.querySelector("#inputUpdateIsAdmin").checked,
    };
    btnSave.classList.add("btnOff");
    fetch("controller/user.php", {
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
          entry.querySelector("#userInfoIsAdmin").textContent = user.isAdmin
            ? "Admin"
            : "User";
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
  // Suppression : confirmation puis appel API
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
    fetch("controller/user.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id: user.id }),
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
// ///////////////////// USERLIST UPLOAD /////////////////////////////////////
// Sélection des éléments
const BTN_UPLOADUSERLIST = document.getElementById("btnUploadUserList");
const INPUT_UPLOAD_CSV = document.getElementById("inputUploadUserCSV");

// Fonction pour afficher un message temporaire
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

// Événement sur le bouton pour déclencher l'input file
BTN_UPLOADUSERLIST.addEventListener("click", () => {
  INPUT_UPLOAD_CSV.click();
});

// Événement lors de la sélection d'un fichier
INPUT_UPLOAD_CSV.addEventListener("change", () => {
  const file = INPUT_UPLOAD_CSV.files[0];
  if (!file) return;

  // Vérification de l'extension du fichier
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