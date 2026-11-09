-- MySQL dump 10.13  Distrib 5.7.42, for Linux (x86_64)
--
-- Host: localhost    Database: owo
-- ------------------------------------------------------
-- Server version	5.7.42-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `gem`
--

LOCK TABLES `gem` WRITE;
/*!40000 ALTER TABLE `gem` DISABLE KEYS */;
INSERT INTO `gem` VALUES ('cgem1','multi'),('cgem2','patreon'),('cgem3','empow'),('cgem4','lucky'),('cgem5','special'),('egem1','multi'),('egem2','patreon'),('egem3','empow'),('egem4','lucky'),('egem5','special'),('fgem1','multi'),('fgem2','patreon'),('fgem3','empow'),('fgem4','lucky'),('fgem5','special'),('lgem1','multi'),('lgem2','patreon'),('lgem3','empow'),('lgem4','lucky'),('lgem5','special'),('mgem1','multi'),('mgem2','patreon'),('mgem3','empow'),('mgem4','lucky'),('mgem5','special'),('rgem1','multi'),('rgem2','patreon'),('rgem3','empow'),('rgem4','lucky'),('rgem5','special'),('ugem1','multi'),('ugem2','patreon'),('ugem3','empow'),('ugem4','lucky'),('ugem5','special');
/*!40000 ALTER TABLE `gem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `weapon`
--

LOCK TABLES `weapon` WRITE;
/*!40000 ALTER TABLE `weapon` DISABLE KEYS */;
INSERT INTO `weapon` VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),(16),(17),(18),(19),(20),(21),(22);
/*!40000 ALTER TABLE `weapon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `weapon_passive`
--

LOCK TABLES `weapon_passive` WRITE;
/*!40000 ALTER TABLE `weapon_passive` DISABLE KEYS */;
INSERT INTO `weapon_passive` VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),(16),(17),(18),(19),(20),(21);
/*!40000 ALTER TABLE `weapon_passive` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `animals_rank`
--

LOCK TABLES `animals_rank` WRITE;
/*!40000 ALTER TABLE `animals_rank` DISABLE KEYS */;
INSERT INTO `animals_rank` VALUES ('bot'),('common'),('cpatreon'),('distorted'),('epic'),('fabled'),('gem'),('hidden'),('legendary'),('mythical'),('patreon'),('rare'),('special'),('uncommon');
/*!40000 ALTER TABLE `animals_rank` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-20 17:48:25
-- MySQL dump 10.13  Distrib 5.7.42, for Linux (x86_64)
--
-- Host: localhost    Database: owo
-- ------------------------------------------------------
-- Server version	5.7.42-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `animals`
--
-- WHERE:  rank in ('common', 'rare', 'uncommon', 'epic')

LOCK TABLES `animals` WRITE;
/*!40000 ALTER TABLE `animals` DISABLE KEYS */;
INSERT INTO `animals` VALUES (':bee:','common',1,5,2,3,3,1,'How do bees go to school?\n~   On the school buzz!','bee,wasp'),(':beetle:','common',4,2,2,3,2,2,'Are they all female?','beetle,ladybug'),(':bug:','common',3,2,2,4,2,2,'It\'s a worm.','bug,worm,caterpillar'),(':butterfly:','common',1,1,1,5,5,2,'Why did you throw butter out the window?\n~ To see a butter fly!','butterfly'),(':snail:','common',8,1,2,3,5,1,'The slowest animal, but the toughest in the zoo','snail,slug'),(':crocodile:','epic',3,4,4,2,1,4,'How do you tell the difference between an alligator and an crocodile?\n~ You will see one later and one in a while','crocodile,alligator'),(':elephant:','epic',5,5,3,1,1,3,'They don\'t actually eat peanuts','elephant'),(':penguin:','epic',2,1,2,6,5,2,'The birds that can\'t fly','penguin'),(':tiger2:','epic',4,6,2,1,3,2,'Just a very large kitty','tiger,tiger2,cheetah'),(':whale:','epic',7,1,3,1,2,4,'whale, whale, whale, look what we have here','whale'),(':cat2:','rare',3,1,1,6,3,3,'They shoot lazers.','cat,cat2,kitty,kitten'),(':cow2:','rare',5,4,3,1,1,3,'Some say that they are highly sought-after','cow,cow2'),(':dog2:','rare',4,6,3,1,1,2,'Very loyal and protective','dog,dog2,doggy,puppy,wolf'),(':pig2:','rare',4,2,3,2,2,4,'aka ur mum','pig,pig2'),(':sheep:','rare',5,2,2,3,1,4,'Tastes like cotten candy!','sheep,ram,goat'),(':baby_chick:','uncommon',3,2,3,3,3,2,'chirp chirp! It\'s so cute!','chick,baby_chick'),(':chipmunk:','uncommon',3,5,2,3,2,1,'Don\'t mess with them.','chipmunk,squirrel'),(':mouse2:','uncommon',3,3,2,3,3,2,'~~sqeak~~ squeak!','mouse,mouse2,rat'),(':rabbit2:','uncommon',3,4,2,3,2,2,'There\'s a ton of them.','rabbit,rabbit2,bunny'),(':rooster:','uncommon',3,4,3,2,2,2,'The alarm cluck','chicken,rooster');
/*!40000 ALTER TABLE `animals` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-20 17:48:25
