<?php
/**
 * search_public.php — Recherche globale du site (public, sans authentification).
 * Ne porte que sur les pages visibles (is_visible = 1) — titre, sous-titre, contenu des
 * blocs — jamais sur des données réservées à l'outil admin.
 */
header('Content-Type: application/json');
require_once __DIR__ . '/../model/model_pages.php';

$q = trim($_GET['q'] ?? '');

// Garde-fou longueur minimale : pas d'erreur, simplement aucun résultat tant que la requête
// est trop courte (évite de scanner toutes les pages pour 0 ou 1 caractère).
if (mb_strlen($q) < 2) {
    echo json_encode(['success' => true, 'results' => []]);
    exit;
}

echo json_encode(['success' => true, 'results' => searchPublicContent($q)]);
