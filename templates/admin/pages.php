<div class="pagesContent" id="cntPAGES" style="display: none">
  <h2 class="title titleTop pagesTitle">
    <span>p</span><span>a</span><span>g</span><span>e</span><span>s</span>
  </h2>
  <div class="basicGrid">
    <div class="mainBlock">
      <!-- Filtres -->
      <div class="basicBlock" id="pagesSearchBlock">
        <span class="blockTitle" lang="FR" data-en="Filter">Filtrer</span>
        <form id="formSearchPages" class="adminForm adminFormInline">
          <div class="formGroup">
            <select id="selectPageType" class="formSelect">
              <option value="">Tous les types</option>
              <option value="projet">Projet</option>
              <option value="expertise">Expertise</option>
              <option value="blog">Blog</option>
            </select>
          </div>
          <div class="formGroup">
            <input type="text" id="inputSearchPageQ" class="formInput" placeholder="Titre…" />
          </div>
          <div class="formGroup formGroupBtn">
            <div class="btnMedium" id="btnSearchPages">
              <div class="btnLabel">
                <span class="icon iconSearch"></span>
                <span class="btnText" lang="FR" data-en="Search">Chercher</span>
              </div>
            </div>
          </div>
          <div class="formGroup formGroupBtn">
            <div class="btnMedium" id="btnNewPage">
              <div class="btnLabel">
                <span class="icon iconAdd"></span>
                <span class="btnText" lang="FR" data-en="New page">Nouvelle page</span>
              </div>
            </div>
          </div>
        </form>
      </div>
      <!-- Liste -->
      <div class="entryListContainer" id="pagesListContainer">
        <!-- Entries injectées par JS -->
      </div>
    </div>
    <div class="sideBlock" id="pageEditorSide">
      <button class="btnBackToAdmin">
        <span class="icon iconAdmin"></span>
        <span lang="FR" data-en="Back to Admin">Retour Admin</span>
      </button>
      <div class="basicBlock" id="pageEditorBlock" style="display:none">
        <span class="blockTitle" id="pageEditorTitle" lang="FR" data-en="New page">Nouvelle page</span>
        <!-- Formulaire injecté par JS -->
      </div>
    </div>
  </div>
</div>
