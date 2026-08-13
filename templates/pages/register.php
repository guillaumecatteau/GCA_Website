<div class="registerContent" id="cntREGISTER" style="display: none">
  <h2 class="title titleTop registerTitle">
    <span>i</span><span>n</span><span>s</span><span>c</span><span>r</span><span>i</span>
    <span>p</span><span>t</span><span>i</span><span>o</span><span>n</span>
  </h2>
  <div class="formContainer">
    <form action="" method="POST" class="form" id="formRegister">
      <div class="formGroup">
        <label class="formLabel" for="inputNameRegister">Nom</label>
        <input class="formInput" type="text" id="inputNameRegister" name="name" maxlength="100" placeholder="Entrez votre nom" autofocus />
        <p class="errorMessage" id="nameErrorTextRegister" style="display: none">Doit contenir au moins 2 caractères.</p>
        <div class="validationIcons">
          <span class="icon iconValid" id="nameValidRegister" style="display: none"></span>
          <span class="icon iconProhibed" id="nameProhibedRegister" style="display: none"></span>
        </div>
      </div>
      <div class="formGroup">
        <label class="formLabel" for="inputFirstnameRegister">Prénom</label>
        <input class="formInput" type="text" id="inputFirstnameRegister" name="firstname" maxlength="100" placeholder="Entrez votre prénom" />
        <p class="errorMessage" id="firstnameErrorTextRegister" style="display: none">Doit contenir au moins 2 caractères.</p>
        <div class="validationIcons">
          <span class="icon iconValid" id="firstnameValidRegister" style="display: none"></span>
          <span class="icon iconProhibed" id="firstnameProhibedRegister" style="display: none"></span>
        </div>
      </div>
      <div class="formGroup">
        <label class="formLabel" for="inputMailRegister">Adresse e-mail</label>
        <input class="formInput" type="text" id="inputMailRegister" name="mail" maxlength="100" placeholder="Entrez votre mail" />
        <p class="errorMessage" id="mailErrorTextRegister" style="display: none">Adresse email non valide !</p>
        <div class="validationIcons">
          <span class="icon iconValid" id="mailValidRegister" style="display: none"></span>
          <span class="icon iconProhibed" id="mailProhibedRegister" style="display: none"></span>
        </div>
      </div>
      <div class="formGroup">
        <label class="formLabel" for="inputPasswordRegister">Mot de passe</label>
        <input class="formInput" type="password" id="inputPasswordRegister" name="password" maxlength="16" placeholder="Entrez votre mot de passe" required />
        <p class="errorMessage" id="passwordErrorTextRegister" style="display: none">8 caractères minimum, 1 majuscule, 1 chiffre !</p>
        <div class="validationIcons">
          <span class="icon iconValid" id="passwordValidRegister" style="display: none"></span>
          <span class="icon iconProhibed" id="passwordProhibedRegister" style="display: none"></span>
        </div>
        <button class="eyeButton" id="passwordEyeRegister">
          <span class="icon iconEyeClosed"></span>
          <span class="icon iconEye" style="display: none"></span>
        </button>
      </div>
      <div class="formGroup">
        <label class="formLabel" for="inputQuestionARegister">Couleur favorite</label>
        <input class="formInput" type="text" id="inputQuestionARegister" name="questionA" maxlength="100" placeholder="Entrez votre réponse" />
        <p class="errorMessage" id="questionAErrorTextRegister" style="display: none">Doit contenir au moins 2 caractères.</p>
        <div class="validationIcons">
          <span class="icon iconValid" id="questionAValidRegister" style="display: none"></span>
          <span class="icon iconProhibed" id="questionAProhibedRegister" style="display: none"></span>
        </div>
      </div>
      <div class="formGroup">
        <label class="formLabel" for="inputQuestionBRegister">Plat préféré</label>
        <input class="formInput" type="text" id="inputQuestionBRegister" name="questionB" maxlength="100" placeholder="Entrez votre réponse" />
        <p class="errorMessage" id="questionBErrorTextRegister" style="display: none">Doit contenir au moins 2 caractères.</p>
        <div class="validationIcons">
          <span class="icon iconValid" id="questionBValidRegister" style="display: none"></span>
          <span class="icon iconProhibed" id="questionBProhibedRegister" style="display: none"></span>
        </div>
      </div>
      <label class="formCheckboxLabel">
        <input type="checkbox" id="mailingRegister" name="remember" />
        <span class="formCheckbox"></span>
        <span class="formCheckboxText">Recevoir les newsletters</span>
      </label>
      <div class="btnMedium btnOff" id="btnRegisterRegister">
        <div class="btnLabel">
          <span class="icon iconInscription"></span>
          <span class="btnText" lang="FR" data-en="Register">S'inscrire</span>
        </div>
      </div>
    </form>
    <div class="messageBox">
      <div class="message" id="messageRegisterSucces" style="display: none">
        <span>I</span><span>N</span><span>s</span><span>c</span><span>r</span><span>i</span><span>p</span><span>t</span><span>i</span><span>o</span><span>n</span><span> </span><span>r</span><span>é</span><span>u</span><span>s</span><span>s</span><span>i</span><span>e</span><span>!</span>
      </div>
      <div class="message" id="messageRegisterError" style="display: none">
        <span>E</span><span>r</span><span>r</span><span>e</span><span>u</span><span>r</span><span> </span><span>t</span><span>e</span><span>c</span><span>h</span><span>n</span><span>i</span><span>q</span><span>u</span><span>e</span><span>!</span><span> </span><span>R</span><span>é</span><span>e</span><span>s</span><span>s</span><span>a</span><span>y</span><span>e</span><span>z</span>
      </div>
      <div class="message" id="messageRegisterErrorMail" style="display: none">
        <span>E</span><span>m</span><span>a</span><span>i</span><span>l</span><span> </span><span>d</span><span>é</span><span>j</span><span>à</span><span> </span><span>e</span><span>n</span><span>r</span><span>e</span><span>g</span><span>i</span><span>s</span><span>t</span><span>r</span><span>é</span>
      </div>
    </div>
  </div>
</div>
