-- ============================================================================
-- Migration v3 — GCA Website
-- À exécuter dans phpMyAdmin ou via la CLI MySQL (après la v2)
-- ============================================================================
-- 1. Suppression des questions secrètes (remplacées par une réinitialisation
--    de mot de passe par token envoyé par email — cf. reset_token / reset_token_expiry,
--    déjà ajoutés en v2).
-- 2. Extension de la table `comments` pour supporter la messagerie privée
--    utilisateur ↔ admin (en plus des commentaires publics sur une page) :
--    - `page_id` devient nullable (NULL = message de messagerie privée, pas un commentaire public)
--    - `is_admin_reply` distingue qui a écrit le message dans un fil de discussion
--    - `read_at` permet les compteurs de messages non lus (côté admin ET côté utilisateur)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE users
  DROP COLUMN questionA,
  DROP COLUMN questionB;

ALTER TABLE comments
  MODIFY COLUMN page_id INT NULL,
  ADD COLUMN is_admin_reply TINYINT(1) NOT NULL DEFAULT 0 AFTER message,
  ADD COLUMN read_at DATETIME NULL DEFAULT NULL AFTER edited_at;

SET FOREIGN_KEY_CHECKS = 1;
