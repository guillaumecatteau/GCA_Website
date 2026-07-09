<div class="connexionContent" id="cntCONNEXION" style="display: none">
  <h2 class="title titleTop connexionTitle">
    <span>C</span><span>o</span><span>n</span><span>n</span><span>e</span>
    <span>x</span><span>i</span><span>o</span><span>n</span>
  </h2>
  <div class="formContainer">
    <form action="" method="POST" class="form" id="formConnexion">
      <div class="formGroup">
        <label for="inputMailConnexion">Adresse e-mail :</label>
        <input type="text" id="inputMailConnexion" name="mail" size="30" maxlength="100" placeholder="Entrez votre mail" autofocus />
        <p class="errorMessage" id="mailErrorTextConnexion" style="display: none">Adresse email non valide !</p>
        <div class="validationIcons">
          <span class="icon iconValid" id="mailValidConnexion" style="display: none"></span>
          <span class="icon iconProhibed" id="mailProhibedConnexion" style="display: none"></span>
        </div>
      </div>
      <div class="formGroup">
        <label for="inputPasswordConnexion">Mot de passe :</label>
        <input type="password" id="inputPasswordConnexion" name="password" maxlength="16" placeholder="Entrez votre mot de passe" required />
        <p class="errorMessage" id="passwordErrorTextConnexion" style="display: none">8 caractères minimum, 1 majuscule, 1 chiffre !</p>
        <div class="validationIcons">
          <span class="icon iconValid" id="passwordValidConnexion" style="display: none"></span>
          <span class="icon iconProhibed" id="passwordProhibedConnexion" style="display: none"></span>
        </div>
        <button class="eyeButton" id="passwordEyeConnexion">
          <span class="icon iconEyeClosed"></span>
          <span class="icon iconEye" style="display: none"></span>
        </button>
      </div>
      <div class="checkboxGroup">
        <input type="checkbox" id="rememberMeConnexion" name="remember" />
        <label for="rememberMeConnexion"> Se souvenir de moi </label>
      </div>
      <div class="btnMedium btnOff" id="btnLoginConnexion">
        <div class="btnLabel">
          <span class="icon iconConnect"></span>
          <span class="btnText" lang="FR" data-en="Connexion">Connexion</span>
        </div>
      </div>
      <div class="linkClickGroup">
        <span class="linkClickText" id="btnForgottenConnexion" lang="FR" data-en="forgotten password ?">Mot de passe oublié ?</span>
        <div class="linkClickCombo">
          <p class="introLinkClickText" lang="FR" data-en="No account yet ?">Pas encore de compte ?</p>
          <span class="linkClickText" id="btnRegisterConnexion" lang="FR" data-en="Register now!">Inscrivez-vous !</span>
        </div>
      </div>
    </form>
    <div class="messageBox">
      <div class="message" id="messageLoginSuccess" style="display: none">
        <span>C</span><span>o</span><span>n</span><span>n</span><span>e</span><span>x</span><span>i</span><span>o</span><span>n</span><span> </span><span>r</span><span>é</span><span>u</span><span>s</span><span>s</span><span>i</span><span>e</span><span>!</span>
      </div>
      <div class="message" id="messageLoginError" style="display: none">
        <span>L</span><span>o</span><span>g</span><span>i</span><span>n</span><span> </span><span>i</span><span>n</span><span>c</span><span>o</span><span>r</span><span>r</span><span>e</span><span>c</span><span>t</span><span>!</span>
      </div>
      <div class="message" id="messageLoginTechnicalError" style="display: none">
        <span>E</span><span>r</span><span>r</span><span>e</span><span>u</span><span>r</span><span> </span><span>t</span><span>e</span><span>c</span><span>h</span><span>n</span><span>i</span><span>q</span><span>u</span><span>e</span><span>!</span><span> </span><span>R</span><span>é</span><span>e</span><span>s</span><span>s</span><span>a</span><span>y</span><span>e</span><span>z</span>
      </div>
    </div>
  </div>
</div>
