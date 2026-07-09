<?php
require_once('db.php');
require_once('model.php'); // ProtectInjection() est ici

function emailExists($mail)
{
    global $bdd;
    $sql = "SELECT COUNT(*) FROM users WHERE mail = :mail";
    $stmt = $bdd->prepare($sql);
    $stmt->execute([':mail' => $mail]);
    return $stmt->fetchColumn() > 0;
}

function registerUser($name, $firstname, $mail, $hashedPassword, $questionA, $questionB, $newsletter, $subscriptionDate, $role = 'user')
{
    global $bdd;

    $sql = "INSERT INTO users (name, firstname, mail, password, questionA, questionB, newsletter, subscription, role)
            VALUES (:name, :firstname, :mail, :password, :questionA, :questionB, :newsletter, :subscription, :role)";

    $stmt = $bdd->prepare($sql);

    try {
        $stmt->execute([
            ':name'         => $name,
            ':firstname'    => $firstname,
            ':mail'         => $mail,
            ':password'     => $hashedPassword,
            ':questionA'    => $questionA,
            ':questionB'    => $questionB,
            ':newsletter'   => $newsletter,
            ':subscription' => $subscriptionDate,
            ':role'         => in_array($role, ['user','vip','admin']) ? $role : 'user',
        ]);
        return true;
    } catch (PDOException $e) {
        return false;
    }
}

