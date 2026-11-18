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
// Ne pilote plus que la teinte émissive du logo (wire) par page — "glow" et "speed"
// ont été retirés : "glow" n'était jamais appliqué à rien, et "speed" alimentait une
// rotation automatique du logo explicitement désactivée (cf. historique du projet).
const THEMES = {
  home:            { wire: '#666666' },
  connexion:       { wire: '#ef9a9a' },
  register:        { wire: '#a5d6a7' },
  userprofile:     { wire: '#4fc3f7' },
  admintool:       { wire: '#ffa726' },
  usersmanagement: { wire: '#ef9a9a' },
};
const DEFAULT_THEME = { wire: '#555555' };

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
let _rimLeftLight  = null; // THREE.DirectionalLight — contre-jour gauche
let _rimRightLight = null; // THREE.DirectionalLight — contre-jour droit
let _logoPointLight = null; // THREE.PointLight — éclairage émis par LogoLight mesh
let _logoGroup  = null;  // THREE.Group — contient les meshes logo
let _bodyMat    = null;  // MeshStandardMaterial — LogoBody
let _lightMat   = null;  // MeshStandardMaterial emissive — LogoLight
let _groundMat  = null;  // MeshStandardMaterial — Ground
let _logoScale = 1;
let _logoScaleMult = 1;
let _groundScaleMult = 1; // multiplicateur d'échelle Ground+Dome, indépendant des meshes du logo
const _lookAtOffset  = new THREE.Vector3(0, 0, 0);
// Position de base de la caméra (sans parallaxe). Le parallaxe souris s'ajoute par-dessus.
const _cameraBasePos = new THREE.Vector3(0, 0, 6);
// Vue de prévisualisation forcée (éditeur uniquement) : 'top' | 'left' | 'right' | 'front' | null.
// Quand définie, remplace entièrement le positionnement caméra habituel (parallaxe + état de
// scène) le temps de placer précisément les lumières par rapport à la mesh du logo ; dès qu'on
// la désactive, la caméra revient à la position/cible définie par l'état de scène en cours.
let _viewOverride = null;
// FOV cible — lerp vers cette valeur chaque frame pour éviter les sauts visuels.
let _targetFov = 60;
// Stops de gradient pour LogoLight (array de THREE.Color, N couleurs animées en boucle)
let _lightGradientStops = [
  new THREE.Color(0x4488ff),
  new THREE.Color(0xaa44ff),
  new THREE.Color(0xff6644),
];
// Position (0-1) de chaque stop ci-dessus, même index — répartition uniforme par défaut
// (recalculée à la volée si absente/longueur incohérente, cf. _resolveStopPositions).
let _lightGradientStopPositions = [];
let   _lightGradientSpeed = 0.5; // cycles/s
let   _lightGradientReverse = false; // true = défilement inversé (sens négatif de l'offset UV)
// "Jouer une seule fois" : l'animation de défilement du gradient s'arrête après un cycle
// complet et se fige sur sa dernière frame, au lieu de boucler indéfiniment.
let   _lightGradientPlayOnce   = false;
let   _lightGradientTraveled   = 0;     // distance totale parcourue (valeur absolue, non modulo) en mode "une fois"
let   _lightGradientFrozen     = false; // true dès qu'un cycle complet a été joué en mode "une fois"
// Offset UV manuel : actif uniquement quand gradientSpeed === 0 (pas de défilement auto). Permet
// de positionner "à la main" le dégradé sur la mesh (utile en State Variation, pour ses propres
// keyframes d'animation, cf. éditeur de scène § color map).
let   _lightManualUvOffset    = 0;
let   _lightEmissiveIntensity = 2.0;
let   _lightLightIntensity    = 1.5;
let   _lightLightRange        = 8.0;
let   _lightRimTintBlend      = 0.0; // 0 = couleur statique, 1 = suit le gradient (appliqué aux deux rim lights)
let   _lightKeyTintBlend      = 0.0;
const _rimLeftBaseColor       = new THREE.Color(0x3366ff);  // miroir de _rimLeftLight.color
const _rimRightBaseColor      = new THREE.Color(0x3366ff);  // miroir de _rimRightLight.color
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
let _orbitSpeedMod    = 1.0;   // multiplicateur global de vitesse orbitale, piloté par le geste horizontal du curseur
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
// Position (0-1) de chaque stop ci-dessus — même rôle que _lightGradientStopPositions,
// maintenu en parallèle (synchronisé partout où _colorMapLeadStops est réassigné).
let _colorMapLeadStopPositions = [];

// Durée (ms) de la transition ColorMapLead lors d'un changement d'état
let _cmlTransitionDuration = 800;
let _cmlTransitionT        = 1.0;   // 0 = début transition, 1 = terminée
let _cmlFrom               = [];    // stops source
let _cmlTo                 = [];    // stops cible
let _cmlFromPositions      = [];
let _cmlToPositions        = [];

/**
 * Résout les positions (0-1) à utiliser pour une liste de `n` stops : utilise `positions`
 * si elle a la bonne longueur, sinon retombe sur une répartition uniforme (comportement
 * historique, avant l'ajout du positionnement personnalisé de chaque stop).
 */
function _resolveStopPositions(n, positions) {
  if (Array.isArray(positions) && positions.length === n) return positions;
  if (n <= 1) return [0];
  return Array.from({ length: n }, (_, i) => i / (n - 1));
}

/**
 * Échantillonne une liste de stops colorés (avec positions arbitraires, pas nécessairement
 * triées ni uniformément réparties) à t ∈ [0,1]. Fonction générique partagée par
 * _sampleColorMapLead (ColorMapLead) et la couleur du Point Light (logoLight), pour que les
 * deux consommateurs du même gradient se comportent de façon identique.
 */
function _sampleGradientAt(colors, positions, t, out) {
  const n = colors.length;
  if (n === 0) { out.set(0xffffff); return out; }
  if (n === 1) { out.copy(colors[0]); return out; }
  const pos = _resolveStopPositions(n, positions);
  const pairs = colors.map((c, i) => ({ pos: pos[i], color: c })).sort((a, b) => a.pos - b.pos);
  const tc = Math.max(0, Math.min(1, t));
  if (tc <= pairs[0].pos) { out.copy(pairs[0].color); return out; }
  if (tc >= pairs[n - 1].pos) { out.copy(pairs[n - 1].color); return out; }
  for (let i = 0; i < n - 1; i++) {
    if (tc >= pairs[i].pos && tc <= pairs[i + 1].pos) {
      const span = pairs[i + 1].pos - pairs[i].pos;
      const localT = span > 0 ? (tc - pairs[i].pos) / span : 0;
      out.lerpColors(pairs[i].color, pairs[i + 1].color, localT);
      return out;
    }
  }
  out.copy(pairs[n - 1].color);
  return out;
}

/** Échantillonne le ColorMapLead à la position t ∈ [0,1] et stocke dans `out`. */
function _sampleColorMapLead(t, out) {
  return _sampleGradientAt(_colorMapLeadStops, _colorMapLeadStopPositions, t, out);
}

// Facteur de répétition de la texture gradient sur mesh_light (cf. _buildLightTexture) :
// repeat.y = 1 / texScale. Avec texScale > 1 (gradient "élargi"), repeat.y < 1 → une plus
// petite portion du ColorMapLead est visible à la fois sur la mesh (elle doit défiler pour
// montrer le reste). Centralisé ici car utilisé à la fois par le rendu (_buildLightTexture)
// et par l'échantillonnage "live" (_sampleColorMapLeadLive) — les deux DOIVENT rester cohérents.
function _lightTexRepeatY() {
  return 1 / Math.max(_lightTexScale, 0.01);
}

/**
 * Échantillonne le ColorMapLead EN TEMPS RÉEL à la position `pos` ∈ [0,1], où `pos`
 * représente un point fixe le long de mesh_light (0 = une extrémité, 1 = l'autre),
 * dans le même référentiel UV que la texture affichée sur la mesh (repeat.y/offset.y de
 * _lightTex, cf. _buildLightTexture).
 *
 * Contrairement à _sampleColorMapLead (position fixe dans le gradient complet, qui ne
 * bouge jamais toute seule), cette version recalcule à CHAQUE appel le point du
 * ColorMapLead réellement affiché à cet endroit précis de la mesh À L'INSTANT T, en
 * combinant :
 *   - le défilement en cours (_lightTexOffset, qui avance chaque frame)
 *   - le niveau de zoom UV (_lightTexScale → repeat.y, cf. _lightTexRepeatY)
 *   - le wrapping RepeatWrapping (même comportement que wrapT sur _lightTex)
 *   - la correction flipY : Three.js inverse systématiquement la coordonnée V pour toute
 *     Texture/CanvasTexture (flipY=true par défaut, cf. Texture.transformUv() dans le
 *     code source de Three.js : `uv.y = 1 - uv.y` appliqué APRÈS le wrap). _buildLightTexture
 *     dessine le stop 0 en haut du canvas (ligne 0) et le dernier stop en bas — sans cette
 *     correction, cette fonction lisait le gradient À L'ENVERS par rapport à ce qui est
 *     RÉELLEMENT affiché sur la mesh (stops inversés), ce qui faussait tout le système.
 * Formule exacte (vérifiée contre Texture.transformUv()) :
 *   t_effectif = 1 - frac(pos × repeat.y + offset)
 * pos=0 correspond au point mesh-UV v=0 au moment où le défilement est à son offset
 * d'origine — une valeur de référence stable pour positionner les autres lumières les
 * unes par rapport aux autres le long du dégradé qui défile (indépendante de l'animation
 * de base du Point Light lui-même, qui reste une approximation distincte, cf. boucle de
 * rendu — activer "ColorMapLead" dessus aussi bascule sur cette même formule exacte).
 */
