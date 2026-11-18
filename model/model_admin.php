<?php
/**
 * model_admin.php — Accès admin unique (ex-table "users").
 *
 * Le site n'a plus qu'un seul utilisateur possible : l'administrateur. Ses
 * identifiants (mail + mot de passe) et le mode du site (dev/production) sont
 * stockés dans un fichier JSON chiffré HORS de la base de données (cf. demande :
 * "je serai le seul et unique utilisateur à me connecter"), généré automatiquement
 * au premier accès avec les valeurs par défaut ci-dessous. Ce fichier n'est
 * JAMAIS versionné (cf. .gitignore).
 *
 * Le mot de passe est chiffré de façon réversible (et non simplement haché) car
 * l'écran "Settings" de l'admin tool doit pouvoir le ré-afficher en clair dans
 * un champ pré-rempli pour permettre sa modification.
 */

define('ADMIN_SETTINGS_FILE', __DIR__ . '/../database/admin_settings.json');
// Clé de chiffrement locale — à déplacer vers une variable d'environnement en production.
define('ADMIN_ENC_KEY', 'GCA-2025-s3cr3t-local-settings-key');
define('ADMIN_ENC_CIPHER', 'aes-256-cbc');

// Valeurs par défaut (premier accès uniquement — cf. demande).
const ADMIN_DEFAULT_MAIL     = 'guillaume.catteau@gmail.com';
const ADMIN_DEFAULT_PASSWORD = 'Neko&Keiko2025';

// Double condition d'accès à l'écran "Settings" (date de naissance + prénom du
// premier chat) — valeurs fixes, non stockées en base.
const ADMIN_GATE_BIRTHDATE = '1982-06-08'; // 8 juin 1982
const ADMIN_GATE_CATNAME   = 'trinette';

function _adminEncrypt(string $plain): string
{
    $iv = random_bytes(openssl_cipher_iv_length(ADMIN_ENC_CIPHER));
    $cipherText = openssl_encrypt($plain, ADMIN_ENC_CIPHER, ADMIN_ENC_KEY, 0, $iv);
    return base64_encode($iv . $cipherText);
}

function _adminDecrypt(string $encoded): string
{
    $raw = base64_decode($encoded);
    $ivLen = openssl_cipher_iv_length(ADMIN_ENC_CIPHER);
    $iv = substr($raw, 0, $ivLen);
    $cipherText = substr($raw, $ivLen);
    $plain = openssl_decrypt($cipherText, ADMIN_ENC_CIPHER, ADMIN_ENC_KEY, 0, $iv);
    return $plain === false ? '' : $plain;
}

// Réglages par défaut du scroll magnétique de la home (cf. Home page — navigation).
const SCROLL_DEFAULTS = [
    'scroll_edge_hold_delay_ms' => 2000, // délai d'immobilité avant de changer de section
    'scroll_wheel_threshold'    => 10,   // force de molette minimale pour déclencher un scroll
    'scroll_swipe_threshold'    => 50,   // force de swipe tactile minimale (tablette/mobile)
];

// Réglages par défaut du titre principal + sous-titres de la section Accueil
// (cf. Redéfinition de la section Accueil) — tailles en "vh" (% de la hauteur du
// viewport, jamais affectées par un zoom texte du navigateur), taux de
// prélèvement de couleur en ms.
//  - hero_title_offset_pct       : position verticale du titre, en % d'écart par rapport
//    au centre vertical (50%) — valeur par défaut 7.5 ⇔ reproduit l'ancien "top: 57.5%"
//    codé en dur.
//  - hero_title_letter_spacing_px: espacement entre les lettres du titre (gap flex, cf.
//    .homeTitle en scss) — valeur par défaut 24 ⇔ ancien "gap: 24px" hérité de .titleMain.
//  - hero_subtitle_distance_vh   : distance (vh) entre le titre et le sous-titre, le
//    sous-titre étant TOUJOURS positionné relativement au titre (jamais en absolu) —
//    défaut 4.5 ⇔ ancien "+4.5vh" codé en dur.
//  - hero_subtitle_opacity       : opacité "au repos" (max) du sous-titre une fois son
//    animation de révélation terminée (0→cette valeur, au lieu de 0→1 codé en dur).
//  - hero_subtitle_hold_ms       : durée d'affichage d'un sous-titre avant de passer au
//    suivant — remplace l'ancienne constante HOLD_MS codée en dur dans home-hero.js.
const HERO_DEFAULTS = [
    'hero_title_vh'                 => 4.2,
    'hero_subtitle_vh'              => 2.2,
    'hero_color_sample_ms'          => 200,
    'hero_title_offset_pct'         => 7.5,
    'hero_title_letter_spacing_px'  => 24,
    'hero_subtitle_distance_vh'     => 4.5,
    'hero_subtitle_opacity'         => 1.0,
    'hero_subtitle_hold_ms'         => 3500,
    // Position verticale du texte de bienvenue — % de la hauteur de la section (0 = haut,
    // 100 = bas), INDÉPENDANTE du titre/sous-titre (élément autonome, pas rattaché au
    // groupe titre/sous-titre — cf. Redéfinition Accueil : "il faut pouvoir choisir sa
    // hauteur vis-à-vis de la hauteur de la page").
    'hero_welcome_text_top_pct'     => 65.0,
];

