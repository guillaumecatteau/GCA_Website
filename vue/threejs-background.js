// ============================================================================
// GCA Background — Three.js interactive background
// Scène : logo 3D principal (MainScene.glb) + champ de particules
// Logo  : meshes dont le nom contient "light" → MeshBasicMaterial additif (lueur)
//         autres meshes                        → MeshStandardMaterial (métal + emissive)
// Groupe _logoGroup : position/rotation/scale partagés, animations en code
// Interactions : mouvement souris (parallaxe caméra + répulsion particules),
//                changement de page (transition couleur + impulsion burst)
// API publique  : window.GCABackground.init() / setPage(name) / dispose()
// ============================================================================
import * as THREE          from 'three';
import { GLTFLoader }      from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer }  from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }      from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass }      from 'three/addons/postprocessing/OutputPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass }       from 'three/addons/postprocessing/BokehPass.js';

// ─── Thèmes par page ─────────────────────────────────────────────────────────
const THEMES = {
  home:            { wire: '#666666', glow: '#1a1a2e', speed: 0.0018 },
  profile:         { wire: '#4fc3f7', glow: '#0d2137', speed: 0.0025 },
  games:           { wire: '#7c4dff', glow: '#1a0050', speed: 0.0040 },
  uxui:            { wire: '#00e5ff', glow: '#003d45', speed: 0.0025 },
  '3d':            { wire: '#ff6d00', glow: '#3e1200', speed: 0.0030 },
  '2d':            { wire: '#ff4081', glow: '#3e0020', speed: 0.0030 },
  video:           { wire: '#e040fb', glow: '#2a0045', speed: 0.0030 },
  web:             { wire: '#69f0ae', glow: '#003020', speed: 0.0025 },
  pixel:           { wire: '#ffd600', glow: '#3a2800', speed: 0.0030 },
  portfolio:       { wire: '#ffd740', glow: '#382500', speed: 0.0025 },
  blog:            { wire: '#90a4ae', glow: '#0d1b26', speed: 0.0018 },
  bio:             { wire: '#ffccbc', glow: '#3e1000', speed: 0.0018 },
  contact:         { wire: '#80deea', glow: '#003040', speed: 0.0025 },
  connexion:       { wire: '#ef9a9a', glow: '#3e0808', speed: 0.0025 },
  register:        { wire: '#a5d6a7', glow: '#073e10', speed: 0.0025 },
  userprofile:     { wire: '#4fc3f7', glow: '#0d2137', speed: 0.0025 },
  admintool:       { wire: '#ffa726', glow: '#3e1800', speed: 0.0040 },
  usersmanagement: { wire: '#ef9a9a', glow: '#3e0808', speed: 0.0030 },
};
const DEFAULT_THEME = { wire: '#555555', glow: '#0d0d1a', speed: 0.0018 };

// ─── Constantes physique ─────────────────────────────────────────────────────
const PARTICLE_COUNT  = 1800;
const SPRING_K        = 7.0;   // rappel vers origine
const DAMPING         = 0.82;  // amortissement vélocité
const MOUSE_RADIUS_DEFAULT = 2.5;  // rayon d'influence curseur par défaut
const BURST_FORCE_MIN = 2.0;
const BURST_FORCE_MAX = 5.0;

// ─── État interne ─────────────────────────────────────────────────────────────
let _renderer, _scene, _camera, _clock;
let _editorMode = false;  // true = gèle le parallaxe caméra et la rotation logo
let _cameraInitialized = false; // true après la première application d'état réel (téléportation garantie avant lerp)
let _ambientLight = null; // THREE.AmbientLight
let _keyLight     = null; // THREE.DirectionalLight — lumière principale
let _rimLight     = null; // THREE.DirectionalLight — contre-jour
let _logoPointLight = null; // THREE.PointLight — éclairage émis par LogoLight mesh
let _logoGroup  = null;  // THREE.Group — contient les meshes logo
let _bodyMat    = null;  // MeshStandardMaterial — LogoBody
let _lightMat   = null;  // MeshStandardMaterial emissive — LogoLight
let _groundMat  = null;  // MeshStandardMaterial — Ground
let _logoScale = 1;
let _logoScaleMult = 1;
const _lookAtOffset  = new THREE.Vector3(0, 0, 0);
// Position de base de la caméra (sans parallaxe). Le parallaxe souris s'ajoute par-dessus.
const _cameraBasePos = new THREE.Vector3(0, 0, 6);
// FOV cible — lerp vers cette valeur chaque frame pour éviter les sauts visuels.
let _targetFov = 60;
// Stops de gradient pour LogoLight (array de THREE.Color, N couleurs animées en boucle)
let _lightGradientStops = [
  new THREE.Color(0x4488ff),
  new THREE.Color(0xaa44ff),
  new THREE.Color(0xff6644),
];
let   _lightGradientSpeed = 0.5; // cycles/s
let   _lightEmissiveIntensity = 2.0;
let   _lightLightIntensity    = 1.5;
let   _lightLightRange        = 8.0;
let   _lightRimTintBlend      = 0.0; // 0 = couleur statique, 1 = suit le gradient
let   _lightKeyTintBlend      = 0.0;
const _rimLightBaseColor      = new THREE.Color(0x3366ff); // miroir de _rimLight.color
const _keyLightBaseColor      = new THREE.Color(0xffffff); // miroir de _keyLight.color
// Tableaux de références meshes (pour modifier params post-chargement)
const _logoBodyMeshes  = [];
const _logoLightMeshes = [];
const _groundMeshes    = [];
const _envTopObjects   = []; // top-level env objects (visibilité)
let _pointCloud;
let _pos, _orig, _vel;
let _life, _maxLife, _orbitAngle, _orbitRadius, _orbitHeight, _orbitSpeed, _turbPhase, _alpha;
// — Params particules
let _partCount        = PARTICLE_COUNT; // peut être modifié via l'éditeur
let _partOrbitSpeed   = 0.3;    // rad/s rotation globale
let _partOrbitCurve   = 1.0;    // exposant distance→vitesse (1=linéaire, >1=centre+ rapide)
let _partTurbulence   = 0.15;   // amplitude de bruit de trajectoire
let _partLifeMin      = 5.0;
let _partLifeMax      = 15.0;
let _partColorNear    = new THREE.Color(0x888888);
let _partColorFar     = new THREE.Color(0x1a2244);
let _partColorMaxDist = 9.0;
let _mouseInfluence   = 0.7;   // force d'entraînement 0–1
let _mouseRadius      = 2.5;   // rayon d'influence curseur XZ (unités monde)
let _mouseDepth       = 4.0;   // distance caméra max pour l'interaction (0 = désactivé = toutes)
let _raf = null;
// — Post-processing
let _composer    = null;
let _bokehPass   = null;
let _bloomPass   = null;
// — Post-processing : Bloom
let _bloomEnabled   = true;
let _bloomThreshold = 0.25;
let _bloomStrength  = 1.2;
let _bloomRadius    = 0.5;
let _toneMappingExposure = 1.0;
// — Texture gradient UV pour mesh_light
let _lightTex           = null;
let _lightTexOffset     = 0;
let _lightTexScale      = 1.0;    // facteur d'échelle UV (1 = normal, >1 = gradient élargi)
let _lightLocalNormal   = null;   // normale moyenne de mesh_light en espace local (calculée une fois)
let _lightNormalOffset  = 0.4;    // décalage du PointLight le long de la normale (unités monde)
const _lightWorldNormal  = new THREE.Vector3();
const _lightNormalMatrix = new THREE.Matrix3();
// — Depth of Field
let _dofEnabled  = false;
let _dofFocus    = 3.5;
let _dofAperture = 0.003;
let _dofMaxblur  = 0.02;
// — Paramètres ombres
let _shadowKeyRes    = 1024;
let _shadowKeyRadius = 1;
let _shadowPtRes     = 512;
let _shadowPtRadius  = 1;
// — État en attente (appliqué après chargement GLB pour les propriétés mesh-dépendantes)
let _pendingState = null;
let _glbLoaded    = false;
// — Réflexions temps réel (CubeCamera)
let _reflEnabled         = false;
let _reflResolution      = 128;
let _reflBodyIntensity   = 0.3;
let _reflGroundIntensity = 0.5;
let _reflUpdateEvery     = 3;
let _reflFrameCount      = 0;
let _cubeCamera          = null;
let _envMapTarget        = null;
// — Lumières dynamiques (ajoutées via l'éditeur)
let _dynamicLights = []; // Array of { id, type, light }

// ─── ColorMapLead — gradient maître permanent ─────────────────────────────────
// Le ColorMapLead est LE gradient actif à l'instant t.
// Pendant les transitions inter-états, il lerpe de l'ancien vers le nouveau gradient.
// Chaque lumière peut y "prélever" une couleur à une position fixe (0–1).
let _colorMapLeadStops = [
  new THREE.Color(0x4488ff),
  new THREE.Color(0xaa44ff),
  new THREE.Color(0xff6644),
]; // initialisé identique à logoLight; mis à jour par applyEditorState / transitions

// Durée (ms) de la transition ColorMapLead lors d'un changement d'état
let _cmlTransitionDuration = 800;
let _cmlTransitionT        = 1.0;   // 0 = début transition, 1 = terminée
let _cmlFrom               = [];    // stops source
let _cmlTo                 = [];    // stops cible

/** Échantillonne le ColorMapLead à la position t ∈ [0,1] et stocke dans `out`. */
function _sampleColorMapLead(t, out) {
  const stops = _colorMapLeadStops;
  const n = stops.length;
  if (n === 0) { out.set(0xffffff); return out; }
  if (n === 1) { out.copy(stops[0]); return out; }
  const seg = Math.max(0, Math.min(1, t)) * (n - 1);
  const i   = Math.min(Math.floor(seg), n - 2);
  out.lerpColors(stops[i], stops[i + 1], seg - i);
  return out;
}

/** Lance une transition du ColorMapLead vers de nouveaux stops. */
function _startCMLTransition(toStops, durationMs) {
  _cmlFrom = _colorMapLeadStops.map(c => c.clone());
  _cmlTo   = toStops.map(c => c.clone());
  _cmlTransitionT = 0;
  _cmlTransitionDuration = durationMs ?? 800;
}

