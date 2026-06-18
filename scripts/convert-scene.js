#!/usr/bin/env node
/**
 * convert-scene.js
 * Convertit vue/assets/meshes/MainScene.fbx → vue/assets/meshes/MainScene.glb
 * via Maya 2025 mayapy (mode standalone, sans UI).
 *
 * Pipeline :
 *   1. mayapy fbx_to_gltf.py — essaie glTFExport, sinon export OBJ
 *   2. Si OBJ produit → obj2gltf convertit en .glb
 *   3. Nettoyage des fichiers intermédiaires (.obj, .mtl)
 *
 * Usage :
 *   node scripts/convert-scene.js           # conversion unique
 *   node scripts/convert-scene.js --watch   # reconvertit à chaque save du FBX
 */

const { execSync, spawnSync } = require('child_process');
const path  = require('path');
const fs    = require('fs');

// ── Chemins ──────────────────────────────────────────────────────────────────
const ROOT       = path.resolve(__dirname, '..');
const MAYAPY     = 'C:/Program Files/Autodesk/Maya2025/bin/mayapy.exe';
const PY_SCRIPT  = path.join(__dirname, 'fbx_to_gltf.py');
const MESHES_DIR = path.join(ROOT, 'vue/assets/meshes');
const FBX_FILE   = path.join(MESHES_DIR, 'MainScene.fbx');
const GLB_FILE   = path.join(MESHES_DIR, 'MainScene.glb');
const OBJ_FILE   = path.join(MESHES_DIR, 'MainScene.obj');
const MTL_FILE   = path.join(MESHES_DIR, 'MainScene.mtl');

// ── Vérifications préalables ─────────────────────────────────────────────────
if (!fs.existsSync(MAYAPY)) {
  console.error(`[convert] ✗ mayapy introuvable : ${MAYAPY}`);
  process.exit(1);
}
if (!fs.existsSync(FBX_FILE)) {
  console.error(`[convert] ✗ FBX introuvable : ${FBX_FILE}`);
  process.exit(1);
}

// ── Nettoyage des fichiers intermédiaires ─────────────────────────────────────
function cleanup() {
  [OBJ_FILE, MTL_FILE].forEach(f => { try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch(_) {} });
}

// ── Étape 2 : OBJ → glTF via obj2gltf ────────────────────────────────────────
function objToGlb() {
  console.log('[convert] OBJ → glTF via obj2gltf …');
  const obj2gltf = path.join(ROOT, 'node_modules/.bin/obj2gltf');
  const result = spawnSync(
    obj2gltf,
    ['-i', OBJ_FILE, '-o', GLB_FILE, '--binary'],
    { stdio: 'inherit', cwd: ROOT, timeout: 60_000 }
  );
  if (result.status !== 0) {
    console.error('[convert] ✗ obj2gltf échoué.');
    return false;
  }
  return true;
}

// ── Fonction principale de conversion ────────────────────────────────────────
function convert() {
  const start = Date.now();
  console.log('\n[convert] ── FBX → glTF ──────────────────────────────────');
  console.log(`[convert] Source : ${FBX_FILE}`);
  console.log(`[convert] Cible  : ${GLB_FILE}`);
  console.log('[convert] Lancement de Maya standalone (peut prendre 30–60s) …\n');

  cleanup();

  const result = spawnSync(
    MAYAPY,
    [PY_SCRIPT, FBX_FILE, GLB_FILE],
    { stdio: 'inherit', cwd: ROOT, timeout: 180_000 }
  );

  const exitCode = result.status ?? 1;

  // Code 0 → glTF exporté directement par Maya
  if (exitCode === 0 && fs.existsSync(GLB_FILE)) {
    const kb      = (fs.statSync(GLB_FILE).size / 1024).toFixed(1);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`\n[convert] ✓ glTF natif — ${kb} KB en ${elapsed}s`);
    return true;
  }

  // Code 2 → OBJ exporté, on finit avec obj2gltf
  if (exitCode === 2 && fs.existsSync(OBJ_FILE)) {
    const ok = objToGlb();
    if (ok && fs.existsSync(GLB_FILE)) {
      const kb      = (fs.statSync(GLB_FILE).size / 1024).toFixed(1);
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      console.log(`[convert] ✓ OBJ → glTF — ${kb} KB en ${elapsed}s`);
      cleanup();
      return true;
    }
  }

  console.error('[convert] ✗ Conversion échouée (exit code ' + exitCode + ').');
  cleanup();
  return false;
}

// ── Mode watch ────────────────────────────────────────────────────────────────
const watchMode = process.argv.includes('--watch');

convert();

if 