<div class="mediasContent" id="cntMEDIAS" style="display: none">
  <h2 class="title titleTop mediasTitle">
    <span>m</span><span>é</span><span>d</span><span>i</span><span>a</span><span>s</span>
  </h2>
  <div class="basicGrid">

    <!-- ── Left panel : navigateur de fichiers + grille ── -->
    <div class="mainBlock">
      <div class="mediasTopBar">
        <!-- Fil d'Ariane du dossier courant -->
        <div class="btnSmall btnOn" id="btnMediasUp" style="display:none">
          <div class="btnLabel"><span class="icon iconBack"></span></div>
        </div>
        <span class="mediasBreadcrumb" id="mediasBreadcrumb" lang="FR" data-en="Choose a folder">Choisir un dossier</span>
        <div class="mediasRootBtns" id="mediasRootBtns">
          <div class="btnSmall btnOn" data-folder="vue/assets/images/Galleries">Galleries</div>
          <div class="btnSmall btnOn" data-folder="vue/assets/images/GalleriesMini">Minis</div>
          <div class="btnSmall btnOn" data-folder="vue/assets/images/Banners">Banners</div>
          <div class="btnSmall btnOn" data-folder="vue/assets/images/Thumbnails">Thumbnails</div>
          <div class="btnSmall btnOn" data-folder="vue/assets/images/Backgrounds">Backgrounds</div>
          <div class="btnSmall btnOn" data-folder="vue/assets/images/icons">Icons</div>
        </div>
        <span class="mediaSelInfo" id="mediaSelInfo"></span>
        <span class="formMessage" id="msgUploadMedia" style="display:none"></span>
      </div>
      <div class="mediasGrid" id="mediasGrid">
        <p class="adminPlaceholder" lang="FR" data-en="Select a folder to browse its images">Sélectionnez un dossier pour parcourir ses images</p>
      </div>
    </div>

    <!-- ── Right panel : formulaire d'édition ── -->
    <div class="sideBlock">
      <button class="btnBackToAdmin">
        <span class="icon iconBack"></span>
      </button>
      <div class="basicBlock" id="mediaEditorBlock">
        <span class="blockTitle" id="mediaEditorTitle" lang="FR" data-en="Select a media">Sélectionner un média</span>

        <!-- Prévisualisation (sélection unique) -->
        <div class="mediaPreviewWrap" id="mediaPreview" style="display:none">
          <img id="mediaPreviewImg" src="" alt="" />
        </div>

        <!-- Formulaire édition -->
        <form id="formEditMedia" class="adminForm" style="display:none">

          <!-- Description FR/EN -->
          <div class="formGroup langGroup">
            <div class="langSwitch">
              <label class="formLabel" lang="FR" data-en="Description">Description</label>
              <button type="button" class="langBtn langBtn--active" data-lang="fr">FR</button>
              <button type="button" class="langBtn" data-lang="en">EN</button>
            </div>
            <div class="langField langField--visible" data-lang="fr">
              <textarea id="inputMediaDescFr" class="formTextarea" rows="3" placeholder="Description en français"></textarea>
            </div>
            <div class="langField" data-lang="en">
              <textarea id="inputMediaDescEn" class="formTextarea" rows="3" placeholder="Description in English"></textarea>
            </div>
          </div>

          <!-- Texte alternatif (sélection unique uniquement) -->
          <div class="formGroup" id="mediaAltGroup">
            <label class="formLabel" for="inputMediaAlt" lang="FR" data-en="Alt text">Texte alternatif</label>
            <input type="text" id="inputMediaAlt" class="formInput" maxlength="255" />
          </div>

          <!-- Actions -->
          <div class="formGroup formGroupBtn">
            <div class="btnMedium btnOff" id="btnSaveMedia">
              <div class="btnLabel">
                <span class="btnText" lang="FR" data-en="Save">Sauvegarder</span>
              </div>
            </div>
          </div>

          <div class="formMessage" id="msgMediaSave" style="display:none"></div>
        </form>

        <!-- Supprimer (sélection unique) -->
        <div style="display:none" id="mediaDeleteGroup">
          <div class="btnMedium btnDanger" id="btnDeleteMedia">
            <div class="btnLabel">
              <span class="icon iconDelete"></span>
              <span lang="FR" data-en="Delete">Supprimer</span>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>

  <!-- Popup confirmation suppression -->
  <div class="confirmOverlay" id="mediaDeleteConfirm" style="display:none">
    <div class="confirmBox">
      <p class="confirmMsg" lang="FR" data-en="Delete this media?">Supprimer ce média ?</p>
      <div class="confirmActions">
        <div class="btnMedium btnDanger" id="btnConfirmDeleteMedia">
          <div class="btnLabel"><span lang="FR" data-en="Delete">Supprimer</span></div>
        </div>
        <div class="btnMedium" id="btnCancelDeleteMedia">
          <div class="btnLabel"><span lang="FR" data-en="Cancel">Annuler</span></div>
        </div>
      </div>
    </div>
  </div>

</div>
