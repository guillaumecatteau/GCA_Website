<?php
require_once __DIR__ . '/db.php';

// ─── Comments ────────────────────────────────────────────────────────────────

function getComments(array $filters = [], int $page = 1, int $perPage = 30): array
{
    global $bdd;
    $conditions = [];
    $params = [];

    if (!empty($filters['id'])) {
        $conditions[] = 'c.id = :id';
        $params[':id'] = (int)$filters['id'];
    }
    if (!empty($filters['user_id'])) {
        $conditions[] = 'c.user_id = :uid';
        $params[':uid'] = (int)$filters['user_id'];
    }
    if (!empty($filters['page_id'])) {
        $conditions[] = 'c.page_id = :pid';
        $params[':pid'] = (int)$filters['page_id'];
    }
    if (!empty($filters['date_from'])) {
        $conditions[] = 'DATE(c.created_at) >= :dfrom';
        $params[':dfrom'] = $filters['date_from'];
    }
    if (!empty($filters['date_to'])) {
        $conditions[] = 'DATE(c.created_at) <= :dto';
        $params[':dto'] = $filters['date_to'];
    }
    if (isset($filters['is_hidden']) && $filters['is_hidden'] !== '') {
        $conditions[] = 'c.is_hidden = :hidden';
        $params[':hidden'] = (int)$filters['is_hidden'];
    }
    if (!empty($filters['q'])) {
        $conditions[] = 'c.message LIKE :q';
        $params[':q'] = '%' . $filters['q'] . '%';
    }

    $where = empty($conditions) ? '' : 'WHERE ' . implode(' AND ', $conditions);
    $offset = ($page - 1) * $perPage;

    $stmt = $bdd->prepare(
        "SELECT c.id, c.user_id, c.page_id, c.message, c.is_hidden, c.likes,
                c.created_at, c.edited_at,
                CONCAT(u.firstname, ' ', u.name) AS user_name,
                p.title_fr AS page_title, p.type AS page_type, p.slug AS page_slug
         FROM comments c
         LEFT JOIN users u ON c.user_id = u.id
         LEFT JOIN pages p  ON c.page_id  = p.id
         $where
         ORDER BY c.created_at DESC
         LIMIT :lim OFFSET :off"
    );
    foreach ($params as $key => $val) $stmt->bindValue($key, $val);
    $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset,  PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function countComments(array $filters = []): int
{
    global $bdd;
    $conditions = [];
    $params = [];
    if (!empty($filters['page_id'])) { $conditions[] = 'page_id = :pid'; $params[':pid'] = (int)$filters['page_id']; }
    if (!empty($filters['user_id'])) { $conditions[] = 'user_id = :uid'; $params[':uid'] = (int)$filters['user_id']; }
    if (isset($filters['is_hidden']) && $filters['is_hidden'] !== '') {
        $conditions[] = 'is_hidden = :hidden';
        $params[':hidden'] = (int)$filters['is_hidden'];
    }
    $where = empty($conditions) ? '' : 'WHERE ' . implode(' AND ', $conditions);
    $stmt = $bdd->prepare("SELECT COUNT(*) FROM comments $where");
    $stmt->execute($params);
    return (int)$stmt->fetchColumn();
}

function getCommentById(int $id): array|false
{
    global $bdd;
    $stmt = $bdd->prepare("SELECT * FROM comments WHERE id = :id");
    $stmt->execute([':id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function createComment(int $userId, int $pageId, string $message): int|false
{
    global $bdd;
    $stmt = $bdd->prepare(
        "INSERT INTO comments (user_id, page_id, message) VALUES (:uid, :pid, :msg)"
    );
    $stmt->execute([':uid' => $userId, ':pid' => $pageId, ':msg' => $message]);
    return (int)$bdd->lastInsertId();
}

function updateComment(int $id, string $message): bool
{
    global $bdd;
    $stmt = $bdd->prepare(
        "UPDATE comments SET message = :msg, edited_at = NOW() WHERE id = :id"
    );
    return $stmt->execute([':msg' => $message, ':id' => $id]);
}

function setCommentHidden(int $id, bool $hidden): bool
{
    global $bdd;
    $stmt = $bdd->prepare("UPDATE comments SET is_hidden = :h WHERE id = :id");
    return $stmt->execute([':h' => (int)$hidden, ':id' => $id]);
}

function deleteComment(int $id): bool
{
    global $bdd;
    $stmt = $bdd->prepare("DELETE FROM comments WHERE id = :id");
    return $stmt->execute([':id' => $id]);
}

function getPublicComments(int $pageId): array
{
    global $bdd;
    $stmt = $bdd->prepare(
        "SELECT c.id, c.message, c.likes, c.created_at, c.edited_at,
                CONCAT(u.firstname, ' ', u.name) AS user_name,
                u.avatar AS user_avatar
         FROM comments c JOIN users u ON c.user_id = u.id
         WHERE c.page_id = :pid AND c.is_hidden = 0
         ORDER BY c.created_at ASC"
    );
    $stmt->execute([':pid' => $pageId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
