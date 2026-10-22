<?php
/**
 * user_chat.php — Fil de messagerie privée de l'utilisateur connecté avec l'admin.
 * GET  : récupère son propre fil (et marque les réponses admin comme lues).
 * POST : envoie un nouveau message dans son fil.
 */
header('Content-Type: application/json');
if (session_status() === PHP_SESSION_NONE) session_start();

if (empty($_SESSION['user']['id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'code' => 'NOT_LOGGED_IN']);
    exit;
}

require_once __DIR__ . '/../model/db.php';
require_once __DIR__ . '/../model/model_comments.php';

$userId = (int)$_SESSION['user']['id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    markChatThreadRead($userId, false);
    echo json_encode(['success' => true, 'messages' => getChatThread($userId)]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body    = json_decode(file_get_contents('php://input'), true) ?? [];
    $message = trim($body['message'] ?? '');

    if (!$message) {
        echo json_encode(['success' => false, 'code' => 'MISSING_FIELD']);
        exit;
    }
    if (mb_strlen($message) > 2000) {
        echo json_encode(['success' => false, 'code' => 'MESSAGE_TOO_LONG']);
        exit;
    }

    $message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    $id = createChatMessage($userId, $message, false);
    echo json_encode($id ? ['success' => true, 'id' => $id] : ['success' => false, 'code' => 'DB_ERROR']);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
