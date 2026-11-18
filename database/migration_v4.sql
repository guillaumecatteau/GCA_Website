-- migration_v4.sql
-- Redéfinition des utilisateurs : suppression du compte visiteur/inscription.
-- Il n'existe plus qu'un seul "utilisateur" (l'administrateur), dont les
-- identifiants sont désormais stockés hors base (cf. model/model_admin.php,
-- database/admin_settings.json, généré automatiquement).
--
-- La table `comments` référençait `users(id)` : on retire cette contrainte et
-- la colonne associée (le modèle de commentaires est entièrement repensé par
-- la migration suivante — commentaires anonymes avec nom/mail saisis à la volée).

SET FOREIGN_KEY_CHECKS = 0;

-- Retire la FK users -> comments si elle existe encore (nom généré par MySQL,
-- on la retrouve dynamiquement pour éviter une erreur si le nom diffère).
SET @fk_name := (
  SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'comments'
    AND COLUMN_NAME = 'user_id' AND REFERENCED_TABLE_NAME = 'users'
  LIMIT 1
);
SET @drop_fk := IF(@fk_name IS NOT NULL,
  CONCAT('ALTER TABLE comments DROP FOREIGN KEY ', @fk_name),
  'SELECT 1'
);
PREPARE stmt FROM @drop_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;
