<div class="messagesContent" id="cntMESSAGES" style="display: none">
  <h2 class="title titleTop messagesTitle">
    <span>m</span><span>e</span><span>s</span><span>s</span><span>a</span><span>g</span><span>e</span><span>r</span><span>i</span><span>e</span>
  </h2>
  <div class="basicGrid">
    <div class="mainBlock">
      <div class="basicBlock">
        <span class="blockTitle" lang="FR" data-en="Conversations">Conversations</span>
        <div class="msgThreadList" id="msgThreadList">
          <!-- Fils injectés par JS -->
        </div>
      </div>
    </div>
    <div class="sideBlock">
      <div class="basicBlock msgThreadBlock" id="msgThreadBlock" style="display: none">
        <span class="blockTitle" id="msgThreadUserName"></span>
        <div class="chatThread" id="msgThreadMessages"></div>
        <form class="chatForm" id="msgReplyForm">
          <textarea class="formTextarea chatFormInput" id="msgReplyInput" maxlength="2000" placeholder="Répondre…"></textarea>
          <div class="btnMedium btnOff" id="btnMsgReplySend">
            <div class="btnLabel">
              <span class="btnText" lang="FR" data-en="Send">Envoyer</span>
            </div>
          </div>
        </form>
      </div>
      <p class="adminPlaceholder" id="msgThreadPlaceholder" lang="FR" data-en="Select a conversation">
        Sélectionnez une conversation
      </p>
    </div>
    <button class="btnBackToAdmin"><span class="icon iconBack"></span></button>
  </div>
</div>
