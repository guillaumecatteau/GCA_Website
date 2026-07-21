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
        $fr   = htmlspecialchars(trim($body['title_fr'] ?? ''), ENT_QUOTES, 'UTF-8');
        $en   = htmlspecialchars(trim($body['title_en'] ?? ''), ENT_QUOTES, 'UTF-8');
        $cat  = $body['category'] ?? '';
        $icon = $body['icon_path'] ? htmlspecialchars(trim($body['icon_path']), ENT_QUOTES, 'UTF-8') : null;
        if (!$fr || !$cat) {
            echo json_encode(['success' => false, 'code' => 'MISSING_FIELD']);
            break;
        }
        $id = createTag($fr, $en ?: $fr, $cat, $icon ?: null);
        echo json_encode($id ? ['success' => true, 'id' => $id] : ['success' => false, 'code' => 'INVALID_CATEGORY']);
        break;

    case 'POST:update':
        requireAdmin();
        $id   = (int)($body['id'] ?? 0);
        $fr   = htmlspecialchars(trim($body['title_fr'] ?? ''), ENT_QUOTES, 'UTF-8');
        $en   = htmlspecialchars(trim($body['title_en'] ?? ''), ENT_QUOTES, 'UTF-8');
        $cat  = $body['category'] ?? '';
        $icon = isset($body['icon_path']) ? (htmlspecialchars(trim($body['icon_path']), ENT_QUOTES, 'UTF-8') ?: null) : null;
        if (!$id || !$fr || !$cat) {
            echo json_encode(['success' => false, 'code' => 'MISSING_FIELD']);
            break;
        }
        echo json_encode(['success' => updateTag($id, $fr, $en ?: $fr, $cat, $icon)]);
        break;

    case 'GET:icons': {
        // Liste les images disponibles dans un dossier autorisé
        $folder  = $_GET['folder'] ?? 'vue/assets/images/icons';
        $allowed = ['vue/assets/images/icons', 'vue/assets/images/icons/PNGs'];
        if (!in_array($folder, $allowed, true)) {
            echo json_encode(['success' => false, 'code' => 'INVALID_FOLDER']); break;
        }
        $base     = realpath(__DIR__ . '/../../') . '/';
        $fullPath = realpath($base . $folder);
        if (!$fullPath || !is_dir($fullPath)) {
            echo json_encode(['success' => true, 'folder' => $folder, 'files' => []]); break;
        }
        $exts = ['png','jpg','jpeg','webp','svg','gif'];
        $files = array_values(array_filter(scandir($fullPath), function($f) use ($exts, $fullPath) {
            if ($f[0] === '.' || is_dir($fullPath . '/' . $f)) return false;
            return in_array(strtolower(pathinfo($f, PATHINFO_EXTENSION)), $exts, true);
        }));
        echo json_encode(['success' => true, 'folder' => $folder, 'files' => $files]);
        break;
    }

    case 'POST:delete':
        requireAdmin();
        $id = (int)($body['id'] ?? 0);
        echo json_encode(['success' => $id ? deleteTag($id) : false]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'code' => 'INVALID_SUB']);
}
