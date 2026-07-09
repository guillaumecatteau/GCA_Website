<?php
// Session déjà démarrée par index.php — ne pas rappeler session_start()

$STATES_FILE = __DIR__ . '/../json/scene-states.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Lecture des états
    if (!file_exists($STATES_FILE)) {
        echo json_encode(['success' => true, 'states' => (object)[]]);
        exit;
    }
    $json = file_get_contents($STATES_FILE);
    $states = json_decode($json, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['success' => false, 'code' => 'PARSE_ERROR', 'message' => 'Fichier JSON corrompu.']);
        exit;
    }
    echo json_encode(['success' => true, 'states' => $states]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Seul un admin peut sauvegarder les états de scène
    $role = $_SESSION['user']['role'] ?? '';
    if (!in_array($role, ['vip', 'admin'], true)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'code' => 'FORBIDDEN', 'message' => 'Accès refusé.']);
        exit;
    }

    $body = file_get_contents('php://input');
    $data = json_decode($body, true);

    if (json_last_error() !== JSON_ERROR_NONE || !isset($data['action'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'code' => 'BAD_REQUEST', 'message' => 'Données invalides.']);
        exit;
    }

    // Charger les états existants
    $states = [];
    if (file_exists($STATES_FILE)) {
        $existing = json_decode(file_get_contents($STATES_FILE), true);
        if (json_last_error() === JSON_ERROR_NONE) $states = $existing;
    }

    switch ($data['action']) {

        case 'save':
            // Sauvegarder ou créer un état
            if (empty($data['id']) || empty($data['state'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'code' => 'MISSING_FIELDS']);
                exit;
            }
            $id = preg_replace('/[^a-z0-9_-]/', '', strtolower($data['id']));
            if (empty($id)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'code' => 'INVALID_ID']);
                exit;
            }
            $state = $data['state'];
            if (!empty($data['label'])) {
                $state['label'] = htmlspecialchars(strip_tags($data['label']), ENT_QUOTES, 'UTF-8');
            }
            $states[$id] = $state;
            break;

        case 'delete':
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'code' => 'MISSING_FIELDS']);
                exit;
            }
            $id = $data['id'];
            if (!isset($states[$id])) {
                echo json_encode(['success' => false, 'code' => 'NOT_FOUND', 'message' => 'État introuvable.']);
                exit;
            }
            unset($states[$id]);
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'code' => 'UNKNOWN_ACTION']);
            exit;
    }

    // Écriture
    $written = file_put_contents(
        $STATES_FILE,
        json_encode($states, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    );

    if ($written === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'code' => 'WRITE_ERROR', 'message' => 'Impossible d\'écrire le fichier.']);
        exit;
    }

    echo json_encode(['success' => true, 'code' => 'SAVED', 'states' => $states]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