function _sampleColorMapLeadLive(pos, out) {
  const R = _lightTexRepeatY();
  const raw = pos * R + _lightTexOffset;
  const wrapped = ((raw % 1) + 1) % 1; // frac positif (RepeatWrapping), robuste aux valeurs négatives
  const t = 1 - wrapped; // flipY (cf. commentaire ci-dessus) — NE PAS retirer
  return _sampleColorMapLead(t, out);
}

/** Lance une transition du ColorMapLead vers de nouveaux stops (couleurs + positions). */
function _startCMLTransition(toStops, toPositions, durationMs) {
  _cmlFrom          = _colorMapLeadStops.map(c => c.clone());
  _cmlFromPositions = _resolveStopPositions(_cmlFrom.length, _colorMapLeadStopPositions).slice();
  _cmlTo            = toStops.map(c => c.clone());
  _cmlToPositions   = _resolveStopPositions(toStops.length, toPositions).slice();
  _cmlTransitionT = 0;
  _cmlTransitionDuration = durationMs ?? 800;
}

/** Met à jour la transition ColorMapLead chaque frame (dt en secondes). */
function _tickCMLTransition(dt) {
  if (_cmlTransitionT >= 1.0 || _cmlFrom.length === 0 || _cmlTo.length === 0) return;
  _cmlTransitionT = Math.min(1.0, _cmlTransitionT + dt / (_cmlTransitionDuration / 1000));
  const t = _cmlTransitionT;
  // Lerp chaque stop (couleur + position) ; si longueurs différentes, on clampe sur la plus courte
  const n = Math.max(_cmlFrom.length, _cmlTo.length);
  _colorMapLeadStops = [];
  _colorMapLeadStopPositions = [];
  for (let i = 0; i < n; i++) {
    const a  = _cmlFrom[Math.min(i, _cmlFrom.length - 1)];
    const b  = _cmlTo  [Math.min(i, _cmlTo.length   - 1)];
    const pa = _cmlFromPositions[Math.min(i, _cmlFromPositions.length - 1)] ?? 0;
    const pb = _cmlToPositions[Math.min(i, _cmlToPositions.length - 1)] ?? 0;
    _colorMapLeadStops.push(new THREE.Color().lerpColors(a, b, t));
    _colorMapLeadStopPositions.push(pa + (pb - pa) * t);
  }
  // Sync avec logoLight si la transition est terminée
  if (_cmlTransitionT >= 1.0) {
    _colorMapLeadStops = _cmlTo.map(c => c.clone());
    _colorMapLeadStopPositions = _cmlToPositions.slice();
    _lightGradientStops = _colorMapLeadStops.map(c => c.clone());
    _lightGradientStopPositions = _colorMapLeadStopPositions.slice();
    _buildLightTexture();
  }
}

/**
 * Réinitialise la lecture de l'animation du gradient ColorMapLead (pertinent surtout en mode
 * "jouer une seule fois" : sans ce reset explicite, une fois figée, l'animation resterait figée
 * pour toujours). Appelée au chargement initial de la page, et par l'éditeur de scène à chaque
 * sélection d'état/sous-état ou lecture explicite d'une animation.
 */
function resetColorMapAnimation() {
  _lightGradientTraveled = 0;
  _lightGradientFrozen   = false;
}

// État "useLeadColor" et "leadColorPos" pour les lumières fixes (key, rim gauche/droite)
let _keyLightLeadColor   = false;
let _keyLightLeadPos     = 0.0;
let _rimLeftLeadColor    = false;
let _rimLeftLeadPos      = 0.0;
let _rimRightLeadColor   = false;
let _rimRightLeadPos     = 1.0;
let _ptLightLeadColor   = false;
let _ptLightLeadPos     = 0.5;
// Type courant des lumières "fixes" (key/rim gauche/droite) — par défaut DirectionalLight,
// mais remplaçable via le sélecteur de type de l'éditeur (cf. recreateNamedLight). La
// mesh_light (Point Light dédié au néon) n'est volontairement PAS incluse dans ce système :
// elle reste un cas spécial, toujours Point Light, positionné sur la surface de la mesh.
let _keyLightType     = 'DirectionalLight';
let _rimLeftLightType  = 'DirectionalLight';
let _rimRightLightType = 'DirectionalLight';
// Libellés personnalisés (renommage via double-clic dans l'éditeur) — purement cosmétique,
// n'affecte jamais l'identité fonctionnelle fixe (key/rimLeft/rimRight) de ces lumières.
let _keyLightLabel     = 'Key Light';
let _rimLeftLightLabel = 'Rim Light Left';
let _rimRightLightLabel = 'Rim Light Right';
// Rotation (direction) des lumières fixes orientables — cf. _applyLightRotation.
let _keyLightRot      = { x: 0, y: 0, z: 0 };
let _rimLeftLightRot  = { x: 0, y: 0, z: 0 };
let _rimRightLightRot = { x: 0, y: 0, z: 0 };

const _mouse       = new THREE.Vector2(0, 0);  // position lissée
const _rawMouse    = new THREE.Vector2(0, 0);  // position brute
const _curWire     = new THREE.Color(DEFAULT_THEME.wire);
const _tgtWire     = new THREE.Color(DEFAULT_THEME.wire);
// Paramètres de parallaxe caméra (curseur/tactile) — remplacent l'ancien onglet "Thème"
// (glow/speed) qui n'avait plus aucun effet réel. Cf. leur usage dans _tick().
let _parallaxStrengthX    = 0.7;   // amplitude du déplacement horizontal de la caméra
let _parallaxStrengthY    = 0.45;  // amplitude du déplacement vertical
let _parallaxMouseSmoothing = 0.06; // réactivité du suivi du curseur (lerp _mouse → _rawMouse)
let _parallaxCameraLerp     = 0.04; // amortissement du déplacement de la caméra elle-même

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

// Calcule et applique la direction d'une lumière orientable (Directional/Spot) à partir
// d'angles de rotation (radians), en repositionnant son `.target` — en Three.js, une
// DirectionalLight/SpotLight ne s'oriente PAS via `.rotation` (ignoré par le moteur de
// rendu pour ces types) mais via la position relative de `.target` par rapport à `.position`.
// `.target` DOIT être ajouté à la scène pour que son `matrixWorld` soit mis à jour.
function _applyLightRotation(light, rotX, rotY, rotZ) {
  if (!light?.target) return;
  const euler = new THREE.Euler(rotX ?? 0, rotY ?? 0, rotZ ?? 0, 'XYZ');
  const dir = new THREE.Vector3(0, 0, -1).applyEuler(euler);
  if (_scene && !light.target.parent) _scene.add(light.target);
  light.target.position.copy(light.position).add(dir);
  light.target.updateMatrixWorld();
}

// Recrée l'objet THREE sous-jacent d'une lumière "fixe" (key/rimLeft/rimRight) avec un
// nouveau type — impossible de muter un DirectionalLight en SpotLight en place. Préserve
// l'identité fonctionnelle (nom fixe, flags ColorMapLead séparés inchangés) ; seule
// l'instance THREE.Light change. Retourne le nouvel objet (à réassigner par l'appelant).
function _recreateNamedLight(name, type, data) {
  const map = {
    key:      { getLight: () => _keyLight,      setLight: (l) => { _keyLight = l; },      setType: (t) => { _keyLightType = t; } },
    rimLeft:  { getLight: () => _rimLeftLight,   setLight: (l) => { _rimLeftLight = l; },  setType: (t) => { _rimLeftLightType = t; } },
    rimRight: { getLight: () => _rimRightLight,  setLight: (l) => { _rimRightLight = l; }, setType: (t) => { _rimRightLightType = t; } },
  };
  const entry = map[name];
  if (!entry || !_scene) return null;
  const old = entry.getLight();
  if (old) {
    _scene.remove(old);
    if (old.target) _scene.remove(old.target);
  }
  const newLight = _createExtraLight({ ...data, type });
  if (!newLight) return null;
  _scene.add(newLight);
  if (newLight.target) _scene.add(newLight.target);
  entry.setLight(newLight);
  entry.setType(type);
  return newLight;
}

// Ambient/Hemisphere/RectArea n'ont pas de propriété .shadow en Three.js — utilisé pour
// éviter d'assigner castShadow=true ou de toucher .shadow.* sur ces types (fixes ou
// additionnels), ce qui provoquerait un TypeError bloquant applyEditorState() en plein vol.
function _lightSupportsShadow(light) {
  return !!light && !light.isAmbientLight && !light.isHemisphereLight && !light.isRectAreaLight;
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
  // Rotation (direction) — uniquement pour les types orientables via .target
  if (light.isDirectionalLight || light.isSpotLight) {
    _applyLightRotation(light, data.rotX ?? 0, data.rotY ?? 0, data.rotZ ?? 0);
  }
  const noShadow = !_lightSupportsShadow(light);
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
  // Opacité (shadow.intensity, Three.js ≥ r160) et diffusion (shadow.radius, PCFSoftShadowMap)
  // — réglables par lumière dès qu'une ombre est activée sur celle-ci.
  if (!noShadow && light.shadow) {
    if (data.shadowOpacity !== undefined) light.shadow.intensity = data.shadowOpacity;
    if (data.shadowRadius  !== undefined) light.shadow.radius    = data.shadowRadius;
  }
}