// Réglages par défaut des liens réseaux sociaux (cf. Settings admin tool — "Liens
// sociaux") : affichage conditionnel (enabled) + URL par réseau, lus publiquement par le
// front (cf. controller/admin_status.php, vue/social-links.js) pour peupler les listes
// d'icônes sociales de la navigation (desktop/tablette/mobile). Valeurs par défaut =
// URLs déjà présentes en dur dans templates/partials/nav-mobile.php avant cette fonctionnalité.
// Instagram est un NOUVEAU réseau (pas encore d'URL connue) : désactivé par défaut.
const SOCIAL_LINKS_NETWORKS = ['artstation', 'linkedin', 'youtube', 'facebook', 'x', 'instagram'];

const SOCIAL_LINKS_DEFAULTS = [
    'social_links' => [
        'artstation' => ['enabled' => true,  'url' => 'https://www.artstation.com/gcdigitalarts'],
        'linkedin'   => ['enabled' => true,  'url' => 'https://www.linkedin.com/in/guillaumecatteau/'],
        'youtube'    => ['enabled' => true,  'url' => 'https://www.youtube.com/@GuillaumeCatteau'],
        'facebook'   => ['enabled' => true,  'url' => 'https://www.facebook.com/guillaume.catteau'],
        'x'          => ['enabled' => true,  'url' => 'https://x.com/GC_DigitalArts'],
        'instagram'  => ['enabled' => false, 'url' => ''],
    ],
];

/** Fusionne les réglages sociaux stockés avec les défauts (ajoute les réseaux manquants, ex: nouveau réseau ajouté après coup). */
function _mergeSocialLinksDefaults($storedLinks): array
{
    $defaults = SOCIAL_LINKS_DEFAULTS['social_links'];
    $stored = is_array($storedLinks) ? $storedLinks : [];
    $merged = [];
    foreach ($defaults as $network => $default) {
        $entry = is_array($stored[$network] ?? null) ? $stored[$network] : [];
        $merged[$network] = [
            'enabled' => (bool)($entry['enabled'] ?? $default['enabled']),
            'url'     => (string)($entry['url'] ?? $default['url']),
        ];
    }
    return $merged;
}

// Durée (ms) du rideau noir affiché au chargement/rafraîchissement de la page, le temps que
// la scène 3D (cf. vue/threejs-background.js) soit effectivement chargée et affichée — évite
// que la scène "cassée" (particules sans logo le temps du chargement du .glb) ne soit visible
// quelques frames (cf. demande "Interface générale").
const LAUNCH_DEFAULTS = [
    'launch_delay_ms' => 800,
];

// Chronologie admin-configurable de la séquence d'intro de la home (cf. "chronologie
// configurable du lancement du site") — t=0 correspond au moment où la scène 3D commence à
// JOUER son état "intro" (cf. vue/threejs-background.js, évènement 'gca-intro-start'), PAS au
// chargement de la page ni à la levée du rideau noir (cf. launch_delay_ms ci-dessus, mécanisme
// séparé qui ne fait que retarder l'affichage général tant que la scène 3D n'est pas chargée).
// Chaque élément d'interface a un délai (ms, depuis t=0) propre PAR DEVICE — `null` = non
// applicable (l'élément n'existe pas, ou n'a pas de révélation pilotée par cette chronologie,
// sur ce device, ex: icônes latérales = desktop uniquement).
const INTRO_TIMELINE_KEYS = [
    'mainLogo', 'lateralIcons', 'topInputs', 'burgerIcon',
    'mainTitle', 'subtitles', 'welcomeText', 'scrollIcon',
];

