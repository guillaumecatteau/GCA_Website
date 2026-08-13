<?php
require_once __DIR__ . '/../admin_check.php';
require_once __DIR__ . '/../../model/model_medias.php';

$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$sub    = $_GET['sub'] ?? '';

switch ("$method:$sub") {

    case 'GET:list':
        $page    = max(1, (int)($_GET['page'] ?? 1));
        $perPage = min(100, max(1, (int)($_GET['per_page'] ?? 40)));
        echo json_encode(['success' => true, 'medias' => getAllMedias($page, $perPage)]);
        break;

    case 'GET:get':
        $id = (int)($_GET['id'] ?? 0);
        $m  = $id ? getMediaById($id) : false;
        if ($m) $m['tags'] = getMediaTags($id);
        echo json_encode($m ? ['success' => true, 'media' => $m] : ['success' => false, 'code' => 'NOT_FOUND']);
        break;

    case 'POST:search':
        $results = searchMedias([
            'type'   => $body['type']   ?? '',
            'q'      => $body['q']      ?? '',
            'tag_id' => $body['tag_id'] ?? '',
        ]);
        echo json_encode(['success' => true, 'medias' => $results]);
        break;

    case 'POST:upload':
        // Fichier uploadé (multipart/form-data)
        $type = $_POST['type'] ?? 'image';
        $meta = [
            'description_fr' => htmlspecialchars($_POST['description_fr'] ?? '', ENT_QUOTES, 'UTF-8'),
            'description_en' => htmlspecialchars($_POST['description_en'] ?? '', ENT_QUOTES, 'UTF-8'),
            'alt_text'       => htmlspecialchars($_POST['alt_text'] ?? '',       ENT_QUOTES, 'UTF-8'),
            'tags'           => json_decode($_POST['tags'] ?? '[]', true) ?: [],
        ];
        if (empty($_FILES['file'])) {
            echo json_encode(['success' => false, 'code' => 'NO_FILE']);
            break;
        }
        echo json_encode(uploadMedia($_FILES['file'], $type, $meta));
        break;

    case 'POST:add_link':
        // Lien youtube ou audio_link
        $type = $body['type'] ?? '';
        if (!in_array($type, ['youtube','audio_link'], true)) {
            echo json_encode(['success' => false, 'code' => 'INVALID_TYPE']);
            break;
        }
        $url = trim($body['url'] ?? '');
        if (!$url) { echo json_encode(['success' => false, 'code' => 'MISSING_URL']); break; }
        $meta = [
            'description_fr' => htmlspecialchars($body['description_fr'] ?? '', ENT_QUOTES, 'UTF-8'),
            'description_en' => htmlspecialchars($body['description_en'] ?? '', ENT_QUOTES, 'UTF-8'),
            'alt_text'       => htmlspecialchars($body['alt_text'] ?? '',       ENT_QUOTES, 'UTF-8'),
            'tags'           => (array)($body['tags'] ?? []),
        ];
        $id = createMedia($type, $url, $meta);
        echo json_encode($id ? ['success' => true, 'id' => $id] : ['success' => false, 'code' => 'DB_ERROR']);
        break;

    case 'POST:update':
        $id = (int)($body['id'] ?? 0);
        if (!$id) { echo json_encode(['success' => false, 'code' => 'MISSING_ID']); break; }
        $fields = [
            'description_fr' => htmlspecialchars($body['description_fr'] ?? '', ENT_QUOTES, 'UTF-8'),
            'description_en' => htmlspecialchars($body['description_en'] ?? '', ENT_QUOTES, 'UTF-8'),
            'alt_text'       => htmlspecialchars($body['alt_text'] ?? '',       ENT_QUOTES, 'UTF-8'),
            'tags'           => (array)($body['tags'] ?? []),
        ];
        echo json_encode(['success' => updateMedia($id, $fields)]);
        break;

    case 'POST:delete':
        requireAdmin();
        $id = (int)($body['id'] ?? 0);
        echo json_encode(['success' => $id ? deleteMedia($id) : false]);
        break;

    case 'GET:browse':
        $folder = trim($_GET['folder'] ?? '');
        $folder = preg_replace('/\.\.|\\/', '', $folder); // no traversal
        $absDir = realpath(__DIR__ . '/../../' . ltrim($folder, '/'));
        $base   = realpath(__DIR__ . '/../../');
        if (!$absDir || !str_starts_with($absDir, $base) || !is_dir($absDir)) {
            echo json_encode(['success' => false, 'code' => 'NOT_FOUND']); break;
        }
        $imgExts = ['jpg','jpeg','png','gif','webp','svg'];
        $files = []; $dirs = [];
        foreach (new DirectoryIterator($absDir) as $f) {
            if ($f->isDot()) continue;
            if ($f->isDir()) {
                $dirs[] = ['name' => $f->getFilename(), 'path' => ltrim($folder, '/') . '/' . $f->getFilename()];
            } elseif (in_array(strtolower($f->getExtension()), $imgExts)) {
                $files[] = ltrim($folder, '/') . '/' . $f->getFilename();
            }
        }
        usort($dirs, fn($a,$b) => strcmp($a['name'],$b['name']));
        sort($files);
        echo json_encode(['success' => true, 'files' => $files, 'dirs' => $dirs]);
        break;

    case 'POST:register':
        requireAdmin();
        $path = trim($body['file_path'] ?? '');
        if (!$path) { echo json_encode(['success' => false, 'code' => 'MISSING_PATH']); break; }
        $existing = getMediaByPath($path);
        if ($existing) {
            echo json_encode(['success' => true, 'id' => $existing['id'], 'existing' => true]);
        } else {
            $id = createMedia('image', $path, []);
            echo json_encode($id ? ['success' => true, 'id' => $id] : ['success' => false, 'code' => 'DB_ERROR']);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'code' => 'INVALID_SUB']);
}