function _syncExtraLights(extraLightsData) {
  if (!_scene) return;
  const incoming = Array.isArray(extraLightsData) ? extraLightsData : [];
  const incomingIds = new Set(incoming.map(d => d.id));
  // Supprimer les lumières retirées
  _dynamicLights.filter(e => !incomingIds.has(e.id)).forEach(e => {
    _scene.remove(e.light);
    if (e.light.target) _scene.remove(e.light.target);
  });
  _dynamicLights = _dynamicLights.filter(e => incomingIds.has(e.id));
  // Créer ou mettre à jour
  incoming.forEach(data => {
    let entry = _dynamicLights.find(e => e.id === data.id);
    // Changement de TYPE sur une lumière existante : l'objet THREE sous-jacent doit être
    // recréé (impossible de "muter" un DirectionalLight en SpotLight en place) — on
    // conserve le même id/emplacement dans la liste, seule l'instance change.
    if (entry && entry.type !== data.type) {
      _scene.remove(entry.light);
      if (entry.light.target) _scene.remove(entry.light.target);
      _dynamicLights = _dynamicLights.filter(e => e !== entry);
      entry = null;
    }
    if (!entry) {
      const light = _createExtraLight(data);
      if (!light) return;
      _scene.add(light);
      if (light.target) _scene.add(light.target); // requis pour Directional/SpotLight
      entry = { id: data.id, type: data.type, light, data: {} };
      _dynamicLights.push(entry);
    }
    _updateExtraLight(entry.light, data);
    entry.data = { ...data }; // mise à jour des métadonnées (useLeadColor, leadColorPos…)
  });
}

// ─── Visualisation des positions de lumières (outil éditeur) ─────────────────
// Petites sphères non affectées par l'éclairage (MeshBasicMaterial), placées à la
// position réelle de chaque lumière positionnable et colorées selon sa couleur
// courante — purement un outil de repérage visuel pour placer les lumières dans la
// scène 3D, masqué par défaut (activé via setLightHelpersVisible depuis l'éditeur).
let _lightHelperGroup  = null;
let _lightHelperGeo    = null;
const _lightHelperMeshes = new Map(); // clé (nom fixe ou "dyn:<id>") → THREE.Mesh
const _lightHelperArrows = new Map(); // clé → THREE.ArrowHelper (lumières orientables uniquement)

function _getOrCreateLightHelper(key) {
  let mesh = _lightHelperMeshes.get(key);
  if (!mesh) {
    mesh = new THREE.Mesh(_lightHelperGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false }));
    mesh.renderOrder = 999; // toujours visible, même à travers la géométrie opaque
    _lightHelperGroup.add(mesh);
    _lightHelperMeshes.set(key, mesh);
  }
  return mesh;
}

// Flèche de direction (THREE.ArrowHelper) pour les lumières orientables (Directional/Spot) —
// part de la position de la lumière vers son `.target`, permet de voir où elle "vise" dans
// la scène sans avoir à deviner depuis les seuls angles de rotation.
function _getOrCreateLightArrow(key) {
  let arrow = _lightHelperArrows.get(key);
  if (!arrow) {
    arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(), 1, 0xffffff);
    arrow.line.material.depthTest = false;
    arrow.cone.material.depthTest = false;
    arrow.renderOrder = 999;
    _lightHelperGroup.add(arrow);
    _lightHelperArrows.set(key, arrow);
  }
  return arrow;
}

function _updateLightHelperFor(key, light) {
  const mesh = _getOrCreateLightHelper(key);
  mesh.position.copy(light.position);
  mesh.material.color.copy(light.color);
  mesh.visible = light.visible !== false;

  const orientable = light.isDirectionalLight || light.isSpotLight;
  if (orientable && light.target) {
    const arrow = _getOrCreateLightArrow(key);
    const dir = new THREE.Vector3().subVectors(light.target.position, light.position);
    const len = Math.max(0.01, dir.length());
    dir.normalize();
    arrow.position.copy(light.position);
    arrow.setDirection(dir);
    arrow.setLength(Math.min(len, 3), 0.3, 0.18);
    arrow.setColor(light.color);
    arrow.visible = light.visible !== false;
  } else {
    const arrow = _lightHelperArrows.get(key);
    if (arrow) arrow.visible = false;
  }
}

function _updateLightHelpers() {
  if (!_lightHelperGroup || !_lightHelperGroup.visible) return;

  const fixed = [
    ['key',       _keyLight],
    ['rimLeft',   _rimLeftLight],
    ['rimRight',  _rimRightLight],
    ['pointLight', _logoPointLight],
  ];
  fixed.forEach(([key, light]) => {
    if (!light) return;
    _updateLightHelperFor(key, light);
  });

  // Lumières dynamiques positionnables uniquement (Ambient/Hemisphere n'ont pas de position)
  const dynKeys = new Set();
  _dynamicLights.forEach(({ id, light }) => {
    if (!light.position || light.isAmbientLight || light.isHemisphereLight) return;
    const key = 'dyn:' + id;
    dynKeys.add(key);
    _updateLightHelperFor(key, light);
  });
  // Nettoyer les sphères/flèches orphelines (lumière dynamique supprimée ou devenue non-positionnable)
  for (const [key, mesh] of _lightHelperMeshes) {
    if (key.startsWith('dyn:') && !dynKeys.has(key)) {
      _lightHelperGroup.remove(mesh);
      mesh.material.dispose();
      _lightHelperMeshes.delete(key);
      const arrow = _lightHelperArrows.get(key);
      if (arrow) { _lightHelperGroup.remove(arrow); arrow.dispose(); _lightHelperArrows.delete(key); }
    }
  }
}

/** Active/désactive l'affichage des repères de position des lumières dans la scène 3D. */
function setLightHelpersVisible(enabled) {
  if (!_lightHelperGroup) return;
  _lightHelperGroup.visible = !!enabled;
  if (enabled) _updateLightHelpers(); // peuple immédiatement, pas d'attente de la prochaine frame
}

