<div class="commentsContent" id="cntCOMMENTS" style="display: none">
  <h2 class="title titleTop commentsTitle">
    <span>c</span><span>o</span><span>m</span><span>m</span><span>e</span><span>n</span><span>t</span><span>s</span>
  </h2>
  <div class="basicGrid">
    <div class="mainBlock">
      <!-- Filtres de recherche -->
      <div class="basicBlock" id="commentsSearchBlock">
        <span class="blockTitle" lang="FR" data-en="Search">Rechercher</span>
        <form id="formSearchComments" class="adminForm adminFormInline">
          <div class="formGroup">
            <input type="number" id="inputSearchCommentId"   class="formInput" placeholder="ID commentaire" />
          </div>
          <div class="formGroup">
            <input type="number" id="inputSearchCommentUser" class="formInput" placeholder="ID utilisateur" />
          </div>
          <div class="formGroup">
            <input type="number" id="inputSearchCommentPage" class="formInput" placeholder="ID page" />
          </div>
          <div class="formGroup">
            <input type="date"   id="inputSearchCommentFrom" class="formInput" placeholder="Du" />
          </div>
          <div class="formGroup">
            <input type="date"   id="inputSearchCommentTo"   class="formInput" placeholder="Au" />
          </div>
          <div class="formGroup">
            <input type="text"   id="inputSearchCommentQ"    class="formInput" placeholder="Texte…" />
          </div>
          <div class="checkboxGroup">
            <input type="checkbox" id="inputSearchCommentHidden" />
            <label for="inputSearchCommentHidden" lang="FR" data-en="Hidden only">Masqués seul.</label>
          </div>
          <div class="formGroup formGroupBtn">
            <div class="btnMedium" id="btnSearchComments">
              <div class="btnLabel">
                <span class="icon iconSearch"></span>
                <span class="btnText" lang="FR" data-en="Search">Chercher</span>
              </div>
            </div>
          </div>
        </form>
      </div>
      <!-- Résultats -->
      <div class="entryListContainer" id="commentsListContainer">
        <!-- Entries injectées par JS -->
      </div>
    </div>
    <div class="sideBlock">
      <button class="btnBackToAdmin">
        <span class="icon iconAdmin"></span>
        <span lang="FR" data-en="Back to Admin">Retour Admin</span>
      </button>
    </div>
  </div>
</div>
