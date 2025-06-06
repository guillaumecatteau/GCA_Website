<?php
header('Content-Type: application/json');

require_once('../model/model_user.php'); 

// Vérification de la présence du fichier
if (!isset($_FILES['csvFile']) || $_FILES['csvFile']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'error' => 'upload']);
    exit;
}

// Vérification de l'extension du fichier
$filename = $_FILES['csvFile']['name'];
if (strtolower(pathinfo($filename, PATHINFO_EXTENSION)) !== 'csv') {
    echo json_encode(['success' => false, 'error' => 'format']);
    exit;
}

// Appel à la fonction d'import dans model_user.php
$result = importUsersFromCSV($_FILES['csvFile']['tmp_name']);

if ($result['code'] === 'success') {
    echo json_encode([
        'code' => 'success',
        'inserted' => $result['inserted']
    ]);
} elseif ($result['code'] === 'none') {
    // Pas d'insertion (doublons ou fichier vide)
    echo json_encode([
        'code' => 'none',
        'inserted' => 0
    ]);
} elseif ($result['code'] === 'format') {
    echo json_encode([
        'code' => 'format',
        'message' => $result['message']
    ]);
} else {
    // Code error général
    echo json_encode([
        'code' => 'error',
        'message' => $result['message'] ?? 'Erreur technique'
    ]);
}