// ─── Initialisation ───────────────────────────────────────────────────────────
function init() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas || _renderer) return;   // idempotent

  resetColorMapAnimation(); // animation du gradient repart de zéro à chaque (ré)initialisation

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
  _rimLeftLight = new THREE.DirectionalLight(0x3366ff, 0.35);
  _rimLeftLight.position.set(-4, -2, -3);
  _scene.add(_rimLeftLight);
  // Rim Light Right : miroir en X de la rim left par défaut (contre-jour de l'autre côté).
  _rimRightLight = new THREE.DirectionalLight(0x3366ff, 0.35);
  _rimRightLight.position.set(4, -2, -3);
  _scene.add(_rimRightLight);

  // — Repères de position des lumières (outil éditeur, masqué par défaut)
  _lightHelperGroup = new THREE.Group();
  _lightHelperGroup.visible = false;
  _lightHelperGeo = new THREE.SphereGeometry(0.15, 12, 8);
  _scene.add(_lightHelperGroup);

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

  // Fusionne un état "State Variation" (ex: Intro) SUR la Master Scene (Home) : une variation
  // ne définit jamais logo/ground/environment/rendu/particules (champs réservés à la Master
  // Scene, cf. éditeur de scène) — les jouer seule laisse ces champs à leurs valeurs par défaut
  // du moteur, d'où le bug observé ("logo à travers le sol, rendu aléatoire"). Toute variation
  // doit donc TOUJOURS être affichée comme une surcouche de la master scene, jamais seule.
  function _mergeStateOntoMaster(masterState, overrideState) {
    const out = JSON.parse(JSON.stringify(masterState || {}));
    const v = overrideState || {};
    function overlay(target, source) {
      if (!source) return;
      Object.entries(source).forEach(([k, val]) => {
        if (val === undefined) return;
        if (Array.isArray(val)) { if (val.length > 0) target[k] = val; return; }
        if (val !== null && typeof val === 'object') { target[k] = target[k] || {}; overlay(target[k], val); return; }
        target[k] = val;
      });
    }
    overlay(out, v);
    // extraLights : fusion par id (intensité/portée seulement), pas un remplacement en bloc —
    // la passe générique ci-dessus vient de les remplacer par les entrées restreintes de la
    // variation (sans couleur/position/etc.), on corrige en les refusionnant correctement.
    if (Array.isArray(v.extraLights)) {
      const overridesById = new Map(v.extraLights.map(e => [e.id, e]));
      out.extraLights = (masterState?.extraLights || []).map(me => {
        const ov = overridesById.get(me.id);
        if (!ov) return me;
        const merged = { ...me };
        Object.entries(ov).forEach(([f, val]) => { if (val !== undefined) merged[f] = val; });
        return merged;
      });
    }
    return out;
  }

  // — Appliquer la séquence de démarrage : état "intro" joué une fois si présent, puis
  // transition (fondu, cf. son paramètre "transition") vers l'état Home (qui continue ensuite
  // comme avant — animations ambiantes perpétuelles : particules, défilement du gradient, etc.).
  // Sans état "intro" défini dans l'éditeur de scène, comportement inchangé (Home directement).
  (async () => {
    try {
      const r = await fetch('?action=scene_states');
      const j = await r.json();
      const states = j.success ? j.states : null;
      if (!states) return;
      // Signale le DÉBUT de la lecture de la séquence d'intro (état "intro" s'il existe,
      // sinon directement Home) — c'est le t=0 de la chronologie d'intro configurable côté
      // admin (cf. vue/intro-timeline.js, model/model_admin.php "intro_timeline") : PAS le
      // chargement de la page, ni la levée du rideau noir (cf. 'gca-scene-ready' plus bas,
      // qui dépend du chargement du GLB — un évènement DIFFÉRENT, déjà utilisé par le rideau).
      window.dispatchEvent(new CustomEvent('gca-intro-start'));
      const home = states.home;
      // Un item peut être au nouveau schéma ({state, mode, tracks, transition, …}, cf. refonte
      // Master Scene/State Variation) ou à l'ancien format ({subStates:[{state},…]}) ou au tout
      // premier format plat (l'objet état directement) — on extrait le state de base dans tous
      // les cas, sans quoi applyEditorState() ne reçoit que des `undefined`.
      const homeState = home?.state !== undefined && !Array.isArray(home?.subStates)
        ? home.state
        : (home && Array.isArray(home.subStates) && home.subStates.length > 0
            ? home.subStates[0].state
            : (home && (home.camera || home.lights) ? home : null));
      const applyHome = () => {
        if (!homeState) return;
        _pendingState = homeState; // mémorisé pour ré-application après GLB
        applyEditorState(_pendingState);
      };

      const intro = states.intro
        // L'état créé via l'éditeur de scène est stocké sous un id généré (ex: "state_…"),
        // pas littéralement sous la clé "intro" — seul son LABEL (affiché/renommé par
        // l'utilisateur dans l'éditeur) porte ce nom. On le retrouve donc par label, pas par clé.
        ?? Object.values(states).find(s => /^intro$/i.test((s?.label ?? '').trim()));

      if (!intro) { applyHome(); return; }

      // Deux formats possibles pour l'animation interne de l'intro :
      //  - legacy multi-sous-états (subStates.length > 1) : rejoué tel quel (comportement
      //    historique, inchangé).
      //  - nouveau schéma "Animé" (mode:'animated' + tracks par paramètre) : rééchantillonné en
      //    keyframes pour être rejoué par le même moteur playAnimation()/_interpAnim().
      // Dans les deux cas, chaque état est fusionné SUR la Master Scene (cf.
      // _mergeStateOntoMaster) : une variation comme "Intro" ne définit jamais logo/ground/
      // rendu/particules, la jouer seule laisserait ces champs à leurs valeurs par défaut du
      // moteur (bug observé : logo mal positionné, rendu "aléatoire" pendant l'intro).
      let introKeyframes = [];
      if (Array.isArray(intro.subStates) && intro.subStates.length > 0) {
        introKeyframes = intro.subStates.filter(ss => ss.state)
          .map(ss => ({ time: (ss.time ?? 0) / 100, easing: ss.easing, state: homeState ? _mergeStateOntoMaster(homeState, ss.state) : ss.state }))
          .sort((a, b) => a.time - b.time);
      } else if (intro.mode === 'animated' && intro.tracks && Object.keys(intro.tracks).length > 0) {
        introKeyframes = _kfResampleToKeyframes(intro).map(kf => ({
          ...kf,
          state: homeState ? _mergeStateOntoMaster(homeState, kf.state) : kf.state,
        }));
      }

      // Si l'état n'a jamais été resauvegardé depuis la refonte Master Scene/State Variation,
      // son champ "transition" n'existe pas encore sur disque (l'éditeur n'affiche qu'une
      // valeur par défaut en mémoire, jamais persistée tant qu'on ne clique pas "Sauvegarder")
      // — on applique ici la MÊME valeur par défaut que l'éditeur plutôt qu'une coupure brute.
      const introTransition = intro.transition || { duration: 1500, fadeIn: true, fadeOut: true };
      const transitionDuration = (introTransition.fadeIn || introTransition.fadeOut) ? (introTransition.duration ?? 0) : 0;
      // Fondu ENCHAÎNÉ entre la dernière image de l'intro et Home (pas un fondu au noir) :
      // `fromState` = exactement ce qui est affiché au moment où l'intro se termine.
      const finishWithTransition = (fromState) => {
        if (!homeState) return;
        _pendingState = homeState; // mémorisé pour ré-application après GLB
        _crossDissolveToState(fromState, homeState, transitionDuration);
      };

      if (introKeyframes.length === 0) {
        // Pas d'animation interne exploitable : état "intro" statique tenu puis transition.
        const introStaticRaw = intro.state !== undefined && !Array.isArray(intro.subStates) ? intro.state : null;
        const introStatic = introStaticRaw && homeState ? _mergeStateOntoMaster(homeState, introStaticRaw) : introStaticRaw;
        if (introStatic) { _pendingState = introStatic; applyEditorState(_pendingState); }
        finishWithTransition(introStatic);
        return;
      }

      // Applique immédiatement la 1ère frame de l'intro (évite un flash de l'état par défaut
      // pendant le fetch/chargement du GLB) puis lance l'animation complète ; au terme, fondu
      // enchaîné (cf. _crossDissolveToState) vers Home selon le paramètre "transition" de l'intro.
      const introLastState = introKeyframes[introKeyframes.length - 1].state;
      _pendingState = introKeyframes[0].state;
      applyEditorState(_pendingState);
      const duration = intro.duration ?? 0;
      if (duration <= 0 || introKeyframes.length === 1) {
        finishWithTransition(introLastState);
        return;
      }
      playAnimation({ duration, keyframes: introKeyframes }, () => finishWithTransition(introLastState));
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
  const positions = _resolveStopPositions(n, _lightGradientStopPositions);
  _lightGradientStops.forEach((c, i) => {
    // getHexString('srgb') → renvoie le hex en espace sRGB (canvas 2D est sRGB)
    // Disponible Three.js r155+. Évite la double-linéarisation.
    const hexSrgb = c.getHexString('srgb');
    grad.addColorStop(positions[i], '#' + hexSrgb);
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
// Robustesse : un rafraîchissement forcé (Ctrl+F5) relance TOUTES les requêtes réseau en
// parallèle (cache HTTP ignoré) — un simple aléa réseau peut alors faire échouer le fetch
// du .glb une fois sur quelques dizaines, sans aucun rattrapage auparavant (le logo restait
// alors invisible en permanence, `_logoGroup.visible` ne passant jamais à true). On retente
// automatiquement quelques fois avant d'abandonner, et on nettoie les tableaux de meshes à
// chaque tentative pour que la fonction reste ré-entrante (jamais de doublons en cas de
// second appel, volontaire ou non).
const _GLB_MAX_ATTEMPTS = 4;
function _loadGLTFScene(attempt = 1) {
  const loader = new GLTFLoader();

  // Réinitialise l'état de classification des meshes — nécessaire si cette fonction est
  // rappelée (retry après échec), sinon les tableaux accumuleraient les meshes en double.
  _logoBodyMeshes.length  = 0;
  _logoLightMeshes.length = 0;
  _groundMeshes.length    = 0;
  _envTopObjects.length   = 0;

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
        // Motif non-ancré (substring), cohérent avec isDome ci-dessous : le mesh réel
        // s'appelle "mesh_Ground" (préfixe "mesh_" comme les autres), pas "Ground" seul —
        // l'ancien motif ancré (^Ground$) ne matchait donc JAMAIS, cette mesh retombait
        // dans la catégorie "env" générique, sans _groundMat ni receiveShadow:true. Résultat :
        // aucune surface ne pouvait jamais recevoir d'ombre, quelle que soit la lumière.
        const isGround    = /ground/i.test(child.name);
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
          // Échelle d'origine (telle qu'exportée depuis le GLB) conservée pour appliquer
          // un multiplicateur relatif (_groundScaleMult) sans écraser le ratio d'origine.
          child.userData._baseScale = child.scale.clone();
          // Forcer la visibilité de toute la chaîne parente jusqu'à root
          let p = child.parent;
          while (p && p !== root) { p.visible = true; p = p.parent; }
          _groundMeshes.push(child);
        } else if (isGround) {
          child.material      = _groundMat;
          child.receiveShadow = true;
          child.userData._baseScale = child.scale.clone();
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

      // — Appliquer l'état en attente (mémo avant GLB) pour les réglages mesh-dépendants.
      // NE JAMAIS le faire si une animation est EN COURS (intro, transition cross-dissolve…) :
      // _pendingState pointe déjà vers la cible FINALE de cette animation (mis à jour dès son
      // lancement), donc la réappliquer instantanément ici reviendrait à couper court à
      // l'interpolation en cours — bug constaté : le site "sautait" en plein milieu du fondu
      // enchaîné intro→home dès que le GLB finissait de charger pendant la transition. La
      // boucle de playAnimation() réapplique de toute façon un état correct à CHAQUE frame une
      // fois le GLB prêt, donc rien à faire de spécial ici dans ce cas.
      _glbLoaded = true;
      if (_pendingState && !_animDef) applyEditorState(_pendingState);

      // Signale au rideau de lancement (cf. index.php, inline script) que la scène 3D est
      // désormais chargée et affichable — condition nécessaire (avec le délai minimal réglable
      // depuis l'admin tool) pour lever le rideau noir masquant le chargement.
      window.dispatchEvent(new CustomEvent('gca-scene-ready'));
    },
    undefined,
    (err) => {
      console.error(`[GCABackground] Erreur chargement MainScene.glb (tentative ${attempt}/${_GLB_MAX_ATTEMPTS}) :`, err);
      if (attempt < _GLB_MAX_ATTEMPTS) {
        // Backoff court — suffisant pour laisser passer un aléa réseau ponctuel sans
        // retarder perceptiblement l'affichage en cas de succès dès la 1ère tentative.
        setTimeout(() => _loadGLTFScene(attempt + 1), 400 * attempt);
      } else {
        console.error('[GCABackground] Abandon du chargement de MainScene.glb après plusieurs tentatives.');
      }
    }
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
// Positionne la caméra selon une vue préréglée (top/left/right/front), centrée sur la même
// cible que l'état de scène courant (_lookAtOffset) — utilisé par l'éditeur pour placer les
// lumières précisément par rapport à la mesh du logo, sans affecter l'état sauvegardé.
function _applyCameraViewOverride(view, target) {
  // Distance basée sur le cadrage de l'état courant pour garder une échelle cohérente.
  const dist = Math.max(4, _cameraBasePos.length() || 8);
  switch (view) {
    case 'top':
      _camera.up.set(0, 0, -1);
      _camera.position.set(target.x, target.y + dist, target.z + 0.0001);
      break;
    case 'left':
      _camera.up.set(0, 1, 0);
      _camera.position.set(target.x - dist, target.y, target.z);
      break;
    case 'right':
      _camera.up.set(0, 1, 0);
      _camera.position.set(target.x + dist, target.y, target.z);
      break;
    case 'front':
    default:
      _camera.up.set(0, 1, 0);
      _camera.position.set(target.x, target.y, target.z + dist);
      break;
  }
  _camera.lookAt(target);
}

/**
 * Active/désactive une vue de prévisualisation préréglée (éditeur uniquement).
 * view = 'top' | 'left' | 'right' | 'front' | null (null = revient à la caméra de l'état).
 */
function setCameraViewOverride(view) {
  _viewOverride = ['top', 'left', 'right', 'front'].includes(view) ? view : null;
}

function _tick() {
  _raf = requestAnimationFrame(_tick);
  const dt = Math.min(_clock.getDelta(), 0.05);

  // Transition ColorMapLead
  _tickCMLTransition(dt);

  // Lissage souris → parallaxe caméra (désactivé en mode éditeur)
  // La caméra cible un point fixe dans la scène (_lookAtOffset)
  // Le logo (meshes) peut être déplacé indépendamment sans affecter la caméra
  const _lookAtTarget = new THREE.Vector3().copy(_lookAtOffset);

  if (_viewOverride) {
    _applyCameraViewOverride(_viewOverride, _lookAtTarget);
  } else {
    // Restaure le vecteur "up" standard si on vient de quitter une vue préréglée
    // (la vue "top" le modifie pour garder une orientation lisible à l'écran).
    if (_camera.up.x !== 0 || _camera.up.y !== 1 || _camera.up.z !== 0) _camera.up.set(0, 1, 0);
    // Parallaxe active aussi en mode éditeur (sans vue préréglée) : permet de calibrer les
    // réglages de l'onglet "Interaction" directement dans l'aperçu — auparavant totalement
    // gelée en editorMode, rendant ces réglages impossibles à régler visuellement.
    _mouse.lerp(_rawMouse, _parallaxMouseSmoothing);
    // Parallaxe = offset relatif à la position de base sauvegardée
    const targetX = _cameraBasePos.x + _mouse.x * _parallaxStrengthX;
    const targetY = Math.max(0.05, _cameraBasePos.y + _mouse.y * _parallaxStrengthY); // jamais sous le sol
    _camera.position.x += (targetX - _camera.position.x) * _parallaxCameraLerp;
    _camera.position.y += (targetY - _camera.position.y) * _parallaxCameraLerp;
    // Z : lerp comme X/Y pour éviter le saut quand _cameraBasePos.z change
    _camera.position.z += (_cameraBasePos.z - _camera.position.z) * _parallaxCameraLerp;
  }
  // FOV : transition douce vers _targetFov (évite le zoom soudain au chargement/login)
  if (Math.abs(_camera.fov - _targetFov) > 0.01) {
    _camera.fov += (_targetFov - _camera.fov) * 0.04;
    _camera.updateProjectionMatrix();
  }
  if (!_viewOverride) _camera.lookAt(_lookAtTarget);

  // Transition douce de la teinte émissive du logo
  _curWire.lerp(_tgtWire, 0.025);

  // Mise à jour matériaux logo (emissive body + couleur light)
  if (_bodyMat)  _bodyMat.emissive.copy(_curWire);

  // Animation gradient LogoLight (toujours actif, y compris en éditeur)
  if (_logoPointLight && _lightGradientStops.length > 0) {
    // Scroll de la texture gradient pour un vrai dégradé UV animé (sens réglable via
    // "gradientReverse" — case à cocher de l'éditeur, pour inverser le sens de lecture
    // du dégradé sans changer sa vitesse ni ses couleurs).
    // "gradientPlayOnce" : une fois un cycle complet parcouru (distance absolue = 1, quel
    // que soit le sens), on fige l'offset et on arrête de le faire avancer — l'animation ne
    // boucle plus indéfiniment, elle se fige sur sa dernière frame jusqu'à un reset explicite
    // (cf. resetColorMapAnimation(), appelée au chargement de page / sélection d'état/sous-état
    // dans l'éditeur / lecture d'une animation).
    if (_lightTex && _lightGradientSpeed > 0 && !(_lightGradientPlayOnce && _lightGradientFrozen)) {
      const dir   = _lightGradientReverse ? -1 : 1;
      let   delta = dir * dt * _lightGradientSpeed * 0.3;
      if (_lightGradientPlayOnce) {
        const remaining = 1 - _lightGradientTraveled;
        if (Math.abs(delta) >= remaining) {
          delta = Math.sign(delta) * remaining; // clampe pile sur la fin du cycle, sans saut
          _lightGradientFrozen = true;
        }
        _lightGradientTraveled += Math.abs(delta);
      }
      _lightTexOffset = (((_lightTexOffset + delta) % 1.0) + 1.0) % 1.0;
      _lightTex.offset.y = _lightTexOffset;
    } else if (_lightTex && _lightGradientSpeed <= 0) {
      // Vitesse nulle = pas de défilement automatique : le dégradé est positionné "à la main"
      // via l'offset manuel (éditable en State Variation, notamment par keyframes).
      _lightTexOffset = (((_lightManualUvOffset) % 1.0) + 1.0) % 1.0;
      _lightTex.offset.y = _lightTexOffset;
    }
    // Couleur PointLight = sample du gradient à l'offset courant (approximation existante,
    // non modifiée — INDÉPENDANTE de la correction flipY ci-dessous, qui ne concerne que le
    // nouveau système ColorMapLead ; activer "ColorMapLead" sur ce Point Light lui-même
    // bascule sur la formule exacte via _sampleColorMapLeadLive, cf. plus bas).
    _sampleGradientAt(_lightGradientStops, _lightGradientStopPositions, _lightTexOffset, _logoPointLight.color);
    // Teinte dynamique : blend rim lights / keyLight vers la couleur gradient — IGNORÉ si
    // "ColorMapLead" est actif sur cette même lumière (choix explicite et plus précis de
    // l'utilisateur ; sans cette exclusion, un rimTintBlend/keyTintBlend hérité d'un ancien
    // réglage pouvait écraser silencieusement le ColorMapLead, qui semblait alors "ne rien
    // faire" bien que la couleur échantillonnée dans l'éditeur soit correcte).
    if (_lightRimTintBlend > 0) {
      if (_rimLeftLight && !_rimLeftLeadColor)   _rimLeftLight.color.lerpColors(_rimLeftBaseColor,  _logoPointLight.color, _lightRimTintBlend);
      if (_rimRightLight && !_rimRightLeadColor) _rimRightLight.color.lerpColors(_rimRightBaseColor, _logoPointLight.color, _lightRimTintBlend);
    }
    if (_lightKeyTintBlend > 0 && _keyLight && !_keyLightLeadColor) {
      _keyLight.color.lerpColors(_keyLightBaseColor, _logoPointLight.color, _lightKeyTintBlend);
    }
    // ColorMapLead sampling EN TEMPS RÉEL pour les lumières fixes : chaque lumière
    // "ColorMapLead" prélève la couleur RÉELLEMENT affichée sur mesh_light à sa position
    // configurée, à cet instant précis (cf. _sampleColorMapLeadLive) — synchronisé en
    // permanence avec le défilement ET le zoom UV (scale), y compris pendant une transition.
    // Priorité absolue sur la teinte dynamique ci-dessus (cf. commentaire), d'où l'absence
    // de condition sur _lightRimTintBlend/_lightKeyTintBlend ici.
    if (_ptLightLeadColor && _logoPointLight)      _sampleColorMapLeadLive(_ptLightLeadPos,   _logoPointLight.color);
    if (_rimLeftLeadColor && _rimLeftLight)   _sampleColorMapLeadLive(_rimLeftLeadPos,  _rimLeftLight.color);
    if (_rimRightLeadColor && _rimRightLight) _sampleColorMapLeadLive(_rimRightLeadPos, _rimRightLight.color);
    if (_keyLightLeadColor && _keyLight) _sampleColorMapLeadLive(_keyLightLeadPos, _keyLight.color);
    // ColorMapLead sampling pour les lumières dynamiques
    _dynamicLights.forEach(({ light, data: ld }) => {
      if (ld?.useLeadColor && light.color) _sampleColorMapLeadLive(ld.leadColorPos ?? 0, light.color);
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

  // Repères visuels de position des lumières (outil éditeur, no-op si masqués)
  _updateLightHelpers();

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

  // — Modulation de la vitesse orbitale par le geste horizontal du curseur : un mouvement
  //   vers la droite (+X) RALENTIT la rotation, vers la gauche (-X) l'ACCÉLÈRE (effet
  //   volontairement "à contre-courant" du geste, demandé explicitement). Lissé (pas de
  //   à-coups) et mis à l'échelle par _mouseInfluence (0 = aucun effet, comme le reste de
  //   l'interaction curseur). Un seul calcul par frame (pas par particule).
  const targetOrbitMod = 1.0 - Math.max(-1, Math.min(1, _mwVx * 0.15)) * _mouseInfluence;
  _orbitSpeedMod += (targetOrbitMod - _orbitSpeedMod) * 0.05;

  for (let i = 0; i < n; i++) {
    const i3 = i * 3;

    // — Vie
    let drain = dt;
    if (_pos[i3+1] < 0) drain += dt * 2.0;
    _life[i] += drain;
    if (_life[i] >= _maxLife[i]) _respawnParticle(i);

    // — Rotation orbitale pure (pas de turbulence sur l'angle)
    _orbitAngle[i] += dt * _partOrbitSpeed * _orbitSpeed[i] * _orbitSpeedMod;
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
    // stopPositions doit suivre le même lissage continu que les couleurs qu'il positionne —
    // sinon la position des stops du dégradé "saute" brutalement à mi-transition (t=0.5) alors
    // que les couleurs, elles, se fondent en douceur : résultat visuel incohérent ("saute de
    // lumière" signalée par l'utilisateur) puisque tout élément échantillonnant le dégradé
    // (ColorMapLead, lumières "useLeadColor") lit alors une position de couleur discontinue.
    if (k === 'stopPositions') {
      const n = Math.max(va.length, vb.length);
      out[k] = [];
      for (let i = 0; i < n; i++) {
        const a = va[Math.min(i, va.length - 1)];
        const b = vb[Math.min(i, vb.length - 1)];
        out[k].push(_lerp(a, b, t));
      }
      continue;
    }
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
  // Repart toujours d'un gradient non figé, qu'il s'agisse de la première lecture ou d'une
  // relecture après un cycle en mode "jouer une fois" sur l'un des sous-états.
  resetColorMapAnimation();

  function _frame(now) {
    const elapsed  = now - _animStartTs;
    const duration = _animDef.duration ?? 2000;
    const progress = Math.min(elapsed / duration, 1);

    const interpState = _interpAnim(_animDef, progress);
    // instant: true — chaque frame porte déjà la valeur exacte interpolée pour cette frame
    // précise (cf. _interpAnim) ; appliquer en plus les transitions/lerps habituels (caméra,
    // fondu ColorMapLead) ferait courir ces systèmes après une cible qui change à chaque
    // frame sans jamais la rattraper, d'où l'effet observé de superposition entre états
    // (surtout visible en rejouant, le point de départ n'étant alors plus neutre).
    if (interpState) applyEditorState(interpState, { instant: true });

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

// ─── Résolution d'un état "Animé" (nouveau schéma keyframes par paramètre) ──────────────────
// Traduit les pistes de keyframes de l'éditeur de scène (clés = id de .seRow de l'inspecteur
// admin, cf. vue/scene-editor.js _KF_LEGACY_FIELD_GETTERS) en un chemin dans l'objet "state" du
// moteur, pour pouvoir les rejouer ICI sur le site public (pas seulement dans l'aperçu admin).
const _KF_ROWID_PATHS = {
  'seRow-camera-posX': ['camera', 'posX'],
  'seRow-camera-posY': ['camera', 'posY'],
  'seRow-camera-posZ': ['camera', 'posZ'],
  'seRow-camera-lookAtOffsetX': ['camera', 'lookAtOffsetX'],
  'seRow-camera-lookAtOffsetY': ['camera', 'lookAtOffsetY'],
  'seRow-camera-lookAtOffsetZ': ['camera', 'lookAtOffsetZ'],
  'seRow-lights-ambient-intensity': ['lights', 'ambient', 'intensity'],
  'se-el-key-intensity': ['lights', 'key', 'intensity'],
  'se-el-rimLeft-intensity': ['lights', 'rimLeft', 'intensity'],
  'se-el-rimLeft-distance': ['lights', 'rimLeft', 'distance'],
  'se-el-rimRight-intensity': ['lights', 'rimRight', 'intensity'],
  'se-el-rimRight-distance': ['lights', 'rimRight', 'distance'],
  'seRow-logoLight-gradientSpeed': ['logoLight', 'gradientSpeed'],
  'seRow-logoLight-uvOffset': ['logoLight', 'uvOffset'],
  'seRow-logoLight-lightIntensity': ['logoLight', 'lightIntensity'],
  'seRow-logoLight-lightRange': ['logoLight', 'lightRange'],
};
const _KF_EASE = {
  linear:    v => v,
  easeIn:    v => v * v,
  easeOut:   v => 1 - (1 - v) * (1 - v),
  easeInOut: v => v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2,
};

function _kfSampleTrack(track, t) {
  if (!track || track.length === 0) return undefined;
  const s = [...track].sort((a, b) => a.t - b.t);
  if (t <= s[0].t) return s[0].v;
  if (t >= s[s.length - 1].t) return s[s.length - 1].v;
  for (let i = 0; i < s.length - 1; i++) {
    const a = s[i], b = s[i + 1];
    if (t >= a.t && t <= b.t) {
      const span = (b.t - a.t) || 1;
      const p = (_KF_EASE[b.e] || _KF_EASE.linear)((t - a.t) / span);
      return a.v + (b.v - a.v) * p;
    }
  }
  return s[s.length - 1].v;
}

// Construit l'état complet (base "state" + pistes exposées interpolées) d'un item "Animé" à
// l'instant normalisé t ∈ [0,1].
function _kfResolveStateAt(item, t) {
  const out = JSON.parse(JSON.stringify(item?.state || {}));
  if (item?.mode !== 'animated' || !item.tracks) return out;
  Object.entries(item.tracks).forEach(([rowId, track]) => {
    const v = _kfSampleTrack(track, t);
    if (v === undefined) return;
    let path = _KF_ROWID_PATHS[rowId];
    if (!path) {
      const m = /^se-el-(.+)-(intensity|distance)$/.exec(rowId);
      if (m) {
        const [, lightId, field] = m;
        out.extraLights = out.extraLights || [];
        let light = out.extraLights.find(l => l.id === lightId);
        if (!light) { light = { id: lightId }; out.extraLights.push(light); }
        light[field] = v;
        return;
      }
    }
    if (!path) return;
    let o = out;
    for (let i = 0; i < path.length - 1; i++) { o[path[i]] = o[path[i]] || {}; o = o[path[i]]; }
    o[path[path.length - 1]] = v;
  });
  return out;
}

// Échantillonne un item "Animé" en N keyframes réparties uniformément, pour pouvoir le rejouer
// via playAnimation()/_interpAnim() (qui travaille sur des snapshots d'état complets, pas des
// pistes par paramètre) — chaque échantillon porte déjà sa valeur correctement interpolée (avec
// l'easing propre à SA piste), donc un raccord linéaire entre échantillons suffit.
function _kfResampleToKeyframes(item, samples = 24) {
  const kfs = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    kfs.push({ time: t, easing: 'linear', state: _kfResolveStateAt(item, t) });
  }
  return kfs;
}

// ─── Transition entre états = fondu ENCHAÎNÉ entre leurs valeurs (PAS un fondu au noir) ──────
// Si la dernière image de l'état sortant est, disons, un color map blanc, la transition doit
// estomper ce blanc pour laisser apparaître progressivement les couleurs de l'état entrant —
// exactement comme un fondu enchaîné vidéo. Réutilise playAnimation()/_interpAnim()/
// _lerpStateObj() (qui interpolent déjà un snapshot d'état complet vers un autre, y compris les
// color maps) avec seulement 2 keyframes : l'état de départ et l'état d'arrivée.
function _crossDissolveToState(fromState, toState, durationMs, onDone) {
  if (!toState) { onDone?.(); return; }
  if (!fromState || !durationMs || durationMs <= 0) {
    applyEditorState(toState);
    onDone?.();
    return;
  }
  playAnimation({
    duration: durationMs,
    keyframes: [
      { time: 0, easing: 'linear', state: fromState },
      { time: 1, easing: 'linear', state: toState },
    ],
  }, onDone);
}

function dispose() {
  if (_raf) cancelAnimationFrame(_raf);
  _raf = null;
  _cameraInitialized = false; // reset pour permettre une téléportation propre si init() est rappelé
  _viewOverride = null; // ne doit pas persister au rechargement/réinitialisation du moteur
  window.removeEventListener('mousemove', _onMouseMove);
  window.removeEventListener('touchmove', _onTouchMove);
  window.removeEventListener('resize',    _onResize);
  _dynamicLights.forEach(({ light }) => { _scene?.remove(light); if (light.target) _scene?.remove(light.target); });
  _dynamicLights = [];
  _lightHelperMeshes.forEach(mesh => mesh.material?.dispose());
  _lightHelperMeshes.clear();
  _lightHelperArrows.forEach(arrow => arrow.dispose());
  _lightHelperArrows.clear();
  _lightHelperGeo?.dispose();
  _lightHelperGeo   = null;
  _lightHelperGroup = null;
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
  // Sans ça, init() restait indéfiniment no-op après un dispose() (garde `if (_renderer) return`
  // sur un renderer déjà disposé mais toujours non-null) — la scène ne pouvait plus jamais
  // être reconstruite correctement.
  _renderer         = null;
  _scene            = null;
  _camera           = null;
  _composer         = null;
  _glbLoaded        = false;
  _pendingState      = null;
  _logoGroup        = null;
  _logoBodyMeshes.length  = 0;
  _logoLightMeshes.length = 0;
  _groundMeshes.length    = 0;
  _envTopObjects.length   = 0;
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
    },
    parallax: {
      strengthX:      +_parallaxStrengthX.toFixed(3),
      strengthY:       +_parallaxStrengthY.toFixed(3),
      mouseSmoothing:  +_parallaxMouseSmoothing.toFixed(3),
      cameraLerp:      +_parallaxCameraLerp.toFixed(3),
    },
    lights: {
      ambient: {
        color:     '#' + (_ambientLight?.color ?? col.set(0xffffff)).getHexString('srgb'),
        intensity: +(_ambientLight?.intensity ?? 0.45).toFixed(2),
      },
      key: {
        type: _keyLightType,
        label: _keyLightLabel,
        color:     '#' + (_keyLight?.color ?? col.set(0xffffff)).getHexString('srgb'),
        intensity: +(_keyLight?.intensity ?? 0.90).toFixed(2),
        posX: +(_keyLight?.position.x ?? 3).toFixed(2),
        posY: +(_keyLight?.position.y ?? 4).toFixed(2),
        posZ: +(_keyLight?.position.z ?? 5).toFixed(2),
        rotX: +_keyLightRot.x.toFixed(3),
        rotY: +_keyLightRot.y.toFixed(3),
        rotZ: +_keyLightRot.z.toFixed(3),
        castShadow:   _keyLight?.castShadow ?? true,
        shadowOpacity: +(_keyLight?.shadow?.intensity ?? 1).toFixed(2),
        shadowRadius:  +(_keyLight?.shadow?.radius    ?? 1).toFixed(2),
        useLeadColor: _keyLightLeadColor,
        leadColorPos: +_keyLightLeadPos.toFixed(3),
      },
      rimLeft: {
        type: _rimLeftLightType,
        label: _rimLeftLightLabel,
        color:     '#' + (_rimLeftLight?.color ?? col.set(0x3366ff)).getHexString('srgb'),
        intensity: +(_rimLeftLight?.intensity ?? 0.35).toFixed(2),
        posX: +(_rimLeftLight?.position.x ?? -4).toFixed(2),
        posY: +(_rimLeftLight?.position.y ?? -2).toFixed(2),
        posZ: +(_rimLeftLight?.position.z ?? -3).toFixed(2),
        rotX: +_rimLeftLightRot.x.toFixed(3),
        rotY: +_rimLeftLightRot.y.toFixed(3),
        rotZ: +_rimLeftLightRot.z.toFixed(3),
        castShadow:   _rimLeftLight?.castShadow ?? false,
        shadowOpacity: +(_rimLeftLight?.shadow?.intensity ?? 1).toFixed(2),
        shadowRadius:  +(_rimLeftLight?.shadow?.radius    ?? 1).toFixed(2),
        useLeadColor: _rimLeftLeadColor,
        leadColorPos: +_rimLeftLeadPos.toFixed(3),
      },
      rimRight: {
        type: _rimRightLightType,
        label: _rimRightLightLabel,
        color:     '#' + (_rimRightLight?.color ?? col.set(0x3366ff)).getHexString('srgb'),
        intensity: +(_rimRightLight?.intensity ?? 0.35).toFixed(2),
        posX: +(_rimRightLight?.position.x ?? 4).toFixed(2),
        posY: +(_rimRightLight?.position.y ?? -2).toFixed(2),
        posZ: +(_rimRightLight?.position.z ?? -3).toFixed(2),
        rotX: +_rimRightLightRot.x.toFixed(3),
        rotY: +_rimRightLightRot.y.toFixed(3),
        rotZ: +_rimRightLightRot.z.toFixed(3),
        castShadow:   _rimRightLight?.castShadow ?? false,
        shadowOpacity: +(_rimRightLight?.shadow?.intensity ?? 1).toFixed(2),
        shadowRadius:  +(_rimRightLight?.shadow?.radius    ?? 1).toFixed(2),
        useLeadColor: _rimRightLeadColor,
        leadColorPos: +_rimRightLeadPos.toFixed(3),
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
      stopPositions:     _resolveStopPositions(_lightGradientStops.length, _lightGradientStopPositions).map(p => +p.toFixed(3)),
      gradientSpeed:     +_lightGradientSpeed.toFixed(2),
      gradientReverse:   _lightGradientReverse,
      gradientPlayOnce:  _lightGradientPlayOnce,
      uvOffset:          +_lightManualUvOffset.toFixed(3),
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
      scale:        +_groundScaleMult.toFixed(3),
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
        if (!light.isAmbientLight && !light.isRectAreaLight) {
          data.castShadow = light.castShadow;
          if (light.shadow) {
            data.shadowOpacity = +light.shadow.intensity.toFixed(2);
            data.shadowRadius  = +light.shadow.radius.toFixed(2);
          }
        }
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
 * @param {object} state
 * @param {object} [opts]
 * @param {boolean} [opts.instant] - Force une application immédiate, sans transition ni lerp
 *   (caméra téléportée, ColorMapLead appliqué sans fondu). Utilisé par playAnimation() : chaque
 *   frame y fournit déjà une valeur interpolée pour CETTE frame précise (cf. _interpAnim) — lui
 *   superposer en plus une transition caméra/couleur à sa propre temporalité (lerp parallaxe,
 *   fondu de 800ms) les faisait "courir après" une cible qui change à chaque frame, sans jamais
 *   la rattraper : d'où l'effet de superposition/traînée entre états lors de la lecture (et plus
 *   visiblement encore à la relecture, puisque le point de départ n'est alors plus neutre).
 */
function applyEditorState(state, opts) {
  if (!state) return;
  const instant = !!opts?.instant;

  if (state.camera && _camera) {
    // Téléportation si : application "instantanée" (lecture d'animation) OU mode éditeur OU
    // première application (caméra pas encore positionnée depuis l'état réel)
    const teleport = instant || _editorMode || !_cameraInitialized;
    // La position caméra d'un état est ABSOLUE (base de référence), mais l'altération du
    // curseur (parallaxe) doit TOUJOURS s'y additionner, même lors d'une téléportation — sinon
    // chaque frame d'une transition/animation (instant:true) écrase le décalage curseur en
    // cours, provoquant un "saut" visuel au moment où le tick normal le réapplique ensuite.
    if (state.camera.posX !== undefined) {
      _cameraBasePos.x = state.camera.posX;
      if (teleport) _camera.position.x = state.camera.posX + _mouse.x * _parallaxStrengthX;
    }
    if (state.camera.posY !== undefined) {
      _cameraBasePos.y = state.camera.posY;
      if (teleport) _camera.position.y = Math.max(0.05, state.camera.posY + _mouse.y * _parallaxStrengthY);
    }
    if (state.camera.posZ !== undefined) {
      _cameraBasePos.z = state.camera.posZ;
      if (teleport) _camera.position.z = state.camera.posZ; // pas d'offset curseur sur Z (cf. _tick)
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
  }

  if (state.parallax) {
    const pa = state.parallax;
    if (pa.strengthX      !== undefined) _parallaxStrengthX      = pa.strengthX;
    if (pa.strengthY      !== undefined) _parallaxStrengthY      = pa.strengthY;
    if (pa.mouseSmoothing !== undefined) _parallaxMouseSmoothing = pa.mouseSmoothing;
    if (pa.cameraLerp     !== undefined) _parallaxCameraLerp     = pa.cameraLerp;
  }

  if (state.lights) {
    // rétrocompat : les états sauvegardés avant le split rim→rimLeft/rimRight n'ont
    // qu'une clé "rim" — on la réutilise comme rimLeft si rimLeft est absent, pour ne
    // perdre aucun réglage existant. rimRight démarre alors à ses valeurs par défaut.
    const { ambient, key, rim, rimLeft, rimRight } = state.lights;
    const effectiveRimLeft = rimLeft ?? rim;
    if (ambient && _ambientLight) {
      if (ambient.color     !== undefined) _ambientLight.color.set(ambient.color);
      if (ambient.intensity !== undefined) _ambientLight.intensity = ambient.intensity;
    }
    if (key) {
      // Changement de type : recrée l'objet THREE (DirectionalLight ↔ SpotLight ↔ PointLight…)
      if (key.type !== undefined && key.type !== _keyLightType) {
        _keyLight = _recreateNamedLight('key', key.type, key) ?? _keyLight;
      }
      if (key.color     !== undefined) { _keyLight.color.set(key.color); _keyLightBaseColor.set(key.color); }
      if (key.intensity !== undefined) _keyLight.intensity = key.intensity;
      if (key.posX !== undefined) _keyLight.position.set(key.posX, key.posY ?? _keyLight.position.y, key.posZ ?? _keyLight.position.z);
      if (key.castShadow !== undefined && _lightSupportsShadow(_keyLight)) _keyLight.castShadow = !!key.castShadow;
      if (_lightSupportsShadow(_keyLight) && _keyLight.shadow) {
        if (key.shadowOpacity !== undefined) _keyLight.shadow.intensity = key.shadowOpacity;
        if (key.shadowRadius  !== undefined) _keyLight.shadow.radius    = key.shadowRadius;
      }
      if (key.useLeadColor !== undefined) _keyLightLeadColor = !!key.useLeadColor;
      if (key.leadColorPos !== undefined) _keyLightLeadPos   = key.leadColorPos;
      if (key.label !== undefined) _keyLightLabel = key.label;
      if (key.rotX !== undefined || key.rotY !== undefined || key.rotZ !== undefined) {
        _keyLightRot = { x: key.rotX ?? 0, y: key.rotY ?? 0, z: key.rotZ ?? 0 };
        _applyLightRotation(_keyLight, _keyLightRot.x, _keyLightRot.y, _keyLightRot.z);
      }
    }
    if (effectiveRimLeft) {
      const rl = effectiveRimLeft;
      if (rl.type !== undefined && rl.type !== _rimLeftLightType) {
        _rimLeftLight = _recreateNamedLight('rimLeft', rl.type, rl) ?? _rimLeftLight;
      }
      if (rl.color     !== undefined) { _rimLeftLight.color.set(rl.color); _rimLeftBaseColor.set(rl.color); }
      if (rl.intensity !== undefined) _rimLeftLight.intensity = rl.intensity;
      if (rl.posX !== undefined) _rimLeftLight.position.set(rl.posX, rl.posY ?? _rimLeftLight.position.y, rl.posZ ?? _rimLeftLight.position.z);
      if (rl.castShadow !== undefined && _lightSupportsShadow(_rimLeftLight)) _rimLeftLight.castShadow = !!rl.castShadow;
      if (_lightSupportsShadow(_rimLeftLight) && _rimLeftLight.shadow) {
        if (rl.shadowOpacity !== undefined) _rimLeftLight.shadow.intensity = rl.shadowOpacity;
        if (rl.shadowRadius  !== undefined) _rimLeftLight.shadow.radius    = rl.shadowRadius;
      }
      if (rl.useLeadColor !== undefined) _rimLeftLeadColor = !!rl.useLeadColor;
      if (rl.leadColorPos !== undefined) _rimLeftLeadPos   = rl.leadColorPos;
      if (rl.label !== undefined) _rimLeftLightLabel = rl.label;
      if (rl.rotX !== undefined || rl.rotY !== undefined || rl.rotZ !== undefined) {
        _rimLeftLightRot = { x: rl.rotX ?? 0, y: rl.rotY ?? 0, z: rl.rotZ ?? 0 };
        _applyLightRotation(_rimLeftLight, _rimLeftLightRot.x, _rimLeftLightRot.y, _rimLeftLightRot.z);
      }
    }
    if (rimRight) {
      if (rimRight.type !== undefined && rimRight.type !== _rimRightLightType) {
        _rimRightLight = _recreateNamedLight('rimRight', rimRight.type, rimRight) ?? _rimRightLight;
      }
      if (rimRight.color     !== undefined) { _rimRightLight.color.set(rimRight.color); _rimRightBaseColor.set(rimRight.color); }
      if (rimRight.intensity !== undefined) _rimRightLight.intensity = rimRight.intensity;
      if (rimRight.posX !== undefined) _rimRightLight.position.set(rimRight.posX, rimRight.posY ?? _rimRightLight.position.y, rimRight.posZ ?? _rimRightLight.position.z);
      if (rimRight.castShadow !== undefined && _lightSupportsShadow(_rimRightLight)) _rimRightLight.castShadow = !!rimRight.castShadow;
      if (_lightSupportsShadow(_rimRightLight) && _rimRightLight.shadow) {
        if (rimRight.shadowOpacity !== undefined) _rimRightLight.shadow.intensity = rimRight.shadowOpacity;
        if (rimRight.shadowRadius  !== undefined) _rimRightLight.shadow.radius    = rimRight.shadowRadius;
      }
      if (rimRight.useLeadColor !== undefined) _rimRightLeadColor = !!rimRight.useLeadColor;
      if (rimRight.leadColorPos !== undefined) _rimRightLeadPos   = rimRight.leadColorPos;
      if (rimRight.label !== undefined) _rimRightLightLabel = rimRight.label;
      if (rimRight.rotX !== undefined || rimRight.rotY !== undefined || rimRight.rotZ !== undefined) {
        _rimRightLightRot = { x: rimRight.rotX ?? 0, y: rimRight.rotY ?? 0, z: rimRight.rotZ ?? 0 };
        _applyLightRotation(_rimRightLight, _rimRightLightRot.x, _rimRightLightRot.y, _rimRightLightRot.z);
      }
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
      const newPositions = _resolveStopPositions(newStops.length, state.logoLight.stopPositions);
      if (instant) {
        // Pas de fondu : la valeur fournie est déjà celle attendue À CETTE frame précise
        // (interpolée par _interpAnim pendant playAnimation) — un fondu supplémentaire par
        // dessus ferait perpétuellement courir le ColorMapLead après une cible qui change à
        // chaque frame, sans jamais la rattraper (effet de traînée/superposition entre états).
        _cmlTransitionT = 1; _cmlFrom = []; _cmlTo = [];
        _lightGradientStops = newStops;
        _lightGradientStopPositions = newPositions.slice();
        _colorMapLeadStops  = newStops.map(c => c.clone());
        _colorMapLeadStopPositions = newPositions.slice();
        _buildLightTexture();
      } else {
        // Transition ColorMapLead vers les nouveaux stops
        _startCMLTransition(newStops, newPositions, state.logoLight.cmlTransitionMs ?? _cmlTransitionDuration);
        _lightGradientStops = newStops;
        _lightGradientStopPositions = newPositions.slice();
        _colorMapLeadStops  = newStops.map(c => c.clone());
        _colorMapLeadStopPositions = newPositions.slice();
      }
    } else if (state.logoLight.colorA !== undefined || state.logoLight.colorB !== undefined) {
      const newStops = [
        new THREE.Color().setStyle(state.logoLight.colorA ?? '#4488ff'),
        new THREE.Color().setStyle(state.logoLight.colorB ?? '#ff6644'),
      ];
      const newPositions = [0, 1];
      if (instant) {
        _cmlTransitionT = 1; _cmlFrom = []; _cmlTo = [];
        _lightGradientStops = newStops;
        _lightGradientStopPositions = newPositions.slice();
        _colorMapLeadStops  = newStops.map(c => c.clone());
        _colorMapLeadStopPositions = newPositions.slice();
        _buildLightTexture();
      } else {
        _startCMLTransition(newStops, newPositions, state.logoLight.cmlTransitionMs ?? _cmlTransitionDuration);
        _lightGradientStops = newStops;
        _lightGradientStopPositions = newPositions.slice();
        _colorMapLeadStops  = newStops.map(c => c.clone());
        _colorMapLeadStopPositions = newPositions.slice();
      }
    }
    if (state.logoLight.gradientSpeed     !== undefined) _lightGradientSpeed    = state.logoLight.gradientSpeed;
    if (state.logoLight.gradientReverse   !== undefined) _lightGradientReverse  = !!state.logoLight.gradientReverse;
    if (state.logoLight.gradientPlayOnce  !== undefined) _lightGradientPlayOnce = !!state.logoLight.gradientPlayOnce;
    if (state.logoLight.uvOffset          !== undefined) _lightManualUvOffset  = state.logoLight.uvOffset;
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
      // Reset couleur des rim lights à leur base si blend = 0
      if (_lightRimTintBlend === 0) {
        if (_rimLeftLight)  _rimLeftLight.color.copy(_rimLeftBaseColor);
        if (_rimRightLight) _rimRightLight.color.copy(_rimRightBaseColor);
      }
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
    if (state.ground.scale !== undefined) {
      _groundScaleMult = state.ground.scale;
      _groundMeshes.forEach(m => {
        const base = m.userData._baseScale;
        if (base) m.scale.copy(base).multiplyScalar(_groundScaleMult);
      });
    }
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
    // _keyLight peut désormais être n'importe quel type via le sélecteur de l'éditeur
    // (y compris Ambient/Hemisphere/RectArea, qui n'ont pas de propriété .shadow) — on
    // vérifie donc sa présence avant toute lecture/écriture pour éviter un crash qui
    // bloquait silencieusement toute l'init (et donc les onglets) de l'éditeur de scène.
    if (sh.keyResolution !== undefined && sh.keyResolution !== _shadowKeyRes && _keyLight?.shadow) {
      _shadowKeyRes = sh.keyResolution;
      _keyLight.shadow.mapSize.width = _keyLight.shadow.mapSize.height = _shadowKeyRes;
      if (_keyLight.shadow.map) { _keyLight.shadow.map.dispose(); _keyLight.shadow.map = null; }
    }
    if (sh.keyRadius !== undefined && _keyLight?.shadow) { _shadowKeyRadius = sh.keyRadius; _keyLight.shadow.radius = _shadowKeyRadius; }
    if (sh.ptResolution !== undefined && sh.ptResolution !== _shadowPtRes && _logoPointLight?.shadow) {
      _shadowPtRes = sh.ptResolution;
      _logoPointLight.shadow.mapSize.width = _logoPointLight.shadow.mapSize.height = _shadowPtRes;
      if (_logoPointLight.shadow.map) { _logoPointLight.shadow.map.dispose(); _logoPointLight.shadow.map = null; }
    }
    if (sh.ptRadius !== undefined && _logoPointLight?.shadow) { _shadowPtRadius = sh.ptRadius; _logoPointLight.shadow.radius = _shadowPtRadius; }
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
           ambientLight: _ambientLight, keyLight: _keyLight,
           rimLeftLight: _rimLeftLight, rimRightLight: _rimRightLight,
           logoGroup: _logoGroup, pointCloud: _pointCloud,
           logoPointLight: _logoPointLight, dynamicLights: _dynamicLights };
}

// Active/désactive le mode éditeur (gèle parallaxe et rotation logo)
function setEditorMode(enabled) {
  _editorMode = !!enabled;
}

// Enregistrement de l'API globale dès l'évaluation du module
window.GCABackground = {
  init, setPage, dispose, getSceneState, applyEditorState, getEditorHandles, setEditorMode,
  sampleColorMapLead: _sampleColorMapLead,
  sampleColorMapLeadLive: (pos) => _sampleColorMapLeadLive(pos, new THREE.Color()),
  startCMLTransition: _startCMLTransition,
  getColorMapLeadStops: () => _colorMapLeadStops,
  setLightHelpersVisible,
  setCameraViewOverride,
  resetColorMapAnimation,
  playAnimation, stopAnimation,
};
