<div class="sceneEditorContent" id="cntSCENEEDITOR">
  <h2 class="title titleTop sceneEditorTitle">
    <span>é</span><span>d</span><span>i</span><span>t</span><span>e</span><span>u</span><span>r</span>
    <span> </span>
    <span>s</span><span>c</span><span>è</span><span>n</span><span>e</span>
  </h2>

  <!-- ── Inspecteur (panneau droit) ───────────────────────────────────────── -->
  <div class="seInspector" id="seInspector">

    <!-- ── TOPBOX (chargement / gestion des états) ──────────────────────── -->
    <div class="seTopbox" id="seTopbox">
      <div class="seTopboxRow">
        <select class="seSelect" id="seStateSelect"></select>
        <input class="seInput" type="text" id="seStateLabelInput" placeholder="Nom" maxlength="60" />
      </div>
      <div class="seTopboxBtns">
        <div class="btnMedium btnSmall" id="seNewBtn"     title="Nouvel état"><div class="btnLabel"><span class="icon iconAdd"></span></div></div>
        <div class="btnMedium btnSmall btnOff" id="seSaveBtn" title="Sauvegarder"><div class="btnLabel"><span class="icon iconSave"></span></div></div>
        <div class="btnMedium btnSmall" id="seDeleteBtn"  title="Supprimer"><div class="btnLabel"><span class="icon iconDelete"></span></div></div>
        <div class="btnMedium btnSmall" id="sePreviewBtn" title="Appliquer à la scène"><div class="btnLabel"><span class="icon iconValid"></span></div></div>
      </div>
      <div class="seStateFeedback">
        <div class="seDirtyBadge" id="seDirtyBadge" style="display:none">● non sauvegardé</div>
        <div class="seStatusMsg"  id="seStatusMsg"></div>
      </div>
    </div>

    <!-- ── RENDERBOX (paramètres de rendu — collapsible) ────────────────── -->
    <div class="seRenderbox" id="seRenderbox">
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
      <button class="seTab seTab--active" data-tab="animation">Anim</button>
      <button class="seTab" data-tab="logo">Logo</button>
      <button class="seTab" data-tab="theme">Thème</button>
      <button class="seTab" data-tab="ground">Env</button>
    </div>

    <!-- ── TAB PANES ─────────────────────────────────────────────────────── -->
    <div class="seTabPanes" id="seTabPanes">

      <!-- ── Animation ──────────────────────────────────────────────────── -->
      <div class="seTabPane" id="sePane-animation">
        <div class="seSectionBody">

          <!-- Box état sélectionné -->
          <div class="seAnimStateBox" id="seAnimStateBox">
            <div class="seAnimStateBoxHeader">
              <span class="seAnimStateBoxLabel">État</span>
              <span class="seAnimStateBoxTitle" id="seAnimStateBoxTitle">—</span>
            </div>
            <div class="seAnimStateBoxBody">
              <div class="seRow" id="seRow-anim-duration">
                <label>Durée</label>
                <input type="range" min="0" max="30000" step="100"/>
                <input type="number" min="0" max="30000" step="100"/>
                <span class="seUnit">ms</span>
              </div>
              <div class="seAnimDurationHint" id="seAnimDurationHint">0 ms — état statique</div>
              <div id="seTimelineGroup" style="display:none">
                <div class="seAnimTimeline" id="seAnimTimeline"></div>
              </div>
              <div id="seSubStatesGroup" style="display:none">
                <div id="seSubStatesList"></div>
                <div style="display:flex;gap:0.4rem;margin-top:0.5rem">
                  <button class="seBtn" id="seAddSubStateBtn">+ Sous-état</button>
                </div>
              </div>
              <div class="seAnimControls" id="seAnimControls" style="display:none">
                <button class="seBtn" id="seAnimPlayBtn">▶ Lire</button>
                <button class="seBtn" id="seAnimStopBtn">■ Stop</button>
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
          <div class="seGroup">
            <span class="seGroupLabel">Caméra — Optique</span>
            <div class="seRow" id="seRow-camera-fov"><label>FOV</label><input type="range" min="10" max="120" step="1"/><input type="number" min="10" max="120" step="1"/><span class="seUnit">°</span></div>
            <div class="seRow" id="seRow-camera-near"><label>Near</label><input type="range" min="0.01" max="10" step="0.01"/><input type="number" min="0.01" max="10" step="0.01"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-camera-far"><label>Far</label><input type="range" min="50" max="2000" step="10"/><input type="number" min="50" max="2000" step="10"/><span class="seUnit">u</span></div>
          </div>

          <!-- Lumières -->
          <div class="seGroup">
            <span class="seGroupLabel">Lumière ambiante</span>
            <div class="seRow seRowColor" id="seRow-lights-ambient-color"><label>Couleur</label><input type="color" /></div>
            <div class="seRow" id="seRow-lights-ambient-intensity"><label>Intensité</label><input type="range" min="0" max="3" step="0.01"/><input type="number" min="0" max="3" step="0.01"/></div>
          </div>
          <div class="seGroup">
            <span class="seGroupLabel">Key Light (directionnelle)</span>
            <div class="seRow seRowColor" id="seRow-lights-key-color"><label>Couleur</label><input type="color" /></div>
            <div class="seRow" id="seRow-lights-key-intensity"><label>Intensité</label><input type="range" min="0" max="3" step="0.01"/><input type="number" min="0" max="3" step="0.01"/></div>
            <div class="seRow" id="seRow-lights-key-posX"><label>Pos X</label><input type="range" min="-15" max="15" step="0.1"/><input type="number" min="-15" max="15" step="0.1"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-lights-key-posY"><label>Pos Y</label><input type="range" min="-15" max="15" step="0.1"/><input type="number" min="-15" max="15" step="0.1"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-lights-key-posZ"><label>Pos Z</label><input type="range" min="-15" max="15" step="0.1"/><input type="number" min="-15" max="15" step="0.1"/><span class="seUnit">u</span></div>
            <div class="seRow seRowCheck" id="seRow-lights-key-castShadow"><label>Ombre projetée</label><input type="checkbox" /></div>
            <div class="seRow seRowCheck" id="seRow-lights-key-useLeadColor"><label>ColorMapLead</label><input type="checkbox" /></div>
            <div class="seRow" id="seRow-lights-key-leadColorPos"><label>Position</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
          </div>
          <div class="seGroup">
            <span class="seGroupLabel">Rim Light (contre-jour)</span>
            <div class="seRow seRowColor" id="seRow-lights-rim-color"><label>Couleur</label><input type="color" /></div>
            <div class="seRow" id="seRow-lights-rim-intensity"><label>Intensité</label><input type="range" min="0" max="3" step="0.01"/><input type="number" min="0" max="3" step="0.01"/></div>
            <div class="seRow" id="seRow-lights-rim-posX"><label>Pos X</label><input type="range" min="-15" max="15" step="0.1"/><input type="number" min="-15" max="15" step="0.1"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-lights-rim-posY"><label>Pos Y</label><input type="range" min="-15" max="15" step="0.1"/><input type="number" min="-15" max="15" step="0.1"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-lights-rim-posZ"><label>Pos Z</label><input type="range" min="-15" max="15" step="0.1"/><input type="number" min="-15" max="15" step="0.1"/><span class="seUnit">u</span></div>
            <div class="seRow seRowCheck" id="seRow-lights-rim-castShadow"><label>Ombre projetée</label><input type="checkbox" /></div>
            <div class="seRow seRowCheck" id="seRow-lights-rim-useLeadColor"><label>ColorMapLead</label><input type="checkbox" /></div>
            <div class="seRow" id="seRow-lights-rim-leadColorPos"><label>Position</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
          </div>
          <div class="seGroup">
            <span class="seGroupLabel">Point Light (mesh_light)</span>
            <div class="seRow" id="seRow-logoLight-lightIntensity"><label>Intensité</label><input type="range" min="0" max="10" step="0.1"/><input type="number" min="0" max="10" step="0.1"/></div>
            <div class="seRow" id="seRow-logoLight-lightRange"><label>Portée</label><input type="range" min="0" max="30" step="0.1"/><input type="number" min="0" max="30" step="0.1"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-logoLight-normalOffset"><label>Offset normal</label><input type="range" min="-2" max="4" step="0.05"/><input type="number" min="-2" max="4" step="0.05"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-logoLight-emissiveIntensity"><label>Émission mesh</label><input type="range" min="0" max="10" step="0.1"/><input type="number" min="0" max="10" step="0.1"/></div>
            <div class="seRow seRowCheck" id="seRow-logoLight-castShadow"><label>Ombre projetée</label><input type="checkbox" /></div>
            <div class="seRow seRowCheck" id="seRow-logoLight-useLeadColor"><label>ColorMapLead</label><input type="checkbox" /></div>
            <div class="seRow" id="seRow-logoLight-leadColorPos"><label>Position</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
          </div>
          <div class="seGroup">
            <span class="seGroupLabel">Teinte dynamique (suit le color map)</span>
            <div class="seRow" id="seRow-logoLight-rimTintBlend"><label>Rim Light</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
            <div class="seRow" id="seRow-logoLight-keyTintBlend"><label>Key Light</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
          </div>
          <div class="seGroup" id="seExtraLightsGroup">
            <span class="seGroupLabel">Lumières additionnelles</span>
            <div id="se-extraLights-list"></div>
            <div class="se-addLightRow">
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
            <div class="seRow" id="seRow-logoLight-texScale"><label>Scale UV</label><input type="range" min="0.1" max="8" step="0.05"/><input type="number" min="0.1" max="8" step="0.05"/><span class="seUnit">×</span></div>
          </div>

        </div>
      </div>

      <!-- ── Logo ──────────────────────────────────────────────────────── -->
      <div class="seTabPane seTabPane--hidden" id="sePane-logo">
        <div class="seSectionBody">
          <div class="seGroup">
            <span class="seGroupLabel">Position</span>
            <div class="seRow" id="seRow-logo-posX"><label>X</label><input type="range" min="-5" max="5" step="0.05"/><input type="number" min="-5" max="5" step="0.05"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-logo-posY"><label>Y</label><input type="range" min="-5" max="5" step="0.05"/><input type="number" min="-5" max="5" step="0.05"/><span class="seUnit">u</span></div>
            <div class="seRow" id="seRow-logo-posZ"><label>Z</label><input type="range" min="-5" max="5" step="0.05"/><input type="number" min="-5" max="5" step="0.05"/><span class="seUnit">u</span></div>
          </div>
          <div class="seGroup">
            <span class="seGroupLabel">Rotation</span>
            <div class="seRow" id="seRow-logo-rotX"><label>X</label><input type="range" min="-3.14159" max="3.14159" step="0.01"/><input type="number" min="-3.14159" max="3.14159" step="0.01"/><span class="seUnit">rad</span></div>
            <div class="seRow" id="seRow-logo-rotY"><label>Y</label><input type="range" min="-3.14159" max="3.14159" step="0.01"/><input type="number" min="-3.14159" max="3.14159" step="0.01"/><span class="seUnit">rad</span></div>
            <div class="seRow" id="seRow-logo-rotZ"><label>Z</label><input type="range" min="-3.14159" max="3.14159" step="0.01"/><input type="number" min="-3.14159" max="3.14159" step="0.01"/><span class="seUnit">rad</span></div>
          </div>
          <div class="seGroup">
            <span class="seGroupLabel">Scale</span>
            <div class="seRow" id="seRow-logo-scale"><label>Scale</label><input type="range" min="0.01" max="20" step="0.01"/><input type="number" min="0.01" max="20" step="0.01"/><span class="seUnit">×</span></div>
          </div>
          <div class="seGroup">
            <span class="seGroupLabel">Logo Body</span>
            <div class="seRow seRowColor" id="seRow-logoBody-color"><label>Couleur</label><input type="color" /></div>
            <div class="seRow" id="seRow-logoBody-metalness"><label>Métal</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
            <div class="seRow" id="seRow-logoBody-roughness"><label>Rugosité</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
            <div class="seRow" id="seRow-logoBody-emissiveIntensity"><label>Emissive</label><input type="range" min="0" max="2" step="0.01"/><input type="number" min="0" max="2" step="0.01"/></div>
            <div class="seRow seRowCheck" id="seRow-logoBody-castShadow"><label>Ombre projetée</label><input type="checkbox" /></div>
          </div>
        </div>
      </div>

      <!-- ── Thème ──────────────────────────────────────────────────────── -->
      <div class="seTabPane seTabPane--hidden" id="sePane-theme">
        <div class="seSectionBody">
          <div class="seRow seRowColor" id="seRow-theme-wire"><label>Couleur fil</label><input type="color" /></div>
          <div class="seRow seRowColor" id="seRow-theme-glow"><label>Lueur fond</label><input type="color" /></div>
          <div class="seRow" id="seRow-theme-speed"><label>Vitesse rot.</label><input type="range" min="0" max="0.015" step="0.0001"/><input type="number" min="0" max="0.015" step="0.0001"/><span class="seUnit">r/f</span></div>
        </div>
      </div>

      <!-- ── Ground + Environnement ─────────────────────────────────────── -->
      <div class="seTabPane seTabPane--hidden" id="sePane-ground">
        <div class="seSectionBody">
          <div class="seGroup">
            <span class="seGroupLabel">Ground</span>
            <div class="seRow seRowColor" id="seRow-ground-color"><label>Couleur</label><input type="color" /></div>
            <div class="seRow" id="seRow-ground-metalness"><label>Métal</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
            <div class="seRow" id="seRow-ground-roughness"><label>Rugosité</label><input type="range" min="0" max="1" step="0.01"/><input type="number" min="0" max="1" step="0.01"/></div>
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
