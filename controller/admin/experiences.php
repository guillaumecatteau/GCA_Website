<?php
require_once __DIR__ . '/../admin_check.php';
require_once __DIR__ . '/../../model/model_experiences.php';

$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$sub    = $_GET['sub'] ?? '';

switch ("$method:$sub") {

    case 'GET:list':
        echo json_encode(['success' => true, 'experiences' => getAllExperiences()]);
        break;

    case 'GET:get':
        $id = (int)($_GET['id'] ?? 0);
        $e  = $id ? getExperienceById($id) : false;
        echo json_encode($e ? ['success' => true, 'experience' => $e] : ['success' => false, 'code' => 'NOT_FOUND']);
        break;

    case 'POST:create':
        requireAdmin();
        if (empty($body['title_fr']) || empty($body['date_start'])) {
            echo json_encode(['success' => false, 'code' => 'MISSING_FIELD']);
            break;
        }
        $data = _sanitizeExpData($body);
        $id = createExperience($data);
        echo json_encode($id ? ['success' => true, 'id' => $id] : ['success' => false, 'code' => 'DB_ERROR']);
        break;

    case 'POST:update':
        requireAdmin();
        $id = (int)($body['id'] ?? 0);
        if (!$id) { echo json_encode(['success' => false, 'code' => 'MISSING_ID']); break; }
        echo json_encode(['success' => updateExperience($id, _sanitizeExpData($body))]);
        break;

    case 'POST:delete':
        requireAdmin();
        $id = (int)($body['id'] ?? 0);
        echo json_encode(['success' => $id ? deleteExperience($id) : false]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'code' => 'INVALID_SUB']);
}

function _sanitizeExpData(array $body): array
{
    $str = fn($v) => htmlspecialchars(trim($v ?? ''), ENT_QUOTES, 'UTF-8');
    return [
        'title_fr'       => $str($body['title_fr']       ?? ''),
        'title_nl'       => $str($body['title_nl']       ?? ''),
        'date_start'     => $body['date_start']           ?: null,
        'date_end'       => $body['date_end']             ?: null,
        'logo_media_id'  => !empty($body['logo_media_id']) ? (int)$body['logo_media_id'] : null,
        'description_fr' => $str($body['description_fr'] ?? ''),
        'description_nl' => $str($body['description_nl'] ?? ''),
        'tags'           => (array)($body['tags']  ?? []),
        'pages'          => (array)($body['pages'] ?? []),
    ];
}
