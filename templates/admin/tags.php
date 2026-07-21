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
      <button class="btnBackToAdmin">
        <span class="icon iconAdmin"></span>
        <span lang="FR" data-en="Back to Admin">Retour Admin</span>
      </button>
      <div class="basicBlock" id="tagEditorBlock">
        <span class="blockTitle" lang="FR" data-en="New tag">Nouveau tag</span>
        <form id="formCreateTag" class="adminForm">
          <div class="formGroup">
            <label class="formLabel" lang="FR" data-en="Title FR">Titre FR</label>
            <input type="text" id="inputTagTitleFr" class="formInput" maxlength="150" placeholder="Titre en français" />
          </div>
          <div class="formGroup">
            <label class="formLabel" lang="FR" data-en="Title EN">Titre EN</label>
            <input type="text" id="inputTagTitleEn" class="formInput" maxlength="150" placeholder="Title in english" />
          </div>
          <div class="formGroup">
            <label class="formLabel" lang="FR" data-en="Category">Catégorie</label>
            <select id="selectTagCategory" class="formSelect">
              <option value="category">Category</option>
              <option value="job">Job</option>
              <option value="technology">Technology</option>
            </select>
          </div>
          <!-- Icône associée -->
          <div class="formGroup">
            <label class="formLabel" lang="FR" data-en="Icon">Icône</label>
            <div class="tagIconPicker">
              <div class="tagIconPreview" id="tagIconPreview">
                <img id="tagIconPreviewImg" src="" alt="" style="display:none" />
                <span id="tagIconPreviewEmpty">—</span>
              </div>
              <input type="hidden" id="inputTagIconPath" value="" />
              <button type="button" class="btnSmall" id="btnPickTagIcon">
                <span lang="FR" data-en="Choose…">Choisir…</span>
              </button>
              <button type="button" class="btnSmall btnDanger" id="btnClearTagIcon" style="display:none">
                <span class="icon iconDelete"></span>
              </button>
            </div>
          </div>
          <!-- Actions -->
          <div class="formGroup formGroupBtn tagFormActions">
            <div class="btnMedium btnOff" id="btnCreateTag">
              <div class="btnLabel">
                <span class="icon iconAdd" id="iconCreateTag"></span>
                <span class="btnText" id="lblCreateTag" lang="FR" data-en="Create">Créer</span>
              </div>
            </div>
            <div class="btnMedium btnOff" id="btnResetTag">
              <div class="btnLabel">
                <span class="icon iconRetry"></span>
                <span class="btnText" lang="FR" data-en="Reset">Réinit.</span>
              </div>
            </div>
          </div>
          <!-- Supprimer (visible seulement en mode édition) -->
          <div class="formGroup formGroupBtn" id="tagDeleteGroup" style="display:none">
            <div class="btnMedium btnDanger" id="btnDeleteTag">
              <div class="btnLabel">
                <span class="icon iconDelete"></span>
                <span class="btnText" lang="FR" data-en="Delete">Supprimer</span>
              </div>
            </div>
          </div>
          <input type="hidden" id="inputTagId" value="" />
          <div class="formMessage" id="msgTagCreate" style="display:none"></div>
        </form>
      </div>
    </div>
  </div>
</div>
