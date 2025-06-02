<?php
header('Content-Type: application/json');
require_once('../model/db.php');
require_once('../model/model_user.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $name = ProtectInjection($_POST['name'] ?? '');
    $firstname = ProtectInjection($_POST['firstname'] ?? '');
    $mail = ProtectInjection($_POST['mail'] ?? '');
    $password = ProtectInjection($_POST['password'] ?? '');
    $questionA = ProtectInjection($_POST['questionA'] ?? '');
    $questionB = ProtectInjection($_POST['questionB'] ?? '');
    $newsletter = isset($_POST['newsletter']) ? 1 : 0;

    if (emailExists($mail)) {
        echo json_encode([
            'success' => false,
            'code' => 'EMAIL_EXISTS',
            'message' => 'Cette adresse email est déjà utilisée.'
        ]);
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $subscriptionDate = date('Y-m-d');

    $result = registerUser($name, $firstname, $mail, $hashedPassword, $questionA, $questionB, $newsletter, $subscriptionDate);

    if ($result) {
        echo json_encode([
            'success' => true,
            'code' => 'REGISTER_SUCCESS',
            'message' => 'Inscription réussie.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'code' => 'TECH_ERROR',
            'message' => 'Une erreur technique est survenue.'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Méthode non autorisée.'
    ]);
}