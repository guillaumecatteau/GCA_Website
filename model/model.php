<?php

require_once('db.php');

function setUser($pseudo, $password)
{
    global $bdd;
    $message = "Utilisateur enregistré avec succès";

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $sqlUser = "INSERT INTO user (pseudo, password) VALUES (:pseudo, :password)";
    $stmtUser = $bdd->prepare($sqlUser);
    $stmtUser->bindParam(':pseudo', $pseudo, PDO::PARAM_STR);
    $stmtUser->bindParam(':password', $passwordHash, PDO::PARAM_STR);

    try {
        $stmtUser->execute();
    } catch (PDOException $e) {
        echo "Erreur : " . $e->getMessage();
        $message = "Une erreur s'est produite";
    }

    return $message;
}

function ProtectInjection($donnees)
{
    return htmlspecialchars(trim($donnees));
}

function getUser($pseudo, $password)
{
    global $bdd;

    $sql = "SELECT * FROM user WHERE pseudo = :pseudo";
    $stmt = $bdd->prepare($sql);
    $stmt->bindParam(':pseudo', $pseudo, PDO::PARAM_STR);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        return $user;
    } else {
        return false;
    }
}
