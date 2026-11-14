<div class="sceneEditorContent" id="cntSCENEEDITOR">
  <h2 class="title titleTop sceneEditorTitle">
    <span>é</span><span>d</span><span>i</span><span>t</span><span>e</span><span>u</span><span>r</span>
    <span> </span>
    <span>s</span><span>c</span><span>è</span><span>n</span><span>e</span>
  </h2>

  <!-- ── Barre d'outils viewport (repérage visuel) ─────────────────────────── -->
  <div class="seViewportToolbar" id="seViewportToolbar">
    <button type="button" class="seToolBtn" id="seToggleLightHelpersBtn" title="Visualiser la position des lumières dans la scène">
      <span class="icon iconEye"></span>
    </button>
    <button type="button" class="seToolBtn" id="seToggleAxisGuideBtn" title="Afficher les repères d'axes X/Y de la fenêtre">
      <span class="seToolBtnGlyph">✛</span>
    </button>
    <span class="seViewportToolbarSep"></span>
    <!-- Vues de prévisualisation préréglées : positionnent temporairement la caméra pour
         placer précisément les lumières par rapport à la mesh du logo. Un seul bouton actif
         à la fois ; le réactiver (ou en activer un autre) désélectionne le précédent, et les
         désactiver tous revient à la caméra définie par l'état de scène. -->
    <button type="button" class="seToolBtn seViewBtn" id="seViewTopBtn" data-view="top" title="Vue de dessus (top)">
      <span class="seToolBtnGlyph">T</span>
    </button>
    <button type="button" class="seToolBtn seViewBtn" id="seViewFrontBtn" data-view="front" title="Vue de face (front)">
      <span class="seToolBtnGlyph">F</span>
    </button>
    <button type="button" class="seToolBtn seViewBtn" id="seViewLeftBtn" data-view="left" title="Vue de gauche (left)">
      <span class="seToolBtnGlyph">L</span>
    </button>
    <button type="button" class="seToolBtn seViewBtn" id="seViewRightBtn" data-view="right" title="Vue de droite (right)">
      <span class="seToolBtnGlyph">R</span>
    </button>
  </div>

  <!-- ── Repères d'axes X/Y de la fenêtre (overlay 2D, aide au cadrage caméra) ── -->
  <div class="seAxisGuide" id="seAxisGuide" style="display:none">
    <div class="seAxisGuideLineH"></div>
    <div class="seAxisGuideLineV"></div>
  </div>

  <!-- ── Timeline de keyframes par paramètre (état "Animé") — superposée en bas de l'écran,
       pleine largeur. Une piste par paramètre exposé (case à cocher devant le champ dans
       l'inspecteur) ; clic sur une piste = créer une keyframe à cet instant avec la valeur
       courante ; glisser une keyframe = la retimer ; clic droit = choisir son type de
       transition (linéaire/accél./décél./accél-décél). La durée de l'état "Animé" se définit
       ici (plus dans la box principale, qui ne gère que le type d'état et sa transition). ── -->
  <div class="seKeyframeTimeline" id="seKeyframeTimeline" style="display:none">
    <div class="seKfHeader">
      <div class="seKfDurationGroup" id="seRow-anim-duration">
        <label>Durée</label>
        <input type="range" min="0" max="30000" step="100"/>
        <input type="number" min="0" max="30000" step="100"/>
        <span class="seUnit">ms</span>
      </div>
      <div class="seKfPlayerControls">
        <button type="button" class="seIconBtn icon iconFirst"    id="seKfToStartBtn" title="Revenir au début"></button>
        <button type="button" class="seIconBtn icon iconPrevious" id="seKfPrevKfBtn"  title="Keyframe précédente"></button>
        <button type="button" class="seIconBtn icon iconPlay"     id="seKfPlayBtn"    title="Lire"></button>
        <button type="button" class="seKfStopBtn"                 id="seKfStopBtn"    title="Stop">■</button>
        <button type="button" class="seIconBtn icon iconNext"     id="seKfNextKfBtn"  title="Keyframe suivante"></button>
        <button type="button" class="seIconBtn icon iconLast"     id="seKfToEndBtn"   title="Aller à la fin"></button>
      </div>
      <div class="seKfTimeGroup" id="seKfTimeGroup" title="Positionner précisément le curseur (ms)">
        <input type="number" min="0" step="10" id="seKfTimeInput"/>
        <span class="seUnit">ms</span>
      </div>
    </div>
    <div class="seKfHint">Clic sur une piste = ajouter une keyframe · glisser = déplacer · clic droit = type de transition</div>
    <div class="seKfRuler" id="seKfRuler">
      <div class="seKfPlayhead" id="seKfPlayhead"></div>
    </div>
    <div class="seKfTrackList" id="seKfTrackList"></div>
  </div>
  <div class="seKfContextMenu" id="seKfContextMenu" style="display:none">
    <div data-easing="linear">Linéaire</div>
    <div data-easing="easeIn">Accélération</div>
    <div data-easing="easeOut">Décélération</div>
    <div data-easing="easeInOut">Accél./décél.</div>
    <div class="seKfContextMenuSep"></div>
    <div data-action="delete">Supprimer la keyframe</div>
  </div>

  <!-- ── Inspecteur (panneau droit) ───────────────────────────────────────── -->
  <div class="seInspector" id="seInspector" data-scope="master">

    <!-- ── SCOPE BAR (Master Scene / State Variation) ────────────────────
         "Master Scene" = la scène de référence globale (toujours l'état "home") : nombre/
         placement/type des lumières, config caméra et color map de base, interaction,
         environnement, rendu. "State Variation" = états additionnels qui ne peuvent que FAIRE
         VARIER l'intensité/portée des lumières de la master scene, la position de caméra et
         définir leur propre color map + un paramètre de transition pour blender en douceur
         avec la master scene (ou toute autre variation) au lieu d'un changement brutal. -->
    <div class="seScopeBar" id="seScopeBar">
      <button type="button" class="seScopeBtn seScopeBtn--active" id="seScopeMasterBtn" data-scope="master">Master Scene</button>
      <button type="button" class="seScopeBtn" id="seScopeVariationBtn" data-scope="variation">State Variation</button>
    </div>

    <!-- ── TOPBOX (chargement / gestion des états) ──────────────────────── -->
    <div class="seTopbox" id="seTopbox">
      <div class="seTopboxRow">
        <select class="seSelect" id="seStateSelect"></select>
        <input class="seInput" type="text" id="seStateLabelInput" placeholder="Nom" maxlength="60" />
      </div>
      <!-- Assignation de la variation : à quelle page/section du site s'applique-t-elle ? Une
           variation n'a PAS d'autorité automatique sur une section — elle n'est active QUE si
           explicitement assignée ici. Sans assignation, elle reste un simple brouillon
           consultable/prévisualisable depuis l'éditeur. -->
      <div class="seTopboxRow" id="seAssignRow" data-variation-only>
        <label class="seLabel">Assigner à</label>
        <select class="seSelect" id="seAssignSelect">
          <option value="">— Aucune —</option>
        </select>
      </div>
      <div class="seTopboxBtns">
        <span class="seIconBtn icon iconAdd"    id="seNewBtn"     title="Nouvel état" data-variation-only></span>
        <span class="seIconBtn icon iconCopy"   id="seDuplicateBtn" title="Dupliquer l'état" data-variation-only></span>
        <span class="seIconBtn icon iconSave btnOff" id="seSaveBtn" title="Sauvegarder"></span>
        <span class="seIconBtn icon iconDelete" id="seDeleteBtn"  title="Supprimer" data-variation-only></span>
        <span class="seIconBtn icon iconValid"  id="sePreviewBtn" title="Appliquer à la scène"></span>
        <span class="seIconBtn icon iconPlay"   id="seTransitionPreviewBtn" title="Prévisualiser la transition depuis l'état courant" data-variation-only></span>
      </div>
      <div class="seStateFeedback">
        <div class="seDirtyBadge" id="seDirtyBadge" style="display:none">● non sauvegardé</div>
        <div class="seStatusMsg"  id="seStatusMsg"></div>
      </div>
    </div>

    <!-- ── RENDERBOX (paramètres de rendu — collapsible) — Master Scene uniquement :
         post-processing/ombres/réflexions/particules s'appliquent à la scène globale, une
         "State variation" ne peut pas les redéfinir. ──────────────────────── -->
    <div class="seRenderbox" id="seRenderbox" data-master-only>
      <div class="seRenderboxHeader" id="seRenderboxHeader">
        <span class="seRenderboxLabel">Rendu</span>
        <button class="seRenderboxToggle" id="seRenderboxToggle" title="Développer/Réduire">▼</button>
      </div>
      <div class="seRenderboxBody" id="seRenderboxBody" style="display:none">
        <div class="seSectionBody">

          <!-- Bloom -->
          <div class="seGroup">
            <span class="seGroupLabel">Bloom / Lueur</span>
            <div class="seRow seRowCheck" id="seRow-bloom-enabled"><label>Activé</label><input type="checkbox" /></div>
            <div class="seRow" id="seRow-bloom-threshold"><label>Seuil</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
            <div class="seRow" id="seRow-bloom-strength"><label>Intensité</label><input type="range" min="0" max="5" step="0.05"/><input type="number" min="0" max="5" step="0.05"/></div>
            <div class="seRow" id="seRow-bloom-radius"><label>Rayon</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
            <div class="seRow" id="seRow-bloom-exposure"><label>Exposition</label><input type="range" min="0.1" max="3" step="0.05"/><input type="number" min="0.1" max="3" step="0.05"/></div>
          </div>

          <!-- DOF -->
          <div class="seGroup">
            <span class="seGroupLabel">Profondeur de champ</span>
            <div class="seRow seRowCheck" id="seRow-dof-enabled"><label>Activé</label><input type="checkbox" /></div>
            <div class="seRow" id="seRow-dof-focus"><label>Mise au point</label><input type="range" min="0.5" max="20" step="0.1"/><input type="number" min="0.5" max="20" step="0.1"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-dof-aperture"><label>Ouverture</label><input type="range" min="0.0001" max="0.02" step="0.0001"/><input type="number" min="0.0001" max="0.02" step="0.0001"/></div>
            <div class="seRow" id="seRow-dof-maxblur"><label>Flou max</label><input type="range" min="0" max="0.05" step="0.001"/><input type="number" min="0" max="0.05" step="0.001"/></div>
          </div>

          <!-- Ombres -->
          <div class="seGroup">
            <span class="seGroupLabel">Ombres — Key Light</span>
            <div class="seRow" id="seRow-shadow-keyResolution"><label>Résolution</label><input type="number" min="256" max="4096" step="1"/><span class="seUnit">px</span></div>
            <div class="seRow" id="seRow-shadow-keyRadius"><label>Flou (radius)</label><input type="range" min="0" max="10" step="0.1"/><input type="number" min="0" max="10" step="0.1"/></div>
          </div>
          <div class="seGroup">
            <span class="seGroupLabel">Ombres — Point Light</span>
            <div class="seRow" id="seRow-shadow-ptResolution"><label>Résolution</label><input type="number" min="64" max="2048" step="1"/><span class="seUnit">px</span></div>
            <div class="seRow" id="seRow-shadow-ptRadius"><label>Flou (radius)</label><input type="range" min="0" max="10" step="0.1"/><input type="number" min="0" max="10" step="0.1"/></div>
          </div>

          <!-- Réflexions -->
          <div class="seGroup">
            <span class="seGroupLabel">Réflexions</span>
            <div class="seRow seRowCheck" id="seRow-reflection-enabled"><label>Activer</label><input type="checkbox"/></div>
            <div class="seRow" id="seRow-reflection-resolution"><label>Résolution</label><input type="range" min="32" max="512" step="32"/><input type="number" min="32" max="512" step="32"/><span class="seUnit">px</span></div>
            <div class="seRow" id="seRow-reflection-bodyIntensity"><label>Logo Body</label><input type="range" min="0" max="2" step="0.05"/><input type="number" min="0" max="2" step="0.05"/></div>
            <div class="seRow" id="seRow-reflection-groundIntensity"><label>Ground</label><input type="range" min="0" max="2" step="0.05"/><input type="number" min="0" max="2" step="0.05"/></div>
            <div class="seRow" id="seRow-reflection-updateEvery"><label>Mise à jour</label><input type="range" min="1" max="10" step="1"/><input type="number" min="1" max="10" step="1"/><span class="seUnit">frames</span></div>
          </div>

          <!-- Particules -->
          <div class="seGroup">
            <span class="seGroupLabel">Particules — Couleur</span>
            <div class="seRow seRowColor" id="seRow-particles-colorNear"><label>Proche</label><input type="color" /></div>
            <div class="seRow seRowColor" id="seRow-particles-colorFar"><label>Lointaine</label><input type="color" /></div>
            <div class="seRow" id="seRow-particles-colorMaxDist"><label>Dist. gradient</label><input type="range" min="1" max="20" step="0.5"/><input type="number" min="1" max="20" step="0.5"/><span class="seUnit">u</span></div>
          </div>
          <div class="seGroup">
            <span class="seGroupLabel">Particules — Apparence</span>
            <div class="seRow" id="seRow-particles-size"><label>Taille</label><input type="range" min="0.005" max="0.15" step="0.001"/><input type="number" min="0.005" max="0.15" step="0.001"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-particles-opacity"><label>Opacité max</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
          </div>
          <div class="seGroup">
            <span class="seGroupLabel">Particules — Orbite</span>
            <div class="seRow" id="seRow-particles-count"><label>Quantité</label><input type="range" min="100" max="8000" step="100"/><input type="number" min="100" max="8000" step="100"/></div>
            <div class="seRow" id="seRow-particles-orbitSpeed"><label>Vitesse</label><input type="range" min="0" max="2" step="0.01"/><input type="number" min="0" max="2" step="0.01"/><span class="seUnit">rad/s</span></div>
            <div class="seRow" id="seRow-particles-orbitCurve"><label>Courbe centre/loin</label><input type="range" min="0.1" max="5" step="0.1"/><input type="number" min="0.1" max="5" step="0.1"/></div>
            <div class="seRow" id="seRow-particles-turbulence"><label>Turbulence</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
          </div>
          <div class="seGroup">
            <span class="seGroupLabel">Particules — Durée de vie</span>
            <div class="seRow" id="seRow-particles-lifeMin"><label>Min</label><input type="range" min="1" max="30" step="0.5"/><input type="number" min="1" max="30" step="0.5"/><span class="seUnit">s</span></div>
            <div class="seRow" id="seRow-particles-lifeMax"><label>Max</label><input type="range" min="1" max="60" step="0.5"/><input type="number" min="1" max="60" step="0.5"/><span class="seUnit">s</span></div>
          </div>
          <div class="seGroup">
            <span class="seGroupLabel">Particules — Curseur</span>
            <div class="seRow" id="seRow-particles-mouseInfluence"><label>Entraînement</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
            <div class="seRow" id="seRow-particles-mouseRadius"><label>Rayon curseur</label><input type="range" min="0.5" max="8" step="0.1"/><input type="number" min="0.5" max="8" step="0.1"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-particles-mouseDepth"><label>Profondeur max</label><input type="range" min="0" max="20" step="0.5"/><input type="number" min="0" max="20" step="0.5"/><span class="seUnit">u</span></div>
          </div>

        </div>
      </div>
    </div>

    <!-- ── TAB BAR ───────────────────────────────────────────────────────── -->
    <div class="seTabBar" id="seTabBar">
      <button class="seTab seTab--active" data-tab="animation">Master State</button>
      <button class="seTab" data-tab="theme" data-master-only>Interaction</button>
      <button class="seTab" data-tab="ground" data-master-only>Env</button>
    </div>

    <!-- ── TAB PANES ─────────────────────────────────────────────────────── -->
    <div class="seTabPanes" id="seTabPanes">

      <!-- ── Animation ──────────────────────────────────────────────────── -->
      <div class="seTabPane" id="sePane-animation">
        <div class="seSectionBody">

          <!-- Box état sélectionné : ne définit plus que le TYPE d'état (statique/animé) et son
               paramètre de TRANSITION avec les autres états (fondu d'entrée/sortie). Tout le
               reste (durée, keyframes par paramètre) est géré par la timeline du bas
               (#seKeyframeTimeline) — les sous-états n'existent plus avec cette approche. -->
          <div class="seAnimStateBox" id="seAnimStateBox" data-variation-only>
            <div class="seAnimStateBoxHeader">
              <span class="seAnimStateBoxLabel">État</span>
              <span class="seAnimStateBoxTitle" id="seAnimStateBoxTitle">—</span>
            </div>
            <div class="seAnimStateBoxBody">
              <!-- Statique = état fixe joué en boucle (une seule valeur par paramètre). Animé =
                   durée + keyframes indépendantes par paramètre exposé, éditées dans la
                   timeline en bas de l'écran (cf. #seKeyframeTimeline). -->
              <div class="seRow seRowSelect" id="seRow-state-mode">
                <label>Type d'état</label>
                <select id="se-state-mode-select" class="seSelect">
                  <option value="static">Statique</option>
                  <option value="animated">Animé</option>
                </select>
              </div>

              <!-- Transition : fondu d'entrée/sortie de CET état avec la master scene (ou toute
                   autre variation) — unique à l'état lui-même, pas à ses keyframes internes. Sa
                   méthode ne peut être qu'un fondu (pas de linéaire/accél./décél. ici : ces
                   méthodes ne s'appliquent qu'aux keyframes individuelles de la timeline). Ne
                   s'applique pas à la Master Scene (état de référence, pas de notion d'entrée/
                   sortie). -->
              <div class="seGroup" id="seTransitionGroup" data-variation-only>
                <span class="seGroupLabel">Transition (fondu d'entrée / sortie de l'état)</span>
                <div class="seRow" id="seRow-transition-duration"><label>Durée</label><input type="range" min="0" max="20000" step="100"/><input type="number" min="0" max="20000" step="100"/><span class="seUnit">ms</span></div>
                <div class="seRow seRowCheck" id="seRow-transition-fadeIn"><label>Fondu en entrée</label><input type="checkbox"></div>
                <div class="seRow seRowCheck" id="seRow-transition-fadeOut"><label>Fondu en sortie</label><input type="checkbox"></div>
              </div>
            </div>
          </div>

          <!-- Caméra -->
          <div class="seGroup">
            <span class="seGroupLabel">Caméra — Position</span>
            <div class="seRow" id="seRow-camera-posX"><label>X</label><input type="range" min="-20" max="20" step="0.05"/><input type="number" min="-20" max="20" step="0.05"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-camera-posY"><label>Y</label><input type="range" min="-20" max="20" step="0.05"/><input type="number" min="-20" max="20" step="0.05"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-camera-posZ"><label>Z</label><input type="range" min="0.5" max="30" step="0.05"/><input type="number" min="0.5" max="30" step="0.05"/><span class="seUnit">u</span></div>
          </div>
          <div class="seGroup">
            <span class="seGroupLabel">Caméra — Offset cible (logo center +)</span>
            <div class="seRow" id="seRow-camera-lookAtOffsetX"><label>X</label><input type="range" min="-10" max="10" step="0.05"/><input type="number" min="-10" max="10" step="0.05"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-camera-lookAtOffsetY"><label>Y</label><input type="range" min="-10" max="10" step="0.05"/><input type="number" min="-10" max="10" step="0.05"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-camera-lookAtOffsetZ"><label>Z</label><input type="range" min="-10" max="10" step="0.05"/><input type="number" min="-10" max="10" step="0.05"/><span class="seUnit">u</span></div>
          </div>
          <div class="seGroup" data-master-only>
            <span class="seGroupLabel">Caméra — Optique</span>
            <div class="seRow" id="seRow-camera-fov"><label>FOV</label><input type="range" min="10" max="120" step="1"/><input type="number" min="10" max="120" step="1"/><span class="seUnit">°</span></div>
            <div class="seRow" id="seRow-camera-near"><label>Near</label><input type="range" min="0.01" max="10" step="0.01"/><input type="number" min="0.01" max="10" step="0.01"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-camera-far"><label>Far</label><input type="range" min="50" max="2000" step="10"/><input type="number" min="50" max="2000" step="10"/><span class="seUnit">u</span></div>
          </div>

          <!-- Lumières -->

          <!-- Color Map Lead — preview temps réel + sélection de la position de chaque lumière
               (Master Scene uniquement — positionner les lumières sur LE color map de référence
               est une décision structurelle, pas une variation). -->
          <div class="seGroup" id="seCmlGroup" data-master-only>
            <span class="seGroupLabel">Color Map Lead</span>
            <div class="seCmlPreviewWrap" id="seCmlPreviewWrap">
              <canvas class="seCmlPreviewCanvas" id="seCmlPreviewCanvas" width="400" height="40"></canvas>
              <div class="seCmlMarkers" id="seCmlMarkers"></div>
            </div>
            <div class="seCmlHint">Glisser un repère (ou la bande) pour positionner la lumière sélectionnée.</div>
            <div class="seCmlLightList" id="seCmlLightList"></div>
          </div>

          <div class="seGroup">
            <span class="seGroupLabel">Lumière ambiante</span>
            <div class="seRow seRowColor" id="seRow-lights-ambient-color" data-master-only><label>Couleur</label><input type="color" /></div>
            <div class="seRow" id="seRow-lights-ambient-intensity"><label>Intensité</label><input type="range" min="0" max="3" step="0.01"/><input type="number" min="0" max="3" step="0.01"/></div>
          </div>
          <!-- Key/Rim Light Left/Rim Light Right : construits dynamiquement en JS (scene-editor.js,
               _populateNamedLight) pour partager le même système que les lumières additionnelles
               (sélecteur de type, rotation, renommage par double-clic, repliable, réordonnable).
               Pas de bouton supprimer. En "State variation", seuls intensité/portée/ColorMapLead
               restent éditables (cf. variationMode dans _extraLightFields). -->
          <div class="seGroup" id="seKeyLightGroup"></div>
          <div class="seGroup" id="seRimLeftGroup"></div>
          <div class="seGroup" id="seRimRightGroup"></div>
          <div class="seGroup">
            <span class="seGroupLabel">Point Light (mesh_light)</span>
            <div class="seRow" id="seRow-logoLight-lightIntensity"><label>Intensité</label><input type="range" min="0" max="10" step="0.1"/><input type="number" min="0" max="10" step="0.1"/></div>
            <div class="seRow" id="seRow-logoLight-lightRange"><label>Portée</label><input type="range" min="0" max="30" step="0.1"/><input type="number" min="0" max="30" step="0.1"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-logoLight-normalOffset" data-master-only><label>Offset normal</label><input type="range" min="-2" max="4" step="0.05"/><input type="number" min="-2" max="4" step="0.05"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-logoLight-emissiveIntensity" data-master-only><label>Émission mesh</label><input type="range" min="0" max="10" step="0.1"/><input type="number" min="0" max="10" step="0.1"/></div>
            <div class="seRow seRowCheck" id="seRow-logoLight-castShadow" data-master-only><label>Ombre projetée</label><input type="checkbox" /></div>
            <div class="seRow seRowCheck" id="seRow-logoLight-useLeadColor"><label>ColorMapLead</label><input type="checkbox" /></div>
            <div class="seRow" id="seRow-logoLight-leadColorPos"><label>Position</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
          </div>
          <div class="seGroup" data-master-only>
            <span class="seGroupLabel">Teinte dynamique (suit le color map)</span>
            <div class="seRow" id="seRow-logoLight-rimTintBlend"><label>Rim Light</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
            <div class="seRow" id="seRow-logoLight-keyTintBlend"><label>Key Light</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
          </div>
          <div class="seGroup" id="seExtraLightsGroup">
            <!-- Pas de sous-titre "Autres lumières" : toutes les lumières de la scène (sauf
                 mesh_light) forment une seule liste continue avec Key/Rim Left/Rim Right
                 ci-dessus — juste un bouton "+ Lumière" à la fin du groupe. -->
            <div id="se-extraLights-list"></div>
            <div class="se-addLightRow" data-master-only>
              <select id="se-addLightType" class="seSelect">
                <option value="PointLight">Point Light</option>
                <option value="DirectionalLight">Directionnelle</option>
                <option value="SpotLight">Spot Light</option>
                <option value="HemisphereLight">Hémisphère</option>
                <option value="AmbientLight">Ambiante</option>
                <option value="RectAreaLight">Rect Area</option>
              </select>
              <button class="seBtn" id="se-addLightBtn">+ Lumière</button>
            </div>
          </div>

          <!-- Color Map -->
          <div class="seGroup">
            <span class="seGroupLabel">Color Map</span>
            <div class="seGradientEditor">
              <div class="seGradientPreview" id="se-logoLight-preview"></div>
              <div class="seGradientStops" id="se-logoLight-stops"></div>
              <button class="seBtn seGradientAddBtn" id="se-logoLight-addStop">+ Couleur</button>
            </div>
            <div class="seRow" id="seRow-logoLight-gradientSpeed"><label>Vitesse animation</label><input type="range" min="0" max="5" step="0.01"/><input type="number" min="0" max="5" step="0.01"/><span class="seUnit">Hz</span></div>
            <div class="seRow seRowCheck" id="seRow-logoLight-gradientReverse"><label>Sens inversé</label><input type="checkbox" /></div>
            <div class="seRow seRowCheck" id="seRow-logoLight-gradientPlayOnce"><label>Jouer une fois</label><input type="checkbox" /></div>
            <!-- Actif uniquement quand la vitesse ci-dessus est à 0 (pas de défilement auto) :
                 permet de positionner le dégradé "à la main", notamment via les keyframes
                 d'animation d'une State Variation. -->
            <div class="seRow" id="seRow-logoLight-uvOffset"><label>Offset UV</label><input type="range" min="0" max="1" step="0.001"/><input type="number" min="0" max="1" step="0.001"/></div>
            <div class="seRow" id="seRow-logoLight-texScale"><label>Scale UV</label><input type="range" min="0.1" max="8" step="0.05"/><input type="number" min="0.1" max="8" step="0.05"/><span class="seUnit">×</span></div>
          </div>

        </div>
      </div>

      <!-- ── Caméra — Parallaxe (curseur/tactile) ──────────────────────────
           Anciennement "Thème" : "Lueur fond" et "Vitesse rot." étaient du code mort
           (glow jamais appliqué, rotation auto désactivée) — remplacés par les réglages
           qui gouvernent réellement le déplacement de la caméra au passage du curseur /
           glissement tactile (cf. _tick() dans threejs-background.js). Master Scene uniquement. -->
      <div class="seTabPane seTabPane--hidden" id="sePane-theme">
        <div class="seSectionBody">
          <div class="seGroup">
            <span class="seGroupLabel">Intensité du déplacement</span>
            <div class="seRow" id="seRow-parallax-strengthX"><label>Horizontal</label><input type="range" min="0" max="3" step="0.01"/><input type="number" min="0" max="3" step="0.01"/></div>
            <div class="seRow" id="seRow-parallax-strengthY"><label>Vertical</label><input type="range" min="0" max="3" step="0.01"/><input type="number" min="0" max="3" step="0.01"/></div>
          </div>
          <div class="seGroup">
            <span class="seGroupLabel">Réactivité</span>
            <div class="seRow" id="seRow-parallax-mouseSmoothing"><label>Suivi curseur</label><input type="range" min="0.01" max="1" step="0.01"/><input type="number" min="0.01" max="1" step="0.01"/></div>
            <div class="seRow" id="seRow-parallax-cameraLerp"><label>Amort. caméra</label><input type="range" min="0.01" max="1" step="0.01"/><input type="number" min="0.01" max="1" step="0.01"/></div>
          </div>
        </div>
      </div>

      <!-- ── Env (Ground + Environnement + Logo) — Master Scene uniquement ─ -->
      <div class="seTabPane seTabPane--hidden" id="sePane-ground">
        <div class="seSectionBody">
          <div class="seGroup">
            <span class="seGroupLabel">Logo — Position</span>
            <div class="seRow" id="seRow-logo-posX"><label>X</label><input type="range" min="-5" max="5" step="0.05"/><input type="number" min="-5" max="5" step="0.05"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-logo-posY"><label>Y</label><input type="range" min="-5" max="5" step="0.05"/><input type="number" min="-5" max="5" step="0.05"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-logo-posZ"><label>Z</label><input type="range" min="-5" max="5" step="0.05"/><input type="number" min="-5" max="5" step="0.05"/><span class="seUnit">u</span></div>
          </div>
          <div class="seGroup">
            <span class="seGroupLabel">Logo — Rotation</span>
            <div class="seRow" id="seRow-logo-rotX"><label>X</label><input type="range" min="-3.14159" max="3.14159" step="0.01"/><input type="number" min="-3.14159" max="3.14159" step="0.01"/><span class="seUnit">rad</span></div>
            <div class="seRow" id="seRow-logo-rotY"><label>Y</label><input type="range" min="-3.14159" max="3.14159" step="0.01"/><input type="number" min="-3.14159" max="3.14159" step="0.01"/><span class="seUnit">rad</span></div>
            <div class="seRow" id="seRow-logo-rotZ"><label>Z</label><input type="range" min="-3.14159" max="3.14159" step="0.01"/><input type="number" min="-3.14159" max="3.14159" step="0.01"/><span class="seUnit">rad</span></div>
          </div>
          <div class="seGroup">
            <span class="seGroupLabel">Logo — Scale</span>
            <div class="seRow" id="seRow-logo-scale"><label>Scale</label><input type="range" min="0.01" max="20" step="0.01"/><input type="number" min="0.01" max="20" step="0.01"/><span class="seUnit">×</span></div>
          </div>
          <div class="seGroup">
            <span class="seGroupLabel">Logo Body</span>
            <div class="seRow seRowColor" id="seRow-logoBody-color"><label>Couleur</label><input type="color" /></div>
            <div class="seRow" id="seRow-logoBody-metalness"><label>Métal</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
            <div class="seRow" id="seRow-logoBody-roughness"><label>Rugosité</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
            <div class="seRow" id="seRow-logoBody-emissiveIntensity"><label>Emissive</label><input type="range" min="0" max="2" step="0.01"/><input type="number" min="0" max="2" step="0.01"/></div>
            <div class="seRow seRowColor" id="seRow-theme-wire"><label>Teinte émissive</label><input type="color" /></div>
            <div class="seRow seRowCheck" id="seRow-logoBody-castShadow"><label>Ombre projetée</label><input type="checkbox" /></div>
          </div>
          <div class="seGroup">
            <span class="seGroupLabel">Ground</span>
            <div class="seRow seRowColor" id="seRow-ground-color"><label>Couleur</label><input type="color" /></div>
            <div class="seRow" id="seRow-ground-metalness"><label>Métal</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
            <div class="seRow" id="seRow-ground-roughness"><label>Rugosité</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
            <!-- Échelle Ground+Dome, indépendante du scale du logo (seRow-logo-scale) —
                 les deux meshes "env" partagent cette même échelle car isDome/isGround
                 utilisent toutes deux _groundMat et sont traitées comme un même ensemble. -->
            <div class="seRow" id="seRow-ground-scale"><label>Échelle</label><input type="range" min="0.1" max="10" step="0.01"/><input type="number" min="0.1" max="10" step="0.01"/><span class="seUnit">×</span></div>
            <div class="seRow seRowCheck" id="seRow-ground-receiveShadow"><label>Ombre reçue</label><input type="checkbox" /></div>
          </div>
          <div class="seGroup">
            <span class="seGroupLabel">Environnement</span>
            <div class="seRow seRowCheck" id="seRow-environment-visible"><label>Visible</label><input type="checkbox" /></div>
            <div class="seRow seRowColor" id="seRow-renderer-clearColor"><label>Fond scène</label><input type="color" /></div>
          </div>
        </div>
      </div>

    </div><!-- /seTabPanes -->

    <!-- LIVE READ-OUT -->
    <div class="seReadout" id="seReadout">
      <span class="seReadoutLabel">Snapshot scène</span>
      <div class="btnMedium btnSmall" id="seCaptureBtn" title="Lire l'état courant de la scène"><div class="btnLabel"><span class="icon iconSearch"></span><span class="btnText">Lire</span></div></div>
      <pre class="seReadoutPre" id="seReadoutPre"></pre>
    </div>

  </div><!-- /seInspector -->
</div><!-- /sceneEditorContent -->
