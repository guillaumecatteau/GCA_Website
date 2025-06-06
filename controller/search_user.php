<?php
require_once('../model/model_user.php');

$response = ['code' => 'error', 'users' => []];

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    // Récupérer les données JSON envoyées via fetch
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    // On récupère les filtres avec EXACTEMENT les mêmes clés que dans ton JS
$filters = [
    'idFrom' => isset($input['idFrom']) && $input['idFrom'] !== '' ? (int) $input['idFrom'] : null,
    'idTo' => isset($input['idTo']) && $input['idTo'] !== '' ? (int) $input['idTo'] : null,
    'name' => isset($input['name']) ? trim($input['name']) : '',
    'firstname' => isset($input['firstname']) ? trim($input['firstname']) : '',
    'mail' => isset($input['mail']) ? trim($input['mail']) : '',
    'subscription' => isset($input['subscription']) ? trim($input['subscription']) : '',
    'isAdmin' => isset($input['isAdmin']) && $input['isAdmin'] !== '' ? 1 : '',
    'newsletter' => isset($input['newsletter']) && $input['newsletter'] !== '' ? 1 : '',
];

    $users = searchUsers($filters);

    if (is_array($users)) {
        if (count($users) > 0) {
            $response['code'] = 'success';
            $response['users'] = $users;
        } else {
            $response['code'] = 'no_results';
            $response['users'] = [];
        }
    }
} catch (Exception $e) {
    $response['code'] = 'error';
    $response['error'] = $e->getMessage();
}

header('Content-Type: application/json');
echo json_encode($response);
exit;