<?php
require_once __DIR__ . '/../admin_check.php';
require_once __DIR__ . '/../../model/model_user.php';

$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$sub    = $_GET['sub'] ?? '';  // list | get | create | update | delete | search | upload_avatar

switch ("$method:$sub") {

    case 'GET:list':
        echo json_encode(['success' => true, 'users' => getAllUsers()]);
        break;

    case 'GET:get':
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) { echo json_encode(['success' => false, 'code' => 'MISSING_ID']); break; }
        $u = getUserById($id);
        echo json_encode($u ? ['success' => true, 'user' => $u] : ['success' => false, 'code' => 'NOT_FOUND']);
        break;

    case 'POST:create':
        requireAdmin();
        $required = ['name','firstname','mail','password'];
        foreach ($required as $f) {
            if (empty($body[$f])) {
                echo json_encode(['success' => false, 'code' => 'MISSING_FIELD', 'field' => $f]);
                exit;
            }
        }
        if (emailExists($body['mail'])) {
            echo json_encode(['success' => false, 'code' => 'EMAIL_EXISTS']);
            break;
        }
        $ok = registerUser(
            htmlspecialchars(trim($body['name']), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($body['firstname']), ENT_QUOTES, 'UTF-8'),
            trim($body['mail']),
            password_hash($body['password'], PASSWORD_DEFAULT),
            $body['questionA'] ?? '',
            $body['questionB'] ?? '',
            (int)($body['newsletter'] ?? 0),
            date('Y-m-d'),
            $body['role'] ?? 'user'
        );
        echo json_encode(['success' => $ok, 'code' => $ok ? 'CREATED' : 'DB_ERROR']);
        break;

    case 'POST:update':
        requireAdmin();
        $id = (int)($body['id'] ?? 0);
        if (!$id) { echo json_encode(['success' => false, 'code' => 'MISSING_ID']); break; }
        $fields = array_intersect_key($body, array_flip(['name','firstname','mail','role','newsletter']));
        $ok = updateUser($id, $fields);
        echo json_encode(['success' => $ok]);
        break;

    case 'POST:delete':
        requireAdmin();
        $id = (int)($body['id'] ?? 0);
        if (!$id) { echo json_encode(['success' => false, 'code' => 'MISSING_ID']); break; }
        if ($id === currentUserId()) {
            echo json_encode(['success' => false, 'code' => 'SELF_DELETE']);
            break;
        }
        echo json_encode(['success' => deleteUser($id)]);
        break;

    case 'POST:search':
        $filters = [
            'idFrom'      => $body['idFrom']      ?? '',
            'idTo'        => $body['idTo']        ?? '',
            'name'        => $body['name']        ?? '',
            'firstname'   => $body['firstname']   ?? '',
            'mail'        => $body['mail']        ?? '',
            'subscription'=> $body['subscription']?? '',
            'role'        => $body['role']        ?? '',
            'newsletter'  => $body['newsletter']  ?? '',
        ];
        $users = searchUsers($filters);
        echo json_encode(['success' => true, 'code' => count($users) ? 'success' : 'no_results', 'users' => $users]);
        break;

    case 'POST:upload_avatar':
        $id = (int)($body['id'] ?? currentUserId());
        if (empty($_FILES['avatar'])) {
            echo json_encode(['success' => false, 'code' => 'NO_FILE']);
            break;
        }
        require_once __DIR__ . '/../../model/model_medias.php';
        $result = uploadMedia($_FILES['avatar'], 'image', []);
        if (!$result['success']) { echo json_encode($result); break; }
        updateUser($id, ['avatar' => $result['file_path']]);
        echo json_encode(['success' => true, 'avatar' => $result['file_path']]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'code' => 'INVALID_SUB']);
}