const INTRO_TIMELINE_DEFAULTS = [
    'intro_timeline' => [
        // Logo principal (2 lignes, top-left) — desktop + tablette (mobile : dans le burger,
        // révélé par l'animation d'ouverture du menu, pas par cette chronologie).
        'mainLogo'     => ['desktop' => 2000, 'tablet' => 2000, 'mobile' => null],
        // Icônes latérales (#sectionNav + social toggle + partage) — desktop uniquement.
        'lateralIcons' => ['desktop' => 3600, 'tablet' => null, 'mobile' => null],
        // Recherche + sélecteur de langue (+ icône Admin tool si visible) — desktop uniquement.
        'topInputs'    => ['desktop' => 2300, 'tablet' => null, 'mobile' => null],
        // Bouton burger — tablette + mobile uniquement.
        'burgerIcon'   => ['desktop' => null, 'tablet' => 800,  'mobile' => 800],
        // Titre principal de la home — tous devices.
        'mainTitle'    => ['desktop' => 3600, 'tablet' => 3600, 'mobile' => 3600],
        // Cycle des sous-titres défilants — tous devices.
        'subtitles'    => ['desktop' => 4500, 'tablet' => 4500, 'mobile' => 4500],
        // Texte de bienvenue (nouveau) — desktop + tablette uniquement.
        'welcomeText'  => ['desktop' => 5000, 'tablet' => 5000, 'mobile' => null],
        // 1ère apparition de l'icône de scroll (section landing uniquement) — tous devices.
        'scrollIcon'   => ['desktop' => 3600, 'tablet' => 3600, 'mobile' => 3600],
    ],
];

/** Fusionne la chronologie d'intro stockée avec les défauts — une valeur `null` (device non
 *  applicable à cet élément) est TOUJOURS préservée, quelle que soit la valeur stockée. */
function _mergeIntroTimelineDefaults($stored): array
{
    $defaults = INTRO_TIMELINE_DEFAULTS['intro_timeline'];
    $stored = is_array($stored) ? $stored : [];
    $merged = [];
    foreach ($defaults as $key => $devices) {
        $storedDevices = is_array($stored[$key] ?? null) ? $stored[$key] : [];
        $merged[$key] = [];
        foreach ($devices as $device => $default) {
            if ($default === null) { $merged[$key][$device] = null; continue; }
            $val = $storedDevices[$device] ?? null;
            $merged[$key][$device] = is_numeric($val) ? max(0, min(60000, (int)$val)) : $default;
        }
    }
    return $merged;
}

/** Charge les réglages admin, en créant le fichier avec les valeurs par défaut s'il n'existe pas. */
function loadAdminSettings(): array
{
    if (!file_exists(ADMIN_SETTINGS_FILE)) {
        $defaults = array_merge([
            'mail'         => ADMIN_DEFAULT_MAIL,
            'password_enc' => _adminEncrypt(ADMIN_DEFAULT_PASSWORD),
            'dev_mode'     => true,
        ], SCROLL_DEFAULTS, HERO_DEFAULTS, LAUNCH_DEFAULTS, SOCIAL_LINKS_DEFAULTS, INTRO_TIMELINE_DEFAULTS);
        saveAdminSettings($defaults);
        return $defaults;
    }
    $json = file_get_contents(ADMIN_SETTINGS_FILE);
    $data = json_decode($json, true);
    if (!is_array($data)) {
        $data = array_merge([
            'mail'         => ADMIN_DEFAULT_MAIL,
            'password_enc' => _adminEncrypt(ADMIN_DEFAULT_PASSWORD),
            'dev_mode'     => true,
        ], SCROLL_DEFAULTS, HERO_DEFAULTS, LAUNCH_DEFAULTS, SOCIAL_LINKS_DEFAULTS, INTRO_TIMELINE_DEFAULTS);
    }
    // Fusionne les clés manquantes (ex: fichier généré avant l'ajout d'un nouveau réglage).
    $merged = array_merge(SCROLL_DEFAULTS, HERO_DEFAULTS, LAUNCH_DEFAULTS, SOCIAL_LINKS_DEFAULTS, INTRO_TIMELINE_DEFAULTS, $data);
    // Fusion profonde dédiée pour social_links (ajoute un réseau manquant, ex: instagram
    // ajouté après coup, sans écraser les réseaux déjà configurés par l'admin).
    $merged['social_links'] = _mergeSocialLinksDefaults($merged['social_links'] ?? null);
    // Idem pour intro_timeline (ajoute un élément manquant, ex: nouveau élément ajouté après
    // coup, sans écraser les délais déjà configurés par l'admin).
    $merged['intro_timeline'] = _mergeIntroTimelineDefaults($merged['intro_timeline'] ?? null);
    return $merged;
}

