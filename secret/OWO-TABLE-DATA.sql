-- MySQL dump 10.15  Distrib 10.0.38-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: owo
-- ------------------------------------------------------
-- Server version	10.0.38-MariaDB-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `gem`
--

LOCK TABLES `gem` WRITE;
/*!40000 ALTER TABLE `gem` DISABLE KEYS */;
INSERT INTO `gem` VALUES ('cgem1','multi'),('cgem2','patreon'),('cgem3','empow'),('cgem4','lucky'),('egem1','multi'),('egem2','patreon'),('egem3','empow'),('egem4','lucky'),('fgem1','multi'),('fgem2','patreon'),('fgem3','empow'),('fgem4','lucky'),('lgem1','multi'),('lgem2','patreon'),('lgem3','empow'),('lgem4','lucky'),('mgem1','multi'),('mgem2','patreon'),('mgem3','empow'),('mgem4','lucky'),('rgem1','multi'),('rgem2','patreon'),('rgem3','empow'),('rgem4','lucky'),('ugem1','multi'),('ugem2','patreon'),('ugem3','empow'),('ugem4','lucky');
/*!40000 ALTER TABLE `gem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `weapon`
--

LOCK TABLES `weapon` WRITE;
/*!40000 ALTER TABLE `weapon` DISABLE KEYS */;
INSERT INTO `weapon` VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),(16),(17);
/*!40000 ALTER TABLE `weapon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table 'animals'
--

LOCK TABLES `animals` WRITE;
/*!40000 ALTER TABLE `animals` DISABLE KEYS */;
INSERT INTO `animals` VALUES (':bee:'),(':bug:'),(':snail:'),(':beetle:'),(':butterfly:'),(':baby_chick:'),(':mouse2:'),(':rooster:'),(':rabbit2:'),(':chipmunk:'),(':sheep:'),(':pig2:'),(':cow2:'),(':dog2:'),(':cat2:'),(':crocodile:'),(':tiger2:'),(':penguin:'),(':elephant:'),(':whale:'),(':dragon:'),(':unicorn:'),(':snowman2:'),(':ghost:'),(':dove:'),(':gsquid:'),(':gowl:'),(':glion:'),(':gfox:'),(':gdeer:');
/*!40000 ALTER TABLE `animals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `weapon_passive`
--

LOCK TABLES `weapon_passive` WRITE;
/*!40000 ALTER TABLE `weapon_passive` DISABLE KEYS */;
INSERT INTO `weapon_passive` VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),(16),(17),(18);
/*!40000 ALTER TABLE `weapon_passive` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-03-24 15:17:13
