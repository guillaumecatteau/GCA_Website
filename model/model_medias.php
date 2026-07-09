<?php
require_once __DIR__ . '/db.php';

// ─── Medias ──────────────────────────────────────────────────────────────────

const MEDIA_TYPES   = ['image','video','youtube','audio','audio_link'];
const UPLOAD_BASE   = __DIR__ . '/../uploads/';
const UPLOAD_SUBDIR = [
    'image'      => 'images/',
    'video'      => 'videos/',
    'youtube'    => '',
    'audio'      => 'audio/',
    'audio_link' => '',
];

function getAllMedias(int $page = 1, int $perPage = 40): array
{
    global $bdd;
    $offset = ($page - 1) * $perPage;
    $stmt = $bdd->prepare(
        "SELECT id, type, file_path, description_fr, description_nl, alt_text, uploaded_at
         FROM medias ORDER BY uploaded_at DESC LIMIT :limit OFFSET :offset"
    );
    $stmt->bindValue(':limit',  $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset,  PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getMediaById(int $id): array|false
{
    global $bdd;
    $stmt = $bdd->prepare("SELECT * FROM medias WHERE id = :id");
    $stmt->execute([':id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function createMedia(string $type, string $file_path, array $meta = []): int|false
{
    global $bdd;
    if (!in_array($type, MEDIA_TYPES, true)) return false;
    $stmt = $bdd->prepare(
        "INSERT INTO medias (type, file_path, description_fr, description_nl, alt_text)
         VALUES (:type, :path, :dfr, :dnl, :alt)"
    );
    $stmt->execute([
        ':type' => $type,
        ':path' => $file_path,
        ':dfr'  => $meta['description_fr'] ?? '',
        ':dnl'  => $meta['description_nl'] ?? '',
        ':alt'  => $meta['alt_text']       ?? '',
    ]);
    $id = (int)$bdd->lastInsertId();
    if (!empty($meta['tags']) && is_array($meta['tags'])) {
        syncMediaTags($id, $meta['tags']);
    }
    return $id;
}

function updateMedia(int $id, array $fields): bool
{
    global $bdd;
    $allowed = ['description_fr','description_nl','alt_text'];
    $set = [];
    $params = [':id' => $id];
    foreach ($fields as $col => $val) {
        if (!in_array($col, $allowed, true)) continue;
        $set[] = "`$col` = :$col";
        $params[":$col"] = $val;
    }
    if (!empty($set)) {
        $stmt = $bdd->prepare("UPDATE medias SET " . implode(', ', $set) . " WHERE id = :id");
        $stmt->execute($params);
    }
    if (isset($fields['tags']) && is_array($fields['tags'])) {
        syncMediaTags($id, $fields['tags']);
    }
    return true;
}

function deleteMedia(int $id): bool
{
    global $bdd;
    // Récupérer le chemin pour supprimer le fichier physique si besoin
    $media = getMediaById($id);
    $stmt = $bdd->prepare("DELETE FROM medias WHERE id = :id");
    $ok = $stmt->execute([':id' => $id]);
    if ($ok && $media && in_array($media['type'], ['image','video','audio'], true)) {
        $fullPath = UPLOAD_BASE . $media['file_path'];
        if (file_exists($fullPath)) @unlink($fullPath);
    }
    return $ok;
}

function syncMediaTags(int $mediaId, array $tagIds): void
{
    global $bdd;
    $bdd->prepare("DELETE FROM medias_tags WHERE media_id = :id")->execute([':id' => $mediaId]);
    $stmt = $bdd->prepare("INSERT IGNORE INTO medias_tags (media_id, tag_id) VALUES (:mid, :tid)");
    foreach ($tagIds as $tid) {
        $stmt->execute([':mid' => $mediaId, ':tid' => (int)$tid]);
    }
}

function getMediaTags(int $mediaId): array
{
    global $bdd;
    $stmt = $bdd->prepare(
        "SELECT t.id, t.title_fr, t.title_nl, t.category
         FROM tags t JOIN medias_tags mt ON t.id = mt.tag_id
         WHERE mt.media_id = :id"
    );
    $stmt->execute([':id' => $mediaId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function searchMedias(array $filters): array
{
    global $bdd;
    $conditions = [];
    $params     = [];
    if (!empty($filters['type'])) {
        $conditions[] = 'm.type = :type';
        $params[':type'] = $filters['type'];
    }
    if (!empty($filters['q'])) {
        $conditions[] = '(m.description_fr LIKE :q OR m.description_nl LIKE :q OR m.alt_text LIKE :q)';
        $params[':q'] = '%' . $filters['q'] . '%';
    }
    if (!empty($filters['tag_id'])) {
        $conditions[] = 'EXISTS (SELECT 1 FROM medias_tags mt WHERE mt.media_id = m.id AND mt.tag_id = :tag)';
        $params[':tag'] = (int)$filters['tag_id'];
    }
    $where = empty($conditions) ? '' : 'WHERE ' . implode(' AND ', $conditions);
    $stmt = $bdd->prepare(
        "SELECT m.id, m.type, m.file_path, m.description_fr, m.alt_text, m.uploaded_at
         FROM medias m $where ORDER BY m.uploaded_at DESC"
    );
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Enregistre un fichier uploadé et crée l'entrée en base.
 * $file = $_FILES['field']
 */
function uploadMedia(array $file, string $type, array $meta = []): array
{
    $allowedMimes = [
        'image' => ['image/jpeg','image/png','image/gif','image/webp','image/svg+xml'],
        'video' => ['video/mp4','video/webm'],
        'audio' => ['audio/mpeg','audio/ogg','audio/wav'],
    ];
    if (!isset($allowedMimes[$type])) {
        return ['success' => false, 'code' => 'INVALID_TYPE'];
    }
    if (!in_array($file['type'], $allowedMimes[$type], true)) {
        return ['success' => false, 'code' => 'INVALID_MIME', 'mime' => $file['type']];
    }
    if ($file['size'] > 30 * 1024 * 1024) { // 30 MB max
        return ['success' => false, 'code' => 'FILE_TOO_LARGE'];
    }
    $ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = bin2hex(random_bytes(12)) . '.' . strtolower($ext);
    $subdir   = UPLOAD_SUBDIR[$type];
    $destDir  = UPLOAD_BASE . $subdir;
    if (!is_dir($destDir)) mkdir($destDir, 0755, true);
    $destPath = $destDir . $filename;
    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        return ['success' => false, 'code' => 'MOVE_FAILED'];
    }
    $relativePath = $subdir . $filename;
    $id = createMedia($type, $relativePath, $meta);
    if (!$id) return ['success' => false, 'code' => 'DB_ERROR'];
    return ['success' => true, 'id' => $id, 'file_path' => $relativePath];
}
