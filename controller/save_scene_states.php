<?php
// Session déjà démarrée par index.php — ne pas rappeler session_start()

$STATES_FILE = __DIR__ . '/../json/scene-states.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Lecture des états — PUBLIQUE (nécessaire au chargement de la scène Three.js sur le site
    // pour tout visiteur, pas seulement les admins) : pas de garde admin_check.php ici.
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
    // Gate d'accès admin commune (respecte ADMIN_DEV_MODE comme tous les autres contrôleurs
    // admin/*.php), chargée UNIQUEMENT pour les écritures (save/delete) — avant ce correctif,
    // ce bloc réimplémentait son propre contrôle de rôle sans le bypass ADMIN_DEV_MODE, d'où
    // les "Accès refusé" en sauvegarde/suppression alors que la lecture (GET) fonctionnait.
    require_once __DIR__ . '/admin_check.php';
    // admin_check.php a déjà vérifié l'accès (dev mode ou admin connecté) plus haut.

    $body = file_get_contents('php://input');
    $data = json_decode($body, true);

    if (json_last_error() !== JSON_ERROR_NONE || !isset($data['action'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'code' => 'BAD_REQUEST', 'message' => 'Données invalides.']);
        exit;
    }

    // Charger les états existants — ABSOLUMENT ne jamais repartir d'un tableau vide si le
    // fichier existe mais est illisible/corrompu : une sauvegarde écrirait alors SEULEMENT le
    // nouvel état et effacerait silencieusement tous les autres (incident déjà constaté : perte
    // de plusieurs états lors d'un save concurrent à une écriture du fichier). On abandonne la
    // sauvegarde plutôt que de risquer d'écraser des données existantes.
    $states = [];
    if (file_exists($STATES_FILE)) {
        $raw = file_get_contents($STATES_FILE);
        if (trim($raw) !== '') {
            $existing = json_decode($raw, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(500);
                echo json_encode(['success' => false, 'code' => 'CORRUPT_FILE', 'message' => 'Fichier des états illisible — sauvegarde annulée pour éviter toute perte de données.']);
                exit;
            }
            $states = $existing ?? [];
        }
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

    // Sauvegarde défensive du fichier précédent avant toute écriture (filet de sécurité
    // supplémentaire en cas de bug imprévu côté merge/migration) — un seul fichier .bak,
    // écrasé à chaque sauvegarde, pas un historique complet.
    if (file_exists($STATES_FILE)) {
        @copy($STATES_FILE, $STATES_FILE . '.bak');
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
