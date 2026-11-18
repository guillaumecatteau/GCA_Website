<?php
/**
 * comment_post.php — Poste un commentaire public (ou une réponse) sur une page
 * de blog. Si l'admin est connecté, le post est automatiquement signé
 * "GC Digital Arts" sans qu'il ait à saisir de nom/mail (cf. model_comments.php).
 */
header('Content-Type: application/json');
if (session_status() === PHP_SESSION_NONE) session_start();

require_once __DIR__ . '/../model/model_comments.php';
require_once __DIR__ . '/../model/model_pages.php';
require_once __DIR__ . '/../model/model_admin.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

$body     = json_decode(file_get_contents('php://input'), true) ?? [];
$pageId   = (int)($body['page_id'] ?? 0);
$parentId = isset($body['parent_id']) ? (int)$body['parent_id'] : null;
$message  = trim((string)($body['message'] ?? ''));

if (!$pageId || !$message) {
    http_response_code(400);
    echo json_encode(['success' => false, 'code' => 'MISSING_FIELD']);
    exit;
}

// Seules les pages de type "blog" avec les commentaires activés acceptent des posts.
$page = getPageById($pageId);
if (!$page || $page['type'] !== 'blog' || !$page['is_visible'] || !$page['comments_enabled']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'code' => 'COMMENTS_DISABLED']);
    exit;
}

// Une réponse doit cibler un commentaire visible de la MÊME page (anti cross-page abuse).
if ($parentId) {
    $parent = getCommentById($parentId);
    if (!$parent || (int)$parent['page_id'] !== $pageId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'code' => 'INVALID_PARENT']);
        exit;
    }
}

if (mb_strlen($message) > 2000) {
    echo json_encode(['success' => false, 'code' => 'MESSAGE_TOO_LONG']);
    exit;
}

$isAdmin = !empty($_SESSION['admin']);

if ($isAdmin) {
    $username = COMMENT_ADMIN_USERNAME;
    $mail     = getAdminAccess()['mail'];
} else {
    $username = trim((string)($body['username'] ?? ''));
    $mail     = trim((string)($body['mail'] ?? ''));

    if (mb_strlen($username) < 2) {
        echo json_encode(['success' => false, 'code' => 'INVALID_USERNAME']);
        exit;
    }
    if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'code' => 'INVALID_MAIL']);
        exit;
    }
    if (mb_strlen($username) > 100 || mb_strlen($mail) > 150) {
        echo json_encode(['success' => false, 'code' => 'FIELD_TOO_LONG']);
        exit;
    }
    $username = htmlspecialchars($username, ENT_QUOTES, 'UTF-8');
}

$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
$id = createComment($pageId, $parentId, $username, $mail, $message, $isAdmin);

echo json_encode($id
    ? ['success' => true, 'id' => $id, 'username' => $username, 'is_admin' => $isAdmin]
    : ['success' => false, 'code' => 'DB_ERROR']
);
