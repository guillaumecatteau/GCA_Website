<?php
// controller/user.php

header('Content-Type: application/json');
require_once __DIR__ . '/../model/db.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // LISTE DES USERS
        $sql = "SELECT id, name, firstname, mail, subscription, isAdmin FROM users ORDER BY id ASC";
        $stmt = $bdd->prepare($sql);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($users as &$user) {
            $user['isAdmin'] = (bool)$user['isAdmin'];
            $user['subscription'] = $user['subscription'] ? substr($user['subscription'], 0, 10) : "";
        }
        unset($user);

        echo json_encode([
            'success' => true,
            'data' => $users
        ]);
        exit;
    }

    // POST actions: update ou delete
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $inputJSON = file_get_contents('php://input');
        $input = json_decode($inputJSON, true);

        if (!isset($input['action'])) {
            throw new Exception('Action non spécifiée');
        }

        switch ($input['action']) {
            case 'update':
                // Validation minimale
                if (!isset($input['id'], $input['name'], $input['firstname'], $input['mail'], $input['isAdmin'])) {
                    throw new Exception('Données manquantes pour mise à jour');
                }

                $id = (int)$input['id'];
                $name = trim($input['name']);
                $firstname = trim($input['firstname']);
                $mail = trim($input['mail']);
                $isAdmin = $input['isAdmin'] ? 1 : 0;

                // Vérifier email valide
                if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {
                    echo json_encode(['success' => false, 'code' => 'invalid_email', 'message' => 'Email invalide']);
                    exit;
                }

                // Mise à jour
                $sql = "UPDATE users SET name = :name, firstname = :firstname, mail = :mail, isAdmin = :isAdmin WHERE id = :id";
                $stmt = $bdd->prepare($sql);
                $res = $stmt->execute([
                    ':name' => $name,
                    ':firstname' => $firstname,
                    ':mail' => $mail,
                    ':isAdmin' => $isAdmin,
                    ':id' => $id,
                ]);

                if ($res) {
                    echo json_encode(['success' => true, 'message' => 'Utilisateur mis à jour']);
                } else {
                    echo json_encode(['success' => false, 'code' => 'update_failed', 'message' => 'Erreur mise à jour']);
                }
                exit;

            case 'delete':
                if (!isset($input['id'])) {
                    throw new Exception('ID manquant pour suppression');
                }
                $id = (int)$input['id'];

                $sql = "DELETE FROM users WHERE id = :id";
                $stmt = $bdd->prepare($sql);
                $res = $stmt->execute([':id' => $id]);

                if ($res) {
                    echo json_encode(['success' => true, 'message' => 'Utilisateur supprimé']);
                } else {
                    echo json_encode(['success' => false, 'code' => 'delete_failed', 'message' => 'Erreur suppression']);
                }
                exit;

            default:
                throw new Exception('Action non reconnue');
        }
    }

    throw new Exception('Méthode non autorisée');

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
