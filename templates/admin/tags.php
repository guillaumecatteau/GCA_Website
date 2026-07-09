<div class="tagsContent" id="cntTAGS" style="display: none">
  <h2 class="title titleTop tagsTitle">
    <span>t</span><span>a</span><span>g</span><span>s</span>
  </h2>
  <div class="basicGrid">
    <div class="mainBlock">
      <div class="entryListContainer" id="tagsListContainer">
        <!-- Entries injectées par JS -->
      </div>
    </div>
    <div class="sideBlock">
      <div class="basicBlock" id="tagEditorBlock">
        <span class="blockTitle" lang="FR" data-en="New tag">Nouveau tag</span>
        <form id="formCreateTag" class="adminForm">
          <div class="formGroup">
            <label class="formLabel" lang="FR" data-en="Title FR">Titre FR</label>
            <input type="text" id="inputTagTitleFr" class="formInput" maxlength="150" placeholder="Titre en français" />
          </div>
          <div class="formGroup">
            <label class="formLabel" lang="FR" data-en="Title NL">Titre NL</label>
            <input type="text" id="inputTagTitleNl" class="formInput" maxlength="150" placeholder="Titre en néerlandais" />
          </div>
          <div class="formGroup">
            <label class="formLabel" lang="FR" data-en="Category">Catégorie</label>
            <select id="selectTagCategory" class="formSelect">
              <option value="category">Category</option>
              <option value="job">Job</option>
              <option value="technology">Technology</option>
            </select>
          </div>
          <div class="formGroup formGroupBtn">
            <div class="btnMedium btnOff" id="btnCreateTag">
              <div class="btnLabel">
                <span class="icon iconAdd"></span>
                <span class="btnText" lang="FR" data-en="Create">Créer</span>
              </div>
            </div>
          </div>
          <div class="formMessage" id="msgTagCreate" style="display:none"></div>
        </form>
      </div>
    </div>
  </div>
</div>
