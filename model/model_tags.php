<?php
require_once __DIR__ . '/db.php';

// ─── Tags ────────────────────────────────────────────────────────────────────

function getAllTags(): array
{
    global $bdd;
    $stmt = $bdd->query("SELECT id, title_fr, title_en, category, icon_path FROM tags ORDER BY category, title_fr");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getTagsByCategory(string $category): array
{
    global $bdd;
    $stmt = $bdd->prepare("SELECT id, title_fr, title_en FROM tags WHERE category = :cat ORDER BY title_fr");
    $stmt->execute([':cat' => $category]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getTagById(int $id): array|false
{
    global $bdd;
    $stmt = $bdd->prepare("SELECT id, title_fr, title_en, category, icon_path FROM tags WHERE id = :id");
    $stmt->execute([':id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function createTag(string $title_fr, string $title_en, string $category, ?string $icon_path = null): int|false
{
    global $bdd;
    $allowed = ['category','job','technology'];
    if (!in_array($category, $allowed, true)) return false;
    $stmt = $bdd->prepare(
        "INSERT INTO tags (title_fr, title_en, category, icon_path) VALUES (:fr, :en, :cat, :icon)"
    );
    $stmt->execute([':fr' => $title_fr, ':en' => $title_en, ':cat' => $category, ':icon' => $icon_path]);
    return (int)$bdd->lastInsertId();
}

function updateTag(int $id, string $title_fr, string $title_en, string $category, ?string $icon_path = null): bool
{
    global $bdd;
    $allowed = ['category','job','technology'];
    if (!in_array($category, $allowed, true)) return false;
    $stmt = $bdd->prepare(
        "UPDATE tags SET title_fr = :fr, title_en = :en, category = :cat, icon_path = :icon WHERE id = :id"
    );
    return $stmt->execute([':fr' => $title_fr, ':en' => $title_en, ':cat' => $category, ':icon' => $icon_path, ':id' => $id]);
}

function deleteTag(int $id): bool
{
    global $bdd;
    $stmt = $bdd->prepare("DELETE FROM tags WHERE id = :id");
    return $stmt->execute([':id' => $id]);
}

function searchTags(string $query, string $category = ''): array
{
    global $bdd;
    $conditions = ['(title_fr LIKE :q OR title_en LIKE :q)'];
    $params = [':q' => '%' . $query . '%'];
    if ($category !== '') {
        $conditions[] = 'category = :cat';
        $params[':cat'] = $category;
    }
    $sql = "SELECT id, title_fr, title_en, category, icon_path FROM tags WHERE "
         . implode(' AND ', $conditions)
         . " ORDER BY category, title_fr";
    $stmt = $bdd->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
