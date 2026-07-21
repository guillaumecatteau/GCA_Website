<?php
require_once __DIR__ . '/db.php';

// ─── Pages (projet / expertise / blog) ───────────────────────────────────────

const PAGE_TYPES = ['projet','expertise','blog'];

function getAllPages(string $type = '', bool $visibleOnly = false): array
{
    global $bdd;
    $conditions = [];
    $params = [];
    if ($type !== '' && in_array($type, PAGE_TYPES, true)) {
        $conditions[] = 'p.type = :type';
        $params[':type'] = $type;
    }
    if ($visibleOnly) {
        $conditions[] = 'p.is_visible = 1';
    }
    $where = empty($conditions) ? '' : 'WHERE ' . implode(' AND ', $conditions);
    $stmt = $bdd->prepare(
        "SELECT p.id, p.type, p.slug, p.title_fr, p.title_en,
                p.is_visible, p.comments_enabled,
                p.date_start, p.date_end, p.date_publication,
                p.thumbnail_id, p.created_at, p.updated_at
         FROM pages p $where ORDER BY p.updated_at DESC"
    );
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getPageById(int $id): array|false
{
    global $bdd;
    $stmt = $bdd->prepare("SELECT * FROM pages WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $page = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$page) return false;
    $page['tags']        = getPageTags($id);
    $page['related']     = getRelatedPages($id);
    $page['experiences'] = getPageExperiences($id);
    $page['blocks']      = getPageBlocks($id);
    return $page;
}

function getPageBySlug(string $slug): array|false
{
    global $bdd;
    $stmt = $bdd->prepare("SELECT id FROM pages WHERE slug = :slug");
    $stmt->execute([':slug' => $slug]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) return false;
    return getPageById((int)$row['id']);
}

function createPage(array $data): int|false
{
    global $bdd;
    if (!in_array($data['type'] ?? '', PAGE_TYPES, true)) return false;
    $slug = generateSlug($data['title_fr'] ?? '', $data['type']);
    $stmt = $bdd->prepare(
        "INSERT INTO pages
           (type, slug, title_fr, title_en, subtitle_fr, subtitle_en,
            main_visual_id, thumbnail_id, is_visible, comments_enabled,
            date_start, date_end, date_publication)
         VALUES
           (:type, :slug, :tfr, :ten, :sfr, :sen,
            :mvi, :thi, :vis, :com,
            :ds, :de, :dp)"
    );
    $stmt->execute([
        ':type' => $data['type'],
        ':slug' => $slug,
        ':tfr'  => $data['title_fr']    ?? '',
        ':ten'  => $data['title_en']    ?? '',
        ':sfr'  => $data['subtitle_fr'] ?? null,
        ':sen'  => $data['subtitle_en'] ?? null,
        ':mvi'  => $data['main_visual_id'] ? (int)$data['main_visual_id'] : null,
        ':thi'  => $data['thumbnail_id']   ? (int)$data['thumbnail_id']   : null,
        ':vis'  => (int)($data['is_visible']       ?? 0),
        ':com'  => (int)($data['comments_enabled'] ?? 0),
        ':ds'   => $data['date_start']       ?? null,
        ':de'   => $data['date_end']         ?? null,
        ':dp'   => $data['date_publication'] ?? null,
    ]);
    $id = (int)$bdd->lastInsertId();
    _syncPageRelations($id, $data);
    return $id;
}

function updatePage(int $id, array $data): bool
{
    global $bdd;
    $allowed = [
        'title_fr','title_en','subtitle_fr','subtitle_en',
        'main_visual_id','thumbnail_id','is_visible','comments_enabled',
        'date_start','date_end','date_publication',
    ];
    $set = [];
    $params = [':id' => $id];
    foreach ($allowed as $col) {
        if (!array_key_exists($col, $data)) continue;
        $set[] = "`$col` = :$col";
        $params[":$col"] = $data[$col];
    }
    if (!empty($set)) {
        $stmt = $bdd->prepare("UPDATE pages SET " . implode(', ', $set) . " WHERE id = :id");
        $stmt->execute($params);
    }
    _syncPageRelations($id, $data);
    return true;
}

function deletePage(int $id): bool
{
    global $bdd;
    $stmt = $bdd->prepare("DELETE FROM pages WHERE id = :id");
    return $stmt->execute([':id' => $id]);
}

function searchPages(array $filters): array
{
    global $bdd;
    $conditions = [];
    $params = [];
    if (!empty($filters['type'])) {
        $conditions[] = 'p.type = :type';
        $params[':type'] = $filters['type'];
    }
    if (!empty($filters['q'])) {
        $conditions[] = '(p.title_fr LIKE :q OR p.title_en LIKE :q)';
        $params[':q'] = '%' . $filters['q'] . '%';
    }
    if (isset($filters['is_visible']) && $filters['is_visible'] !== '') {
        $conditions[] = 'p.is_visible = :vis';
        $params[':vis'] = (int)$filters['is_visible'];
    }
    if (!empty($filters['tag_id'])) {
        $conditions[] = 'EXISTS (SELECT 1 FROM pages_tags pt WHERE pt.page_id = p.id AND pt.tag_id = :tag)';
        $params[':tag'] = (int)$filters['tag_id'];
    }
    $where = empty($conditions) ? '' : 'WHERE ' . implode(' AND ', $conditions);
    $stmt = $bdd->prepare(
        "SELECT p.id, p.type, p.slug, p.title_fr, p.title_en,
                p.is_visible, p.date_publication, p.updated_at
         FROM pages p $where ORDER BY p.updated_at DESC"
    );
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// ─── Blocs de contenu ────────────────────────────────────────────────────────

function getPageBlocks(int $pageId): array
{
    global $bdd;
    $stmt = $bdd->prepare(
        "SELECT id, sort_order, block_type, content_fr, content_en, media_id
         FROM page_blocks WHERE page_id = :pid ORDER BY sort_order"
    );
    $stmt->execute([':pid' => $pageId]);
    $blocks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($blocks as &$b) {
        if ($b['block_type'] === 'gallery') {
            $b['gallery'] = getBlockGallery((int)$b['id']);
        }
    }
    return $blocks;
}

function savePageBlocks(int $pageId, array $blocks): void
{
    global $bdd;
    $bdd->prepare("DELETE FROM page_blocks WHERE page_id = :pid")->execute([':pid' => $pageId]);
    $ins = $bdd->prepare(
        "INSERT INTO page_blocks (page_id, sort_order, block_type, content_fr, content_en, media_id)
         VALUES (:pid, :ord, :type, :fr, :en, :mid)"
    );
    foreach ($blocks as $i => $b) {
        $ins->execute([
            ':pid'  => $pageId,
            ':ord'  => $i,
            ':type' => $b['block_type'] ?? 'text',
            ':fr'   => $b['content_fr'] ?? null,
            ':en'   => $b['content_en'] ?? null,
            ':mid'  => !empty($b['media_id']) ? (int)$b['media_id'] : null,
        ]);
        $blockId = (int)$bdd->lastInsertId();
        if (($b['block_type'] ?? '') === 'gallery' && !empty($b['gallery'])) {
            saveBlockGallery($blockId, $b['gallery']);
        }
    }
}

function getBlockGallery(int $blockId): array
{
    global $bdd;
    $stmt = $bdd->prepare(
        "SELECT media_id, sort_order FROM page_block_gallery
         WHERE block_id = :bid ORDER BY sort_order"
    );
    $stmt->execute([':bid' => $blockId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function saveBlockGallery(int $blockId, array $mediaIds): void
{
    global $bdd;
    $ins = $bdd->prepare(
        "INSERT INTO page_block_gallery (block_id, media_id, sort_order) VALUES (:bid, :mid, :ord)"
    );
    foreach ($mediaIds as $i => $mid) {
        $ins->execute([':bid' => $blockId, ':mid' => (int)$mid, ':ord' => $i]);
    }
}

// ─── Relations ───────────────────────────────────────────────────────────────

function getPageTags(int $pageId): array
{
    global $bdd;
    $stmt = $bdd->prepare(
        "SELECT t.id, t.title_fr, t.title_en, t.category
         FROM tags t JOIN pages_tags pt ON t.id = pt.tag_id
         WHERE pt.page_id = :pid"
    );
    $stmt->execute([':pid' => $pageId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getRelatedPages(int $pageId): array
{
    global $bdd;
    $stmt = $bdd->prepare(
        "SELECT p.id, p.type, p.slug, p.title_fr, p.title_en
         FROM pages p JOIN pages_related pr ON p.id = pr.related_page_id
         WHERE pr.page_id = :pid"
    );
    $stmt->execute([':pid' => $pageId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getPageExperiences(int $pageId): array
{
    global $bdd;
    $stmt = $bdd->prepare(
        "SELECT e.id, e.title_fr, e.title_en
         FROM experiences e JOIN pages_experiences pe ON e.id = pe.experience_id
         WHERE pe.page_id = :pid"
    );
    $stmt->execute([':pid' => $pageId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// ─── Helpers privés ──────────────────────────────────────────────────────────

function _syncPageRelations(int $id, array $data): void
{
    global $bdd;
    if (array_key_exists('tags', $data)) {
        $bdd->prepare("DELETE FROM pages_tags WHERE page_id = :id")->execute([':id' => $id]);
        $ins = $bdd->prepare("INSERT IGNORE INTO pages_tags (page_id, tag_id) VALUES (:pid, :tid)");
        foreach ((array)$data['tags'] as $tid) $ins->execute([':pid' => $id, ':tid' => (int)$tid]);
    }
    if (array_key_exists('related', $data)) {
        $bdd->prepare("DELETE FROM pages_related WHERE page_id = :id")->execute([':id' => $id]);
        $ins = $bdd->prepare("INSERT IGNORE INTO pages_related (page_id, related_page_id) VALUES (:pid, :rid)");
        foreach ((array)$data['related'] as $rid) $ins->execute([':pid' => $id, ':rid' => (int)$rid]);
    }
    if (array_key_exists('experiences', $data)) {
        $bdd->prepare("DELETE FROM pages_experiences WHERE page_id = :id")->execute([':id' => $id]);
        $ins = $bdd->prepare("INSERT IGNORE INTO pages_experiences (page_id, experience_id) VALUES (:pid, :eid)");
        foreach ((array)$data['experiences'] as $eid) $ins->execute([':pid' => $id, ':eid' => (int)$eid]);
    }
    if (array_key_exists('blocks', $data)) {
        savePageBlocks($id, (array)$data['blocks']);
    }
}

function generateSlug(string $title, string $type): string
{
    global $bdd;
    $base = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', iconv('UTF-8', 'ASCII//TRANSLIT', $title)), '-'));
    if ($base === '') $base = $type;
    $slug = $base;
    $i = 1;
    while (true) {
        $stmt = $bdd->prepare("SELECT COUNT(*) FROM pages WHERE slug = :slug");
        $stmt->execute([':slug' => $slug]);
        if ($stmt->fetchColumn() == 0) break;
        $slug = $base . '-' . (++$i);
    }
    return $slug;
}
