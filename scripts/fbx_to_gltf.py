"""
fbx_to_gltf.py — Conversion FBX → intermédiaire exportable via Maya 2025 standalone
Usage : mayapy scripts/fbx_to_gltf.py <input.fbx> <output.glb>

Ordre d'essai :
  1. glTFExport  (plugin natif Maya — disponible selon installation)
  2. OBJexport   (natif Maya, toujours disponible) → convert-scene.js finit en glTF
"""
import sys
import os


def main():
    if len(sys.argv) < 3:
        print('[fbx_to_gltf] Usage: mayapy fbx_to_gltf.py <input.fbx> <output.glb>')
        sys.exit(1)

    fbx_path = os.path.abspath(sys.argv[1]).replace('\\', '/')
    glb_path  = os.path.abspath(sys.argv[2]).replace('\\', '/')
    obj_path  = glb_path.replace('.glb', '.obj')

    print(f'[fbx_to_gltf] Input  : {fbx_path}')
    print(f'[fbx_to_gltf] Output : {glb_path}')

    # ── Init Maya standalone ────────────────────────────────────────────────
    import maya.standalone
    maya.standalone.initialize(name='python')
    import maya.cmds as cmds

    # ── Charger le plugin FBX ───────────────────────────────────────────────
    try:
        cmds.loadPlugin('fbxmaya', quiet=True)
    except Exception as e:
        print(f'[fbx_to_gltf] WARN fbxmaya: {e}')

    # ── Nouvelle scène vierge ───────────────────────────────────────────────
    cmds.file(new=True, force=True)

    # ── Importer le FBX ────────────────────────────────────────────────────
    print('[fbx_to_gltf] Importing FBX …')
    cmds.file(
        fbx_path,
        i=True,
        type='FBX',
        ignoreVersion=True,
        mergeNamespacesOnClash=False,
        preserveReferences=True,
    )
    print('[fbx_to_gltf] FBX imported.')

    # ── Tentative 1 : plugin glTFExport natif ──────────────────────────────
    try:
        cmds.loadPlugin('glTFExport', quiet=True)
        print('[fbx_to_gltf] glTFExport plugin found — exporting glTF …')
        cmds.file(
            glb_path,
            force=True,
            options='exportUVs=1;exportSkinClusters=0;exportBlendShapes=0;exportAnimations=0',
            type='glTF Export',
            exportAll=True,
        )
        print(f'[fbx_to_gltf] SUCCESS:GLB:{glb_path}')
        maya.standalone.uninitialize()
        sys.exit(0)
    except Exception as e:
        print(f'[fbx_to_gltf] glTFExport unavailable : {e}')

    # ── Tentative 2 : export OBJ natif (toujours disponible dans Maya) ─────
    try:
        cmds.loadPlugin('objExport', quiet=True)
        print(f'[fbx_to_gltf] OBJ export → {obj_path}')
        cmds.file(
            obj_path,
            force=True,
            type='OBJexport',
            exportAll=True,
            options='groups=1;ptgroups=1;materials=1;smoothing=1;normals=1',
        )
        print(f'[fbx_to_gltf] SUCCESS:OBJ:{obj_path}')
        maya.standalone.uninitialize()
        sys.exit(2)   # code 2 = OBJ écrit, convert-scene.js doit finir le job
    except Exception as e:
        print(f'[fbx_to_gltf] OBJ export failed : {e}')

    print('[fbx_to_gltf] ERROR: Aucun exporteur disponible.')
    maya.standalone.uninitialize()
    sys.exit(1)


if __name__ == '__main__':
    main()
