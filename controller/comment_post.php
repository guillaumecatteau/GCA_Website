<?php
/**
 * comment_post.php — Poster un commentaire public.
 * Accessible uniquement aux utilisateurs connectés.
 */
header('Content-Type: application/json');
if (session_status() === PHP_SESSION_NONE) session_start();

if (empty($_SESSION['user']['id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'code' => 'NOT_LOGGED_IN']);
    exit;
}

require_once __DIR__ . '/../model/model_comments.php';
require_once __DIR__ . '/../model/model_pages.php';

$body    = json_decode(file_get_contents('php://input'), true) ?? [];
$pageId  = (int)($body['page_id'] ?? 0);
$message = trim($body['message'] ?? '');

if (!$pageId || !$message) {
    http_response_code(400);
    echo json_encode(['success' => false, 'code' => 'MISSING_FIELD']);
    exit;
}

// Vérifier que la page existe et a les commentaires activés
$page = getPageById($pageId);
if (!$page || !$page['comments_enabled'] || !$page['is_visible']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'code' => 'COMMENTS_DISABLED']);
    exit;
}

// Limiter la longueur du message
if (mb_strlen($message) > 2000) {
    echo json_encode(['success' => false, 'code' => 'MESSAGE_TOO_LONG']);
    exit;
}

$message  = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
$userId   = (int)$_SESSION['user']['id'];
$id       = createComment($userId, $pageId, $message);

echo json_encode($id
    ? ['success' => true, 'id' => $id]
    : ['success' => false, 'code' => 'DB_ERROR']
);
