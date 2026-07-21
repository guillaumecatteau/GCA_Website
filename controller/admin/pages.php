<?php
require_once __DIR__ . '/../admin_check.php';
require_once __DIR__ . '/../../model/model_pages.php';

$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$sub    = $_GET['sub'] ?? '';

switch ("$method:$sub") {

    case 'GET:list':
        $type = $_GET['type'] ?? '';
        echo json_encode(['success' => true, 'pages' => getAllPages($type)]);
        break;

    case 'GET:get':
        $id = (int)($_GET['id'] ?? 0);
        $p  = $id ? getPageById($id) : false;
        echo json_encode($p ? ['success' => true, 'page' => $p] : ['success' => false, 'code' => 'NOT_FOUND']);
        break;

    case 'POST:search':
        echo json_encode(['success' => true, 'pages' => searchPages([
            'type'       => $body['type']       ?? '',
            'q'          => $body['q']          ?? '',
            'is_visible' => $body['is_visible'] ?? '',
            'tag_id'     => $body['tag_id']     ?? '',
        ])]);
        break;

    case 'POST:create':
        requireAdmin();
        if (empty($body['type']) || empty($body['title_fr'])) {
            echo json_encode(['success' => false, 'code' => 'MISSING_FIELD']);
            break;
        }
        $data = _sanitizePageData($body);
        $id = createPage($data);
        echo json_encode($id ? ['success' => true, 'id' => $id] : ['success' => false, 'code' => 'DB_ERROR']);
        break;

    case 'POST:update':
        requireAdmin();
        $id = (int)($body['id'] ?? 0);
        if (!$id) { echo json_encode(['success' => false, 'code' => 'MISSING_ID']); break; }
        $data = _sanitizePageData($body);
        echo json_encode(['success' => updatePage($id, $data)]);
        break;

    case 'POST:save_blocks':
        requireAdmin();
        $id     = (int)($body['page_id'] ?? 0);
        $blocks = (array)($body['blocks'] ?? []);
        if (!$id) { echo json_encode(['success' => false, 'code' => 'MISSING_ID']); break; }
        savePageBlocks($id, $blocks);
        echo json_encode(['success' => true]);
        break;

    case 'POST:toggle_visible':
        requireAdmin();
        $id = (int)($body['id'] ?? 0);
        $v  = (int)(bool)($body['is_visible'] ?? 0);
        echo json_encode(['success' => updatePage($id, ['is_visible' => $v])]);
        break;

    case 'POST:delete':
        requireAdmin();
        $id = (int)($body['id'] ?? 0);
        echo json_encode(['success' => $id ? deletePage($id) : false]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'code' => 'INVALID_SUB']);
}

function _sanitizePageData(array $body): array
{
    $str = fn($v) => htmlspecialchars(trim($v ?? ''), ENT_QUOTES, 'UTF-8');
    return [
        'type'             => $body['type']       ?? '',
        'title_fr'         => $str($body['title_fr']   ?? ''),
        'title_en'         => $str($body['title_en']   ?? ''),
        'subtitle_fr'      => $str($body['subtitle_fr'] ?? ''),
        'subtitle_en'      => $str($body['subtitle_en'] ?? ''),
        'main_visual_id'   => !empty($body['main_visual_id'])  ? (int)$body['main_visual_id']  : null,
        'thumbnail_id'     => !empty($body['thumbnail_id'])    ? (int)$body['thumbnail_id']    : null,
        'is_visible'       => (int)(bool)($body['is_visible']       ?? 0),
        'comments_enabled' => (int)(bool)($body['comments_enabled'] ?? 0),
        'date_start'       => $body['date_start']       ?: null,
        'date_end'         => $body['date_end']         ?: null,
        'date_publication' => $body['date_publication'] ?: null,
        'tags'             => (array)($body['tags']        ?? []),
        'related'          => (array)($body['related']     ?? []),
        'experiences'      => (array)($body['experiences'] ?? []),
        'blocks'           => $body['blocks'] ?? null,
    ];
}
