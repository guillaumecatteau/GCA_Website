<div class="userProfileContent" id="cntUSERPROFILE" style="display: none">
  <h2 class="title titleTop userProfileTitle">
    <span>m</span><span>o</span><span>n</span><span> </span>
    <span>c</span><span>o</span><span>m</span><span>p</span><span>t</span><span>e</span>
  </h2>
  <div class="centerContent">
    <div class="userProfileTabs">
      <div class="userProfileTabBtn userProfileTabBtn--active" id="btnUserProfileTabInfo" data-tab="info">
        <span class="icon iconUser"></span>
        <span class="btnText" lang="FR" data-en="Informations">Informations</span>
      </div>
      <div class="userProfileTabBtn" id="btnUserProfileTabChat" data-tab="chat">
        <span class="icon iconContact"></span>
        <span class="btnText" lang="FR" data-en="Messages">Messagerie</span>
      </div>
    </div>

    <!-- ── Onglet Informations ── -->
    <div class="userProfileTabPanel userProfileTabPanel--active" id="userProfileTabInfo">
      <div class="basicBlock">
        <span class="blockTitle" lang="FR" data-en="My information">Mes informations</span>
        <div class="pageViewDetailRow">
          <span class="pageViewDetailLabel" lang="FR" data-en="Name">Nom</span>
          <span class="pageViewDetailValue" id="userProfileInfoName"></span>
        </div>
        <div class="pageViewDetailRow">
          <span class="pageViewDetailLabel" lang="FR" data-en="First name">Prénom</span>
          <span class="pageViewDetailValue" id="userProfileInfoFirstname"></span>
        </div>
        <div class="pageViewDetailRow">
          <span class="pageViewDetailLabel" lang="FR" data-en="Email">Email</span>
          <span class="pageViewDetailValue" id="userProfileInfoMail"></span>
        </div>
        <div class="pageViewDetailRow">
          <span class="pageViewDetailLabel" lang="FR" data-en="Member since">Membre depuis</span>
          <span class="pageViewDetailValue" id="userProfileInfoSubscription"></span>
        </div>
        <div class="pageViewDetailRow">
          <span class="pageViewDetailLabel" lang="FR" data-en="Newsletter">Newsletter</span>
          <span class="pageViewDetailValue" id="userProfileInfoNewsletter"></span>
        </div>
        <div class="btnMedium" id="btnResetOwnPassword">
          <div class="btnLabel">
            <span class="icon iconRetry"></span>
            <span class="btnText" lang="FR" data-en="Reset password">Réinitialiser le mot de passe</span>
          </div>
        </div>
        <p class="formMessage" id="msgResetOwnPassword" style="display: none"></p>
      </div>
    </div>

    <!-- ── Onglet Messagerie (chat avec l'admin, table comments) ── -->
    <div class="userProfileTabPanel" id="userProfileTabChat" style="display: none">
      <div class="basicBlock userChatBlock">
        <span class="blockTitle" lang="FR" data-en="Messages with admin">Messages avec l'administrateur</span>
        <div class="chatThread" id="userChatThread"></div>
        <form class="chatForm" id="userChatForm">
          <textarea class="formTextarea chatFormInput" id="userChatInput" maxlength="2000" placeholder="Écrire un message…"></textarea>
          <div class="btnMedium btnOff" id="btnUserChatSend">
            <div class="btnLabel">
              <span class="btnText" lang="FR" data-en="Send">Envoyer</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
