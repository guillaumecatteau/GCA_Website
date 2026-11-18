<?php
/**
 * gallery_public.php — Section Gallerie de la home (public, sans authentification).
 *  - sub=filters : liste des expertises (icône + id) utilisées comme filtres.
 *  - sub=list    : médias galerie, les plus récents en premier, filtrables par expertise_id.
 */
header('Content-Type: application/json');
require_once __DIR__ . '/../model/model_medias.php';

$sub = $_GET['sub'] ?? 'list';

switch ($sub) {
    case 'filters':
        echo json_encode(['success' => true, 'filters' => getGalleryFilters()]);
        break;

    case 'list':
        $expertiseId = (int)($_GET['expertise_id'] ?? 0) ?: null;
        echo json_encode(['success' => true, 'medias' => getGalleryMedias($expertiseId)]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'code' => 'INVALID_SUB']);
}