/** Met à jour la transition ColorMapLead chaque frame (dt en secondes). */
function _tickCMLTransition(dt) {
  if (_cmlTransitionT >= 1.0 || _cmlFrom.length === 0 || _cmlTo.length === 0) return;
  _cmlTransitionT = Math.min(1.0, _cmlTransitionT + dt / (_cmlTransitionDuration / 1000));
  const t = _cmlTransitionT;
  // Lerp chaque stop ; si longueurs différentes, on clampe sur la plus courte
  const n = Math.max(_cmlFrom.length, _cmlTo.length);
  _colorMapLeadStops = [];
  for (let i = 0; i < n; i++) {
    const a = _cmlFrom[Math.min(i, _cmlFrom.length - 1)];
    const b = _cmlTo  [Math.min(i, _cmlTo.length   - 1)];
    _colorMapLeadStops.push(new THREE.Color().lerpColors(a, b, t));
  }
  // Sync avec logoLight si la transition est terminée
  if (_cmlTransitionT >= 1.0) {
    _colorMapLeadStops = _cmlTo.map(c => c.clone());
    _lightGradientStops = _colorMapLeadStops.map(c => c.clone());
    _buildLightTexture();
  }
}

// État "useLeadColor" et "leadColorPos" pour les lumières fixes (key, rim)
let _keyLightLeadColor  = false;
let _keyLightLeadPos    = 0.0;
let _rimLightLeadColor  = false;
let _rimLightLeadPos    = 0.0;
let _ptLightLeadColor   = false;
let _ptLightLeadPos     = 0.5;

const _mouse       = new THREE.Vector2(0, 0);  // position lissée
const _rawMouse    = new THREE.Vector2(0, 0);  // position brute
const _curWire     = new THREE.Color(DEFAULT_THEME.wire);
const _tgtWire     = new THREE.Color(DEFAULT_THEME.wire);
const _curGlow     = new THREE.Color(DEFAULT_THEME.glow);
const _tgtGlow     = new THREE.Color(DEFAULT_THEME.glow);
let   _curSpeed    = DEFAULT_THEME.speed;
let   _tgtSpeed    = DEFAULT_THEME.speed;

// Pulse wireframe lors d'un changement de page
let _pulseT     = 0;
let _pulsing    = false;

// ─── Shaders particules (éclairées, orbit, lifespan, couleur par distance) ────────
const _PART_VERT = /* glsl */`
  attribute float aAlpha;
  uniform float uSize;
  uniform float uViewportHeight; // hauteur canvas en pixels physiques
  varying vec3  vWorldPos;
  varying float vAlpha;
  void main() {
    vec4 mvPos   = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * projectionMatrix[1][1] * uViewportHeight * 0.5 / (-mvPos.z);
    vWorldPos    = (modelMatrix * vec4(position, 1.0)).xyz;
    vAlpha       = aAlpha;
    gl_Position  = projectionMatrix * mvPos;
  }
`;
const _PART_FRAG = /* glsl */`
  uniform vec3  uColorNear;
  uniform vec3  uColorFar;
  uniform float uColorMaxDist;
  uniform float uBaseOpacity;
  uniform vec3  uAmbientColor;
  uniform float uAmbientIntensity;
  uniform vec3  uKeyLightColor;
  uniform float uKeyLightIntensity;
  uniform vec3  uPointLightPos;
  uniform vec3  uPointLightColor;
  uniform float uPointLightIntensity;
  uniform float uPointLightRange;
  varying vec3  vWorldPos;
  varying float vAlpha;
  void main() {
    vec2  uv   = gl_PointCoord - 0.5;
    if (length(uv) > 0.5) discard;
    float disc = 1.0 - smoothstep(0.3, 0.5, length(uv));
    float dist = length(vWorldPos);
    float t    = clamp(dist / max(uColorMaxDist, 0.001), 0.0, 1.0);
    vec3  col  = mix(uColorNear, uColorFar, t);
    vec3  ambient  = uAmbientColor * uAmbientIntensity;
    vec3  keyLight = uKeyLightColor * uKeyLightIntensity * 0.25;
    float d   = length(uPointLightPos - vWorldPos);
    float att = max(0.0, 1.0 - d / max(uPointLightRange, 0.001));
    att = att * att;
    vec3 ptLight = uPointLightColor * uPointLightIntensity * att * 0.5;
    gl_FragColor = vec4(col * (ambient + keyLight + ptLight), uBaseOpacity * vAlpha * disc);
  }
`;

// ─── Lumières dynamiques — helpers ───────────────────────────────────────────
function _createExtraLight(data) {
  const color     = new THREE.Color(data.color || '#ffffff');
  const intensity = data.intensity ?? 1.0;
  switch (data.type) {
    case 'AmbientLight':
      return new THREE.AmbientLight(color, intensity);
    case 'DirectionalLight': {
      const l = new THREE.DirectionalLight(color, intensity);
      l.position.set(data.posX ?? 3, data.posY ?? 4, data.posZ ?? 2);
      return l;
    }
    case 'PointLight': {
      const l = new THREE.PointLight(color, intensity, data.distance ?? 10, data.decay ?? 2);
      l.position.set(data.posX ?? 0, data.posY ?? 2, data.posZ ?? 0);
      return l;
    }
    case 'SpotLight': {
      const l = new THREE.SpotLight(color, intensity, data.distance ?? 10, data.angle ?? 0.5236, data.penumbra ?? 0.1, data.decay ?? 2);
      l.position.set(data.posX ?? 0, data.posY ?? 3, data.posZ ?? 0);
      return l;
    }
    case 'HemisphereLight': {
      return new THREE.HemisphereLight(
        new THREE.Color(data.skyColor    || '#0088ff'),
        new THREE.Color(data.groundColor || '#552200'),
        intensity
      );
    }
    case 'RectAreaLight': {
      const l = new THREE.RectAreaLight(color, intensity, data.width ?? 2, data.height ?? 2);
      l.position.set(data.posX ?? 0, data.posY ?? 2, data.posZ ?? 0);
      l.lookAt(0, 0, 0);
      return l;
    }
    default: return null;
  }
}

function _updateExtraLight(light, data) {
  if (data.visible !== undefined) light.visible = data.visible;
  if (data.type === 'HemisphereLight') {
    if (data.skyColor    !== undefined) light.color.set(data.skyColor);
    if (data.groundColor !== undefined) light.groundColor.set(data.groundColor);
    if (data.intensity   !== undefined) light.intensity = data.intensity;
    return;
  }
  if (data.color     !== undefined) light.color.set(data.color);
  if (data.intensity !== undefined) light.intensity = data.intensity;
  if (light.isDirectionalLight || light.isPointLight || light.isSpotLight) {
    if (data.posX !== undefined) light.position.set(data.posX, data.posY ?? light.position.y, data.posZ ?? light.position.z);
  }
  if (light.isPointLight || light.isSpotLight) {
    if (data.distance !== undefined) light.distance = data.distance;
    if (data.decay    !== undefined) light.decay    = data.decay;
  }
  if (light.isSpotLight) {
    if (data.angle    !== undefined) light.angle    = data.angle;
    if (data.penumbra !== undefined) light.penumbra = data.penumbra;
  }
  if (light.isRectAreaLight) {
    if (data.width  !== undefined) light.width  = data.width;
    if (data.height !== undefined) light.height = data.height;
    if (data.posX   !== undefined) light.position.set(data.posX, data.posY ?? light.position.y, data.posZ ?? light.position.z);
  }
  const noShadow = light.isAmbientLight || light.isHemisphereLight || light.isRectAreaLight;
  if (!noShadow && data.castShadow !== undefined) {
    const prev = light.castShadow;
    light.castShadow = !!data.castShadow;
    if (light.castShadow && !prev) {
      // Configure la shadow map lors de la première activation
      light.shadow.mapSize.width  = 512;
      light.shadow.mapSize.height = 512;
      if (light.shadow.map) { light.shadow.map.dispose(); light.shadow.map = null; }
      if (light.isSpotLight) {
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far  = light.distance > 0 ? light.distance : 50;
        light.shadow.camera.updateProjectionMatrix();
      }
      if (light.isPointLight) {
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far  = light.distance > 0 ? light.distance : 50;
      }
    }
  }
}

function _syncExtraLights(extraLightsData) {
  if (!_scene) return;
  const incoming = Array.isArray(extraLightsData) ? extraLightsData : [];
  const incomingIds = new Set(incoming.map(d => d.id));
  // Supprimer les lumières retirées
  _dynamicLights.filter(e => !incomingIds.has(e.id)).forEach(e => _scene.remove(e.light));
  _dynamicLights = _dynamicLights.filter(e => incomingIds.has(e.id));
  // Créer ou mettre à jour
  incoming.forEach(data => {
    let entry = _dynamicLights.find(e => e.id === data.id);
    if (!entry) {
      const light = _createExtraLight(data);
      if (!light) return;
      _scene.add(light);
      entry = { id: data.id, type: data.type, light, data: {} };
      _dynamicLights.push(entry);
    }
    _updateExtraLight(entry.light, data);
    entry.data = { ...data }; // mise à jour des métadonnées (useLeadColor, leadColorPos…)
  });
}

