<?php
/**
 * comments_public.php — Liste les commentaires visibles d'une page de blog,
 * hiérarchisés (réponses imbriquées), sans jamais exposer l'adresse mail.
 */
header('Content-Type: application/json');
require_once __DIR__ . '/../model/model_comments.php';
require_once __DIR__ . '/../model/model_pages.php';

$pageId = (int)($_GET['page_id'] ?? 0);
if (!$pageId) {
    echo json_encode(['success' => false, 'code' => 'MISSING_FIELD']);
    exit;
}

$page = getPageById($pageId);
if (!$page || $page['type'] !== 'blog' || !$page['is_visible'] || !$page['comments_enabled']) {
    echo json_encode(['success' => false, 'code' => 'COMMENTS_DISABLED']);
    exit;
}

echo json_encode(['success' => true, 'comments' => getPublicComments($pageId)]);