function saveAdminSettings(array $settings): bool
{
    $dir = dirname(ADMIN_SETTINGS_FILE);
    if (!is_dir($dir)) mkdir($dir, 0775, true);
    return file_put_contents(
        ADMIN_SETTINGS_FILE,
        json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    ) !== false;
}

/** Vérifie les identifiants de connexion admin. */
function verifyAdminCredentials(string $mail, string $password): bool
{
    $settings = loadAdminSettings();
    if (!hash_equals($settings['mail'], $mail)) return false;
    $storedPassword = _adminDecrypt($settings['password_enc']);
    return hash_equals($storedPassword, $password);
}

/** Vérifie la double condition d'accès à l'écran Settings (date de naissance + nom du chat). */
function verifyAdminGate(string $day, string $month, string $year, string $catName): bool
{
    $day   = str_pad(preg_replace('/\D/', '', $day), 2, '0', STR_PAD_LEFT);
    $month = str_pad(preg_replace('/\D/', '', $month), 2, '0', STR_PAD_LEFT);
    $year  = preg_replace('/\D/', '', $year);
    $birthdate = "$year-$month-$day";
    $catMatch = hash_equals(ADMIN_GATE_CATNAME, mb_strtolower(trim($catName)));
    return hash_equals(ADMIN_GATE_BIRTHDATE, $birthdate) && $catMatch;
}

/** Retourne mail + mot de passe en clair (après validation du gate côté appelant). */
function getAdminAccess(): array
{
    $settings = loadAdminSettings();
    return [
        'mail'     => $settings['mail'],
        'password' => _adminDecrypt($settings['password_enc']),
    ];
}

function updateAdminAccess(string $mail, string $password): bool
{
    $settings = loadAdminSettings();
    $settings['mail'] = $mail;
    $settings['password_enc'] = _adminEncrypt($password);
    return saveAdminSettings($settings);
}

function isDevMode(): bool
{
    return (bool)loadAdminSettings()['dev_mode'];
}

function setDevMode(bool $devMode): bool
{
    $settings = loadAdminSettings();
    $settings['dev_mode'] = $devMode;
    return saveAdminSettings($settings);
}

/** Réglages publics du scroll magnétique de la home — lus par tous les visiteurs. */
function getScrollSettings(): array
{
    $settings = loadAdminSettings();
    return [
        'edgeHoldDelay'  => (int)$settings['scroll_edge_hold_delay_ms'],
        'wheelThreshold' => (int)$settings['scroll_wheel_threshold'],
        'swipeThreshold' => (int)$settings['scroll_swipe_threshold'],
    ];
}

function updateScrollSettings(int $edgeHoldDelay, int $wheelThreshold, int $swipeThreshold): bool
{
    $settings = loadAdminSettings();
    $settings['scroll_edge_hold_delay_ms'] = max(0, min(10000, $edgeHoldDelay));
    $settings['scroll_wheel_threshold']    = max(1, min(200, $wheelThreshold));
    $settings['scroll_swipe_threshold']    = max(1, min(400, $swipeThreshold));
    return saveAdminSettings($settings);
}

/** Réglages publics du titre/sous-titres Accueil — lus par tous les visiteurs. */
function getHeroSettings(): array
{
    $settings = loadAdminSettings();
    return [
        'titleVh'              => (float)$settings['hero_title_vh'],
        'subtitleVh'           => (float)$settings['hero_subtitle_vh'],
        'colorSampleMs'        => (int)$settings['hero_color_sample_ms'],
        'titleOffsetPct'       => (float)$settings['hero_title_offset_pct'],
        'titleLetterSpacing'   => (float)$settings['hero_title_letter_spacing_px'],
        'subtitleDistanceVh'   => (float)$settings['hero_subtitle_distance_vh'],
        'subtitleOpacity'      => (float)$settings['hero_subtitle_opacity'],
        'subtitleHoldMs'       => (int)$settings['hero_subtitle_hold_ms'],
        'welcomeTextTopPct'    => (float)$settings['hero_welcome_text_top_pct'],
    ];
}