// ─── Initialisation ───────────────────────────────────────────────────────────
function init() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas || _renderer) return;   // idempotent

  // — Renderer
  _renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  _renderer.setSize(window.innerWidth, window.innerHeight);
  _renderer.setClearColor(0x040508, 1);
  _renderer.shadowMap.enabled = true;
  _renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
  _renderer.toneMapping        = THREE.ReinhardToneMapping;
  _renderer.toneMappingExposure = _toneMappingExposure;

  // — Scene + Camera
  _scene  = new THREE.Scene();
  _camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
  _camera.position.copy(_cameraBasePos);
  _clock  = new THREE.Clock();

  // — Éclairage (requis par MeshStandardMaterial)
  _ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
  _scene.add(_ambientLight);
  _keyLight = new THREE.DirectionalLight(0xffffff, 0.90);
  _keyLight.position.set(3, 4, 5);
  _keyLight.castShadow = true;
  _keyLight.shadow.mapSize.width  = 1024;
  _keyLight.shadow.mapSize.height = 1024;
  _keyLight.shadow.camera.near = 0.5;
  _keyLight.shadow.camera.far  = 50;
  _scene.add(_keyLight);
  _rimLight = new THREE.DirectionalLight(0x3366ff, 0.35);
  _rimLight.position.set(-4, -2, -3);
  _scene.add(_rimLight);

  // — Matériaux logo
  //   Corps : métal sombre avec emissive pilotée par la couleur de thème
  _bodyMat = new THREE.MeshStandardMaterial({
    color:             0x0a0a14,
    metalness:         0.75,
    roughness:         0.30,
    emissive:          new THREE.Color(_curWire),
    emissiveIntensity: 0.22,
  });
  //   Lumières : emissive fort + couleur gradient (opaque)
  _lightMat = new THREE.MeshStandardMaterial({
    color:             new THREE.Color(_lightGradientStops[0]),
    emissive:          new THREE.Color(_lightGradientStops[0]),
    emissiveIntensity: _lightEmissiveIntensity,
  });
  //   Sol : matériau standard recevant les ombres
  _groundMat = new THREE.MeshStandardMaterial({
    color:     0x111122,
    metalness: 0.0,
    roughness: 0.85,
  });

  // — PointLight attaché au groupe logo (luminosité générée par LogoLight)
  _logoPointLight = new THREE.PointLight(new THREE.Color(_lightGradientStops[0]), _lightLightIntensity, _lightLightRange);
  _logoPointLight.castShadow = true;
  _logoPointLight.shadow.mapSize.width  = 512;
  _logoPointLight.shadow.mapSize.height = 512;
  _scene.add(_logoPointLight);

  // — Groupe logo (masqué jusqu'au chargement complet des FBX)
  _logoGroup = new THREE.Group();
  _logoGroup.visible = false;
  _scene.add(_logoGroup);
  _loadGLTFScene();

  // — Champ de particules d'ambiance
  _buildParticles();

  // — Événements
  window.addEventListener('mousemove', _onMouseMove, { passive: true });
  window.addEventListener('touchmove', _onTouchMove, { passive: true });
  window.addEventListener('resize',    _onResize,    { passive: true });

  // — EffectComposer : RenderPass → UnrealBloom → BokehPass → OutputPass
  _composer = new EffectComposer(_renderer);
  _composer.addPass(new RenderPass(_scene, _camera));

  _bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    _bloomStrength, _bloomRadius, _bloomThreshold
  );
  _bloomPass.enabled = _bloomEnabled;
  _composer.addPass(_bloomPass);

  _bokehPass = new BokehPass(_scene, _camera, {
    focus: _dofFocus, aperture: _dofAperture, maxblur: _dofMaxblur,
  });
  _bokehPass.enabled = _dofEnabled;
  _composer.addPass(_bokehPass);

  _composer.addPass(new OutputPass());

  // — Texture gradient pour mesh_light
  _buildLightTexture();

  // — Appliquer l'état Home par défaut (async, non-bloquant)
  (async () => {
    try {
      const r = await fetch('?action=scene_states');
      const j = await r.json();
      if (j.success && j.states?.home) {
        _pendingState = j.states.home;   // mémorisé pour ré-application après GLB
        applyEditorState(_pendingState);
      }
    } catch (_) {}
  })();

  _tick();
}
// ─── Texture gradient UV pour mesh_light ─────────────────────────────────────────
function _buildLightTexture() {
  const h      = 256;
  const canvas = document.createElement('canvas');
  canvas.width = 2; canvas.height = h;
  const ctx  = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  const n    = _lightGradientStops.length;
  _lightGradientStops.forEach((c, i) => {
    // getHexString('srgb') → renvoie le hex en espace sRGB (canvas 2D est sRGB)
    // Disponible Three.js r155+. Évite la double-linéarisation.
    const hexSrgb = c.getHexString('srgb');
    grad.addColorStop(i / Math.max(n - 1, 1), '#' + hexSrgb);
  });
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2, h);
  _lightTex?.dispose();
  _lightTex = new THREE.CanvasTexture(canvas);
  _lightTex.colorSpace  = THREE.SRGBColorSpace; // canvas est sRGB, Three.js convertira linéaire→sRGB correctement
  _lightTex.wrapS       = THREE.ClampToEdgeWrapping;
  _lightTex.wrapT       = THREE.RepeatWrapping;
  _lightTex.repeat.set(1, 1 / Math.max(_lightTexScale, 0.01));
  _lightTex.needsUpdate = true;
  if (_lightMat) {
    _lightMat.map         = _lightTex;
    _lightMat.emissiveMap = _lightTex;
    _lightMat.color.set(0xffffff);
    _lightMat.emissive.set(0xffffff);
    _lightMat.needsUpdate = true;
  }
}
// ─── Chargement de la scène glTF principale ───────────────────────────────────
function _loadGLTFScene() {
  const loader = new GLTFLoader();

  loader.load(
    'vue/assets/meshes/MainScene.glb',
    (gltf) => {
      const root = gltf.scene;

      // ── Centrer la scène complète sur l'origine ─────────────────────────
      const fullBox = new THREE.Box3().setFromObject(root);
      const center  = new THREE.Vector3();
      fullBox.getCenter(center);
      root.position.sub(center);
      root.updateMatrixWorld(true);

      // ── Log des noms de meshes (diagnostic) ────────────────────────────
      const meshNames = [];
      root.traverse(child => { if (child.isMesh) meshNames.push(child.name); });
      console.log('[GCABackground] Meshes dans la scène :', meshNames);

      // ── Classification + matériaux par nom ──────────────────────────────
      // LogoBody  → _bodyMat, castShadow, reparenté dans _logoGroup
      // LogoLight → _lightMat emissive, reparenté dans _logoGroup
      // Ground    → _groundMat, receiveShadow, reste dans root/_scene
      // tout le reste → env, reste dans root/_scene
      root.traverse(child => {
        if (!child.isMesh) return;
        child.castShadow    = false;
        child.receiveShadow = false;
        child.frustumCulled = false;

        const isLogoBody  = /LogoBody|mesh_Logo/i.test(child.name);
        const isLogoLight = /LogoLight|mesh_light/i.test(child.name);
        const isGround    = /^Ground$/i.test(child.name);
        const isDome      = /dome/i.test(child.name);

        if (isLogoBody) {
          child.material   = _bodyMat;
          child.castShadow = true;
          _logoBodyMeshes.push(child);
        } else if (isLogoLight) {
          child.material = _lightMat;
          _logoLightMeshes.push(child);
          // Calculer la normale moyenne (espace local) une seule fois au chargement
          if (!_lightLocalNormal) _lightLocalNormal = _computeAverageNormal(child);
        } else if (isDome) {
          child.material      = _groundMat;
          child.receiveShadow = true;
          child.visible       = true;
          // Forcer la visibilité de toute la chaîne parente jusqu'à root
          let p = child.parent;
          while (p && p !== root) { p.visible = true; p = p.parent; }
          _groundMeshes.push(child);
        } else if (isGround) {
          child.material      = _groundMat;
          child.receiveShadow = true;
          _groundMeshes.push(child);
        } else {
          child.material = _bodyMat; // env : même matériau que le corps
          // Collecter les top-level env pour la visibilité
          let topObj = child;
          while (topObj.parent && topObj.parent !== root) topObj = topObj.parent;
          if (!_envTopObjects.includes(topObj)) _envTopObjects.push(topObj);
        }
      });

      // ── root dans _scene (ground + env restent fixes) ───────────────────
      _scene.add(root);

      // ── Reparenter chaque mesh logo directement dans _logoGroup ─────────
      // On attache les meshes eux-mêmes (pas leur topObj) pour garantir
      // que LogoBody ET LogoLight bougent ensemble quelle que soit la
      // hiérarchie du GLB.
      _logoBodyMeshes.forEach(mesh  => _logoGroup.attach(mesh));
      _logoLightMeshes.forEach(mesh => _logoGroup.attach(mesh));

      console.log('[GCABackground]',
        _logoBodyMeshes.length, 'LogoBody |',
        _logoLightMeshes.length, 'LogoLight |',
        _groundMeshes.length, 'ground |',
        _envTopObjects.length, 'env');

      // ── PointLight au centre du logoGroup ──────────────────────────────
      if (_logoPointLight) _logoPointLight.position.copy(_logoGroup.position);

      // ── Auto-scale basé sur la bbox logo seul ──────────────────────────
      const logoBox  = (_logoBodyMeshes.length + _logoLightMeshes.length) > 0
        ? new THREE.Box3().setFromObject(_logoGroup)
        : fullBox;
      const logoSize = new THREE.Vector3();
      logoBox.getSize(logoSize);
      const maxDim = Math.max(logoSize.x, logoSize.y, logoSize.z);
      _logoScale = maxDim > 0 ? 3.0 / maxDim : 1;

      _logoGroup.scale.setScalar(_logoScale * _logoScaleMult);
      _logoGroup.visible = true;

      // — Appliquer l'état en attente (mémo avant GLB) pour les réglages mesh-dépendants
      _glbLoaded = true;
      if (_pendingState) applyEditorState(_pendingState);
    },
    undefined,
    err => console.error('[GCABackground] Erreur chargement MainScene.glb :', err)
  );
}

