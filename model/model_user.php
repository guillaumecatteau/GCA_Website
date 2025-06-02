<?php
require_once('db.php');
require_once('model.php'); // si ProtectInjection() est ici

function emailExists($mail) {
    global $bdd;
    $sql = "SELECT COUNT(*) FROM users WHERE mail = :mail";
    $stmt = $bdd->prepare($sql);
    $stmt->execute([':mail' => $mail]);
    return $stmt->fetchColumn() > 0;
}

function registerUser($name, $firstname, $mail, $hashedPassword, $questionA, $questionB, $newsletter, $subscriptionDate) {
    global $bdd;

    $sql = "INSERT INTO users (name, firstname, mail, password, questionA, questionB, newsletter, subscription)
            VALUES (:name, :firstname, :mail, :password, :questionA, :questionB, :newsletter, :subscription)";

    $stmt = $bdd->prepare($sql);

    try {
        $stmt->execute([
            ':name'          => $name,
            ':firstname'     => $firstname,
            ':mail'          => $mail,
            ':password'      => $hashedPassword,
            ':questionA'     => $questionA,
            ':questionB'     => $questionB,
            ':newsletter'    => $newsletter,
            ':subscription'  => $subscriptionDate
        ]);
        return true;
    } catch (PDOException $e) {
        return false;
    }
}

function getUserByMail($mail) {
    global $bdd;

    $sql = "SELECT * FROM users WHERE mail = :mail";
    $stmt = $bdd->prepare($sql);
    $stmt->execute([':mail' => $mail]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}