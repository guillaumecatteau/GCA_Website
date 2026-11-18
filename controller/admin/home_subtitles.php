<?php
/**
 * home_subtitles.php — Gestion admin des sous-titres de la section Accueil
 * (titre principal défilant). cf. Redéfinition de la section Accueil.
 */
require_once __DIR__ . '/../admin_check.php';
require_once __DIR__ . '/../../model/model_home.php';

$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$sub    = $_GET['sub'] ?? '';

switch ("$method:$sub") {

    case 'GET:list':
        echo json_encode(['success' => true, 'subtitles' => getHomeSubtitles()]);
        break;

    case 'POST:create':
        // Texte vide autorisé ici (cf. admin tool : le bouton "Ajouter" crée directement une
        // entrée vide à éditer sur place dans la liste, plus de champs FR/EN préalables à
        // côté du bouton) — la validation FR+EN non vides reste appliquée sur 'update'
        // ci-dessous, avant toute persistance réelle du contenu édité.
        $fr = trim((string)($body['text_fr'] ?? ''));
        $en = trim((string)($body['text_en'] ?? ''));
        $id = createHomeSubtitle(
            htmlspecialchars($fr, ENT_QUOTES, 'UTF-8'),
            htmlspecialchars($en, ENT_QUOTES, 'UTF-8')
        );
        echo json_encode($id ? ['success' => true, 'id' => $id] : ['success' => false, 'code' => 'DB_ERROR']);
        break;

    case 'POST:update':
        $id = (int)($body['id'] ?? 0);
        $fr = trim((string)($body['text_fr'] ?? ''));
        $en = trim((string)($body['text_en'] ?? ''));
        if (!$id || !$fr || !$en) { echo json_encode(['success' => false, 'code' => 'MISSING_FIELD']); break; }
        $ok = updateHomeSubtitle(
            $id,
            htmlspecialchars($fr, ENT_QUOTES, 'UTF-8'),
            htmlspecialchars($en, ENT_QUOTES, 'UTF-8')
        );
        echo json_encode(['success' => $ok]);
        break;

    case 'POST:delete':
        $id = (int)($body['id'] ?? 0);
        echo json_encode(['success' => $id ? deleteHomeSubtitle($id) : false]);
        break;

    case 'POST:reorder':
        $ids = $body['ids'] ?? [];
        if (!is_array($ids) || !$ids) { echo json_encode(['success' => false, 'code' => 'MISSING_FIELD']); break; }
        echo json_encode(['success' => reorderHomeSubtitles($ids)]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'code' => 'INVALID_SUB']);
}