// ─── Spawn / respawn d'une particule ─────────────────────────────────────────
function _respawnParticle(i) {
  const i3  = i * 3;
  const θ   = Math.random() * Math.PI * 2;
  const r   = 2.5 + Math.random() * 6.5;
  const oy  = (Math.random() * 2 - 0.5) * 8;
  _orbitAngle[i]  = θ;
  _orbitRadius[i] = r;
  _orbitHeight[i] = oy;
  const rNorm = (r - 2.5) / 6.5;
  _orbitSpeed[i]  = (0.3 + Math.random() * 0.7) * Math.pow(1.0 - rNorm * 0.85, _partOrbitCurve);
  _turbPhase[i]   = Math.random() * Math.PI * 2;
  // turbY calculé avec le temps ACTUEL pour que la position de départ
  // soit cohérente avec la cible de la première frame (évite le saut au spawn)
  const T     = _clock ? _clock.elapsedTime : 0;
  const turbY = _partTurbulence > 0 ? _partTurbulence * r * 0.3 * Math.sin(T * 0.04 + _turbPhase[i]) : 0;
  const ox = r * Math.cos(θ);
  const oz = r * Math.sin(θ);
  _orig[i3]   = ox; _orig[i3+1] = oy + turbY; _orig[i3+2] = oz;
  // Spawn exactement sur l'orbite — aucun offset aléatoire
  // (la variation naturelle vient des angles/hauteurs/rayons différents entre particules)
  _pos[i3]    = ox;
  _pos[i3+1]  = oy + turbY;
  _pos[i3+2]  = oz;
  _vel[i3] = _vel[i3+1] = _vel[i3+2] = 0;
  _life[i]    = 0;
  _maxLife[i] = _partLifeMin + Math.random() * (_partLifeMax - _partLifeMin);
  _alpha[i]   = 0;
}

// ─── Calcul de la normale moyenne d'un mesh (espace local) ──────────────────
function _computeAverageNormal(mesh) {
  const nAttr = mesh.geometry.attributes.normal;
  if (!nAttr || nAttr.count === 0) return new THREE.Vector3(0, 0, 1);
  const avg = new THREE.Vector3();
  for (let i = 0; i < nAttr.count; i++) {
    avg.x += nAttr.getX(i);
    avg.y += nAttr.getY(i);
    avg.z += nAttr.getZ(i);
  }
  return avg.normalize();
}

// ─── Réflexions temps réel (CubeCamera) ──────────────────────────────────────
function _ensureCubeCamera() {
  if (_cubeCamera) return;
  _envMapTarget = new THREE.WebGLCubeRenderTarget(_reflResolution, {
    type: THREE.HalfFloatType, generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
  });
  _cubeCamera = new THREE.CubeCamera(0.1, 500, _envMapTarget);
  _cubeCamera.position.set(0, 0.2, 0);
  _scene.add(_cubeCamera);
}
function _destroyCubeCamera() {
  if (_cubeCamera) { _scene.remove(_cubeCamera); _cubeCamera = null; }
  if (_envMapTarget) { _envMapTarget.dispose(); _envMapTarget = null; }
}
function _setReflections(enabled, resolutionChanged) {
  if (enabled) {
    if (resolutionChanged) _destroyCubeCamera();
    _ensureCubeCamera();
    if (_bodyMat)   { _bodyMat.envMap   = _envMapTarget.texture; _bodyMat.envMapIntensity   = _reflBodyIntensity;   _bodyMat.needsUpdate   = true; }
    if (_groundMat) { _groundMat.envMap = _envMapTarget.texture; _groundMat.envMapIntensity = _reflGroundIntensity; _groundMat.needsUpdate = true; }
  } else {
    if (_bodyMat)   { _bodyMat.envMap   = null; _bodyMat.needsUpdate   = true; }
    if (_groundMat) { _groundMat.envMap = null; _groundMat.needsUpdate = true; }
    _destroyCubeCamera();
  }
}

// ─── Construction des particules ─────────────────────────────────────────────
function _buildParticles() {
  const n    = _partCount;
  _pos        = new Float32Array(n * 3);
  _orig       = new Float32Array(n * 3);
  _vel        = new Float32Array(n * 3);
  _life       = new Float32Array(n);
  _maxLife    = new Float32Array(n);
  _orbitAngle = new Float32Array(n);
  _orbitRadius= new Float32Array(n);
  _orbitHeight= new Float32Array(n);
  _orbitSpeed = new Float32Array(n);
  _turbPhase  = new Float32Array(n);
  _alpha      = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    _respawnParticle(i);
    _life[i] = Math.random() * _maxLife[i];
    const t  = _life[i] / _maxLife[i];
    _alpha[i] = Math.min(t / 0.15, 1.0, (1.0 - t) / 0.15);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(_pos,   3));
  geo.setAttribute('aAlpha',   new THREE.BufferAttribute(_alpha, 1));

  _pointCloud = new THREE.Points(geo, new THREE.ShaderMaterial({
    vertexShader:   _PART_VERT,
    fragmentShader: _PART_FRAG,
    uniforms: {
      uSize:                { value: 0.03 },
      uViewportHeight:      { value: window.innerHeight * Math.min(window.devicePixelRatio, 1.5) },
      uColorNear:           { value: new THREE.Color(_partColorNear) },
      uColorFar:            { value: new THREE.Color(_partColorFar)  },
      uColorMaxDist:        { value: _partColorMaxDist },
      uBaseOpacity:         { value: 0.8 },
      uAmbientColor:        { value: new THREE.Color(1, 1, 1) },
      uAmbientIntensity:    { value: 0.45 },
      uKeyLightColor:       { value: new THREE.Color(1, 1, 1) },
      uKeyLightIntensity:   { value: 0.9 },
      uPointLightPos:       { value: new THREE.Vector3(0, 0, 0) },
      uPointLightColor:     { value: new THREE.Color(0x4488ff) },
      uPointLightIntensity: { value: 1.5 },
      uPointLightRange:     { value: 8.0 },
    },
    transparent: true,
    depthWrite: false,
  }));
  _scene.add(_pointCloud);
}

// Recrée les particules (nouveau count ou params structurels)
function _rebuildParticles() {
  if (_pointCloud) { _scene.remove(_pointCloud); _pointCloud.geometry.dispose(); _pointCloud.material.dispose(); _pointCloud = null; }
  _buildParticles();
}

// ─── Boucle de rendu ──────────────────────────────────────────────────────────
function _tick() {
  _raf = requestAnimationFrame(_tick);
  const dt = Math.min(_clock.getDelta(), 0.05);

  // Transition ColorMapLead
  _tickCMLTransition(dt);

  // Lissage souris → parallaxe caméra (désactivé en mode éditeur)
  // La caméra cible un point fixe dans la scène (_lookAtOffset)
  // Le logo (meshes) peut être déplacé indépendamment sans affecter la caméra
  const _lookAtTarget = new THREE.Vector3().copy(_lookAtOffset);

  if (!_editorMode) {
    _mouse.lerp(_rawMouse, 0.06);
    // Parallaxe = offset relatif à la position de base sauvegardée
    const targetX = _cameraBasePos.x + _mouse.x * 0.7;
    const targetY = Math.max(0.05, _cameraBasePos.y + _mouse.y * 0.45); // jamais sous le sol
    _camera.position.x += (targetX - _camera.position.x) * 0.04;
    _camera.position.y += (targetY - _camera.position.y) * 0.04;
    // Z : lerp comme X/Y pour éviter le saut quand _cameraBasePos.z change
    _camera.position.z += (_cameraBasePos.z - _camera.position.z) * 0.04;
  }
  // FOV : transition douce vers _targetFov (évite le zoom soudain au chargement/login)
  if (Math.abs(_camera.fov - _targetFov) > 0.01) {
    _camera.fov += (_targetFov - _camera.fov) * 0.04;
    _camera.updateProjectionMatrix();
  }
  _camera.lookAt(_lookAtTarget);

  // Transition de vitesse et couleurs
  _curSpeed += (_tgtSpeed - _curSpeed) * 0.02;
  _curWire.lerp(_tgtWire, 0.025);
  _curGlow.lerp(_tgtGlow, 0.025);

  // Mise à jour matériaux logo (emissive body + couleur light)
  if (_bodyMat)  _bodyMat.emissive.copy(_curWire);

  // Animation gradient LogoLight (toujours actif, y compris en éditeur)
  if (_logoPointLight && _lightGradientStops.length > 0) {
    // Scroll de la texture gradient pour un vrai dégradé UV animé
    if (_lightTex && _lightGradientSpeed > 0) {
      _lightTexOffset = (_lightTexOffset + dt * _lightGradientSpeed * 0.3) % 1.0;
      _lightTex.offset.y = _lightTexOffset;
    }
    // Couleur PointLight = sample du gradient à l'offset courant
    const n = _lightGradientStops.length;
    if (n === 1) {
      _logoPointLight.color.copy(_lightGradientStops[0]);
    } else {
      const seg = _lightTexOffset * (n - 1);
      const i   = Math.min(Math.floor(seg), n - 2);
      _logoPointLight.color.lerpColors(_lightGradientStops[i], _lightGradientStops[i + 1], seg - i);
    }
    // Teinte dynamique : blend rimLight / keyLight vers la couleur gradient
    if (_lightRimTintBlend > 0 && _rimLight) {
      _rimLight.color.lerpColors(_rimLightBaseColor, _logoPointLight.color, _lightRimTintBlend);
    }
    if (_lightKeyTintBlend > 0 && _keyLight) {
      _keyLight.color.lerpColors(_keyLightBaseColor, _logoPointLight.color, _lightKeyTintBlend);
    }
    // ColorMapLead sampling pour les lumières fixes
    const _cmlScratch = new THREE.Color();
    if (_ptLightLeadColor && _logoPointLight)      _logoPointLight.color.copy(_sampleColorMapLead(_ptLightLeadPos, _cmlScratch));
    if (_rimLightLeadColor && _rimLight && _lightRimTintBlend === 0) _rimLight.color.copy(_sampleColorMapLead(_rimLightLeadPos, _cmlScratch));
    if (_keyLightLeadColor && _keyLight && _lightKeyTintBlend === 0) _keyLight.color.copy(_sampleColorMapLead(_keyLightLeadPos, _cmlScratch));
    // ColorMapLead sampling pour les lumières dynamiques
    _dynamicLights.forEach(({ light, data: ld }) => {
      if (ld?.useLeadColor && light.color) light.color.copy(_sampleColorMapLead(ld.leadColorPos ?? 0, _cmlScratch));
    });
  // Le PointLight est positionné à la surface de mesh_light, décalé le long de sa normale monde
  if (_logoPointLight) {
    if (_logoLightMeshes.length > 0) {
      const mesh = _logoLightMeshes[0];
      mesh.getWorldPosition(_logoPointLight.position);
      if (_lightLocalNormal && _lightNormalOffset !== 0) {
        // Transformer la normale locale en normale monde (sans échelle)
        _lightNormalMatrix.getNormalMatrix(mesh.matrixWorld);
        _lightWorldNormal.copy(_lightLocalNormal).applyMatrix3(_lightNormalMatrix).normalize();
        _logoPointLight.position.addScaledVector(_lightWorldNormal, _lightNormalOffset);
      }
    } else if (_logoGroup) {
      _logoPointLight.position.copy(_logoGroup.position);
    }
  }
  }

  // Mise à jour uniforms particules (éclairage dynamique)
  if (_pointCloud?.material?.uniforms) {
    const u = _pointCloud.material.uniforms;
    if (_ambientLight)   { u.uAmbientColor.value.copy(_ambientLight.color); u.uAmbientIntensity.value = _ambientLight.intensity; }
    if (_keyLight)       { u.uKeyLightColor.value.copy(_keyLight.color);    u.uKeyLightIntensity.value = _keyLight.intensity; }
    if (_logoPointLight) { u.uPointLightPos.value.copy(_logoPointLight.position); u.uPointLightColor.value.copy(_logoPointLight.color); u.uPointLightIntensity.value = _logoPointLight.intensity; u.uPointLightRange.value = _logoPointLight.distance; }
    // Viewport height en pixels physiques (uniforme pour gl_PointSize cohérent)
    u.uViewportHeight.value = window.innerHeight * Math.min(window.devicePixelRatio, 1.5);
  }

  // Rotation du groupe logo — désactivée
  // if (_logoGroup && !_editorMode) {
  //   _logoGroup.rotation.x += _curSpeed * 0.40;
  //   _logoGroup.rotation.y += _curSpeed;
  // }

  // Pulse sur changement de page
  if (_pulsing && _logoGroup) {
    _pulseT += dt * 1.4;
    const s = 1 + Math.sin(Math.min(_pulseT, 1) * Math.PI) * 0.25;
    _logoGroup.scale.setScalar(_logoScale * _logoScaleMult * s);
    if (_pulseT >= 1) {
      _pulsing = false;
      _pulseT  = 0;
      _logoGroup.scale.setScalar(_logoScale * _logoScaleMult);
    }
  }

  // Mise à jour particules
  _updateParticles(dt);

  // Mise à jour réflexions (CubeCamera — rendu 6 faces sur target séparé)
  if (_reflEnabled && _cubeCamera) {
    _reflFrameCount++;
    if (_reflFrameCount % Math.max(1, _reflUpdateEvery) === 0) {
      if (_pointCloud) _pointCloud.visible = false; // éviter auto-réflexion particules
      _cubeCamera.update(_renderer, _scene);
      if (_pointCloud) _pointCloud.visible = true;
    }
  }

  _composer.render();
}

