-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: aqua_clean_pro
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` text NOT NULL,
  `direccion` text NOT NULL,
  `correo` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol_id` int NOT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'alan','paseo de la alborada 1001','alanxotla123@gmail.com','$2b$10$hxyE8RgfJy.B/gDV00ibq.EsV0fzvYv.ApNA6XovlohKTiOC1hOwi',1,'2026-02-08 22:25:18'),(2,'a','a','aaa','$2b$10$SJ/CAOP/ENh1ad0qWxmuSeT4.1sv3u7WEObe7ThWDqi1vqUqc52my',1,'2026-02-09 16:34:25'),(3,'aaa','aaa','a@gmail.com','$2b$10$cTbIGsRmGfAm4cYbiqrY.OcOUfzpfNe38mvBE55TUU.tTcyNiC1aO',1,'2026-02-15 20:08:21'),(4,'nsqk','paseo de largo','nsqk123@gmail.com','$2b$10$tMl2mSsblSFqJt.tzi1bZO9YgLpG2SYrriZdpWfz9n2Q/mfQO46/y',1,'2026-02-15 20:22:57'),(5,'aaa ','aaaaa','alan12@aquaclean.pro','$2b$10$05ur.uzQ1TM85qySilVi4uOvgPiDH/W7Cj7UWlZs6Hw7/u0WQ/Pgy',1,'2026-02-22 04:47:44'),(6,'aa','aa','alan1aaaaaaaa@aquaclean.pro','$2b$10$kpDp90gIgQYF.L.xxyyuveAEykIXbFnzP1XBWIsutTGAu5KYStjUi',2,'2026-02-22 16:55:06'),(7,'as','asasd','alan1a@aquaclean.pro','$2b$10$j21wyjvDuAv7qLSBmTk9muflbakxNJcOW67v3YnJdy4Kt.dpuyvfu',2,'2026-02-22 17:45:07'),(8,'asda','asas','alanxotla1asdasd23@gmail.com','$2b$10$X8CLbLmaBDhUggRmcgIjkOL5kvx6GO9ixKne6bhytitUWABIb/f.6',2,'2026-02-22 18:52:08'),(9,'a','a','alan1aaaaaaa@aquaclean.pro','$2b$10$.lGEjjiv2XANjIX7Ymc3FO8EJSbmA.VfJFGyUPdalS4NlcUOTAfMG',2,'2026-02-23 03:12:02'),(10,'Axel ','paseo de la alborada 1001 , Col. Rancho san pedro 1001, Querétaro, CP: 76113 - Tel: 7443105467','axel@gmail.com','$2b$10$GZQIl4Naof40QdRujLIRxeHXWH65jlTk1rgcdyK0Dxldhu3vhk/ma',2,'2026-02-23 16:08:39'),(11,'a','aaa','alasdadasanxotla123@gmail.com','$2b$10$tYTyoNUI4A5IK2DkNQ2pfuQvjISlvI0Nl6ToFduNE/cZTVdidgGPa',2,'2026-02-23 16:58:48'),(12,'aa','a','alanxotla1@gmail.com','$2b$10$K3Uh0h1i19GjdMUrWfuwb.Wifua3nHjduwjzNYhSknVoXqnnm9zDu',2,'2026-02-23 16:59:11'),(13,'ssd','234','axel33@gmail.com','$2b$10$KfoCRus0.PvZfRhav0ofpu/OiJycc1BZFwZB1LmP56HRQ91mfHvae',2,'2026-02-23 17:38:25'),(14,'aa','paseo de la alborada 1001, CP: 76116, Queretaro','alanxotlasasas123@gmail.com','$2b$10$EagVrqglI8Lu6lUsx58vDeiXvJCro.N4QUr4Xm/NhfHX4lLcRP93.',2,'2026-03-01 02:13:26'),(15,'as','hola, CP: sdsa, Queretaro','axe323l@gmail.com','$2b$10$tFVVrRdQe0YfFp6ByDkEi.Wc5SQGnfrmK8W1kSSxV5.w6mYXfgjRe',2,'2026-03-01 04:13:16'),(16,'a','Dirección no ingresada','alanxotla1123@gmail.com','$2b$10$rQFNyMNLkn8PthhpP25kiuB71WJPzkDBOycaHMZ1o09AOkTK9EEvK',2,'2026-03-05 16:33:50');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-07 16:20:43
