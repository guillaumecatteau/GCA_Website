<?php
require_once __DIR__ . '/db.php';

// ─── Experiences ─────────────────────────────────────────────────────────────

function getAllExperiences(): array
{
    global $bdd;
    $stmt = $bdd->query(
        "SELECT id, title_fr, title_en, date_start, date_end, logo_media_id
         FROM experiences ORDER BY date_start DESC"
    );
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getExperienceById(int $id): array|false
{
    global $bdd;
    $stmt = $bdd->prepare("SELECT * FROM experiences WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $exp = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$exp) return false;
    $exp['tags']   = getExperienceTags($id);
    $exp['pages']  = getExperiencePages($id);
    return $exp;
}

function createExperience(array $data): int|false
{
    global $bdd;
    $stmt = $bdd->prepare(
        "INSERT INTO experiences (title_fr, title_en, date_start, date_end, logo_media_id, description_fr, description_en)
         VALUES (:tfr, :ten, :ds, :de, :logo, :dfr, :den)"
    );
    $stmt->execute([
        ':tfr'  => $data['title_fr']       ?? '',
        ':ten'  => $data['title_en']       ?? '',
        ':ds'   => $data['date_start']     ?? null,
        ':de'   => $data['date_end']       ?? null,
        ':logo' => !empty($data['logo_media_id']) ? (int)$data['logo_media_id'] : null,
        ':dfr'  => $data['description_fr'] ?? null,
        ':den'  => $data['description_en'] ?? null,
    ]);
    $id = (int)$bdd->lastInsertId();
    _syncExperienceRelations($id, $data);
    return $id;
}

function updateExperience(int $id, array $data): bool
{
    global $bdd;
    $allowed = ['title_fr','title_en','date_start','date_end','logo_media_id','description_fr','description_en'];
    $set = [];
    $params = [':id' => $id];
    foreach ($allowed as $col) {
        if (!array_key_exists($col, $data)) continue;
        $set[] = "`$col` = :$col";
        $params[":$col"] = $data[$col];
    }
    if (!empty($set)) {
        $stmt = $bdd->prepare("UPDATE experiences SET " . implode(', ', $set) . " WHERE id = :id");
        $stmt->execute($params);
    }
    _syncExperienceRelations($id, $data);
    return true;
}

function deleteExperience(int $id): bool
{
    global $bdd;
    $stmt = $bdd->prepare("DELETE FROM experiences WHERE id = :id");
    return $stmt->execute([':id' => $id]);
}

function getExperienceTags(int $expId): array
{
    global $bdd;
    $stmt = $bdd->prepare(
        "SELECT t.id, t.title_fr, t.title_en
         FROM tags t JOIN experiences_tags et ON t.id = et.tag_id
         WHERE et.experience_id = :eid AND t.category = 'job'"
    );
    $stmt->execute([':eid' => $expId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getExperiencePages(int $expId): array
{
    global $bdd;
    $stmt = $bdd->prepare(
        "SELECT p.id, p.type, p.slug, p.title_fr, p.title_en
         FROM pages p JOIN experiences_pages ep ON p.id = ep.page_id
         WHERE ep.experience_id = :eid"
    );
    $stmt->execute([':eid' => $expId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function _syncExperienceRelations(int $id, array $data): void
{
    global $bdd;
    if (array_key_exists('tags', $data)) {
        $bdd->prepare("DELETE FROM experiences_tags WHERE experience_id = :id")->execute([':id' => $id]);
        $ins = $bdd->prepare("INSERT IGNORE INTO experiences_tags (experience_id, tag_id) VALUES (:eid, :tid)");
        foreach ((array)$data['tags'] as $tid) $ins->execute([':eid' => $id, ':tid' => (int)$tid]);
    }
    if (array_key_exists('pages', $data)) {
        $bdd->prepare("DELETE FROM experiences_pages WHERE experience_id = :id")->execute([':id' => $id]);
        $ins = $bdd->prepare("INSERT IGNORE INTO experiences_pages (experience_id, page_id) VALUES (:eid, :pid)");
        foreach ((array)$data['pages'] as $pid) $ins->execute([':eid' => $id, ':pid' => (int)$pid]);
    }
}