// ─── Physique particules (ressort + amortissement + curseur) ─────────────────
const _mw     = new THREE.Vector3(); // position souris en espace monde (frame courante)
const _mwPrev = new THREE.Vector3(); // position souris en espace monde (frame précédente)
let _mwVx = 0, _mwVz = 0;            // vélocité monde lissée (XZ seulement)
let _mwReady = false;                // premiere frame de projection initialisée
const _v3  = new THREE.Vector3();

function _updateParticles(dt) {
  if (!_pointCloud) return;

  // — Projection souris sur le plan de l'orbite (z=0)
  _v3.set(_rawMouse.x, _rawMouse.y, 0.5).unproject(_camera);
  const projDz = -_camera.position.z / _v3.sub(_camera.position).normalize().z;
  _mw.copy(_camera.position).addScaledVector(_v3, projDz);

  // — Vélocité monde du curseur en unités/seconde (lissée, XZ)
  //   Division par dt → unités-monde/sec cohérentes quelle que soit la fréquence
  if (_mwReady && dt > 0) {
    _mwVx += ((_mw.x - _mwPrev.x) / dt - _mwVx) * 0.2;
    _mwVz += ((_mw.z - _mwPrev.z) / dt - _mwVz) * 0.2;
  } else {
    _mwVx = 0; _mwVz = 0; _mwReady = true;
  }
  _mwPrev.copy(_mw);

  const attrP = _pointCloud.geometry.attributes.position;
  const attrA = _pointCloud.geometry.attributes.aAlpha;
  const n     = _partCount;
  const T     = _clock.elapsedTime;
  const MR    = _mouseRadius;
  const MR2   = MR * MR;
  const TB    = _partTurbulence;
  const mouseSpeedSq = _mwVx * _mwVx + _mwVz * _mwVz;

  for (let i = 0; i < n; i++) {
    const i3 = i * 3;

    // — Vie
    let drain = dt;
    if (_pos[i3+1] < 0) drain += dt * 2.0;
    _life[i] += drain;
    if (_life[i] >= _maxLife[i]) _respawnParticle(i);

    // — Rotation orbitale pure (pas de turbulence sur l'angle)
    _orbitAngle[i] += dt * _partOrbitSpeed * _orbitSpeed[i];
    const r = _orbitRadius[i];
    const θ = _orbitAngle[i];

    // — Turbulence = uniquement variation lente de hauteur Y
    //   Période ~157s (T*0.04), amplitude bornée ±TB*r*0.3, zéro strict à TB=0
    const turbY = TB > 0 ? TB * r * 0.3 * Math.sin(T * 0.04 + _turbPhase[i]) : 0;

    _orig[i3]   = r * Math.cos(θ);
    _orig[i3+1] = _orbitHeight[i] + turbY;
    _orig[i3+2] = r * Math.sin(θ);

    const px = _pos[i3], py = _pos[i3+1], pz = _pos[i3+2];

    // — Entraînement curseur : impulsion dans la direction de mouvement
    //   Force = vitesse_curseur(u/s) × mouseInfluence × falloff × dt
    //   mouseSpeedSq > 0.04 → seuil 0.2u/s pour filtrer le bruit statique
    const dxm = px - _mw.x, dym = py - _mw.y, dzm = pz - _mw.z;
    const d2m = dxm*dxm + dym*dym + dzm*dzm;
    if (d2m < MR2 && mouseSpeedSq > 0.04) {
      const falloff = 1.0 - Math.sqrt(d2m) / MR;
      // Atténuation par profondeur : les particules loin de la caméra sont moins affectées
      let depthFactor = 1.0;
      if (_mouseDepth > 0) {
        const distToCam = Math.abs(pz - _camera.position.z);
        depthFactor = Math.max(0.0, 1.0 - distToCam / _mouseDepth);
      }
      const s = falloff * depthFactor * _mouseInfluence * dt;
      _vel[i3]   += _mwVx * s;
      _vel[i3+2] += _mwVz * s;
      _vel[i3+1] += Math.sqrt(mouseSpeedSq) * s * 0.12;
    }

    // — Spring vers l'orbite
    const ax = (_orig[i3]   - px) * SPRING_K * dt;
    const ay = (_orig[i3+1] - py) * SPRING_K * dt;
    const az = (_orig[i3+2] - pz) * SPRING_K * dt;

    // — Intégration semi-implicite
    _vel[i3]   = (_vel[i3]   + ax) * DAMPING;
    _vel[i3+1] = (_vel[i3+1] + ay) * DAMPING;
    _vel[i3+2] = (_vel[i3+2] + az) * DAMPING;
    _pos[i3]   += _vel[i3];
    _pos[i3+1] += _vel[i3+1];
    _pos[i3+2] += _vel[i3+2];

    // — Alpha fade in/out
    const t   = Math.min(_life[i] / _maxLife[i], 1.0);
    _alpha[i] = Math.min(t / 0.15, 1.0, (1.0 - t) / 0.15);
  }

  attrP.needsUpdate = true;
  attrA.needsUpdate = true;
}

// ─── Burst de particules (impulsion radiale) ──────────────────────────────────
function _triggerBurst() {
  const n = _partCount;
  for (let i = 0; i < n; i++) {
    const i3 = i * 3;
    const ox = _orig[i3], oy = _orig[i3+1], oz = _orig[i3+2];
    const r   = Math.sqrt(ox*ox + oy*oy + oz*oz) || 1;
    const f   = BURST_FORCE_MIN + Math.random() * (BURST_FORCE_MAX - BURST_FORCE_MIN);
    _vel[i3]   += (ox / r) * f;
    _vel[i3+1] += (oy / r) * f;
    _vel[i3+2] += (oz / r) * f;
  }
  // NOTE : le pulse d'échelle logo est désactivé intentionnellement
  // (produisait un apparent zoom caméra indésirable sur chaque setPage).
  // Pour réactiver : décommenter les deux lignes ci-dessous.
  // _pulsing = true;
  // _pulseT  = 0;
}

// ─── Gestionnaires d'événements ───────────────────────────────────────────────
function _onMouseMove(e) {
  _rawMouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
  _rawMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}
function _onTouchMove(e) {
  const t = e.touches[0];
  _rawMouse.x =  (t.clientX / window.innerWidth)  * 2 - 1;
  _rawMouse.y = -(t.clientY / window.innerHeight) * 2 + 1;
}
function _onResize() {
  _camera.aspect = window.innerWidth / window.innerHeight;
  _camera.updateProjectionMatrix();
  _renderer.setSize(window.innerWidth, window.innerHeight);
  _composer?.setSize(window.innerWidth, window.innerHeight);
}

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * Déclenche une transition vers le thème de la page donnée.
 * @param {string} pageName  clé dans THEMES (ex: 'home', 'games', '3d'…)
 */
function setPage(pageName) {
  const theme = THEMES[pageName] ?? DEFAULT_THEME;
  _tgtWire.set(theme.wire);
  _tgtGlow.set(theme.glow);
  _tgtSpeed = theme.speed;
  // NOTE : _triggerBurst() retiré — causait un saut de scale des particules à chaque navigation.
  // Pour réactiver un burst subtil : appeler _triggerBurst() avec des forces réduites.
}

