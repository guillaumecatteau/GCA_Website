<?php
require_once __DIR__ . '/../admin_check.php';
require_once __DIR__ . '/../../model/model_comments.php';

$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$sub    = $_GET['sub'] ?? '';

switch ("$method:$sub") {

    case 'GET:list':
    case 'POST:search':
        $filters = [
            'id'         => $body['id']         ?? ($_GET['id'] ?? ''),
            'user_id'    => $body['user_id']    ?? ($_GET['user_id'] ?? ''),
            'page_id'    => $body['page_id']    ?? ($_GET['page_id'] ?? ''),
            'date_from'  => $body['date_from']  ?? '',
            'date_to'    => $body['date_to']    ?? '',
            'is_hidden'  => $body['is_hidden']  ?? '',
            'q'          => $body['q']          ?? '',
        ];
        $page    = max(1, (int)($body['page'] ?? $_GET['page'] ?? 1));
        $perPage = min(100, (int)($body['per_page'] ?? 30));
        $comments = getComments($filters, $page, $perPage);
        $total    = countComments($filters);
        echo json_encode([
            'success'  => true,
            'comments' => $comments,
            'total'    => $total,
            'page'     => $page,
        ]);
        break;

    case 'POST:update':
        $id  = (int)($body['id'] ?? 0);
        $msg = htmlspecialchars(trim($body['message'] ?? ''), ENT_QUOTES, 'UTF-8');
        if (!$id || !$msg) { echo json_encode(['success' => false, 'code' => 'MISSING_FIELD']); break; }
        echo json_encode(['success' => updateComment($id, $msg)]);
        break;

    case 'POST:toggle_hidden':
        $id     = (int)($body['id'] ?? 0);
        $hidden = (bool)($body['is_hidden'] ?? false);
        echo json_encode(['success' => $id ? setCommentHidden($id, $hidden) : false]);
        break;

    case 'POST:delete':
        requireAdmin();
        $id = (int)($body['id'] ?? 0);
        echo json_encode(['success' => $id ? deleteComment($id) : false]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'code' => 'INVALID_SUB']);
}
