-- migration_v6.sql
-- Section Accueil : sous-titres défilants du titre principal (cf. Redéfinition
-- de la section Accueil) — gérables depuis l'écran Settings de l'admin tool.

CREATE TABLE IF NOT EXISTS `home_subtitles` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `text_fr`    VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text_en`    VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `home_subtitles` (`text_fr`, `text_en`, `sort_order`) VALUES
  ('Designer numérique', 'Digital designer', 0),
  ('Artiste 3D', '3D artist', 1),
  ('Créateur de mondes virtuels', 'Virtual worlds creator', 2);
