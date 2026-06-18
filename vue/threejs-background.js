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
import * as THREE  from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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
const REPEL_RADIUS    = 2.2;   // rayon repulsion souris (unités monde)
const REPEL_FORCE     = 18.0;
const BURST_FORCE_MIN = 2.0;
const BURST_FORCE_MAX = 5.0;

// ─── État interne ─────────────────────────────────────────────────────────────
let _renderer, _scene, _camera, _clock;
let _logoGroup  = null;  // THREE.Group — contient les deux meshes FBX
let _bodyMat    = null;  // MeshStandardMaterial — corps solide du logo
let _lightMat   = null;  // MeshBasicMaterial additif — parties lumineuses
let _logoScale  = 1;     // facteur d'échelle calculé après chargement FBX
let _pointCloud;
let _pos, _orig, _vel;   // Float32Array × PARTICLE_COUNT*3
let _raf = null;

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

// ─── Initialisation ───────────────────────────────────────────────────────────
function init() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas || _renderer) return;   // idempotent

  // — Renderer
  _renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  _renderer.setSize(window.innerWidth, window.innerHeight);
  _renderer.setClearColor(0x040508, 1);

  // — Scene + Camera
  _scene  = new THREE.Scene();
  _camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
  _camera.position.z = 6;
  _clock  = new THREE.Clock();

  // — Éclairage (requis par MeshStandardMaterial)
  _scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.90);
  keyLight.position.set(3, 4, 5);
  _scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0x3366ff, 0.35);
  rimLight.position.set(-4, -2, -3);
  _scene.add(rimLight);

  // — Matériaux logo
  //   Corps : métal sombre avec emissive pilotée par la couleur de thème
  _bodyMat = new THREE.MeshStandardMaterial({
    color:             0x0a0a14,
    metalness:         0.75,
    roughness:         0.30,
    emissive:          new THREE.Color(_curWire),
    emissiveIntensity: 0.22,
  });
  //   Lumières : additif transparent, couleur thème vive
  _lightMat = new THREE.MeshBasicMaterial({
    color:      new THREE.Color(_curWire),
    transparent: true,
    opacity:     0.80,
    blending:    THREE.AdditiveBlending,
    depthWrite:  false,
  });

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

  _tick();
}

// ─── Chargement de la scène glTF principale ───────────────────────────────────
function _loadGLTFScene() {
  const loader = new GLTFLoader();

  loader.load(
    'vue/assets/meshes/MainScene.glb',
    (gltf) => {
      const root = gltf.scene;

      // ── Centrer la scène sur l'origine ──────────────────────────────────
      const box    = new THREE.Box3().setFromObject(root);
      const center = new THREE.Vector3();
      const size   = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);
      root.position.sub(center);

      // ── Appliquer les matériaux selon le nom des meshes ─────────────────
      // Convention : nom contenant "light" (insensible casse) → matériau additif
      //              tous les autres → matériau métal/emissive
      root.traverse(child => {
        if (!child.isMesh) return;
        child.castShadow    = false;
        child.receiveShadow = false;
        child.frustumCulled = false;
        const isLight = /light/i.test(child.name);
        child.material = isLight ? _lightMat : _bodyMat;
      });

      // ── Mise à l'échelle : diamètre visuel ≈ 3 unités Three.js ──────────
      const maxDim = Math.max(size.x, size.y, size.z);
      _logoScale   = maxDim > 0 ? 3.0 / maxDim : 1;

      _logoGroup.add(root);
      _logoGroup.scale.setScalar(_logoScale);
      _logoGroup.visible = true;

      console.log('[GCABackground] MainScene.glb chargé —', _logoGroup.children.length, 'objet(s)');
    },
    undefined,
    err => console.error('[GCABackground] Erreur chargement MainScene.glb :', err)
  );
}

// ─── Construction des particules ─────────────────────────────────────────────
function _buildParticles() {
  _pos  = new Float32Array(PARTICLE_COUNT * 3);
  _orig = new Float32Array(PARTICLE_COUNT * 3);
  _vel  = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const θ = Math.random() * Math.PI * 2;
    const φ = Math.acos(2 * Math.random() - 1);
    const r = 2.5 + Math.random() * 6.5;
    const i3 = i * 3;
    _pos[i3] = _orig[i3] = r * Math.sin(φ) * Math.cos(θ);
    _pos[i3+1] = _orig[i3+1] = r * Math.sin(φ) * Math.sin(θ);
    _pos[i3+2] = _orig[i3+2] = r * Math.cos(φ);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(_pos, 3));

  _pointCloud = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0x888888, size: 0.03, transparent: true, opacity: 0.45,
    sizeAttenuation: true, depthWrite: false,
  }));
  _scene.add(_pointCloud);
}

