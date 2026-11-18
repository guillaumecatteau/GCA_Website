<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<base href="/" />
<link rel="stylesheet" href="vue/assets/css/main.css?v=<?= filemtime(__DIR__.'/../../vue/assets/css/main.css') ?>" />
<script type="importmap">
{
  "imports": {
    "three": "./node_modules/three/build/three.module.min.js",
    "three/addons/": "./node_modules/three/examples/jsm/"
  }
}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Audiowide&family=Sarala:wght@400;700&display=swap" rel="stylesheet" />
<title><?= htmlspecialchars($ogMeta['title'] ?? 'GC Digital Arts') ?></title>
<meta name="description" content="<?= htmlspecialchars($ogMeta['description'] ?? '') ?>" />
<!-- Open Graph / Twitter Card — cf. Fonction share (partage d'une page = cover média utilisé) -->
<meta property="og:type" content="website" />
<meta property="og:title" content="<?= htmlspecialchars($ogMeta['title'] ?? 'GC Digital Arts') ?>" />
<meta property="og:description" content="<?= htmlspecialchars($ogMeta['description'] ?? '') ?>" />
<meta property="og:url" content="<?= htmlspecialchars($ogMeta['url'] ?? '') ?>" />
<?php if (!empty($ogMeta['image'])): ?>
<meta property="og:image" content="<?= htmlspecialchars($ogMeta['image']) ?>" />
<meta name="twitter:card" content="summary_large_image" />
<?php else: ?>
<meta name="twitter:card" content="summary" />
<?php endif; ?>
