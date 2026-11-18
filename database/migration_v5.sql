-- migration_v5.sql
-- Redéfinition des commentaires : seules les pages de type "blog" acceptent des
-- commentaires. Les commentaires sont désormais anonymes (nom/mail saisis à la
-- volée, mail jamais exposé publiquement) sauf pour l'admin, auto-signé
-- "GC Digital Arts" lorsqu'il est connecté. Les réponses sont hiérarchisées via
-- `parent_id` (auto-référence).

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `comments`;
CREATE TABLE IF NOT EXISTS `comments` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `page_id`    INT NOT NULL,
  `parent_id`  INT DEFAULT NULL,
  `username`   VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mail`       VARCHAR(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_admin`   TINYINT(1) NOT NULL DEFAULT 0,
  `message`    TEXT COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_hidden`  TINYINT(1) NOT NULL DEFAULT 0,
  `likes`      INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `edited_at`  DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_page` (`page_id`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `comments_page_fk`   FOREIGN KEY (`page_id`)   REFERENCES `pages` (`id`)    ON DELETE CASCADE,
  CONSTRAINT `comments_parent_fk` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
