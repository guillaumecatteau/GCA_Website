function setAutofocus(formElement) {
  const firstInput = formElement.querySelector("input, textarea, select");
  if (firstInput) {
    firstInput.focus();
  }
}
const NAME_REGEX = /^[a-zA-Z-\u00C0-\u00FF]{2,}$/;
function nameCheck(input, iconValid, iconError, errorText, callback) {
  input.addEventListener("input", function () {
    const isValid = NAME_REGEX.test(input.value);

    iconValid.style.display = isValid ? "block" : "none";
    iconError.style.display = isValid ? "none" : "block";
    errorText.style.display = isValid ? "none" : "block";

    callback(isValid);
  });
}
function firstnameCheck(input, iconValid, iconError, errorText, callback) {
  input.addEventListener("input", function () {
    const isValid = NAME_REGEX.test(input.value);

    iconValid.style.display = isValid ? "block" : "none";
    iconError.style.display = isValid ? "none" : "block";
    errorText.style.display = isValid ? "none" : "block";

    callback(isValid);
  });
}
function mailCheck(input, iconValid, iconError, errorText, callback) {
  input.addEventListener("input", function () {
    const MAIL_REGEX = /^[a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let mail = input.value;
    const isValid = MAIL_REGEX.test(mail);

    iconValid.style.display = isValid ? "block" : "none";
    iconError.style.display = isValid ? "none" : "block";
    errorText.style.display = isValid ? "none" : "block";

    callback(isValid);
  });
}
function passwordCheck(input, iconValid, iconError, errorText, callback) {
  input.addEventListener("input", function () {
    let password = input.value;

    let passLength = password.length >= 6;
    let passDigit = /[0-9]/.test(password);
    let passUppercase = /[A-Z]/.test(password);
    const isValid = passLength && passDigit && passUppercase;

    iconValid.style.display = isValid ? "block" : "none";
    iconError.style.display = isValid ? "none" : "block";
    errorText.style.display = isValid ? "none" : "block";

    callback(isValid);
  });
}
// Longueur minimale générique (sujet/message du formulaire de contact)
function minLengthCheck(input, minLength, iconValid, iconError, errorText, callback) {
  input.addEventListener("input", function () {
    const isValid = input.value.trim().length >= minLength;

    iconValid.style.display = isValid ? "block" : "none";
    iconError.style.display = isValid ? "none" : "block";
    errorText.style.display = isValid ? "none" : "block";

    callback(isValid);
  });
}
function togglePasswordVisibility(eyeButtonElement) {
  const formGroup = eyeButtonElement.closest(".formGroup");

  const passwordInput = formGroup.querySelector(
    'input[type="password"], input[type="text"]'
  );
  const eyeClosed = eyeButtonElement.querySelector(".iconEyeClosed");
  const eyeOpen = eyeButtonElement.querySelector(".iconEye");

  if (!passwordInput || !eyeClosed || !eyeOpen) return;

  const isVisible = passwordInput.type === "text";
  passwordInput.type = isVisible ? "password" : "text";
  eyeClosed.style.display = isVisible ? "block" : "none";
  eyeOpen.style.display = isVisible ? "none" : "block";
}
// ///////////////// CONNEXION //////////////////////
const FORM_CONNEXION = document.getElementById("formConnexion");
const INPUT_MAIL_CONNEXION = document.getElementById("inputMailConnexion");
const ICONVALID_MAIL_CONNEXION = document.getElementById("mailValidConnexion");
const ICONERROR_MAIL_CONNEXION = document.getElementById(
  "mailProhibedConnexion"
);
const ERRORTEXT_MAIL_CONNEXION = document.getElementById(
  "mailErrorTextConnexion"
);
const INPUT_PASSWORD_CONNEXION = document.getElementById(
  "inputPasswordConnexion"
);
const ICONVALID_PASSWORD_CONNEXION = document.getElementById(
  "passwordValidConnexion"
);
const ICONERROR_PASSWORD_CONNEXION = document.getElementById(
  "passwordProhibedConnexion"
);
const ERRORTEXT_PASSWORD_CONNEXION = document.getElementById(
  "passwordErrorTextConnexion"
);
const EYEBTN_PASSWORD_CONNEXION = document.getElementById(
  "passwordEyeConnexion"
);
const BTN_LOGIN_CONNEXION = document.getElementById("btnLoginConnexion");
const BTN_REGISTER_CONNEXION = document.getElementById("btnRegisterConnexion");
const BTN_FORGOTTENPASSWORD_CONNEXION = document.getElementById(
  "btnForgottenConnexion"
);
const REMEMBER_CHECKBOX_CONNEXION = document.getElementById(
  "rememberMeConnexion"
);
const MESSAGE_LOGIN_SUCCES = document.getElementById("messageLoginSuccess");
const MESSAGE_LOGIN_ERROR = document.getElementById("messageLoginError");
const MESSAGE_LOGIN_TECHNICALERROR = document.getElementById(
  "messageLoginTechnicalError"
);
// ///////////////// EDIT USER INFOS //////////////////////
const BTN_EDITEUSERINFOS = document.getElementById("btnEditeUserInfos");
function connexionCheck() {
  let validMail = false;
  let validPassword = false;

  function updateButtonState() {
    if (validMail && validPassword) {
      BTN_LOGIN_CONNEXION.classList.remove("btnOff");
    } else {
      BTN_LOGIN_CONNEXION.classList.add("btnOff");
    }
  }

  BTN_LOGIN_CONNEXION.addEventListener("click", (e) => {
    e.preventDefault();
    if (!BTN_LOGIN_CONNEXION.classList.contains("btnOff")) {
      loginFetch();
    }
  });

  mailCheck(
    INPUT_MAIL_CONNEXION,
    ICONVALID_MAIL_CONNEXION,
    ICONERROR_MAIL_CONNEXION,
    ERRORTEXT_MAIL_CONNEXION,
    (isValid) => {
      validMail = isValid;
      updateButtonState();
    }
  );

  passwordCheck(
    INPUT_PASSWORD_CONNEXION,
    ICONVALID_PASSWORD_CONNEXION,
    ICONERROR_PASSWORD_CONNEXION,
    ERRORTEXT_PASSWORD_CONNEXION,
    (isValid) => {
      validPassword = isValid;
      updateButtonState();
    }
  );

  EYEBTN_PASSWORD_CONNEXION.addEventListener("click", function (e) {
    e.preventDefault();
    togglePasswordVisibility(EYEBTN_PASSWORD_CONNEXION);
  });
}

// ///////////////// MOT DE PASSE OUBLIÉ //////////////////////
const FORM_FORGOT_PASSWORD = document.getElementById("formForgotPassword");
const INPUT_MAIL_FORGOTPASSWORD = document.getElementById("inputMailForgotPassword");
const BTN_SEND_FORGOTPASSWORD = document.getElementById("btnSendForgotPassword");
const BTN_CANCEL_FORGOTPASSWORD = document.getElementById("btnCancelForgotPassword");
const MSG_FORGOTPASSWORD = document.getElementById("msgForgotPassword");

function forgotPasswordCheck() {
  INPUT_MAIL_FORGOTPASSWORD.addEventListener("input", () => {
    const valid = /^[a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(INPUT_MAIL_FORGOTPASSWORD.value.trim());
    BTN_SEND_FORGOTPASSWORD.classList.toggle("btnOff", !valid);
  });

  BTN_FORGOTTENPASSWORD_CONNEXION.addEventListener("click", () => {
    FORM_CONNEXION.style.display = "none";
    FORM_FORGOT_PASSWORD.style.display = "flex";
  });

  BTN_CANCEL_FORGOTPASSWORD.addEventListener("click", (e) => {
    e.preventDefault();
    FORM_FORGOT_PASSWORD.style.display = "none";
    FORM_CONNEXION.style.display = "flex";
    MSG_FORGOTPASSWORD.style.display = "none";
  });

  BTN_SEND_FORGOTPASSWORD.addEventListener("click", async (e) => {
    e.preventDefault();
    if (BTN_SEND_FORGOTPASSWORD.classList.contains("btnOff")) return;

    const formData = new FormData();
    formData.append("mail", INPUT_MAIL_FORGOTPASSWORD.value.trim());

    try {
      const response = await fetch("controller/forgot_password.php", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      MSG_FORGOTPASSWORD.textContent = result.message;
      MSG_FORGOTPASSWORD.style.display = "block";
    } catch (error) {
      MSG_FORGOTPASSWORD.textContent = "Erreur technique ! Réessayez.";
      MSG_FORGOTPASSWORD.style.display = "block";
    }
  });
}
async function loginFetch() {
  const formData = new FormData();
  formData.append("mail", INPUT_MAIL_CONNEXION.value.trim());
  formData.append("password", INPUT_PASSWORD_CONNEXION.value.trim());

  try {
    const response = await fetch("controller/login.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      switch (result.code) {
        case "LOGIN_ADMIN":
          turnOnLine();
          handleAdminLoginSuccess(result.firstname, result.name);
          break;
        case "LOGIN_SUCCESS":
          turnOnLine();
          handleLoginSuccess(result.firstname, result.name);
          break;
        default:
          console.warn("Code de succès inattendu :", result.code);
      }
    } else {
      switch (result.code) {
        case "INVALID_CREDENTIALS":
          handleLoginError();
          break;
        default:
          handleLoginTechnicalError();
      }
    }
  } catch (error) {
    handleLoginTechnicalError();
  }
}
function handleLoginSuccess(firstname, name) {
  NAME_USERLOG.forEach((element) => {
    element.innerText = firstname + " " + name;
  });
  BTN_LOGIN_CONNEXION.classList.add("btnOff");
  BTN_LOGIN_CONNEXION.removeEventListener("click", loginFetch);
  MESSAGE_LOGIN_SUCCES.style.display = "flex";
  displayUserLog();
  activateUserProfile()
  titleDisplay(MESSAGE_LOGIN_SUCCES);
  setTimeout(() => {
    titleHide(MESSAGE_LOGIN_SUCCES);
    accessHome();
  }, 3000);
  setTimeout(() => {
    MESSAGE_LOGIN_SUCCES.style.display = "none";
  }, 5000);
}
function handleAdminLoginSuccess(firstname, name) {
  NAME_ADMINLOG.forEach((element) => {
    element.innerText = firstname + " " + name;
  });
  BTN_LOGIN_CONNEXION.classList.add("btnOff");
  BTN_LOGIN_CONNEXION.removeEventListener("click", loginFetch);
  MESSAGE_LOGIN_SUCCES.style.display = "flex";
  displayAdminLog();
  activateAdminTool()
  titleDisplay(MESSAGE_LOGIN_SUCCES);
  setTimeout(() => {
    titleHide(MESSAGE_LOGIN_SUCCES);
    accessHome();
  }, 3000);
  setTimeout(() => {
    MESSAGE_LOGIN_SUCCES.style.display = "none";
  }, 5000);
}
function handleLoginError() {
  BTN_LOGIN_CONNEXION.classList.add("btnOff");
  MESSAGE_LOGIN_ERROR.style.display = "flex";
  titleDisplay(MESSAGE_LOGIN_ERROR);
  setTimeout(() => {
    titleHide(MESSAGE_LOGIN_ERROR);
  }, 3000);
  setTimeout(() => {
    BTN_LOGIN_CONNEXION.classList.remove("btnOff");
  }, 3500);
  setTimeout(() => {
    MESSAGE_LOGIN_ERROR.style.display = "none";
  }, 4500);
}
function handleLoginTechnicalError() {
  BTN_LOGIN_CONNEXION.classList.add("btnOff");
  MESSAGE_LOGIN_ERROR.style.display = "flex";
  titleDisplay(MESSAGE_LOGIN_TECHNICALERROR);
  setTimeout(() => {
    titleHide(MESSAGE_LOGIN_TECHNICALERROR);
  }, 3000);
  setTimeout(() => {
    BTN_LOGIN_CONNEXION.classList.remove("btnOff");
  }, 4000);
  setTimeout(() => {
    MESSAGE_LOGIN_TECHNICALERROR.style.display = "none";
  }, 5000);
}
function resetLoginForm() {
  INPUT_MAIL_CONNEXION.value = "";
  INPUT_PASSWORD_CONNEXION.value = "";
  REMEMBER_CHECKBOX_CONNEXION.checked = false;
}
// ///////////////// LOGOUT //////////////////////
async function logoutFetch() {
  try {
    const response = await fetch("controller/logout.php", {
      method: "POST",
    });
    const result = await response.json();
    if (result.success) {
      deactivateUserProfile()
      deactivateAdminTool()
      hideAdminLog();
      hideUserLog();
      turnOffLine();
      accessHome()
    } else {
      console.error("Erreur lors de la déconnexion :", result.message);
    }
  } catch (error) {
    console.error("Erreur réseau lors de la déconnexion :", error);
  }
}
// ///////////////// REGISTER //////////////////////
const FORM_REGISTER = document.getElementById("formRegister");
const INPUT_NAME_REGISTER = document.getElementById("inputNameRegister");
const ICONVALID_NAME_REGISTER = document.getElementById("nameValidRegister");
const ICONERROR_NAME_REGISTER = document.getElementById("nameProhibedRegister");
const ERRORTEXT_NAME_REGISTER = document.getElementById(
  "nameErrorTextRegister"
);
const INPUT_FIRSTNAME_REGISTER = document.getElementById(
  "inputFirstnameRegister"
);
const ICONVALID_FIRSTNAME_REGISTER = document.getElementById(
  "firstnameValidRegister"
);
const ICONERROR_FIRSTNAME_REGISTER = document.getElementById(
  "firstnameProhibedRegister"
);
const ERRORTEXT_FIRSTNAME_REGISTER = document.getElementById(
  "firstnameErrorTextRegister"
);
const INPUT_MAIL_REGISTER = document.getElementById("inputMailRegister");
const ICONVALID_MAIL_REGISTER = document.getElementById("mailValidRegister");
const ICONERROR_MAIL_REGISTER = document.getElementById("mailProhibedRegister");
const ERRORTEXT_MAIL_REGISTER = document.getElementById(
  "mailErrorTextRegister"
);
const INPUT_PASSWORD_REGISTER = document.getElementById(
  "inputPasswordRegister"
);
const ICONVALID_PASSWORD_REGISTER = document.getElementById(
  "passwordValidRegister"
);
const ICONERROR_PASSWORD_REGISTER = document.getElementById(
  "passwordProhibedRegister"
);
const ERRORTEXT_PASSWORD_REGISTER = document.getElementById(
  "passwordErrorTextRegister"
);
const EYEBTN_PASSWORD_REGISTER = document.getElementById("passwordEyeRegister");
const BTN_REGISTER_REGISTER = document.getElementById("btnRegisterRegister");
const NEWSLETTER_CHECKBOX_REGISTER = document.getElementById("mailingRegister");
const MESSAGE_REGISTER_SUCCES = document.getElementById(
  "messageRegisterSucces"
);
const MESSAGE_REGISTER_ERROR = document.getElementById("messageRegisterError");
const MESSAGE_REGISTER_ERROR_MAIL = document.getElementById(
  "messageRegisterErrorMail"
);
function registerCheck() {
  let validName = false;
  let validFirstname = false;
  let validMail = false;
  let validPassword = false;

  function updateRegisterButtonState() {
    if (
      validName &&
      validFirstname &&
      validMail &&
      validPassword
    ) {
      BTN_REGISTER_REGISTER.classList.remove("btnOff");
    } else {
      BTN_REGISTER_REGISTER.classList.add("btnOff");
    }
  }

  BTN_REGISTER_REGISTER.addEventListener("click", (e) => {
    e.preventDefault();
    if (!BTN_REGISTER_REGISTER.classList.contains("btnOff")) {
      registerFetch();
    }
  });

  nameCheck(
    INPUT_NAME_REGISTER,
    ICONVALID_NAME_REGISTER,
    ICONERROR_NAME_REGISTER,
    ERRORTEXT_NAME_REGISTER,
    (isValid) => {
      validName = isValid;
      updateRegisterButtonState();
    }
  );

  firstnameCheck(
    INPUT_FIRSTNAME_REGISTER,
    ICONVALID_FIRSTNAME_REGISTER,
    ICONERROR_FIRSTNAME_REGISTER,
    ERRORTEXT_FIRSTNAME_REGISTER,
    (isValid) => {
      validFirstname = isValid;
      updateRegisterButtonState();
    }
  );

  mailCheck(
    INPUT_MAIL_REGISTER,
    ICONVALID_MAIL_REGISTER,
    ICONERROR_MAIL_REGISTER,
    ERRORTEXT_MAIL_REGISTER,
    (isValid) => {
      validMail = isValid;
      updateRegisterButtonState();
    }
  );

  passwordCheck(
    INPUT_PASSWORD_REGISTER,
    ICONVALID_PASSWORD_REGISTER,
    ICONERROR_PASSWORD_REGISTER,
    ERRORTEXT_PASSWORD_REGISTER,
    (isValid) => {
      validPassword = isValid;
      updateRegisterButtonState();
    }
  );

  EYEBTN_PASSWORD_REGISTER.addEventListener("click", function (e) {
    e.preventDefault();
    togglePasswordVisibility(EYEBTN_PASSWORD_REGISTER);
  });
}
async function registerFetch() {
  const formData = new FormData();
  formData.append("name", INPUT_NAME_REGISTER.value.trim());
  formData.append("firstname", INPUT_FIRSTNAME_REGISTER.value.trim());
  formData.append("mail", INPUT_MAIL_REGISTER.value.trim());
  formData.append("password", INPUT_PASSWORD_REGISTER.value.trim());
  formData.append(
    "newsletter",
    NEWSLETTER_CHECKBOX_REGISTER.checked ? "1" : "0"
  );

  try {
    const response = await fetch("controller/register.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      handleRegisterSuccess();
    } else if (result.code === "EMAIL_EXISTS") {
      handleRegisterMailError();
    } else {
      handleRegisterError();
    }
  } catch (error) {
    handleRegisterError();
  }
}
function handleRegisterSuccess() {
  BTN_REGISTER_REGISTER.classList.add("btnOff");
  BTN_REGISTER_REGISTER.removeEventListener("click", registerFetch);
  MESSAGE_REGISTER_SUCCES.style.display = "flex";
  titleDisplay(MESSAGE_REGISTER_SUCCES);
  setTimeout(() => {
    titleHide(MESSAGE_REGISTER_SUCCES);
    accessConnexion();
  }, 3000);
  setTimeout(() => {
    MESSAGE_REGISTER_SUCCES.style.display = "none";
  }, 5000);
}
function handleRegisterMailError() {
  BTN_REGISTER_REGISTER.classList.add("btnOff");
  MESSAGE_REGISTER_ERROR_MAIL.style.display = "flex";
  titleDisplay(MESSAGE_REGISTER_ERROR_MAIL);
  setTimeout(() => {
    titleHide(MESSAGE_REGISTER_ERROR_MAIL);
  }, 3000);
  setTimeout(() => {
    BTN_REGISTER_REGISTER.classList.remove("btnOff");
  }, 4000);
  setTimeout(() => {
    MESSAGE_REGISTER_ERROR_MAIL.style.display = "none";
  }, 5000);
}
function handleRegisterError() {
  BTN_REGISTER_REGISTER.classList.add("btnOff");
  MESSAGE_REGISTER_ERROR.style.display = "flex";
  titleDisplay(MESSAGE_REGISTER_ERROR);
  setTimeout(() => {
    titleHide(MESSAGE_REGISTER_ERROR);
  }, 3000);
  setTimeout(() => {
    BTN_REGISTER_REGISTER.classList.remove("btnOff");
  }, 4000);
  setTimeout(() => {
    MESSAGE_REGISTER_ERROR.style.display = "none";
  }, 5000);
}
function resetRegisterForm() {
  INPUT_NAME_REGISTER.value = "";
  INPUT_FIRSTNAME_REGISTER.value = "";
  INPUT_MAIL_REGISTER.value = "";
  INPUT_PASSWORD_REGISTER.value = "";
  NEWSLETTER_CHECKBOX_REGISTER.checked = false;
}

// ///////////////// CONTACT (section Contact de la home) //////////////////////
const FORM_CONTACT = document.getElementById("formContact");
const INPUT_NAME_CONTACT = document.getElementById("inputNameContact");
const ICONVALID_NAME_CONTACT = document.getElementById("nameValidContact");
const ICONERROR_NAME_CONTACT = document.getElementById("nameProhibedContact");
const ERRORTEXT_NAME_CONTACT = document.getElementById("nameErrorTextContact");
const INPUT_FIRSTNAME_CONTACT = document.getElementById("inputFirstnameContact");
const ICONVALID_FIRSTNAME_CONTACT = document.getElementById("firstnameValidContact");
const ICONERROR_FIRSTNAME_CONTACT = document.getElementById("firstnameProhibedContact");
const ERRORTEXT_FIRSTNAME_CONTACT = document.getElementById("firstnameErrorTextContact");
const INPUT_COMPANY_CONTACT = document.getElementById("inputCompanyContact");
const INPUT_MAIL_CONTACT = document.getElementById("inputMailContact");
const ICONVALID_MAIL_CONTACT = document.getElementById("mailValidContact");
const ICONERROR_MAIL_CONTACT = document.getElementById("mailProhibedContact");
const ERRORTEXT_MAIL_CONTACT = document.getElementById("mailErrorTextContact");
const INPUT_PHONE_CONTACT = document.getElementById("inputPhoneContact");
const INPUT_SUBJECT_CONTACT = document.getElementById("inputSubjectContact");
const ICONVALID_SUBJECT_CONTACT = document.getElementById("subjectValidContact");
const ICONERROR_SUBJECT_CONTACT = document.getElementById("subjectProhibedContact");
const ERRORTEXT_SUBJECT_CONTACT = document.getElementById("subjectErrorTextContact");
const INPUT_MESSAGE_CONTACT = document.getElementById("inputMessageContact");
const ICONVALID_MESSAGE_CONTACT = document.getElementById("messageValidContact");
const ICONERROR_MESSAGE_CONTACT = document.getElementById("messageProhibedContact");
const ERRORTEXT_MESSAGE_CONTACT = document.getElementById("messageErrorTextContact");
const BTN_SEND_CONTACT = document.getElementById("btnSendContact");
const MESSAGE_CONTACT_SUCCES = document.getElementById("messageContactSucces");
const MESSAGE_CONTACT_ERROR = document.getElementById("messageContactError");

// Lié une seule fois (la home peut être revisitée plusieurs fois par session SPA,
// contrairement à la page register — éviter d'empiler les listeners de soumission).
let _contactFormBound = false;
function contactCheck() {
  if (_contactFormBound) return;
  _contactFormBound = true;

  // Champs obligatoires : nom, prénom, email, sujet, message.
  // Compagnie et téléphone sont facultatifs (jamais pris en compte ici).
  let validName = false;
  let validFirstname = false;
  let validMail = false;
  let validSubject = false;
  let validMessage = false;

  function updateContactButtonState() {
    if (validName && validFirstname && validMail && validSubject && validMessage) {
      BTN_SEND_CONTACT.classList.remove("btnOff");
    } else {
      BTN_SEND_CONTACT.classList.add("btnOff");
    }
  }

  BTN_SEND_CONTACT.addEventListener("click", (e) => {
    e.preventDefault();
    if (!BTN_SEND_CONTACT.classList.contains("btnOff")) {
      contactFetch();
    }
  });

  nameCheck(
    INPUT_NAME_CONTACT,
    ICONVALID_NAME_CONTACT,
    ICONERROR_NAME_CONTACT,
    ERRORTEXT_NAME_CONTACT,
    (isValid) => { validName = isValid; updateContactButtonState(); }
  );

  firstnameCheck(
    INPUT_FIRSTNAME_CONTACT,
    ICONVALID_FIRSTNAME_CONTACT,
    ICONERROR_FIRSTNAME_CONTACT,
    ERRORTEXT_FIRSTNAME_CONTACT,
    (isValid) => { validFirstname = isValid; updateContactButtonState(); }
  );

  mailCheck(
    INPUT_MAIL_CONTACT,
    ICONVALID_MAIL_CONTACT,
    ICONERROR_MAIL_CONTACT,
    ERRORTEXT_MAIL_CONTACT,
    (isValid) => { validMail = isValid; updateContactButtonState(); }
  );

  minLengthCheck(
    INPUT_SUBJECT_CONTACT, 3,
    ICONVALID_SUBJECT_CONTACT,
    ICONERROR_SUBJECT_CONTACT,
    ERRORTEXT_SUBJECT_CONTACT,
    (isValid) => { validSubject = isValid; updateContactButtonState(); }
  );

  minLengthCheck(
    INPUT_MESSAGE_CONTACT, 10,
    ICONVALID_MESSAGE_CONTACT,
    ICONERROR_MESSAGE_CONTACT,
    ERRORTEXT_MESSAGE_CONTACT,
    (isValid) => { validMessage = isValid; updateContactButtonState(); }
  );
}
async function contactFetch() {
  const formData = new FormData();
  formData.append("name", INPUT_NAME_CONTACT.value.trim());
  formData.append("firstname", INPUT_FIRSTNAME_CONTACT.value.trim());
  formData.append("company", INPUT_COMPANY_CONTACT.value.trim());
  formData.append("mail", INPUT_MAIL_CONTACT.value.trim());
  formData.append("phone", INPUT_PHONE_CONTACT.value.trim());
  formData.append("subject", INPUT_SUBJECT_CONTACT.value.trim());
  formData.append("message", INPUT_MESSAGE_CONTACT.value.trim());

  BTN_SEND_CONTACT.classList.add("btnOff");

  try {
    const response = await fetch("controller/contact.php", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    if (result.success) {
      handleContactSuccess();
    } else {
      handleContactError();
    }
  } catch (error) {
    handleContactError();
  }
}
function handleContactSuccess() {
  resetContactForm();
  MESSAGE_CONTACT_SUCCES.style.display = "flex";
  titleDisplay(MESSAGE_CONTACT_SUCCES);
  setTimeout(() => {
    titleHide(MESSAGE_CONTACT_SUCCES);
  }, 3000);
  setTimeout(() => {
    MESSAGE_CONTACT_SUCCES.style.display = "none";
  }, 5000);
}
function handleContactError() {
  MESSAGE_CONTACT_ERROR.style.display = "flex";
  titleDisplay(MESSAGE_CONTACT_ERROR);
  setTimeout(() => {
    titleHide(MESSAGE_CONTACT_ERROR);
  }, 3000);
  setTimeout(() => {
    BTN_SEND_CONTACT.classList.remove("btnOff");
  }, 4000);
  setTimeout(() => {
    MESSAGE_CONTACT_ERROR.style.display = "none";
  }, 5000);
}
function resetContactForm() {
  INPUT_NAME_CONTACT.value = "";
  INPUT_FIRSTNAME_CONTACT.value = "";
  INPUT_COMPANY_CONTACT.value = "";
  INPUT_MAIL_CONTACT.value = "";
  INPUT_PHONE_CONTACT.value = "";
  INPUT_SUBJECT_CONTACT.value = "";
  INPUT_MESSAGE_CONTACT.value = "";
  [ICONVALID_NAME_CONTACT, ICONVALID_FIRSTNAME_CONTACT, ICONVALID_MAIL_CONTACT, ICONVALID_SUBJECT_CONTACT, ICONVALID_MESSAGE_CONTACT]
    .forEach((icon) => { icon.style.display = "none"; });
  [ICONERROR_NAME_CONTACT, ICONERROR_FIRSTNAME_CONTACT, ICONERROR_MAIL_CONTACT, ICONERROR_SUBJECT_CONTACT, ICONERROR_MESSAGE_CONTACT]
    .forEach((icon) => { icon.style.display = "none"; });
}
