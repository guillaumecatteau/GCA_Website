<div class="pagesContent" id="cntPAGES" style="display: none">
  <h2 class="title titleTop pagesTitle">
    <span>p</span><span>a</span><span>g</span><span>e</span><span>s</span>
  </h2>

  <!-- Mode liste -->
  <div class="basicGrid" id="pagesListMode">
    <div class="mainBlock">
      <div id="pagesListContainer"><p class="adminPlaceholder">Chargement&hellip;</p></div>
    </div>
    <div class="sideBlock">
      <div class="basicBlock">
        <span class="blockTitle" lang="FR" data-en="Filter">Filtrer</span>
        <form id="formSearchPages" class="adminForm">
          <div class="formGroup">
            <label class="formLabel" lang="FR" data-en="Type">Type</label>
            <select id="selectPageTypeFilter" class="formSelect">
              <option value="" lang="FR" data-en="All types">Tous les types</option>
              <option value="projet" lang="FR" data-en="Project">Projet</option>
              <option value="expertise">Expertise</option>
              <option value="blog">Blog</option>
            </select>
          </div>
          <div class="formGroup">
            <label class="formLabel">Titre</label>
            <input type="text" id="inputSearchPageQ" class="formInput" placeholder="Rechercher&hellip;" />
          </div>
          <div class="formGroup formGroupBtn">
            <div class="btnMedium btnOn" id="btnSearchPages">
              <div class="btnLabel"><span class="icon iconSearch"></span><span class="btnText" lang="FR" data-en="Search">Chercher</span></div>
            </div>
          </div>
          <div class="formMessage" id="msgPageSearch" style="display:none"></div>
        </form>
      </div>
      <div class="basicBlock">
        <span class="blockTitle" lang="FR" data-en="New page">Nouvelle page</span>
        <form id="formCreatePage" class="adminForm">
          <div class="formGroup langGroup">
            <div class="langSwitch">
              <label class="formLabel" lang="FR" data-en="Title">Titre</label>
              <button type="button" class="langBtn langBtn--active" data-lang="fr">FR</button>
              <button type="button" class="langBtn" data-lang="en">EN</button>
            </div>
            <div class="langField langField--visible" data-lang="fr">
              <input type="text" id="inputNewPageTitleFr" class="formInput" maxlength="255" placeholder="Titre de la page" />
            </div>
            <div class="langField" data-lang="en">
              <input type="text" id="inputNewPageTitleEn" class="formInput" maxlength="255" placeholder="Page title" />
            </div>
          </div>
          <div class="formGroup">
            <label class="formLabel" lang="FR" data-en="Type">Type</label>
            <select id="selectNewPageType" class="formSelect">
              <option value="" lang="FR" data-en="Choose a type&hellip;">Choisir un type&hellip;</option>
              <option value="projet" lang="FR" data-en="Project">Projet</option>
              <option value="expertise">Expertise</option>
              <option value="blog">Blog</option>
            </select>
          </div>
          <div class="formGroup formGroupBtn">
            <div class="btnMedium btnOff" id="btnCreatePage">
              <div class="btnLabel"><span class="btnText" lang="FR" data-en="Create page">Cr&eacute;er la page</span></div>
            </div>
          </div>
          <div class="formMessage" id="msgPageCreate" style="display:none"></div>
        </form>
      </div>
    </div>
    <button class="btnBackToAdmin"><span class="icon iconBack"></span></button>
  </div>

  <!-- Mode edition -->
  <div class="basicGrid" id="pagesEditMode" style="display:none">
    <div class="mainBlock pageBuilderMain">
      <div id="pageBlocksContainer"></div>
    </div>
    <div class="sideBlock">
      <div class="basicBlock">
        <span class="blockTitle" id="pageEditorTitle" lang="FR" data-en="Edit page">&Eacute;diter la page</span>
        <form id="formEditPage" class="adminForm">
          <div class="formGroup langGroup">
            <div class="langSwitch">
              <label class="formLabel" lang="FR" data-en="Title">Titre</label>
              <button type="button" class="langBtn langBtn--active" data-lang="fr">FR</button>
              <button type="button" class="langBtn" data-lang="en">EN</button>
            </div>
            <div class="langField langField--visible" data-lang="fr">
              <input type="text" id="inputPageTitleFr" class="formInput" maxlength="255" />
            </div>
            <div class="langField" data-lang="en">
              <input type="text" id="inputPageTitleEn" class="formInput" maxlength="255" />
            </div>
          </div>
          <div class="formGroup">
            <label class="formLabel" lang="FR" data-en="Type">Type</label>
            <select id="selectEditPageType" class="formSelect">
              <option value="projet" lang="FR" data-en="Project">Projet</option>
              <option value="expertise">Expertise</option>
              <option value="blog">Blog</option>
            </select>
          </div>
          <!-- Dates de projet — uniquement pour le type "projet" -->
          <div class="formGroup pageProjectOnly" id="pageDateStartGroup" style="display:none">
            <label class="formLabel" lang="FR" data-en="Start date">D&eacute;but</label>
            <input type="date" id="inputPageDateStart" class="formInput" />
          </div>
          <div class="formGroup pageProjectOnly" id="pageDateEndGroup" style="display:none">
            <label class="formLabel" lang="FR" data-en="End date">Fin</label>
            <input type="date" id="inputPageDateEnd" class="formInput" />
          </div>
          <!-- Tags — pour les types "projet" et "blog" -->
          <div class="formGroup pageTagsExpOnly" id="pageTagsGroupWrap" style="display:none">
            <label class="formLabel" lang="FR" data-en="Tags">Tags</label>
            <details class="expTagDropdown" id="pageTagDropdown">
              <summary class="expTagDropdownSummary">
                <span lang="FR" data-en="Select tags">S&eacute;lectionner <span id="pageTagCount"></span></span>
              </summary>
              <div class="expTagSelector" id="pageTagSelector"></div>
            </details>
          </div>
          <!-- Expériences liées — pour les types "projet" et "blog" -->
          <div class="formGroup pageTagsExpOnly" id="pageExpGroupWrap" style="display:none">
            <label class="formLabel" lang="FR" data-en="Related experiences">Exp&eacute;riences li&eacute;es</label>
            <details class="expTagDropdown" id="pageExpDropdown">
              <summary class="expTagDropdownSummary">
                <span lang="FR" data-en="Select experiences">S&eacute;lectionner <span id="pageExpCount"></span></span>
              </summary>
              <div class="expTagSelector" id="pageExpSelector"></div>
            </details>
          </div>
          <div class="formGroup">
            <label class="formLabel" lang="FR" data-en="Cover media">M&eacute;dia cover</label>
            <div class="tagIconPicker">
              <div class="tagIconPreview" id="pageCoverPickerPreview">
                <img id="pageCoverPickerImg" src="" alt="" style="display:none" />
                <span id="pageCoverPickerEmpty">&mdash;</span>
              </div>
              <input type="hidden" id="inputPageCoverId" value="" />
              <button type="button" class="btnSmall" id="btnPickPageCover"><span lang="FR" data-en="Choose&hellip;">Choisir&hellip;</span></button>
            </div>
          </div>
          <div class="formGroup">
            <label class="formLabel" for="inputPageCoverVideoUrl" lang="FR" data-en="Video cover">Cover vid&eacute;o</label>
            <input type="url" id="inputPageCoverVideoUrl" class="formInput" placeholder="https://www.youtube.com/watch?v=..." />
          </div>
          <div class="formGroup">
            <label class="formLabel" lang="FR" data-en="Card media">M&eacute;dia card</label>
            <div class="tagIconPicker">
              <div class="tagIconPreview" id="pageCardPickerPreview">
                <img id="pageCardPickerImg" src="" alt="" style="display:none" />
                <span id="pageCardPickerEmpty">&mdash;</span>
              </div>
              <input type="hidden" id="inputPageCardId" value="" />
              <button type="button" class="btnSmall" id="btnPickPageCard"><span lang="FR" data-en="Choose&hellip;">Choisir&hellip;</span></button>
            </div>
          </div>
          <div class="formGroup">
            <label class="formCheckboxLabel">
              <input type="checkbox" id="inputPageVisible" />
              <span class="formCheckbox"></span>
              <span class="formCheckboxText" lang="FR" data-en="Visible">Visible</span>
            </label>
          </div>
          <div class="formGroup formGroupBtn expFormActions">
            <div class="btnMedium btnIconOnly btnDanger" id="btnDeletePage">
              <div class="btnLabel"><span class="icon iconDelete"></span></div>
            </div>
            <div class="btnMedium btnOff" id="btnSavePage">
              <div class="btnLabel"><span class="btnText" lang="FR" data-en="Save">Sauvegarder</span></div>
            </div>
          </div>
          <input type="hidden" id="inputPageId" value="" />
          <div class="formMessage" id="msgPageSave" style="display:none"></div>
        </form>
      </div>
    </div>
    <button class="btnBackToAdmin" id="btnExitEditMode"><span class="icon iconBack"></span></button>
  </div>

  <!-- Popup type de bloc -->
  <div class="confirmOverlay" id="blockTypePopup" style="display:none">
    <div class="basicBlock blockTypePopupBox">
      <span class="blockTitle" lang="FR" data-en="Block type">Type de bloc</span>
      <div class="blockTypeGrid">
        <div class="btnMedium btnOn" data-block-type="text"><div class="btnLabel"><span class="btnText" lang="FR" data-en="Text">Texte FR/EN</span></div></div>
        <div class="btnMedium btnOn" data-block-type="media"><div class="btnLabel"><span class="btnText" lang="FR" data-en="Isolated media">M&eacute;dia isol&eacute;</span></div></div>
        <div class="btnMedium btnOn" data-block-type="gallery"><div class="btnLabel"><span class="btnText" lang="FR" data-en="Gallery">Galerie</span></div></div>
      </div>
      <div class="btnMedium" id="btnCancelBlockType"><div class="btnLabel"><span class="btnText" lang="FR" data-en="Cancel">Annuler</span></div></div>
    </div>
  </div>

  <!-- Popup selecteur media -->
  <div class="confirmOverlay" id="pageMediaPicker" style="display:none">
    <div class="basicBlock pageMediaPickerBox">
      <span class="blockTitle" lang="FR" data-en="Select a media">S&eacute;lectionner un m&eacute;dia</span>
      <div class="mediasGrid pageMediaPickerGrid" id="pageMediaPickerGrid"></div>
      <div class="mediasPagination" id="pagePickerPagination" style="display:none">
        <div class="expActionBtn btnOff" data-picdir="f" id="btnPickerFirst"><span class="icon iconFirst"></span></div>
        <div class="expActionBtn btnOff" data-picdir="p" id="btnPickerPrev"><span class="icon iconPrevious"></span></div>
        <span class="mediasPageInfo" id="pickerPageInfo"></span>
        <div class="expActionBtn btnOff" data-picdir="n" id="btnPickerNext"><span class="icon iconNext"></span></div>
        <div class="expActionBtn btnOff" data-picdir="l" id="btnPickerLast"><span class="icon iconLast"></span></div>
      </div>
      <div class="expActionBtn" id="btnCancelMediaPicker"><span class="icon iconDeny"></span></div>
      <div class="btnMedium btnOn" id="btnConfirmMediaPicker" style="display:none">
        <div class="btnLabel"><span class="btnText" lang="FR" data-en="Add selection">Ajouter la s&eacute;lection</span></div>
      </div>
    </div>
  </div>

  <!-- Popup confirmation suppression -->
  <div class="confirmOverlay" id="pageDeleteConfirm" style="display:none">
    <div class="confirmBox">
      <p class="confirmMsg" lang="FR" data-en="Delete this page?">Supprimer cette page ?</p>
      <div class="confirmActions">
        <div class="btnMedium btnDanger" id="btnConfirmDeletePage"><div class="btnLabel"><span class="btnText" lang="FR" data-en="Delete">Supprimer</span></div></div>
        <div class="btnMedium" id="btnCancelDeletePage"><div class="btnLabel"><span class="btnText" lang="FR" data-en="Cancel">Annuler</span></div></div>
      </div>
    </div>
  </div>

</div>
