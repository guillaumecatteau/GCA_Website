<?php
require_once __DIR__ . '/../admin_check.php';
require_once __DIR__ . '/../../model/model_pages.php';

$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$sub    = $_GET['sub'] ?? '';

switch ("$method:$sub") {

    case 'GET:list':
        $type        = $_GET['type'] ?? '';
        $visibleOnly = ($_GET['visible_only'] ?? '') === '1';
        echo json_encode(['success' => true, 'pages' => getAllPages($type, $visibleOnly)]);
        break;

    case 'GET:get':
        $id = (int)($_GET['id'] ?? 0);
        $p  = $id ? getPageById($id) : false;
        echo json_encode($p ? ['success' => true, 'page' => $p] : ['success' => false, 'code' => 'NOT_FOUND']);
        break;

    // ── Public : récupération d'une page publiée par son slug ────────────
    case 'GET:get_by_slug':
        $slug = trim($_GET['slug'] ?? '');
        $p    = $slug ? getPageBySlug($slug) : false;
        if ($p && !$p['is_visible'] && !ADMIN_DEV_MODE) $p = false;
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
        try {
            savePageBlocks($id, $blocks);
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'code' => 'DB_ERROR']);
        }
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
    // Pas de htmlspecialchars ici : l'affichage se fait via textContent/.value
    // (jamais innerHTML) côté client, donc encoder au stockage double-encode
    // les caractères spéciaux (ex: une apostrophe devient "&#039;" affiché tel quel).
    $str = fn($v) => trim($v ?? '');
    return [
        'type'             => $body['type']       ?? '',
        'title_fr'         => $str($body['title_fr']   ?? ''),
        'title_en'         => $str($body['title_en']   ?? ''),
        'subtitle_fr'      => $str($body['subtitle_fr'] ?? ''),
        'subtitle_en'      => $str($body['subtitle_en'] ?? ''),
        'main_visual_id'   => !empty($body['main_visual_id'])  ? (int)$body['main_visual_id']  : null,
        'thumbnail_id'     => !empty($body['thumbnail_id'])    ? (int)$body['thumbnail_id']    : null,
        'expertise_icon_path' => _sanitizeExpertiseIconPath($body['expertise_icon_path'] ?? ''),
        'is_visible'       => (int)(bool)($body['is_visible']       ?? 0),
        'comments_enabled' => (int)(bool)($body['comments_enabled'] ?? 0),
        'date_start'       => ($body['date_start']       ?? '') ?: null,
        'date_end'         => ($body['date_end']         ?? '') ?: null,
        'date_publication' => ($body['date_publication'] ?? '') ?: null,
        'cover_pos_x'       => max(0, min(1, (float)($body['cover_pos_x'] ?? 0.5))),
        'cover_pos_y'       => max(0, min(1, (float)($body['cover_pos_y'] ?? 0.5))),
        'cover_scale'       => max(1, min(4, (float)($body['cover_scale'] ?? 1))),
        'cover_video_url'   => ($body['cover_video_url'] ?? '') !== '' ? $str($body['cover_video_url']) : null,
        'tags'             => (array)($body['tags']         ?? []),
        'related'          => (array)($body['related']      ?? []),
        'experiences'      => (array)($body['experiences']  ?? []),
        'related_tags'     => (array)($body['related_tags'] ?? []),
        'blocks'           => $body['blocks'] ?? null,
    ];
}

// N'autorise qu'un chemin vers un icône "_grey" du dossier icons (pas de path traversal / URL externe)
function _sanitizeExpertiseIconPath(string $path): ?string
{
    $path = trim($path);
    if ($path === '') return null;
    if (strpos($path, '..') !== false) return null;
    if (!preg_match('#^vue/assets/images/icons/[A-Za-z0-9_\-]+\.(webp|png|jpg|jpeg|svg|gif)$#i', $path)) return null;
    if (stripos($path, '_grey') === false) return null;
    return $path;
}
