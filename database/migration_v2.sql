-- ============================================================================
-- Migration v2 — GCA Website
-- À exécuter dans phpMyAdmin ou via la CLI MySQL
-- Prérequis : base gcwebsite existante avec la v1
-- ============================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ── 1. TABLE USERS ────────────────────────────────────────────────────────────
-- Convertir en InnoDB et ajouter les nouveaux champs

ALTER TABLE users ENGINE = InnoDB;

ALTER TABLE users
  ADD COLUMN role               ENUM('user','vip','admin') NOT NULL DEFAULT 'user'  AFTER isAdmin,
  ADD COLUMN avatar             VARCHAR(255)               DEFAULT NULL              AFTER role,
  ADD COLUMN auth_token         VARCHAR(255)               DEFAULT NULL,
  ADD COLUMN auth_token_expiry  DATETIME                   DEFAULT NULL,
  ADD COLUMN reset_token        VARCHAR(64)                DEFAULT NULL,
  ADD COLUMN reset_token_expiry DATETIME                   DEFAULT NULL;

-- Migrer isAdmin → role
UPDATE users SET role = 'admin' WHERE isAdmin = 1;
UPDATE users SET role = 'user'  WHERE isAdmin = 0;

-- ── 2. TABLE TAGS ─────────────────────────────────────────────────────────────
-- Remplace categories + jobs. Catégories: category | job | technology

