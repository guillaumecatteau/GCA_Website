<?php
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'register':
        require_once('register.php');
        break;
    case 'login':
        require_once('login.php');
        break;
    case 'logout':
        require_once('logout.php');
        break;
    default:
        echo json_encode(['success' => false, 'code' => 'INVALID_ACTION', 'message' => 'Action invalide.']);
}