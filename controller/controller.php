<?php
header('Content-Type: application/json');
if (session_status() === PHP_SESSION_NONE) session_start();

$action = $_GET['action'] ?? '';

switch ($action) {

    // ── Auth ──────────────────────────────────────────────────────────────
    case 'register':    require_once 'register.php';    break;
    case 'login':       require_once 'login.php';       break;
    case 'logout':      require_once 'logout.php';      break;

    // ── Scene editor ──────────────────────────────────────────────────────
    case 'scene_states':
        require_once 'save_scene_states.php';
        break;

    // ── Admin : Users ─────────────────────────────────────────────────────
    case 'admin_users':
        require_once 'admin/users.php';
        break;

    // ── Admin : Tags ──────────────────────────────────────────────────────
    case 'admin_tags':
        require_once 'admin/tags.php';
        break;

    // ── Admin : Medias ────────────────────────────────────────────────────
    case 'admin_medias':
        require_once 'admin/medias.php';
        break;

    // ── Admin : Pages (Projet / Expertise / Blog) ─────────────────────────
    case 'admin_pages':
        require_once 'admin/pages.php';
        break;

    // ── Admin : Expériences ───────────────────────────────────────────────
    case 'admin_experiences':
        require_once 'admin/experiences.php';
        break;

    // ── Admin : Comments ──────────────────────────────────────────────────
    case 'admin_comments':
        require_once 'admin/comments.php';
        break;

    // ── Public : Comments (poster) ────────────────────────────────────────
    case 'comment_post':
        require_once 'comment_post.php';
        break;

    // ── Legacy ────────────────────────────────────────────────────────────
    case 'search_user':
        require_once 'search_user.php';
        break;

    default:
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code'    => 'INVALID_ACTION',
            'message' => 'Action invalide.',
        ]);
}