function getUserByMail($mail)
{
    global $bdd;

    $sql = "SELECT * FROM users WHERE mail = :mail";
    $stmt = $bdd->prepare($sql);
    $stmt->execute([':mail' => $mail]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function getAllUsers()
{
    global $bdd;
    $sql = "SELECT id, name, firstname, mail, subscription, role, avatar, newsletter FROM users ORDER BY id ASC";
    $stmt = $bdd->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getUserById(int $id)
{
    global $bdd;
    $stmt = $bdd->prepare("SELECT id, name, firstname, mail, subscription, role, avatar, newsletter FROM users WHERE id = :id");
    $stmt->execute([':id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function updateUser(int $id, array $fields): bool
{
    global $bdd;
    $allowed = ['name','firstname','mail','role','avatar','newsletter'];
    $set = [];
    $params = [':id' => $id];
    foreach ($fields as $col => $val) {
        if (!in_array($col, $allowed, true)) continue;
        if ($col === 'role' && !in_array($val, ['user','vip','admin'], true)) continue;
        $set[] = "`$col` = :$col";
        $params[":$col"] = $val;
    }
    if (empty($set)) return false;
    $stmt = $bdd->prepare("UPDATE users SET " . implode(', ', $set) . " WHERE id = :id");
    return $stmt->execute($params);
}

function deleteUser(int $id): bool
{
    global $bdd;
    $stmt = $bdd->prepare("DELETE FROM users WHERE id = :id");
    return $stmt->execute([':id' => $id]);
}

function updateUserPassword(int $id, string $hashedPassword): bool
{
    global $bdd;
    $stmt = $bdd->prepare("UPDATE users SET password = :password WHERE id = :id");
    return $stmt->execute([':password' => $hashedPassword, ':id' => $id]);
}

function setResetToken(string $mail, string $token, string $expiry): bool
{
    global $bdd;
    $stmt = $bdd->prepare("UPDATE users SET reset_token = :token, reset_token_expiry = :expiry WHERE mail = :mail");
    return $stmt->execute([':token' => $token, ':expiry' => $expiry, ':mail' => $mail]);
}

function getUserByResetToken(string $token)
{
    global $bdd;
    $stmt = $bdd->prepare("SELECT id, mail FROM users WHERE reset_token = :token AND reset_token_expiry > NOW()");
    $stmt->execute([':token' => $token]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function clearResetToken(int $id): bool
{
    global $bdd;
    $stmt = $bdd->prepare("UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE id = :id");
    return $stmt->execute([':id' => $id]);
}

function importUsersFromCSV(string $csvTmpPath): array
{
    global $bdd;

    $handle = fopen($csvTmpPath, 'r');
    if (!$handle) {
        return ['code' => 'error', 'message' => 'Impossible d’ouvrir le fichier'];
    }

    // Lecture des entêtes
    $headers = fgetcsv($handle, 0, ',');
    if (!$headers) {
        fclose($handle);
        return ['code' => 'format', 'message' => 'Fichier vide ou illisible'];
    }

    // Normalisation des entêtes CSV en minuscules
    foreach ($headers as &$header) {
        $header = strtolower(trim($header));
    }
    unset($header);

    // Colonnes attendues dans le CSV (minuscules)
    $expectedCsvHeaders = ['firstname', 'name', 'mail', 'password', 'questiona', 'questionb', 'newsletter', 'isadmin'];

    if ($headers !== $expectedCsvHeaders) {
        fclose($handle);
        return ['code' => 'format', 'message' => 'En-têtes incorrects. Attendu: ' . implode(', ', $expectedCsvHeaders)];
    }

    $inserted = 0;
    $lineNumber = 1;

    while (($data = fgetcsv($handle, 0, ',')) !== false) {
        $lineNumber++;

        if (count($data) !== count($expectedCsvHeaders)) {
            fclose($handle);
            return ['code' => 'format', 'message' => "Colonnes manquantes à la ligne $lineNumber"];
        }

        list($firstname, $name, $mail, $password, $questionA, $questionB, $newsletterRaw, $isAdminRaw) =
            array_map('trim', $data);

        // Validation des champs
        if (mb_strlen($firstname) < 2 || mb_strlen($name) < 2) {
            fclose($handle);
            return ['code' => 'format', 'message' => "Prénom ou nom trop court à la ligne $lineNumber"];
        }

        if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {
            fclose($handle);
            return ['code' => 'format', 'message' => "Email invalide à la ligne $lineNumber"];
        }

        if (mb_strlen($password) < 8) {
            fclose($handle);
            return ['code' => 'format', 'message' => "Mot de passe trop court à la ligne $lineNumber"];
        }

        if (mb_strlen($questionA) < 1 || mb_strlen($questionB) < 1) {
            fclose($handle);
            return ['code' => 'format', 'message' => "Réponses aux questions vides à la ligne $lineNumber"];
        }

        if (!in_array($newsletterRaw, ['0', '1'], true)) {
            fclose($handle);
            return ['code' => 'format', 'message' => "Newsletter doit être 0 ou 1 à la ligne $lineNumber"];
        }
        $newsletter = (int)$newsletterRaw;

        if (!in_array($isAdminRaw, ['0', '1'], true)) {
            fclose($handle);
            return ['code' => 'format', 'message' => "isAdmin doit être 0 ou 1 à la ligne $lineNumber"];
        }
        $isAdmin = (int)$isAdminRaw;

        // Skip user if mail already exists
        if (emailExists($mail)) {
            continue;
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $subscriptionDate = date('Y-m-d');

        $sql = "INSERT INTO users (firstname, name, mail, password, questionA, questionB, newsletter, subscription, isAdmin)
                VALUES (:firstname, :name, :mail, :password, :questionA, :questionB, :newsletter, :subscription, :isAdmin)";
        $stmt = $bdd->prepare($sql);

        try {
            $stmt->execute([
                ':firstname' => $firstname,
                ':name' => $name,
                ':mail' => $mail,
                ':password' => $hashedPassword,
                ':questionA' => $questionA,
                ':questionB' => $questionB,
                ':newsletter' => $newsletter,
                ':subscription' => $subscriptionDate,
                ':isAdmin' => $isAdmin
            ]);
            $inserted++;
        } catch (PDOException $e) {
            fclose($handle);
            return ['code' => 'error', 'message' => "Erreur base de données à la ligne $lineNumber : " . $e->getMessage()];
        }
    }

    fclose($handle);

    return ['code' => $inserted > 0 ? 'success' : 'none', 'inserted' => $inserted];
}

function searchUsers($filters) {
    require('db.php');
    global $bdd;

    $conditions = [];
    $params = [];

    $idFromSet = isset($filters['idFrom']) && is_numeric($filters['idFrom']);
    $idToSet = isset($filters['idTo']) && is_numeric($filters['idTo']);

    if ($idFromSet && $idToSet) {
        if ($filters['idFrom'] == $filters['idTo']) {
            $conditions[] = 'id = :idExact';
            $params[':idExact'] = $filters['idFrom'];
        } else {
            $conditions[] = 'id BETWEEN :idFrom AND :idTo';
            $params[':idFrom'] = $filters['idFrom'];
            $params[':idTo'] = $filters['idTo'];
        }
    } elseif ($idFromSet) {
        $conditions[] = 'id = :idExact';
        $params[':idExact'] = $filters['idFrom'];
    } elseif ($idToSet) {
        $conditions[] = 'id = :idExact';
        $params[':idExact'] = $filters['idTo'];
    }

    if (!empty($filters['name'])) {
        $conditions[] = 'name LIKE :name';
        $params[':name'] = $filters['name'] . '%';
    }

    if (!empty($filters['firstname'])) {
        $conditions[] = 'firstname LIKE :firstname';
        $params[':firstname'] = $filters['firstname'] . '%';
    }

    if (!empty($filters['mail'])) {
        $conditions[] = 'mail LIKE :mail';
        $params[':mail'] = $filters['mail'] . '%';
    }

    if (!empty($filters['subscription'])) {
        $conditions[] = 'subscription = :subscription';
        $params[':subscription'] = $filters['subscription'];
    }

    if (isset($filters['isAdmin']) && $filters['isAdmin'] !== '') {
        $conditions[] = 'isAdmin = :isAdmin';
        $params[':isAdmin'] = (int)$filters['isAdmin'];
    }

    if (isset($filters['role']) && $filters['role'] !== '') {
        $conditions[] = 'role = :role';
        $params[':role'] = $filters['role'];
    }

    if (isset($filters['newsletter']) && $filters['newsletter'] !== '') {
        $conditions[] = 'newsletter = :newsletter';
        $params[':newsletter'] = (int)$filters['newsletter'];
    }

    $sql = 'SELECT id, name, firstname, mail, subscription, role, avatar, newsletter FROM users';

    if (!empty($conditions)) {
        $sql .= ' WHERE ' . implode(' AND ', $conditions);
    }

    $sql .= ' ORDER BY id ASC';

    $stmt = $bdd->prepare($sql);
    $stmt->execute($params);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