// ─── Boucle de rendu ──────────────────────────────────────────────────────────
function _tick() {
  _raf = requestAnimationFrame(_tick);
  const dt = Math.min(_clock.getDelta(), 0.05);

  // Lissage souris → parallaxe caméra
  _mouse.lerp(_rawMouse, 0.06);
  _camera.position.x += (_mouse.x * 0.7 - _camera.position.x) * 0.04;
  _camera.position.y += (_mouse.y * 0.45 - _camera.position.y) * 0.04;
  _camera.lookAt(_scene.position);

  // Transition de vitesse et couleurs
  _curSpeed += (_tgtSpeed - _curSpeed) * 0.02;
  _curWire.lerp(_tgtWire, 0.025);
  _curGlow.lerp(_tgtGlow, 0.025);

  // Mise à jour matériaux logo (emissive body + couleur light)
  if (_bodyMat)  _bodyMat.emissive.copy(_curWire);
  if (_lightMat) _lightMat.color.copy(_curWire);

  // Rotation du groupe logo (les deux meshes tournent ensemble)
  if (_logoGroup) {
    _logoGroup.rotation.x += _curSpeed * 0.40;
    _logoGroup.rotation.y += _curSpeed;
  }

  // Pulse sur changement de page
  if (_pulsing && _logoGroup) {
    _pulseT += dt * 1.4;
    const s = 1 + Math.sin(Math.min(_pulseT, 1) * Math.PI) * 0.25;
    _logoGroup.scale.setScalar(_logoScale * s);
    if (_pulseT >= 1) {
      _pulsing = false;
      _pulseT  = 0;
      _logoGroup.scale.setScalar(_logoScale);
    }
  }

  // Mise à jour particules
  _updateParticles(dt);

  _renderer.render(_scene, _camera);
}

// ─── Physique particules (ressort + amortissement + répulsion souris) ─────────
const _mw = new THREE.Vector3(); // position souris en espace monde (réutilisée)
const _v3  = new THREE.Vector3();

function _updateParticles(dt) {
  // Projection souris sur plan z=0
  _v3.set(_rawMouse.x, _rawMouse.y, 0.5).unproject(_camera);
  const d = -_camera.position.z / _v3.sub(_camera.position).normalize().z;
  _mw.copy(_camera.position).addScaledVector(_v3, d);

  const attr = _pointCloud.geometry.attributes.position;
  const R2 = REPEL_RADIUS * REPEL_RADIUS;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    const px = _pos[i3], py = _pos[i3+1], pz = _pos[i3+2];

    // Force de rappel vers l'origine
    let ax = (_orig[i3]   - px) * SPRING_K * dt;
    let ay = (_orig[i3+1] - py) * SPRING_K * dt;
    let az = (_orig[i3+2] - pz) * SPRING_K * dt;

    // Répulsion souris
    const dx = px - _mw.x, dy = py - _mw.y, dz = pz - _mw.z;
    const d2 = dx*dx + dy*dy + dz*dz;
    if (d2 < R2 && d2 > 0.0001) {
      const inv = REPEL_FORCE * (1 - Math.sqrt(d2) / REPEL_RADIUS) * dt / Math.sqrt(d2);
      ax += dx * inv;
      ay += dy * inv;
      az += dz * inv;
    }

    // Intégration semi-implicite (Euler symplectique)
    _vel[i3]   = (_vel[i3]   + ax) * DAMPING;
    _vel[i3+1] = (_vel[i3+1] + ay) * DAMPING;
    _vel[i3+2] = (_vel[i3+2] + az) * DAMPING;

    _pos[i3]   += _vel[i3];
    _pos[i3+1] += _vel[i3+1];
    _pos[i3+2] += _vel[i3+2];
  }
  attr.needsUpdate = true;
}

// ─── Burst de particules (impulsion radiale) ──────────────────────────────────
function _triggerBurst() {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    const ox = _orig[i3], oy = _orig[i3+1], oz = _orig[i3+2];
    const r   = Math.sqrt(ox*ox + oy*oy + oz*oz) || 1;
    const f   = BURST_FORCE_MIN + Math.random() * (BURST_FORCE_MAX - BURST_FORCE_MIN);
    _vel[i3]   += (ox / r) * f;
    _vel[i3+1] += (oy / r) * f;
    _vel[i3+2] += (oz / r) * f;
  }
  _pulsing = true;
  _pulseT  = 0;
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
  _triggerBurst();
}

function dispose() {
  if (_raf) cancelAnimationFrame(_raf);
  window.removeEventListener('mousemove', _onMouseMove);
  window.removeEventListener('touchmove', _onTouchMove);
  window.removeEventListener('resize',    _onResize);
  if (_logoGroup) {
    _logoGroup.traverse(child => {
      if (child.isMesh) child.geometry?.dispose();
    });
  }
  _bodyMat?.dispose();
  _lightMat?.dispose();
  _pointCloud?.geometry?.dispose();
  _pointCloud?.material?.dispose();
  _renderer?.dispose();
}

// Enregistrement de l'API globale dès l'évaluation du module
window.GCABackground = { init, setPage, dispose };
