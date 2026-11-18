<?php
/**
 * home_subtitles_public.php — Liste ordonnée des sous-titres de la section
 * Accueil, publique (consommée par vue/home-hero.js sur toutes les visites).
 */
header('Content-Type: application/json');
require_once __DIR__ . '/../model/model_home.php';

echo json_encode(['success' => true, 'subtitles' => getHomeSubtitles()]);
