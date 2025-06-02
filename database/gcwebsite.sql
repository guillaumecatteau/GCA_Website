-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : lun. 02 juin 2025 à 12:05
-- Version du serveur : 9.1.0
-- Version de PHP : 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gcwebsite`
--

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `clients`
--

DROP TABLE IF EXISTS `clients`;
CREATE TABLE IF NOT EXISTS `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `comments`
--

DROP TABLE IF EXISTS `comments`;
CREATE TABLE IF NOT EXISTS `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `publication` datetime DEFAULT CURRENT_TIMESTAMP,
  `message` text COLLATE utf8mb4_unicode_ci,
  `likes` int DEFAULT '0',
  `isTopCom` tinyint(1) DEFAULT '0',
  `post_id` int DEFAULT NULL,
  `image_id` int DEFAULT NULL,
  `skill_id` int DEFAULT NULL,
  `project_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `post_id` (`post_id`),
  KEY `image_id` (`image_id`),
  KEY `skill_id` (`skill_id`),
  KEY `project_id` (`project_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `experience`
--

DROP TABLE IF EXISTS `experience`;
CREATE TABLE IF NOT EXISTS `experience` (
  `id` int NOT NULL AUTO_INCREMENT,
  `start` date DEFAULT NULL,
  `end` date DEFAULT NULL,
  `client_id` int DEFAULT NULL,
  `isFormation` tinyint(1) DEFAULT '0',
  `isSchool` tinyint(1) DEFAULT '0',
  `diploma` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descriptionFR` text COLLATE utf8mb4_unicode_ci,
  `descriptionEN` text COLLATE utf8mb4_unicode_ci,
  `job_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `job_id` (`job_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `images`
--

DROP TABLE IF EXISTS `images`;
CREATE TABLE IF NOT EXISTS `images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titleFR` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `titleEN` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descriptionFR` text COLLATE utf8mb4_unicode_ci,
  `descriptionEN` text COLLATE utf8mb4_unicode_ci,
  `link` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `posts`
--

DROP TABLE IF EXISTS `posts`;
CREATE TABLE IF NOT EXISTS `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titleFR` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `titleEN` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `textFR` text COLLATE utf8mb4_unicode_ci,
  `textEN` text COLLATE utf8mb4_unicode_ci,
  `publication` date DEFAULT NULL,
  `views` int DEFAULT '0',
  `likes` int DEFAULT '0',
  `isPublic` tinyint(1) DEFAULT '1',
  `project_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `category_id` (`category_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `post_images`
--

DROP TABLE IF EXISTS `post_images`;
CREATE TABLE IF NOT EXISTS `post_images` (
  `post_id` int NOT NULL,
  `image_id` int NOT NULL,
  PRIMARY KEY (`post_id`,`image_id`),
  KEY `image_id` (`image_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `projects`
--

DROP TABLE IF EXISTS `projects`;
CREATE TABLE IF NOT EXISTS `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start` date DEFAULT NULL,
  `end` date DEFAULT NULL,
  `client_id` int DEFAULT NULL,
  `projectLogo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `titleFR` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `titleEN` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `textFR` text COLLATE utf8mb4_unicode_ci,
  `textEN` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `category_id` (`category_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `project_images`
--

DROP TABLE IF EXISTS `project_images`;
CREATE TABLE IF NOT EXISTS `project_images` (
  `project_id` int NOT NULL,
  `image_id` int NOT NULL,
  PRIMARY KEY (`project_id`,`image_id`),
  KEY `image_id` (`image_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `project_jobs`
--

DROP TABLE IF EXISTS `project_jobs`;
CREATE TABLE IF NOT EXISTS `project_jobs` (
  `project_id` int NOT NULL,
  `job_id` int NOT NULL,
  PRIMARY KEY (`project_id`,`job_id`),
  KEY `job_id` (`job_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `skills`
--

DROP TABLE IF EXISTS `skills`;
CREATE TABLE IF NOT EXISTS `skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titleFR` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `titleEN` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `textFR` text COLLATE utf8mb4_unicode_ci,
  `textEN` text COLLATE utf8mb4_unicode_ci,
  `category_id` int DEFAULT NULL,
  `isProfile` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `skill_images`
--

DROP TABLE IF EXISTS `skill_images`;
CREATE TABLE IF NOT EXISTS `skill_images` (
  `skill_id` int NOT NULL,
  `image_id` int NOT NULL,
  PRIMARY KEY (`skill_id`,`image_id`),
  KEY `image_id` (`image_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `skill_jobs`
--

DROP TABLE IF EXISTS `skill_jobs`;
CREATE TABLE IF NOT EXISTS `skill_jobs` (
  `skill_id` int NOT NULL,
  `job_id` int NOT NULL,
  PRIMARY KEY (`skill_id`,`job_id`),
  KEY `job_id` (`job_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mail` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subscription` datetime DEFAULT CURRENT_TIMESTAMP,
  `connexions` int DEFAULT '0',
  `isAdmin` tinyint(1) DEFAULT '0',
  `token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `questionA` text COLLATE utf8mb4_unicode_ci,
  `questionB` text COLLATE utf8mb4_unicode_ci,
  `newsletter` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `mail` (`mail`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;