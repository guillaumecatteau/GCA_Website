<?php
require_once __DIR__ . '/db.php';

// ─── Sous-titres de la section Accueil (titre principal défilant) ─────────────
// cf. Redéfinition de la section Accueil — gérés depuis l'écran Settings de
// l'admin tool, cyclés en front via vue/home-hero.js.

function getHomeSubtitles(): array
{
    global $bdd;
    return $bdd->query('SELECT id, text_fr, text_en, sort_order FROM home_subtitles ORDER BY sort_order ASC, id ASC')
        ->fetchAll(PDO::FETCH_ASSOC);
}

function createHomeSubtitle(string $textFr, string $textEn): int|false
{
    global $bdd;
    $maxOrder = (int)$bdd->query('SELECT COALESCE(MAX(sort_order), -1) FROM home_subtitles')->fetchColumn();
    $stmt = $bdd->prepare('INSERT INTO home_subtitles (text_fr, text_en, sort_order) VALUES (:fr, :en, :o)');
    $stmt->execute([':fr' => $textFr, ':en' => $textEn, ':o' => $maxOrder + 1]);
    return (int)$bdd->lastInsertId();
}

function updateHomeSubtitle(int $id, string $textFr, string $textEn): bool
{
    global $bdd;
    $stmt = $bdd->prepare('UPDATE home_subtitles SET text_fr = :fr, text_en = :en WHERE id = :id');
    return $stmt->execute([':fr' => $textFr, ':en' => $textEn, ':id' => $id]);
}

function deleteHomeSubtitle(int $id): bool
{
    global $bdd;
    $stmt = $bdd->prepare('DELETE FROM home_subtitles WHERE id = :id');
    return $stmt->execute([':id' => $id]);
}

/** Réordonne les sous-titres selon une liste ordonnée d'IDs (position = sort_order). */
function reorderHomeSubtitles(array $orderedIds): bool
{
    global $bdd;
    $stmt = $bdd->prepare('UPDATE home_subtitles SET sort_order = :o WHERE id = :id');
    foreach (array_values($orderedIds) as $index => $id) {
        $stmt->execute([':o' => $index, ':id' => (int)$id]);
    }
    return true;
}
