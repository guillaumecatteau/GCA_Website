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
function questionACheck(input, iconValid, iconError, errorText, callback) {
  input.addEventListener("input", function () {
    const isValid = NAME_REGEX.test(input.value);

    iconValid.style.display = isValid ? "block" : "none";
    iconError.style.display = isValid ? "none" : "block";
    errorText.style.display = isValid ? "none" : "block";

    callback(isValid);
  });
}

function questionBCheck(input, iconValid, iconError, errorText, callback) {
  input.addEventListener("input", function () {
    const isValid = NAME_REGEX.test(input.value);

    iconValid.style.display = isValid ? "block" : "none";
    iconError.style.display = isValid ? "none" : "block";
    errorText.style.display = isValid ? "none" : "block";

    callback(isValid);
  });
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
    console.log("Réponse login :", result);

    if (result.success) {
      switch (result.code) {
        case "LOGIN_ADMIN":
          console.log("Login admin");
          turnOnLine();
          handleAdminLoginSuccess(result.firstname, result.name);
          break;
        case "LOGIN_SUCCESS":
          console.log("Login user");
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
      console.log("Deconnexion reussie");
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
const INPUT_QUESTIONA_REGISTER = document.getElementById(
  "inputQuestionARegister"
);
const ICONVALID_QUESTIONA_REGISTER = document.getElementById(
  "questionAValidRegister"
);
const ICONERROR_QUESTIONA_REGISTER = document.getElementById(
  "questionAProhibedRegister"
);
const ERRORTEXT_QUESTIONA_REGISTER = document.getElementById(
  "questionAErrorTextRegister"
);
const INPUT_QUESTIONB_REGISTER = document.getElementById(
  "inputQuestionBRegister"
);
const ICONVALID_QUESTIONB_REGISTER = document.getElementById(
  "questionBValidRegister"
);
const ICONERROR_QUESTIONB_REGISTER = document.getElementById(
  "questionBProhibedRegister"
);
const ERRORTEXT_QUESTIONB_REGISTER = document.getElementById(
  "questionBErrorTextRegister"
);
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
  let validQuestionA = false;
  let validQuestionB = false;

  function updateRegisterButtonState() {
    if (
      validName &&
      validFirstname &&
      validMail &&
      validPassword &&
      validQuestionA &&
      validQuestionB
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

  questionACheck(
    INPUT_QUESTIONA_REGISTER,
    ICONVALID_QUESTIONA_REGISTER,
    ICONERROR_QUESTIONA_REGISTER,
    ERRORTEXT_QUESTIONA_REGISTER,
    (isValid) => {
      validQuestionA = isValid;
      updateRegisterButtonState();
    }
  );

  questionBCheck(
    INPUT_QUESTIONB_REGISTER,
    ICONVALID_QUESTIONB_REGISTER,
    ICONERROR_QUESTIONB_REGISTER,
    ERRORTEXT_QUESTIONB_REGISTER,
    (isValid) => {
      validQuestionB = isValid;
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
  formData.append("questionA", INPUT_QUESTIONA_REGISTER.value.trim());
  formData.append("questionB", INPUT_QUESTIONB_REGISTER.value.trim());
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
    console.log(result); // Utile pour debug

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
  INPUT_QUESTIONA_REGISTER.value = "";
  INPUT_QUESTIONB_REGISTER.value = "";
  NEWSLETTER_CHECKBOX_REGISTER.checked = false;
}
