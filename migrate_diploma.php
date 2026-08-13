<?php
// Script one-shot — exécuter une fois puis supprimer
require_once 'model/db.php';
try {
    $bdd->exec("ALTER TABLE experiences
        ADD COLUMN diploma_fr VARCHAR(300) DEFAULT NULL,
        ADD COLUMN diploma_en VARCHAR(300) DEFAULT NULL");
    echo "Migration OK";
} catch (PDOException $e) {
    echo "Déjà fait ou erreur : " . $e->getMessage();
}
