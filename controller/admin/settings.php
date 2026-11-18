<?php
/**
 * settings.php — Écran "Settings" de l'admin tool (remplace l'ancienne gestion
 * des utilisateurs). Deux usages :
 *  - sub=verify_gate : vérifie la double condition (date de naissance + prénom
 *    du premier chat) et renvoie, si elle est validée, les identifiants admin
 *    en clair pour affichage/édition.
 *  - sub=update_access : met à jour le mail/mot de passe admin.
 *  - sub=get_dev_mode / sub=set_dev_mode : bascule dev/production.
 */
require_once __DIR__ . '/../admin_check.php';

$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$sub    = $_GET['sub'] ?? '';

switch ("$method:$sub") {

    case 'POST:verify_gate':
        $ok = verifyAdminGate(
            (string)($body['day'] ?? ''),
            (string)($body['month'] ?? ''),
            (string)($body['year'] ?? ''),
            (string)($body['catName'] ?? '')
        );
        if (!$ok) {
            echo json_encode(['success' => false, 'code' => 'GATE_DENIED']);
            break;
        }
        echo json_encode(['success' => true] + getAdminAccess());
        break;

    case 'POST:update_access':
        $mail     = trim((string)($body['mail'] ?? ''));
        $password = (string)($body['password'] ?? '');
        if (!$mail || !$password || !filter_var($mail, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'code' => 'INVALID_FIELD']);
            break;
        }
        echo json_encode(['success' => updateAdminAccess($mail, $password)]);
        break;

    case 'GET:get_dev_mode':
        echo json_encode(['success' => true, 'dev_mode' => isDevMode()]);
        break;

    case 'POST:set_dev_mode':
        echo json_encode(['success' => setDevMode((bool)($body['dev_mode'] ?? false))]);
        break;

    case 'GET:get_scroll_settings':
        echo json_encode(['success' => true] + getScrollSettings());
        break;

    case 'POST:update_scroll_settings':
        $ok = updateScrollSettings(
            (int)($body['edgeHoldDelay'] ?? 2000),
            (int)($body['wheelThreshold'] ?? 10),
            (int)($body['swipeThreshold'] ?? 50)
        );
        echo json_encode(['success' => $ok] + ($ok ? getScrollSettings() : []));
        break;

    case 'GET:get_hero_settings':
        echo json_encode(['success' => true] + getHeroSettings());
        break;

    case 'POST:update_hero_settings':
        $ok = updateHeroSettings(
            (float)($body['titleVh'] ?? 4.2),
            (float)($body['subtitleVh'] ?? 2.2),
            (int)($body['colorSampleMs'] ?? 200),
            (float)($body['titleOffsetPct'] ?? 7.5),
            (float)($body['titleLetterSpacing'] ?? 24),
            (float)($body['subtitleDistanceVh'] ?? 4.5),
            (float)($body['subtitleOpacity'] ?? 1),
            (int)($body['subtitleHoldMs'] ?? 3500),
            (float)($body['welcomeTextTopPct'] ?? 65)
        );
        echo json_encode(['success' => $ok] + ($ok ? getHeroSettings() : []));
        break;

    case 'GET:get_launch_settings':
        echo json_encode(['success' => true] + getLaunchSettings());
        break;

    case 'POST:update_launch_settings':
        $ok = updateLaunchSettings((int)($body['launchDelay'] ?? 800));
        echo json_encode(['success' => $ok] + ($ok ? getLaunchSettings() : []));
        break;

    case 'GET:get_intro_timeline':
        echo json_encode(['success' => true] + getIntroTimelineSettings());
        break;

    case 'POST:update_intro_timeline':
        $timeline = is_array($body['timeline'] ?? null) ? $body['timeline'] : [];
        $ok = updateIntroTimelineSettings($timeline);
        echo json_encode(['success' => $ok] + ($ok ? getIntroTimelineSettings() : []));
        break;

    case 'GET:get_social_links':
        echo json_encode(['success' => true] + getSocialLinksSettings());
        break;

    case 'POST:update_social_links':
        $links = is_array($body['links'] ?? null) ? $body['links'] : [];
        $ok = updateSocialLinksSettings($links);
        echo json_encode(['success' => $ok] + ($ok ? getSocialLinksSettings() : []));
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'code' => 'INVALID_SUB']);
}
