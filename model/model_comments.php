<?php
require_once __DIR__ . '/db.php';

// ─── Comments — Redéfinition : commentaires anonymes (nom/mail saisis à la volée,
// mail jamais exposé publiquement), réponses hiérarchisées (parent_id), admin
// auto-signé "GC Digital Arts". Réservé aux pages de type "blog". ──────────────

const COMMENT_ADMIN_USERNAME = 'GC Digital Arts';

// ── Admin : recherche/modération ───────────────────────────────────────────

function getComments(array $filters = [], int $page = 1, int $perPage = 30): array
{
    global $bdd;
    $conditions = [];
    $params = [];

    if (!empty($filters['id'])) {
        $conditions[] = 'c.id = :id';
        $params[':id'] = (int)$filters['id'];
    }
    if (!empty($filters['page_id'])) {
        $conditions[] = 'c.page_id = :pid';
        $params[':pid'] = (int)$filters['page_id'];
    }
    if (!empty($filters['username'])) {
        $conditions[] = 'c.username LIKE :username';
        $params[':username'] = '%' . $filters['username'] . '%';
    }
    if (!empty($filters['mail'])) {
        $conditions[] = 'c.mail LIKE :mail';
        $params[':mail'] = '%' . $filters['mail'] . '%';
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
        "SELECT c.id, c.page_id, c.parent_id, c.username, c.mail, c.is_admin,
                c.message, c.is_hidden, c.likes, c.created_at, c.edited_at,
                p.title_fr AS page_title, p.slug AS page_slug
         FROM comments c
         LEFT JOIN pages p ON c.page_id = p.id
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
    if (!empty($filters['page_id']))  { $conditions[] = 'page_id = :pid';      $params[':pid']      = (int)$filters['page_id']; }
    if (!empty($filters['username'])) { $conditions[] = 'username LIKE :u';    $params[':u']         = '%' . $filters['username'] . '%'; }
    if (!empty($filters['mail']))     { $conditions[] = 'mail LIKE :m';        $params[':m']         = '%' . $filters['mail'] . '%'; }
    if (!empty($filters['date_from'])) { $conditions[] = 'DATE(created_at) >= :dfrom'; $params[':dfrom'] = $filters['date_from']; }
    if (!empty($filters['date_to']))   { $conditions[] = 'DATE(created_at) <= :dto';   $params[':dto']   = $filters['date_to']; }
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

function createComment(int $pageId, ?int $parentId, string $username, string $mail, string $message, bool $isAdmin): int|false
{
    global $bdd;
    $stmt = $bdd->prepare(
        "INSERT INTO comments (page_id, parent_id, username, mail, is_admin, message)
         VALUES (:pid, :parent, :username, :mail, :admin, :msg)"
    );
    $stmt->execute([
        ':pid'      => $pageId,
        ':parent'   => $parentId,
        ':username' => $isAdmin ? COMMENT_ADMIN_USERNAME : $username,
        ':mail'     => $mail,
        ':admin'    => (int)$isAdmin,
        ':msg'      => $message,
    ]);
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
    // ON DELETE CASCADE (comments_parent_fk) supprime également toutes les réponses.
    $stmt = $bdd->prepare("DELETE FROM comments WHERE id = :id");
    return $stmt->execute([':id' => $id]);
}

// ── Public : affichage hiérarchisé (page de blog) ──────────────────────────
// Le mail n'est jamais retourné par cette fonction (cf. demande : "seul le nom
// d'utilisateur et le commentaire seront visibles").

function getPublicComments(int $pageId): array
{
    global $bdd;
    $stmt = $bdd->prepare(
        "SELECT id, parent_id, username, is_admin, message, created_at, edited_at
         FROM comments
         WHERE page_id = :pid AND is_hidden = 0
         ORDER BY created_at ASC"
    );
    $stmt->execute([':pid' => $pageId]);
    $flat = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return _buildCommentTree($flat, null);
}

function _buildCommentTree(array $flat, ?int $parentId): array
{
    $branch = [];
    foreach ($flat as $row) {
        $rowParent = $row['parent_id'] !== null ? (int)$row['parent_id'] : null;
        if ($rowParent !== $parentId) continue;
        $replies = _buildCommentTree($flat, (int)$row['id']);
        $row['replies'] = $replies;
        $row['reply_count'] = _countDescendants($replies);
        $branch[] = $row;
    }
    return $branch;
}

function _countDescendants(array $replies): int
{
    $count = count($replies);
    foreach ($replies as $r) {
        $count += _countDescendants($r['replies']);
    }
    return $count;
}