CREATE TABLE IF NOT EXISTS tags (
  id         INT          NOT NULL AUTO_INCREMENT,
  title_fr   VARCHAR(150) NOT NULL DEFAULT '',
  title_en   VARCHAR(150) NOT NULL DEFAULT '',,
  category   ENUM('category','job','technology') NOT NULL,
  PRIMARY KEY (id),
  KEY idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrer les données existantes
INSERT INTO tags (title_fr, title_en, category)
  SELECT category, category, 'category' FROM categories
  WHERE category IS NOT NULL AND category != '';

INSERT INTO tags (title_fr, title_en, category)
  SELECT job, job, 'job' FROM jobs
  WHERE job IS NOT NULL AND job != '';

-- ── 3. TABLE MEDIAS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS medias (
  id             INT          NOT NULL AUTO_INCREMENT,
  type           ENUM('image','video','youtube','audio','audio_link') NOT NULL DEFAULT 'image',
  file_path      VARCHAR(512) NOT NULL,
  description_fr TEXT,
  description_en TEXT,
  alt_text       VARCHAR(255),
  uploaded_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS medias_tags (
  media_id INT NOT NULL,
  tag_id   INT NOT NULL,
  PRIMARY KEY (media_id, tag_id),
  KEY idx_tag (tag_id),
  FOREIGN KEY (media_id) REFERENCES medias(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)   REFERENCES tags(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrer les images existantes vers medias
INSERT INTO medias (type, file_path, description_fr, description_en, alt_text)
  SELECT 'image', link, descriptionFR, descriptionEN, titleFR
  FROM images
  WHERE link IS NOT NULL AND link != '';

-- ── 4. TABLE PAGES ────────────────────────────────────────────────────────────
-- Contenu de type projet / expertise / blog

CREATE TABLE IF NOT EXISTS pages (
  id               INT          NOT NULL AUTO_INCREMENT,
  type             ENUM('projet','expertise','blog') NOT NULL,
  slug             VARCHAR(255) NOT NULL,
  title_fr         VARCHAR(255) NOT NULL DEFAULT '',
  title_en         VARCHAR(255) NOT NULL DEFAULT '',
  subtitle_fr      VARCHAR(255)          DEFAULT NULL,
  subtitle_en      VARCHAR(255)          DEFAULT NULL,
  main_visual_id   INT                   DEFAULT NULL,
  thumbnail_id     INT                   DEFAULT NULL,
  is_visible       TINYINT(1)   NOT NULL DEFAULT 0,
  comments_enabled TINYINT(1)   NOT NULL DEFAULT 0,
  date_start       DATE                  DEFAULT NULL,
  date_end         DATE                  DEFAULT NULL,
  date_publication DATE                  DEFAULT NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_slug (slug),
  KEY idx_type    (type),
  KEY idx_visible (is_visible),
  FOREIGN KEY (main_visual_id) REFERENCES medias(id) ON DELETE SET NULL,
  FOREIGN KEY (thumbnail_id)   REFERENCES medias(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tags liés à une page
CREATE TABLE IF NOT EXISTS pages_tags (
  page_id INT NOT NULL,
  tag_id  INT NOT NULL,
  PRIMARY KEY (page_id, tag_id),
  KEY idx_tag (tag_id),
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Expériences liées à une page
CREATE TABLE IF NOT EXISTS pages_experiences (
  page_id       INT NOT NULL,
  experience_id INT NOT NULL,
  PRIMARY KEY (page_id, experience_id),
  KEY idx_exp (experience_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pages liées entre elles (projets liés dans expertise/blog)
CREATE TABLE IF NOT EXISTS pages_related (
  page_id         INT NOT NULL,
  related_page_id INT NOT NULL,
  PRIMARY KEY (page_id, related_page_id),
  KEY idx_related (related_page_id),
  FOREIGN KEY (page_id)         REFERENCES pages(id) ON DELETE CASCADE,
  FOREIGN KEY (related_page_id) REFERENCES pages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 5. TABLE BLOCS DE CONTENU ────────────────────────────────────────────────
-- Contenu structuré d'une page (textes + médias dans l'ordre)

CREATE TABLE IF NOT EXISTS page_blocks (
  id         INT    NOT NULL AUTO_INCREMENT,
  page_id    INT    NOT NULL,
  sort_order INT    NOT NULL DEFAULT 0,
  block_type ENUM('text','media','gallery','canvas') NOT NULL DEFAULT 'text',
  content_fr TEXT,
  content_en TEXT,
  media_id   INT           DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_page  (page_id),
  KEY idx_order (sort_order),
  FOREIGN KEY (page_id)  REFERENCES pages(id)  ON DELETE CASCADE,
  FOREIGN KEY (media_id) REFERENCES medias(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Médias associés à un bloc de type galerie
CREATE TABLE IF NOT EXISTS page_block_gallery (
  block_id   INT NOT NULL,
  media_id   INT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (block_id, media_id),
  KEY idx_media (media_id),
  FOREIGN KEY (block_id) REFERENCES page_blocks(id) ON DELETE CASCADE,
  FOREIGN KEY (media_id) REFERENCES medias(id)      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 6. TABLE EXPERIENCES ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS experiences (
  id             INT          NOT NULL AUTO_INCREMENT,
  title_fr       VARCHAR(200) NOT NULL DEFAULT '',
  title_en       VARCHAR(200) NOT NULL DEFAULT '',
  date_start     DATE         NOT NULL,
  date_end       DATE                  DEFAULT NULL,
  logo_media_id  INT                   DEFAULT NULL,
  description_fr TEXT,
  description_en TEXT,
  PRIMARY KEY (id),
  FOREIGN KEY (logo_media_id) REFERENCES medias(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tags job liés à une expérience
CREATE TABLE IF NOT EXISTS experiences_tags (
  experience_id INT NOT NULL,
  tag_id        INT NOT NULL,
  PRIMARY KEY (experience_id, tag_id),
  KEY idx_tag (tag_id),
  FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)        REFERENCES tags(id)        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pages (projets) liées à une expérience
CREATE TABLE IF NOT EXISTS experiences_pages (
  experience_id INT NOT NULL,
  page_id       INT NOT NULL,
  PRIMARY KEY (experience_id, page_id),
  KEY idx_page (page_id),
  FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
  FOREIGN KEY (page_id)       REFERENCES pages(id)       ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 7. TABLE COMMENTS ────────────────────────────────────────────────────────
-- Remplace l'ancienne table comments

DROP TABLE IF EXISTS comments;
CREATE TABLE IF NOT EXISTS comments (
  id         INT      NOT NULL AUTO_INCREMENT,
  user_id    INT      NOT NULL,
  page_id    INT      NOT NULL,
  message    TEXT     NOT NULL,
  is_hidden  TINYINT(1) NOT NULL DEFAULT 0,
  likes      INT      NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  edited_at  DATETIME          DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_user    (user_id),
  KEY idx_page    (page_id),
  KEY idx_created (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ── Répertoire d'upload (créer côté PHP/serveur) ───────────────────────────
-- uploads/
--   images/
--   videos/
--   audio/
--   avatars/
