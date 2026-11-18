<?php
/**
 * backup.php — Téléchargement d'une sauvegarde complète de la base de données.
 *
 * Contrairement aux autres endpoints de ce dossier, celui-ci ne répond PAS en JSON : il
 * stream directement le fichier .sql généré (Content-Disposition: attachment), comme un
 * téléchargement de fichier classique (cf. demande "le bouton déclenchera un téléchargement").
 *
 * Stratégie : essaie `mysqldump` d'abord (via exec(), plus rapide/complet — triggers,
 * routines, etc.), puis se rabat sur un export 100% PHP (SHOW CREATE TABLE + SELECT * →
 * INSERT) si mysqldump est absent/échoue, pour fonctionner quel que soit l'hébergement.
 */
require_once __DIR__ . '/../admin_check.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'code' => 'METHOD_NOT_ALLOWED']);
    exit;
}

// Identifiants de connexion — identiques à model/db.php (seule source de vérité pour la
// connexion PDO ; dupliqués ici car mysqldump a besoin de ces infos en ligne de commande,
// pas d'un objet PDO).
$dbHost = 'localhost';
$dbName = 'gcwebsite';
$dbUser = 'root';
$dbPass = '';

$dumpDir = __DIR__ . '/../../database';
if (!is_dir($dumpDir)) mkdir($dumpDir, 0775, true);
$tmpFile = $dumpDir . '/_tmp_backup_' . uniqid() . '.sql';

/** Essaie plusieurs chemins mysqldump connus (PATH, puis installations WAMP courantes). */
function _tryMysqldump(string $host, string $user, string $pass, string $dbName, string $outFile): bool
{
    $candidates = [
        'mysqldump', // si présent dans le PATH
    ];
    // Chemins WAMP usuels (MySQL ou MariaDB, selon la version activée) — best effort, pas
    // bloquant si absents (cf. fallback PHP pur plus bas).
    foreach (glob('C:/wamp64/bin/mariadb/*/bin/mysqldump.exe') ?: [] as $p) $candidates[] = $p;
    foreach (glob('C:/wamp64/bin/mysql/*/bin/mysqldump.exe') ?: [] as $p) $candidates[] = $p;

    $passArg = $pass !== '' ? '--password=' . escapeshellarg($pass) : '';
    foreach ($candidates as $bin) {
        $cmd = sprintf(
            '%s --host=%s --user=%s %s --single-transaction --routines --triggers --add-drop-table %s > %s 2>%s',
            escapeshellarg($bin),
            escapeshellarg($host),
            escapeshellarg($user),
            $passArg,
            escapeshellarg($dbName),
            escapeshellarg($outFile),
            escapeshellarg($outFile . '.err')
        );
        @exec($cmd, $unused, $returnCode);
        $ok = $returnCode === 0 && file_exists($outFile) && filesize($outFile) > 0;
        @unlink($outFile . '.err');
        if ($ok) return true;
        @unlink($outFile);
    }
    return false;
}

/** Export 100% PHP (sans mysqldump) : structure + données de chaque table. */
function _phpFallbackDump(PDO $bdd, string $dbName, string $outFile): bool
{
    $fh = fopen($outFile, 'w');
    if (!$fh) return false;

    fwrite($fh, "-- Sauvegarde de la base `$dbName` — générée en PHP pur (mysqldump indisponible)\n");
    fwrite($fh, '-- ' . date('Y-m-d H:i:s') . "\n\n");
    fwrite($fh, "SET FOREIGN_KEY_CHECKS=0;\n\n");

    $tables = $bdd->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tables as $table) {
        $createRow = $bdd->query('SHOW CREATE TABLE `' . str_replace('`', '', $table) . '`')->fetch(PDO::FETCH_ASSOC);
        $createSql = $createRow['Create Table'] ?? null;
        if (!$createSql) continue;

        fwrite($fh, "-- ----------------------------\n-- Table `$table`\n-- ----------------------------\n");
        fwrite($fh, "DROP TABLE IF EXISTS `$table`;\n");
        fwrite($fh, $createSql . ";\n\n");

        $stmt = $bdd->query('SELECT * FROM `' . str_replace('`', '', $table) . '`');
        $columns = null;
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            if ($columns === null) $columns = array_keys($row);
            $values = array_map(function ($v) use ($bdd) {
                if ($v === null) return 'NULL';
                return $bdd->quote((string)$v);
            }, array_values($row));
            fwrite($fh, 'INSERT INTO `' . $table . '` (`' . implode('`, `', $columns) . '`) VALUES (' . implode(', ', $values) . ");\n");
        }
        fwrite($fh, "\n");
    }

    fwrite($fh, "SET FOREIGN_KEY_CHECKS=1;\n");
    fclose($fh);
    return file_exists($outFile) && filesize($outFile) > 0;
}

$usedMethod = 'mysqldump';
$success = _tryMysqldump($dbHost, $dbUser, $dbPass, $dbName, $tmpFile);

if (!$success) {
    $usedMethod = 'php_fallback';
    require_once __DIR__ . '/../../model/db.php'; // fournit $bdd (PDO)
    $success = _phpFallbackDump($bdd, $dbName, $tmpFile);
}

if (!$success) {
    @unlink($tmpFile);
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'code' => 'BACKUP_FAILED']);
    exit;
}

$filename = $dbName . '_backup_' . date('Y-m-d') . '.sql';

// Redéfinit les en-têtes (le controller.php global envoie déjà
// "Content-Type: application/json" en tête de fichier, mais aucune sortie n'a encore été
// émise à ce stade — header() peut donc être rappelé sans souci).
header('Content-Type: application/sql');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Length: ' . filesize($tmpFile));
header('X-Backup-Method: ' . $usedMethod); // utile pour vérifier en test quelle méthode a tourné

readfile($tmpFile);
@unlink($tmpFile);
exit;
