<?php
require_once('db.php');
require_once('model.php'); // si ProtectInjection() est ici

function emailExists($mail)
{
    global $bdd;
    $sql = "SELECT COUNT(*) FROM users WHERE mail = :mail";
    $stmt = $bdd->prepare($sql);
    $stmt->execute([':mail' => $mail]);
    return $stmt->fetchColumn() > 0;
}

function registerUser($name, $firstname, $mail, $hashedPassword, $questionA, $questionB, $newsletter, $subscriptionDate)
{
    global $bdd;

    $sql = "INSERT INTO users (name, firstname, mail, password, questionA, questionB, newsletter, subscription)
            VALUES (:name, :firstname, :mail, :password, :questionA, :questionB, :newsletter, :subscription)";

    $stmt = $bdd->prepare($sql);

    try {
        $stmt->execute([
            ':name' => $name,
            ':firstname' => $firstname,
            ':mail' => $mail,
            ':password' => $hashedPassword,
            ':questionA' => $questionA,
            ':questionB' => $questionB,
            ':newsletter' => $newsletter,
            ':subscription' => $subscriptionDate
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
    $sql = "SELECT id, name, firstname, mail, subscription, isAdmin FROM users ORDER BY id ASC";
    $stmt = $bdd->prepare($sql);
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
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