// ─── Moteur d'animation inter-états ──────────────────────────────────────────
let _animRAF     = null;  // requestAnimationFrame id pour l'animation
let _animStartTs = 0;     // timestamp de départ
let _animDef     = null;  // définition de l'animation en cours
let _animOnDone  = null;  // callback de fin

const _EASING = {
  linear:    t => t,
  easeIn:    t => t * t * t,
  easeOut:   t => 1 - Math.pow(1 - t, 3),
  easeInOut: t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2,
};

function _lerp(a, b, t) { return a + (b - a) * t; }

function _lerpColor(hexA, hexB, t) {
  const ca = new THREE.Color().setStyle(hexA);
  const cb = new THREE.Color().setStyle(hexB);
  return '#' + ca.lerp(cb, t).getHexString('srgb');
}

function _lerpStops(stopsA, stopsB, t) {
  const n = Math.max(stopsA.length, stopsB.length);
  const result = [];
  for (let i = 0; i < n; i++) {
    const a = stopsA[Math.min(i, stopsA.length - 1)];
    const b = stopsB[Math.min(i, stopsB.length - 1)];
    result.push(_lerpColor(a, b, t));
  }
  return result;
}

function _lerpStateValue(a, b, t) {
  if (typeof a === 'number' && typeof b === 'number') return _lerp(a, b, t);
  if (typeof a === 'boolean') return t < 0.5 ? a : b;
  if (typeof a === 'string' && /^#[0-9a-f]{6}$/i.test(a)) return _lerpColor(a, b, t);
  return t < 0.5 ? a : b;
}

function _lerpStateObj(objA, objB, t) {
  if (!objA || !objB) return t < 0.5 ? objA : objB;
  const out = {};
  const keys = new Set([...Object.keys(objA), ...Object.keys(objB)]);
  for (const k of keys) {
    const va = objA[k], vb = objB[k];
    if (va === undefined) { out[k] = vb; continue; }
    if (vb === undefined) { out[k] = va; continue; }
    if (k === 'stops') { out[k] = _lerpStops(va, vb, t); continue; }
    if (Array.isArray(va)) { out[k] = t < 0.5 ? va : vb; continue; }
    if (typeof va === 'object') { out[k] = _lerpStateObj(va, vb, t); continue; }
    out[k] = _lerpStateValue(va, vb, t);
  }
  return out;
}

/**
 * Interpole un état complet entre deux keyframes à t ∈ [0,1].
 * L'easing est celui du keyframe SOURCE (A).
 */
function _interpAnim(animDef, progress) {
  const kfs = animDef.keyframes;
  if (!kfs || kfs.length === 0) return null;
  if (kfs.length === 1) return kfs[0].state;

  // Trouver les deux keyframes encadrant progress
  let a = kfs[0], b = kfs[kfs.length - 1];
  for (let i = 0; i < kfs.length - 1; i++) {
    if (progress >= kfs[i].time && progress <= kfs[i + 1].time) {
      a = kfs[i]; b = kfs[i + 1]; break;
    }
  }
  if (a.time === b.time) return a.state;

  const localT = (progress - a.time) / (b.time - a.time);
  const easedT = (_EASING[a.easing] ?? _EASING.linear)(Math.max(0, Math.min(1, localT)));
  return _lerpStateObj(a.state, b.state, easedT);
}

/**
 * Lance la lecture d'une animation.
 * animDef = { duration: ms, keyframes: [{ time: 0-1, state: {}, easing: 'linear' }, …] }
 * onDone  = callback optionnel appelé à la fin
 */
function playAnimation(animDef, onDone) {
  stopAnimation();
  if (!animDef?.keyframes?.length) return;
  _animDef    = animDef;
  _animOnDone = onDone ?? null;
  _animStartTs = performance.now();

  function _frame(now) {
    const elapsed  = now - _animStartTs;
    const duration = _animDef.duration ?? 2000;
    const progress = Math.min(elapsed / duration, 1);

    const interpState = _interpAnim(_animDef, progress);
    if (interpState) applyEditorState(interpState);

    if (progress < 1) {
      _animRAF = requestAnimationFrame(_frame);
    } else {
      _animRAF = null;
      _animDef = null;
      if (_animOnDone) _animOnDone();
    }
  }
  _animRAF = requestAnimationFrame(_frame);
}

function stopAnimation() {
  if (_animRAF) { cancelAnimationFrame(_animRAF); _animRAF = null; }
  _animDef = null;
}

function dispose() {
  if (_raf) cancelAnimationFrame(_raf);
  _cameraInitialized = false; // reset pour permettre une téléportation propre si init() est rappelé
  window.removeEventListener('mousemove', _onMouseMove);
  window.removeEventListener('touchmove', _onTouchMove);
  window.removeEventListener('resize',    _onResize);
  _dynamicLights.forEach(({ light }) => _scene?.remove(light));
  _dynamicLights = [];
  if (_logoGroup) {
    _logoGroup.traverse(child => {
      if (child.isMesh) child.geometry?.dispose();
    });
  }
  _bodyMat?.dispose();
  _lightMat?.dispose();
  _lightTex?.dispose();
  _pointCloud?.geometry?.dispose();
  _pointCloud?.material?.dispose();
  _composer?.dispose();
  _renderer?.dispose();
}

// ─── API Éditeur ──────────────────────────────────────────────────────────────

/**
 * Retourne un snapshot de l'état courant de la scène.
 * Format compatible avec scene-states.json
 */
function getSceneState() {
  const col = new THREE.Color();
  return {
    camera: {
      posX: +_cameraBasePos.x.toFixed(3),
      posY: +_cameraBasePos.y.toFixed(3),
      posZ: +_cameraBasePos.z.toFixed(3),
      fov:  +_camera.fov.toFixed(1),
      near: +_camera.near.toFixed(3),
      far:  +_camera.far.toFixed(1),
      lookAtOffsetX: +_lookAtOffset.x.toFixed(3),
      lookAtOffsetY: +_lookAtOffset.y.toFixed(3),
      lookAtOffsetZ: +_lookAtOffset.z.toFixed(3),
    },
    theme: {
      wire:  '#' + _curWire.getHexString('srgb'),
      glow:  '#' + _curGlow.getHexString('srgb'),
      speed: +_curSpeed.toFixed(4),
    },
    lights: {
      ambient: {
        color:     '#' + (_ambientLight?.color ?? col.set(0xffffff)).getHexString('srgb'),
        intensity: +(_ambientLight?.intensity ?? 0.45).toFixed(2),
      },
      key: {
        color:     '#' + (_keyLight?.color ?? col.set(0xffffff)).getHexString('srgb'),
        intensity: +(_keyLight?.intensity ?? 0.90).toFixed(2),
        posX: +(_keyLight?.position.x ?? 3).toFixed(2),
        posY: +(_keyLight?.position.y ?? 4).toFixed(2),
        posZ: +(_keyLight?.position.z ?? 5).toFixed(2),
        castShadow:   _keyLight?.castShadow ?? true,
        useLeadColor: _keyLightLeadColor,
        leadColorPos: +_keyLightLeadPos.toFixed(3),
      },
      rim: {
        color:     '#' + (_rimLight?.color ?? col.set(0x3366ff)).getHexString('srgb'),
        intensity: +(_rimLight?.intensity ?? 0.35).toFixed(2),
        posX: +(_rimLight?.position.x ?? -4).toFixed(2),
        posY: +(_rimLight?.position.y ?? -2).toFixed(2),
        posZ: +(_rimLight?.position.z ?? -3).toFixed(2),
        castShadow:   _rimLight?.castShadow ?? false,
        useLeadColor: _rimLightLeadColor,
        leadColorPos: +_rimLightLeadPos.toFixed(3),
      },
    },
    logo: _logoGroup ? {
      scale: +_logoScaleMult.toFixed(3),
      posX: +_logoGroup.position.x.toFixed(3),
      posY: +_logoGroup.position.y.toFixed(3),
      posZ: +_logoGroup.position.z.toFixed(3),
      rotX: +_logoGroup.rotation.x.toFixed(3),
      rotY: +_logoGroup.rotation.y.toFixed(3),
      rotZ: +_logoGroup.rotation.z.toFixed(3),
    } : { scale:1, posX:0, posY:0, posZ:0, rotX:0, rotY:0, rotZ:0 },
    particles: _pointCloud?.material?.uniforms ? {
      count:        _partCount,
      colorNear:    '#' + (_pointCloud.material.uniforms.uColorNear?.value  ?? _partColorNear).getHexString('srgb'),
      colorFar:     '#' + (_pointCloud.material.uniforms.uColorFar?.value   ?? _partColorFar).getHexString('srgb'),
      colorMaxDist: +_partColorMaxDist.toFixed(2),
      size:         +(_pointCloud.material.uniforms.uSize?.value        ?? 0.03).toFixed(4),
      opacity:      +(_pointCloud.material.uniforms.uBaseOpacity?.value ?? 0.8).toFixed(2),
      orbitSpeed:   +_partOrbitSpeed.toFixed(3),
      orbitCurve:   +_partOrbitCurve.toFixed(2),
      turbulence:   +_partTurbulence.toFixed(3),
      lifeMin:      +_partLifeMin.toFixed(1),
      lifeMax:      +_partLifeMax.toFixed(1),
      mouseInfluence: +_mouseInfluence.toFixed(2),
      mouseRadius:    +_mouseRadius.toFixed(2),
      mouseDepth:     +_mouseDepth.toFixed(2),
    } : { count:1800, colorNear:'#888888', colorFar:'#1a2244', colorMaxDist:9, size:0.03, opacity:0.8, orbitSpeed:0.3, orbitCurve:1.0, turbulence:0.15, lifeMin:5, lifeMax:15, mouseInfluence:0.7, mouseRadius:2.5 },
    renderer: {
      clearColor: '#' + _renderer.getClearColor(new THREE.Color()).getHexString('srgb'),
    },
    logoBody: {
      color:             '#' + (_bodyMat?.color ?? new THREE.Color(0x0a0a14)).getHexString('srgb'),
      metalness:         +(_bodyMat?.metalness ?? 0.75).toFixed(2),
      roughness:         +(_bodyMat?.roughness ?? 0.30).toFixed(2),
      emissiveIntensity: +(_bodyMat?.emissiveIntensity ?? 0.22).toFixed(3),
      castShadow:        _logoBodyMeshes[0]?.castShadow ?? true,
    },
    logoLight: {
      stops:             _lightGradientStops.map(c => '#' + c.getHexString('srgb')),
      gradientSpeed:     +_lightGradientSpeed.toFixed(2),
      texScale:          +_lightTexScale.toFixed(3),
      emissiveIntensity: +_lightEmissiveIntensity.toFixed(2),
      lightIntensity:    +_lightLightIntensity.toFixed(2),
      lightRange:        +_lightLightRange.toFixed(2),
      normalOffset:      +_lightNormalOffset.toFixed(2),
      castShadow:        _logoPointLight?.castShadow ?? true,
      useLeadColor:      _ptLightLeadColor,
      leadColorPos:      +_ptLightLeadPos.toFixed(3),
      rimTintBlend:      +_lightRimTintBlend.toFixed(2),
      keyTintBlend:      +_lightKeyTintBlend.toFixed(2),
    },
    ground: {
      color:        '#' + (_groundMat?.color ?? new THREE.Color(0x111122)).getHexString('srgb'),
      metalness:    +(_groundMat?.metalness ?? 0.0).toFixed(2),
      roughness:    +(_groundMat?.roughness ?? 0.85).toFixed(2),
      receiveShadow: _groundMeshes[0]?.receiveShadow ?? true,
    },
    environment: {
      visible: _envTopObjects.length === 0 || _envTopObjects[0].visible !== false,
    },
    bloom: {
      enabled:   _bloomEnabled,
      threshold: +_bloomThreshold.toFixed(3),
      strength:  +_bloomStrength.toFixed(2),
      radius:    +_bloomRadius.toFixed(2),
      exposure:  +_toneMappingExposure.toFixed(2),
    },
    dof: {
      enabled:  _dofEnabled,
      focus:    +_dofFocus.toFixed(3),
      aperture: +_dofAperture.toFixed(6),
      maxblur:  +_dofMaxblur.toFixed(4),
    },
    shadow: {
      keyResolution: _shadowKeyRes,
      keyRadius:     +_shadowKeyRadius.toFixed(1),
      ptResolution:  _shadowPtRes,
      ptRadius:      +_shadowPtRadius.toFixed(1),
    },
    reflection: {
      enabled:         _reflEnabled,
      resolution:      _reflResolution,
      bodyIntensity:   +_reflBodyIntensity.toFixed(2),
      groundIntensity: +_reflGroundIntensity.toFixed(2),
      updateEvery:     _reflUpdateEvery,
    },
    extraLights: _dynamicLights.map(({ id, type, light }) => {
      const data = { id, type, label: type, visible: light.visible };
      if (type === 'HemisphereLight') {
        data.skyColor    = '#' + light.color.getHexString('srgb');
        data.groundColor = '#' + light.groundColor.getHexString('srgb');
        data.intensity   = +light.intensity.toFixed(2);
      } else {
        data.color     = '#' + light.color.getHexString('srgb');
        data.intensity = +light.intensity.toFixed(2);
        if (!light.isAmbientLight && !light.isRectAreaLight) data.castShadow = light.castShadow;
        if (light.isDirectionalLight || light.isPointLight || light.isSpotLight) {
          data.posX = +light.position.x.toFixed(2);
          data.posY = +light.position.y.toFixed(2);
          data.posZ = +light.position.z.toFixed(2);
        }
        if (light.isPointLight || light.isSpotLight) {
          data.distance = +light.distance.toFixed(1);
          data.decay    = +light.decay.toFixed(1);
        }
        if (light.isSpotLight) {
          data.angle    = +light.angle.toFixed(4);
          data.penumbra = +light.penumbra.toFixed(3);
        }
        if (light.isRectAreaLight) {
          data.width  = +light.width.toFixed(1);
          data.height = +light.height.toFixed(1);
          data.posX = +light.position.x.toFixed(2);
          data.posY = +light.position.y.toFixed(2);
          data.posZ = +light.position.z.toFixed(2);
        }
      }
      return data;
    }),
  };
}

/**
 * Applique un état de scène directement (sans transition).
 * Utilisé par l'éditeur pour la prévisualisation en temps réel.
 */
function applyEditorState(state) {
  if (!state) return;

  if (state.camera && _camera) {
    // Téléportation si : mode éditeur OU première application (caméra pas encore positionnée depuis l'état réel)
    const teleport = _editorMode || !_cameraInitialized;
    if (state.camera.posX !== undefined) {
      _cameraBasePos.x = state.camera.posX;
      if (teleport) _camera.position.x = state.camera.posX;
    }
    if (state.camera.posY !== undefined) {
      _cameraBasePos.y = state.camera.posY;
      if (teleport) _camera.position.y = state.camera.posY;
    }
    if (state.camera.posZ !== undefined) {
      _cameraBasePos.z = state.camera.posZ;
      if (teleport) _camera.position.z = state.camera.posZ;
    }
    if (state.camera.fov !== undefined) {
      _targetFov = state.camera.fov;
      if (teleport) { _camera.fov = state.camera.fov; _camera.updateProjectionMatrix(); }
    }
    if (state.camera.near !== undefined) { _camera.near = state.camera.near; _camera.updateProjectionMatrix(); }
    if (state.camera.far  !== undefined) { _camera.far  = state.camera.far;  _camera.updateProjectionMatrix(); }
    if (state.camera.lookAtOffsetX !== undefined) _lookAtOffset.x = state.camera.lookAtOffsetX;
    if (state.camera.lookAtOffsetY !== undefined) _lookAtOffset.y = state.camera.lookAtOffsetY;
    if (state.camera.lookAtOffsetZ !== undefined) _lookAtOffset.z = state.camera.lookAtOffsetZ;
    // Marquer la caméra comme initialisée dès la première application hors éditeur
    if (!_editorMode) _cameraInitialized = true;
  }

  if (state.theme) {
    if (state.theme.wire  !== undefined) { _curWire.set(state.theme.wire);  _tgtWire.set(state.theme.wire); }
    if (state.theme.glow  !== undefined) { _curGlow.set(state.theme.glow);  _tgtGlow.set(state.theme.glow); }
    if (state.theme.speed !== undefined) { _curSpeed = state.theme.speed;    _tgtSpeed = state.theme.speed; }
  }

  if (state.lights) {
    const { ambient, key, rim } = state.lights;
    if (ambient && _ambientLight) {
      if (ambient.color     !== undefined) _ambientLight.color.set(ambient.color);
      if (ambient.intensity !== undefined) _ambientLight.intensity = ambient.intensity;
    }
    if (key && _keyLight) {
      if (key.color     !== undefined) { _keyLight.color.set(key.color); _keyLightBaseColor.set(key.color); }
      if (key.intensity !== undefined) _keyLight.intensity = key.intensity;
      if (key.posX !== undefined) _keyLight.position.set(key.posX, key.posY ?? _keyLight.position.y, key.posZ ?? _keyLight.position.z);
      if (key.castShadow !== undefined) _keyLight.castShadow = !!key.castShadow;
      if (key.useLeadColor !== undefined) _keyLightLeadColor = !!key.useLeadColor;
      if (key.leadColorPos !== undefined) _keyLightLeadPos   = key.leadColorPos;
    }
    if (rim && _rimLight) {
      if (rim.color     !== undefined) { _rimLight.color.set(rim.color); _rimLightBaseColor.set(rim.color); }
      if (rim.intensity !== undefined) _rimLight.intensity = rim.intensity;
      if (rim.posX !== undefined) _rimLight.position.set(rim.posX, rim.posY ?? _rimLight.position.y, rim.posZ ?? _rimLight.position.z);
      if (rim.castShadow !== undefined) _rimLight.castShadow = !!rim.castShadow;
      if (rim.useLeadColor !== undefined) _rimLightLeadColor = !!rim.useLeadColor;
      if (rim.leadColorPos !== undefined) _rimLightLeadPos   = rim.leadColorPos;
    }
  }

  if (state.logo && _logoGroup) {
    if (state.logo.scale !== undefined) {
      _logoScaleMult = state.logo.scale;
      _logoGroup.scale.setScalar(_logoScale * _logoScaleMult);
    }
    if (state.logo.posX !== undefined) _logoGroup.position.set(state.logo.posX, state.logo.posY ?? 0, state.logo.posZ ?? 0);
    if (state.logo.rotX !== undefined) _logoGroup.rotation.set(state.logo.rotX, state.logo.rotY ?? 0, state.logo.rotZ ?? 0);
  }

  if (state.particles) {
    const p = state.particles;
    // — 1. Mettre à jour toutes les variables d'état scalaires en premier
    if (p.colorNear      !== undefined) _partColorNear.set(p.colorNear);
    else if (p.color     !== undefined) _partColorNear.set(p.color);
    if (p.colorFar       !== undefined) _partColorFar.set(p.colorFar);
    if (p.colorMaxDist   !== undefined) _partColorMaxDist = p.colorMaxDist;
    if (p.orbitSpeed     !== undefined) _partOrbitSpeed   = p.orbitSpeed;
    if (p.orbitCurve     !== undefined) _partOrbitCurve   = p.orbitCurve;
    if (p.turbulence     !== undefined) _partTurbulence   = p.turbulence;
    if (p.lifeMin        !== undefined) _partLifeMin      = p.lifeMin;
    if (p.lifeMax        !== undefined) _partLifeMax      = p.lifeMax;
    if (p.mouseInfluence !== undefined) _mouseInfluence   = p.mouseInfluence;
    else if (p.repelForce !== undefined) _mouseInfluence  = Math.min(1.0, p.repelForce / 25);
    if (p.mouseRadius    !== undefined) _mouseRadius      = p.mouseRadius;
    // — 2. Rebuild si le count change (utilise les variables mises à jour ci-dessus)
    if (p.count !== undefined && Math.round(p.count) !== _partCount) {
      _partCount = Math.max(1, Math.min(10000, Math.round(p.count)));
      _rebuildParticles();
    }
    // — 3. Appliquer les uniforms sur le pointCloud courant (potentiellement nouveau après rebuild)
    if (_pointCloud?.material?.uniforms) {
      const u = _pointCloud.material.uniforms;
      u.uColorNear.value.copy(_partColorNear);
      u.uColorFar.value.copy(_partColorFar);
      u.uColorMaxDist.value  = _partColorMaxDist;
      if (p.size    !== undefined) u.uSize.value        = p.size;
      if (p.opacity !== undefined) u.uBaseOpacity.value = p.opacity;
    }
  }

  if (state.renderer && _renderer) {
    if (state.renderer.clearColor !== undefined) _renderer.setClearColor(new THREE.Color(state.renderer.clearColor), 1);
  }

  if (state.logoBody && _bodyMat) {
    if (state.logoBody.color             !== undefined) _bodyMat.color.set(state.logoBody.color);
    if (state.logoBody.metalness         !== undefined) _bodyMat.metalness = state.logoBody.metalness;
    if (state.logoBody.roughness         !== undefined) _bodyMat.roughness = state.logoBody.roughness;
    if (state.logoBody.emissiveIntensity !== undefined) _bodyMat.emissiveIntensity = state.logoBody.emissiveIntensity;
    _logoBodyMeshes.forEach(m => { m.castShadow = state.logoBody.castShadow !== false; });
  }

  if (state.logoLight) {
    // stops[] en sRGB hex. setStyle() les convertit sRGB→linéaire (comportement correct avec ColorManagement)
    if (Array.isArray(state.logoLight.stops) && state.logoLight.stops.length > 0) {
      const newStops = state.logoLight.stops.map(c => new THREE.Color().setStyle(c));
      // Transition ColorMapLead vers les nouveaux stops
      _startCMLTransition(newStops, state.logoLight.cmlTransitionMs ?? _cmlTransitionDuration);
      _lightGradientStops = newStops;
      _colorMapLeadStops  = newStops.map(c => c.clone());
    } else if (state.logoLight.colorA !== undefined || state.logoLight.colorB !== undefined) {
      const newStops = [
        new THREE.Color().setStyle(state.logoLight.colorA ?? '#4488ff'),
        new THREE.Color().setStyle(state.logoLight.colorB ?? '#ff6644'),
      ];
      _startCMLTransition(newStops, state.logoLight.cmlTransitionMs ?? _cmlTransitionDuration);
      _lightGradientStops = newStops;
      _colorMapLeadStops  = newStops.map(c => c.clone());
    }
    if (state.logoLight.gradientSpeed     !== undefined) _lightGradientSpeed    = state.logoLight.gradientSpeed;
    if (state.logoLight.texScale          !== undefined) {
      _lightTexScale = Math.max(0.01, state.logoLight.texScale);
      if (_lightTex) { _lightTex.repeat.set(1, 1 / _lightTexScale); _lightTex.needsUpdate = true; }
    }
    if (state.logoLight.emissiveIntensity !== undefined) {
      _lightEmissiveIntensity = state.logoLight.emissiveIntensity;
      if (_lightMat) _lightMat.emissiveIntensity = _lightEmissiveIntensity;
    }
    // Reconstruire la texture canvas avec les nouveaux stops
    _buildLightTexture();
    if (_logoPointLight) {
      if (state.logoLight.lightIntensity !== undefined) {
        _lightLightIntensity = state.logoLight.lightIntensity;
        _logoPointLight.intensity = _lightLightIntensity;
      }
      if (state.logoLight.lightRange !== undefined) {
        _lightLightRange = state.logoLight.lightRange;
        _logoPointLight.distance = _lightLightRange;
      }
      if (state.logoLight.normalOffset !== undefined) _lightNormalOffset = state.logoLight.normalOffset;
      if (state.logoLight.castShadow   !== undefined) _logoPointLight.castShadow = !!state.logoLight.castShadow;
      if (state.logoLight.useLeadColor !== undefined) _ptLightLeadColor = !!state.logoLight.useLeadColor;
      if (state.logoLight.leadColorPos !== undefined) _ptLightLeadPos   = state.logoLight.leadColorPos;
    }
    if (state.logoLight.rimTintBlend !== undefined) {
      _lightRimTintBlend = state.logoLight.rimTintBlend;
      // Reset couleur rimLight à la base si blend = 0
      if (_lightRimTintBlend === 0 && _rimLight) _rimLight.color.copy(_rimLightBaseColor);
    }
    if (state.logoLight.keyTintBlend !== undefined) {
      _lightKeyTintBlend = state.logoLight.keyTintBlend;
      if (_lightKeyTintBlend === 0 && _keyLight) _keyLight.color.copy(_keyLightBaseColor);
    }
  }

  if (state.ground && _groundMat) {
    if (state.ground.color     !== undefined) _groundMat.color.set(state.ground.color);
    if (state.ground.metalness !== undefined) _groundMat.metalness = state.ground.metalness;
    if (state.ground.roughness !== undefined) _groundMat.roughness = state.ground.roughness;
    _groundMeshes.forEach(m => { m.receiveShadow = state.ground.receiveShadow !== false; });
  }

  if (state.environment !== undefined) {
    const vis = state.environment.visible !== false;
    _envTopObjects.forEach(obj => { obj.visible = vis; });
  }

  if (state.bloom !== undefined && _bloomPass) {
    const bl = state.bloom;
    if (bl.enabled   !== undefined) { _bloomEnabled = !!bl.enabled; _bloomPass.enabled = _bloomEnabled; }
    if (bl.threshold !== undefined) { _bloomThreshold = bl.threshold; _bloomPass.threshold = _bloomThreshold; }
    if (bl.strength  !== undefined) { _bloomStrength  = bl.strength;  _bloomPass.strength  = _bloomStrength; }
    if (bl.radius    !== undefined) { _bloomRadius    = bl.radius;    _bloomPass.radius    = _bloomRadius; }
    if (bl.exposure  !== undefined) { _toneMappingExposure = bl.exposure; if (_renderer) _renderer.toneMappingExposure = _toneMappingExposure; }
  }

  if (state.dof !== undefined && _bokehPass) {
    const dof = state.dof;
    if (dof.enabled  !== undefined) { _dofEnabled = !!dof.enabled; _bokehPass.enabled = _dofEnabled; }
    if (dof.focus    !== undefined) { _dofFocus    = dof.focus;    _bokehPass.uniforms['focus'].value    = _dofFocus; }
    if (dof.aperture !== undefined) { _dofAperture = dof.aperture; _bokehPass.uniforms['aperture'].value = _dofAperture; }
    if (dof.maxblur  !== undefined) { _dofMaxblur  = dof.maxblur;  _bokehPass.uniforms['maxblur'].value  = _dofMaxblur; }
  }

  if (state.shadow) {
    const sh = state.shadow;
    if (sh.keyResolution !== undefined && sh.keyResolution !== _shadowKeyRes && _keyLight) {
      _shadowKeyRes = sh.keyResolution;
      _keyLight.shadow.mapSize.width = _keyLight.shadow.mapSize.height = _shadowKeyRes;
      if (_keyLight.shadow.map) { _keyLight.shadow.map.dispose(); _keyLight.shadow.map = null; }
    }
    if (sh.keyRadius !== undefined && _keyLight) { _shadowKeyRadius = sh.keyRadius; _keyLight.shadow.radius = _shadowKeyRadius; }
    if (sh.ptResolution !== undefined && sh.ptResolution !== _shadowPtRes && _logoPointLight) {
      _shadowPtRes = sh.ptResolution;
      _logoPointLight.shadow.mapSize.width = _logoPointLight.shadow.mapSize.height = _shadowPtRes;
      if (_logoPointLight.shadow.map) { _logoPointLight.shadow.map.dispose(); _logoPointLight.shadow.map = null; }
    }
    if (sh.ptRadius !== undefined && _logoPointLight) { _shadowPtRadius = sh.ptRadius; _logoPointLight.shadow.radius = _shadowPtRadius; }
  }

  if (state.reflection) {
    const rf = state.reflection;
    const resChanged = rf.resolution !== undefined && rf.resolution !== _reflResolution;
    if (rf.bodyIntensity   !== undefined) { _reflBodyIntensity   = rf.bodyIntensity;   if (_reflEnabled && _bodyMat)   { _bodyMat.envMapIntensity   = rf.bodyIntensity; } }
    if (rf.groundIntensity !== undefined) { _reflGroundIntensity = rf.groundIntensity; if (_reflEnabled && _groundMat) { _groundMat.envMapIntensity = rf.groundIntensity; } }
    if (rf.updateEvery     !== undefined) _reflUpdateEvery = rf.updateEvery;
    if (rf.resolution      !== undefined) _reflResolution  = rf.resolution;
    const wasEnabled = _reflEnabled;
    if (rf.enabled !== undefined) _reflEnabled = !!rf.enabled;
    if (_reflEnabled !== wasEnabled || (_reflEnabled && resChanged)) _setReflections(_reflEnabled, resChanged);
    if (!_reflEnabled && wasEnabled) _setReflections(false, false);
  }

  if (state.extraLights !== undefined) {
    _syncExtraLights(state.extraLights);
  }
}

/**
 * Retourne les références internes pour l'éditeur (lecture seule).
 */
function getEditorHandles() {
  return { renderer: _renderer, scene: _scene, camera: _camera,
           ambientLight: _ambientLight, keyLight: _keyLight, rimLight: _rimLight,
           logoGroup: _logoGroup, pointCloud: _pointCloud };
}

// Active/désactive le mode éditeur (gèle parallaxe et rotation logo)
function setEditorMode(enabled) {
  _editorMode = !!enabled;
}

// Enregistrement de l'API globale dès l'évaluation du module
window.GCABackground = {
  init, setPage, dispose, getSceneState, applyEditorState, getEditorHandles, setEditorMode,
  sampleColorMapLead: _sampleColorMapLead,
  startCMLTransition: _startCMLTransition,
  getColorMapLeadStops: () => _colorMapLeadStops,
  playAnimation, stopAnimation,
};