function updateHeroSettings(
    float $titleVh,
    float $subtitleVh,
    int $colorSampleMs,
    float $titleOffsetPct,
    float $titleLetterSpacing,
    float $subtitleDistanceVh,
    float $subtitleOpacity,
    int $subtitleHoldMs,
    float $welcomeTextTopPct
): bool {
    $settings = loadAdminSettings();
    $settings['hero_title_vh']                = max(1, min(15, $titleVh));
    $settings['hero_subtitle_vh']              = max(0.5, min(10, $subtitleVh));
    $settings['hero_color_sample_ms']          = max(16, min(5000, $colorSampleMs));
    $settings['hero_title_offset_pct']         = max(-20, min(20, $titleOffsetPct));
    $settings['hero_title_letter_spacing_px']  = max(0, min(60, $titleLetterSpacing));
    $settings['hero_subtitle_distance_vh']     = max(0, min(20, $subtitleDistanceVh));
    $settings['hero_subtitle_opacity']         = max(0.05, min(1, $subtitleOpacity));
    $settings['hero_subtitle_hold_ms']         = max(500, min(15000, $subtitleHoldMs));
    $settings['hero_welcome_text_top_pct']     = max(0, min(100, $welcomeTextTopPct));
    return saveAdminSettings($settings);
}

/** Réglage public du rideau de lancement (cf. Interface générale) — lu par tous les visiteurs. */
function getLaunchSettings(): array
{
    $settings = loadAdminSettings();
    return [
        'launchDelay' => (int)$settings['launch_delay_ms'],
    ];
}

function updateLaunchSettings(int $launchDelay): bool
{
    $settings = loadAdminSettings();
    $settings['launch_delay_ms'] = max(0, min(10000, $launchDelay));
    return saveAdminSettings($settings);
}

/** Réglages publics de la chronologie d'intro — lus par tous les visiteurs (cf. vue/intro-timeline.js). */
function getIntroTimelineSettings(): array
{
    $settings = loadAdminSettings();
    return ['introTimeline' => _mergeIntroTimelineDefaults($settings['intro_timeline'] ?? null)];
}

/** Met à jour la chronologie d'intro. $timeline est [key => ['desktop'=>int|null, 'tablet'=>int|null, 'mobile'=>int|null]]. */
function updateIntroTimelineSettings(array $timeline): bool
{
    $settings = loadAdminSettings();
    $current = _mergeIntroTimelineDefaults($settings['intro_timeline'] ?? null);
    foreach (INTRO_TIMELINE_KEYS as $key) {
        if (!isset($timeline[$key]) || !is_array($timeline[$key])) continue;
        foreach (['desktop', 'tablet', 'mobile'] as $device) {
            // Une valeur envoyée pour un device non applicable à cet élément est ignorée
            // (reste "null", cf. defaults) — jamais stockée.
            if ($current[$key][$device] === null) continue;
            $val = $timeline[$key][$device] ?? null;
            if (is_numeric($val)) $current[$key][$device] = max(0, min(60000, (int)$val));
        }
    }
    $settings['intro_timeline'] = $current;
    return saveAdminSettings($settings);
}

/** Réglages publics des liens réseaux sociaux — lus par tous les visiteurs (cf. nav). */
function getSocialLinksSettings(): array
{
    $settings = loadAdminSettings();
    return ['socialLinks' => _mergeSocialLinksDefaults($settings['social_links'] ?? null)];
}

/** Met à jour les liens sociaux. $links est un tableau [network => ['enabled' => bool, 'url' => string]]. */
function updateSocialLinksSettings(array $links): bool
{
    $settings = loadAdminSettings();
    $current = _mergeSocialLinksDefaults($settings['social_links'] ?? null);
    foreach (SOCIAL_LINKS_NETWORKS as $network) {
        if (!isset($links[$network]) || !is_array($links[$network])) continue;
        $url = trim((string)($links[$network]['url'] ?? ''));
        // URL optionnelle (réseau désactivé/pas encore renseigné) mais, si fournie, doit être valide.
        if ($url !== '' && !filter_var($url, FILTER_VALIDATE_URL)) continue;
        $current[$network] = [
            'enabled' => (bool)($links[$network]['enabled'] ?? false),
            'url'     => $url,
        ];
    }
    $settings['social_links'] = $current;
    return saveAdminSettings($settings);
}
