<div class="experiencesContent" id="cntEXPERIENCES" style="display: none">
  <h2 class="title titleTop experiencesTitle">
    <span>e</span><span>x</span><span>p</span><span>é</span><span>r</span><span>i</span>
    <span>e</span><span>n</span><span>c</span><span>e</span><span>s</span>
  </h2>
  <div class="basicGrid">

    <!-- ── Left panel : liste des expériences ── -->
    <div class="mainBlock">
      <div id="expListContainer">
        <!-- Injecté par JS — 2 groupes : expériences & formations -->
      </div>
    </div>

    <!-- ── Right panel : formulaire création/édition ── -->
    <div class="sideBlock">
      <div class="basicBlock" id="expEditorBlock">
        <span class="blockTitle" id="expEditorTitle" lang="FR" data-en="New experience">Nouvelle expérience</span>
        <form id="formCreateExp" class="adminForm">

          <!-- Titre FR / EN avec switch -->
          <div class="formGroup langGroup">
            <div class="langSwitch">
              <label class="formLabel" lang="FR" data-en="Title">Titre</label>
              <button type="button" class="langBtn langBtn--active" data-lang="fr">FR</button>
              <button type="button" class="langBtn" data-lang="en">EN</button>
            </div>
            <div class="langField langField--visible" data-lang="fr">
              <input type="text" id="inputExpTitleFr" class="formInput" maxlength="200" placeholder="Titre en français" />
            </div>
            <div class="langField" data-lang="en">
              <input type="text" id="inputExpTitleEn" class="formInput" maxlength="200" placeholder="Title in English" />
            </div>
          </div>

          <!-- Logo -->
          <div class="formGroup">
            <label class="formLabel" lang="FR" data-en="Logo">Logo</label>
            <div class="tagIconPicker">
              <div class="tagIconPreview" id="expLogoPreview">
                <img id="expLogoPreviewImg" src="" alt="" style="display:none" />
                <span id="expLogoPreviewEmpty">—</span>
              </div>
              <input type="hidden" id="inputExpLogoPath" value="" />
              <button type="button" class="btnSmall" id="btnPickExpLogo">
                <span lang="FR" data-en="Choose…">Choisir…</span>
              </button>
              <button type="button" class="btnSmall btnDanger" id="btnClearExpLogo" style="display:none">
                <span class="icon iconDelete"></span>
              </button>
            </div>
          </div>

          <!-- Statut (choix unique) -->
          <div class="formGroup">
            <label class="formLabel" for="inputExpStatus" lang="FR" data-en="Status">Statut</label>
            <select id="inputExpStatus" class="formSelect">
              <option value="" lang="FR" data-en="None">Aucun</option>
              <option value="freelance">Freelance</option>
              <option value="formation" lang="FR" data-en="Training">Formation</option>
              <option value="school" lang="FR" data-en="Study">Étude</option>
            </select>
          </div>

          <!-- Options d'affichage -->
          <div class="formGroup">
            <label class="formLabel" lang="FR" data-en="Display">Affichage</label>
            <label class="formCheckboxLabel">
              <input type="checkbox" id="inputExpTimeline" />
              <span class="formCheckbox"></span>
              <span class="formCheckboxText" lang="FR" data-en="Display in timeline">Afficher dans la timeline</span>
            </label>
          </div>

          <!-- Diplôme (visible seulement quand Formation est coché) -->
          <div class="formGroup langGroup" id="expDiplomaGroup" style="display:none">
            <div class="langSwitch">
              <label class="formLabel" lang="FR" data-en="Diploma">Diplôme</label>
              <button type="button" class="langBtn langBtn--active" data-lang="fr">FR</button>
              <button type="button" class="langBtn" data-lang="en">EN</button>
            </div>
            <div class="langField langField--visible" data-lang="fr">
              <input type="text" id="inputExpDiplomaFr" class="formInput" maxlength="300" placeholder="Intitulé du diplôme" />
            </div>
            <div class="langField" data-lang="en">
              <input type="text" id="inputExpDiplomaEn" class="formInput" maxlength="300" placeholder="Diploma title" />
            </div>
          </div>

          <!-- Dates -->
          <div class="formGroup">
            <label class="formLabel" lang="FR" data-en="Start date">Début</label>
            <input type="date" id="inputExpDateStart" class="formInput" />
          </div>
          <!-- Date de fin + case En cours -->
          <div class="formGroup">
            <label class="formLabel" lang="FR" data-en="End date">Fin</label>
            <div class="expDateEndRow">
              <input type="date" id="inputExpDateEnd" class="formInput" />
              <label class="formCheckboxLabel">
                <input type="checkbox" id="inputExpOngoing" />
                <span class="formCheckbox"></span>
                <span class="formCheckboxText" lang="FR" data-en="Ongoing">En cours</span>
              </label>
            </div>
          </div>

          <!-- Tags job en dropdown -->
          <div class="formGroup">
            <label class="formLabel" lang="FR" data-en="Job tags">Tags métier</label>
            <details class="expTagDropdown" id="expTagDropdown">
              <summary class="expTagDropdownSummary">
                <span lang="FR" data-en="Select tags">Sélectionner <span id="expTagCount"></span></span>
              </summary>
              <div class="expTagSelector" id="expTagSelector"></div>
            </details>
          </div>

          <!-- Description FR / EN avec switch -->
          <div class="formGroup langGroup">
            <div class="langSwitch">
              <label class="formLabel" lang="FR" data-en="Description">Description</label>
              <button type="button" class="langBtn langBtn--active" data-lang="fr">FR</button>
              <button type="button" class="langBtn" data-lang="en">EN</button>
            </div>
            <div class="langField langField--visible" data-lang="fr">
              <textarea id="inputExpDescFr" class="formTextarea" rows="3" placeholder="Description en français"></textarea>
            </div>
            <div class="langField" data-lang="en">
              <textarea id="inputExpDescEn" class="formTextarea" rows="3" placeholder="Description in English"></textarea>
            </div>
          </div>

          <!-- Actions -->
          <div class="formGroup formGroupBtn expFormActions">
            <div class="btnMedium btnIconOnly btnOff" id="btnResetExp">
              <div class="btnLabel"><span class="icon iconRetry"></span></div>
            </div>
            <div class="btnMedium btnOff" id="btnCreateExp">
              <div class="btnLabel">
                <span class="btnText" id="lblCreateExp" lang="FR" data-en="Create">Créer</span>
              </div>
            </div>
          </div>

          <input type="hidden" id="inputExpId" value="" />
          <div class="formMessage" id="msgExpCreate" style="display:none"></div>
        </form>
      </div>
    </div>
    <button class="btnBackToAdmin"><span class="icon iconBack"></span></button>

  </div>
</div>
