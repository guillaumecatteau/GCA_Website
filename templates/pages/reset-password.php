<div class="resetPasswordContent" id="cntRESETPASSWORD" style="display: none">
  <h2 class="title titleTop resetPasswordTitle">
    <span>n</span><span>o</span><span>u</span><span>v</span><span>e</span><span>a</span><span>u</span><span> </span>
    <span>m</span><span>o</span><span>t</span><span> </span><span>d</span><span>e</span><span> </span>
    <span>p</span><span>a</span><span>s</span><span>s</span><span>e</span>
  </h2>
  <div class="formContainer">
    <form action="" method="POST" class="form" id="formResetPassword">
      <div class="formGroup">
        <label class="formLabel" for="inputPasswordReset">Nouveau mot de passe</label>
        <input class="formInput" type="password" id="inputPasswordReset" maxlength="16" placeholder="Entrez votre nouveau mot de passe" autofocus />
        <p class="errorMessage" id="passwordErrorTextReset" style="display: none">8 caractères minimum, 1 majuscule, 1 chiffre !</p>
      </div>
      <div class="formGroup">
        <label class="formLabel" for="inputPasswordConfirmReset">Confirmation</label>
        <input class="formInput" type="password" id="inputPasswordConfirmReset" maxlength="16" placeholder="Confirmez votre nouveau mot de passe" />
        <p class="errorMessage" id="passwordConfirmErrorTextReset" style="display: none">Les mots de passe ne correspondent pas.</p>
      </div>
      <div class="btnMedium btnOff" id="btnSubmitResetPassword">
        <div class="btnLabel">
          <span class="icon iconValid"></span>
          <span class="btnText" lang="FR" data-en="Reset password">Réinitialiser</span>
        </div>
      </div>
    </form>
    <div class="messageBox">
      <p class="formMessage" id="msgResetPasswordPage" style="display: none"></p>
    </div>
  </div>
</div>
