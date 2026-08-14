<div class="mediasContent" id="cntMEDIAS" style="display: none">
  <h2 class="title titleTop mediasTitle">
    <span>m</span><span>é</span><span>d</span><span>i</span><span>a</span><span>s</span>
  </h2>
  <div class="basicGrid">

    <!-- ── Left panel : grille des médias ── -->
    <div class="mainBlock">
      <div class="mediasTopBar">
        <div class="btnSmall btnOn" id="btnSyncMedias">
          <div class="btnLabel">
            <span class="icon iconAdd"></span>
            <span lang="FR" data-en="Sync">Synchroniser</span>
          </div>
        </div>
        <span class="mediaSelInfo" id="mediaSelInfo"></span>
        <span class="formMessage" id="msgUploadMedia" style="display:none"></span>
      </div>
      <div class="mediasGrid" id="mediasGrid">
        <p class="adminPlaceholder">Chargement…</p>
      </div>
    </div>

    <!-- ── Right panel : formulaire d'édition ── -->
    <div class="sideBlock">
      <button class="btnBackToAdmin">
        <span class="icon iconBack"></span>
      </button>
      <div class="basicBlock" id="mediaEditorBlock">
        <span class="blockTitle" id="mediaEditorTitle" lang="FR" data-en="Select a media">Sélectionner un média</span>

        <!-- Actions disponibles quand aucun média n'est sélectionné -->
        <div id="mediaEmptyActions">
          <div class="btnMedium btnOn" id="btnOpenYoutube">
            <div class="btnLabel">
              <span class="btnText">YouTube</span>
            </div>
          </div>
        </div>

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

          <!-- Année -->
          <div class="formGroup">
            <label class="formLabel" for="inputMediaYear" lang="FR" data-en="Year">Année</label>
            <input type="number" id="inputMediaYear" class="formInput" min="1990" max="2100" placeholder="2024" />
          </div>

          <!-- Afficher en galerie -->
          <div class="formGroup">
            <label class="formLabel" lang="FR" data-en="Options">Options</label>
            <label class="formCheckboxLabel">
              <input type="checkbox" id="inputMediaGallery" />
              <span class="formCheckbox"></span>
              <span class="formCheckboxText" lang="FR" data-en="Show in gallery">Afficher en galerie</span>
            </label>
          </div>

          <!-- Tags catégorie -->
          <div class="formGroup" id="mediaCatTagGroup">
            <label class="formLabel" lang="FR" data-en="Category tags">Tags catégorie</label>
            <details class="expTagDropdown" id="mediaCatTagDropdown">
              <summary class="expTagDropdownSummary">
                <span lang="FR" data-en="Select">Sélectionner <span id="mediaCatTagCount"></span></span>
              </summary>
              <div class="expTagSelector" id="mediaCatTagSelector"></div>
            </details>
          </div>

          <!-- Tags technologie -->
          <div class="formGroup" id="mediaTechTagGroup">
            <label class="formLabel" lang="FR" data-en="Technology tags">Tags technologie</label>
            <details class="expTagDropdown" id="mediaTechTagDropdown">
              <summary class="expTagDropdownSummary">
                <span lang="FR" data-en="Select">Sélectionner <span id="mediaTechTagCount"></span></span>
              </summary>
              <div class="expTagSelector" id="mediaTechTagSelector"></div>
            </details>
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

        <!-- Supprimer (icône seule, visible en sélection simple ou multiple) -->
        <div style="display:none" id="mediaDeleteGroup">
          <div class="btnMedium btnIconOnly btnDanger" id="btnDeleteMedia">
            <div class="btnLabel">
              <span class="icon iconDelete"></span>
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

  <!-- Popup YouTube — uniquement l'URL, les métadonnées se gèrent comme tout autre média -->
  <div class="confirmOverlay" id="youtubePopup" style="display:none">
    <div class="basicBlock" style="width:400px;max-width:90vw">
      <span class="blockTitle" lang="FR" data-en="Add a YouTube video">Ajouter une vidéo YouTube</span>
      <div class="formGroup">
        <label class="formLabel" for="inputYoutubeUrl">URL</label>
        <input type="url" id="inputYoutubeUrl" class="formInput" placeholder="https://www.youtube.com/watch?v=..." />
      </div>
      <div class="formGroup formGroupBtn">
        <div class="btnMedium btnOff" id="btnAddYoutube">
          <div class="btnLabel"><span class="btnText" lang="FR" data-en="Add">Ajouter</span></div>
        </div>
        <div class="btnMedium" id="btnCancelYoutube">
          <div class="btnLabel"><span class="btnText" lang="FR" data-en="Cancel">Annuler</span></div>
        </div>
      </div>
      <div class="formMessage" id="msgYoutube" style="display:none"></div>
    </div>
  </div>

</div>
