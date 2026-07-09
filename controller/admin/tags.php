<?php
require_once __DIR__ . '/../admin_check.php';
require_once __DIR__ . '/../../model/model_tags.php';

$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$sub    = $_GET['sub'] ?? '';

switch ("$method:$sub") {

    case 'GET:list':
        $category = $_GET['category'] ?? '';
        echo json_encode([
            'success' => true,
            'tags'    => $category !== '' ? getTagsByCategory($category) : getAllTags(),
        ]);
        break;

    case 'GET:get':
        $id = (int)($_GET['id'] ?? 0);
        $tag = $id ? getTagById($id) : false;
        echo json_encode($tag ? ['success' => true, 'tag' => $tag] : ['success' => false, 'code' => 'NOT_FOUND']);
        break;

    case 'POST:search':
        $results = searchTags($body['q'] ?? '', $body['category'] ?? '');
        echo json_encode(['success' => true, 'tags' => $results]);
        break;

    case 'POST:create':
        requireAdmin();
        $fr  = htmlspecialchars(trim($body['title_fr'] ?? ''), ENT_QUOTES, 'UTF-8');
        $nl  = htmlspecialchars(trim($body['title_nl'] ?? ''), ENT_QUOTES, 'UTF-8');
        $cat = $body['category'] ?? '';
        if (!$fr || !$cat) {
            echo json_encode(['success' => false, 'code' => 'MISSING_FIELD']);
            break;
        }
        $id = createTag($fr, $nl ?: $fr, $cat);
        echo json_encode($id ? ['success' => true, 'id' => $id] : ['success' => false, 'code' => 'INVALID_CATEGORY']);
        break;

    case 'POST:update':
        requireAdmin();
        $id  = (int)($body['id'] ?? 0);
        $fr  = htmlspecialchars(trim($body['title_fr'] ?? ''), ENT_QUOTES, 'UTF-8');
        $nl  = htmlspecialchars(trim($body['title_nl'] ?? ''), ENT_QUOTES, 'UTF-8');
        $cat = $body['category'] ?? '';
        if (!$id || !$fr || !$cat) {
            echo json_encode(['success' => false, 'code' => 'MISSING_FIELD']);
            break;
        }
        echo json_encode(['success' => updateTag($id, $fr, $nl ?: $fr, $cat)]);
        break;

    case 'POST:delete':
        requireAdmin();
        $id = (int)($body['id'] ?? 0);
        echo json_encode(['success' => $id ? deleteTag($id) : false]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'code' => 'INVALID_SUB']);
}
