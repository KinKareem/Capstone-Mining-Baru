<<<<<<< HEAD
CREATE DATABASE  IF NOT EXISTS `db_mining_app` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `db_mining_app`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: shuttle.proxy.rlwy.net    Database: db_mining_app
-- ------------------------------------------------------
-- Server version	9.4.0
=======
-- MySQL dump combined for db_mining_app (COMPLETE VERSION)
-- Server version 9.4.0
>>>>>>> 9f98f19af362063e3803dee35572af4760ae119f

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

<<<<<<< HEAD
--
-- Table structure for table `daily_attendance`
--

DROP TABLE IF EXISTS `daily_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_attendance` (
  `attendance_id` int NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `employee_id` int DEFAULT NULL,
  `attendance_status` enum('present','sick','permission','absent','leave') DEFAULT 'present',
  `remarks` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attendance_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `daily_attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_attendance`
--

LOCK TABLES `daily_attendance` WRITE;
/*!40000 ALTER TABLE `daily_attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `daily_attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_equipment_status`
--

DROP TABLE IF EXISTS `daily_equipment_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_equipment_status` (
  `status_id` int NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `equipment_id` int DEFAULT NULL,
  `equipment_status` enum('ready','breakdown','maintenance','standby') DEFAULT 'ready',
  `remarks` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`status_id`),
  KEY `equipment_id` (`equipment_id`),
  CONSTRAINT `daily_equipment_status_ibfk_1` FOREIGN KEY (`equipment_id`) REFERENCES `heavy_equipment` (`equipment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_equipment_status`
--

LOCK TABLES `daily_equipment_status` WRITE;
/*!40000 ALTER TABLE `daily_equipment_status` DISABLE KEYS */;
/*!40000 ALTER TABLE `daily_equipment_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_report_details`
--

DROP TABLE IF EXISTS `daily_report_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_report_details` (
  `detail_id` int NOT NULL AUTO_INCREMENT,
  `report_id` int DEFAULT NULL,
  `equipment_id` int DEFAULT NULL,
  `employee_id` int DEFAULT NULL,
  `tonnage` float DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  PRIMARY KEY (`detail_id`),
  KEY `report_id` (`report_id`),
  KEY `equipment_id` (`equipment_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `daily_report_details_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `daily_reports` (`report_id`),
  CONSTRAINT `daily_report_details_ibfk_2` FOREIGN KEY (`equipment_id`) REFERENCES `heavy_equipment` (`equipment_id`),
  CONSTRAINT `daily_report_details_ibfk_3` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_report_details`
--

LOCK TABLES `daily_report_details` WRITE;
/*!40000 ALTER TABLE `daily_report_details` DISABLE KEYS */;
INSERT INTO `daily_report_details` VALUES (1,1,7,1,3200,'06:00:00','14:00:00'),(2,1,8,8,3100,'06:00:00','14:00:00'),(3,1,5,2,2500,'06:00:00','14:00:00'),(4,1,6,6,2600,'06:00:00','14:00:00'),(5,1,1,6,3500,'06:00:00','14:00:00'),(6,2,7,1,3300,'06:00:00','14:00:00'),(7,2,8,8,3200,'06:00:00','14:00:00'),(8,2,5,2,2650,'06:00:00','14:00:00'),(9,2,6,6,2700,'06:00:00','14:00:00'),(10,2,1,6,3550,'06:00:00','14:00:00'),(11,3,7,1,3000,'06:00:00','14:00:00'),(12,3,8,8,2950,'06:00:00','14:00:00'),(13,3,5,2,2400,'06:00:00','14:00:00'),(14,3,6,6,2550,'06:00:00','14:00:00'),(15,3,1,6,3400,'06:00:00','14:00:00');
/*!40000 ALTER TABLE `daily_report_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_reports`
--

DROP TABLE IF EXISTS `daily_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_reports` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `period_id` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `daily_tonnage` float DEFAULT NULL,
  `total_employees_present` int DEFAULT NULL,
  `total_equipment_ready` int DEFAULT NULL,
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_id`),
  KEY `period_id` (`period_id`),
  CONSTRAINT `daily_reports_ibfk_1` FOREIGN KEY (`period_id`) REFERENCES `weekly_periods` (`period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_reports`
--

LOCK TABLES `daily_reports` WRITE;
/*!40000 ALTER TABLE `daily_reports` DISABLE KEYS */;
INSERT INTO `daily_reports` VALUES (1,1,'2025-12-01',18500,10,9,'Production stable','2025-12-06 18:34:34'),(2,1,'2025-12-02',19200,10,9,'Good weather','2025-12-06 18:34:34'),(3,1,'2025-12-03',17800,10,10,'Slight delay due to hauling congestion','2025-12-06 18:34:34');
/*!40000 ALTER TABLE `daily_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `employee_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `position` varchar(50) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `competency` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'Budi Santoso','Haul Truck Operator','active','Haul Truck 240T','2025-12-06 18:17:23','2025-12-06 18:17:23'),(2,'Andi Pratama','Shovel Operator','active','Shovel 45m3','2025-12-06 18:17:23','2025-12-06 18:17:23'),(3,'Joko Wibowo','Production Foreman','active','Supervisory','2025-12-06 18:17:23','2025-12-06 18:17:23'),(4,'Rizky Hidayat','Mechanic','active','Heavy Equipment Maintenance','2025-12-06 18:17:23','2025-12-06 18:17:23'),(5,'Siti Rahma','Production Admin','active','Data Entry','2025-12-06 18:17:23','2025-12-06 18:17:23'),(6,'Dedi Supriadi','Crusher Operator','active','Crusher Ops','2025-12-06 18:17:23','2025-12-06 18:17:23'),(7,'Muhammad Irfan','Shiploader Operator','active','Port Operations','2025-12-06 18:17:23','2025-12-06 18:17:23'),(8,'Rendi Saputra','Haul Truck Operator','active','Haul Truck 290T','2025-12-06 18:17:23','2025-12-06 18:17:23'),(9,'Yudi Hartono','Mine Planner','active','Mine Planning','2025-12-06 18:17:23','2025-12-06 18:17:23'),(10,'Anisa Putri','Safety Officer','active','Safety','2025-12-06 18:17:23','2025-12-06 18:17:23');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fleet_master`
--

DROP TABLE IF EXISTS `fleet_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fleet_master` (
  `asset_id` char(20) NOT NULL,
  `equipment_type` char(50) DEFAULT NULL,
  `model` char(50) DEFAULT NULL,
  `capacity` smallint DEFAULT NULL,
  `capacity_unit` char(20) DEFAULT NULL,
  `current_status` char(50) DEFAULT NULL,
  `location` char(50) DEFAULT NULL,
  `planner_notes` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`asset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fleet_master`
--

LOCK TABLES `fleet_master` WRITE;
/*!40000 ALTER TABLE `fleet_master` DISABLE KEYS */;
INSERT INTO `fleet_master` VALUES ('CRUSHER-A','Crusher','GyratoryX',1000,'ton/hour','Operational','Stockpile',NULL,'2025-12-02 00:35:49'),('CRUSHER-B','Crusher','GyratoryX',1000,'ton/hour','Operational','Stockpile',NULL,'2025-12-02 00:35:49'),('SHIPLOADER-01','Shiploader','Standard',1000,'ton/hour','Operational','Port',NULL,'2025-12-02 00:35:49'),('SHIPLOADER-02','Shiploader','Standard',1000,'ton/hour','Operational','Port',NULL,'2025-12-02 00:35:49'),('SHOVEL-01','Shovel','RopeShovel 45m3',85,'ton/bucket','Operational','PIT-A',NULL,'2025-12-02 00:35:49'),('SHOVEL-02','Shovel','RopeShovel 45m3',85,'ton/bucket','Operational','PIT-B',NULL,'2025-12-02 00:35:49'),('TRUK-001','Haul Truck','CAT 793F',240,'ton/trip','Operational','PIT-A',NULL,'2025-12-02 00:35:49'),('TRUK-002','Haul Truck','CAT 793F',240,'ton/trip','Operational','PIT-A',NULL,'2025-12-02 00:35:49'),('TRUK-003','Haul Truck','CAT 793F',240,'ton/trip','Breakdown','PIT-A','oleng','2025-12-03 15:18:59'),('TRUK-004','Haul Truck','CAT 793F',240,'ton/trip','Operational','PIT-A',NULL,'2025-12-02 00:35:49'),('TRUK-005','Haul Truck','CAT 793F',240,'ton/trip','Operational','PIT-A',NULL,'2025-12-02 00:35:49'),('TRUK-006','Haul Truck','CAT 793F',240,'ton/trip','Operational','PIT-A',NULL,'2025-12-02 00:35:49'),('TRUK-007','Haul Truck','CAT 793F',240,'ton/trip','Operational','PIT-A',NULL,'2025-12-02 00:35:49'),('TRUK-008','Haul Truck','CAT 793F',240,'ton/trip','Operational','PIT-A',NULL,'2025-12-02 00:35:49'),('TRUK-009','Haul Truck','CAT 793F',240,'ton/trip','Operational','PIT-B',NULL,'2025-12-02 00:35:49'),('TRUK-010','Haul Truck','CAT 793F',240,'ton/trip','Operational','PIT-B',NULL,'2025-12-02 00:35:49'),('TRUK-011','Haul Truck','CAT 793F',240,'ton/trip','Operational','PIT-B',NULL,'2025-12-02 00:35:49'),('TRUK-012','Haul Truck','CAT 793F',240,'ton/trip','Operational','PIT-B',NULL,'2025-12-02 00:35:49'),('TRUK-013','Haul Truck','CAT 793F',240,'ton/trip','Operational','PIT-B',NULL,'2025-12-02 00:35:49'),('TRUK-014','Haul Truck','CAT 793F',240,'ton/trip','Operational','PIT-B',NULL,'2025-12-02 00:35:49'),('TRUK-015','Haul Truck','CAT 793F',240,'ton/trip','Operational','PIT-B',NULL,'2025-12-02 00:35:49'),('TRUK-016','Haul Truck','Komatsu 930E',290,'ton/trip','Operational','PIT-B',NULL,'2025-12-02 00:35:49'),('TRUK-017','Haul Truck','Komatsu 930E',290,'ton/trip','Operational','PIT-B',NULL,'2025-12-02 00:35:49'),('TRUK-018','Haul Truck','Komatsu 930E',290,'ton/trip','Maintenance','Workshop','Brake repair, est finish 25-Nov','2025-12-02 00:35:49'),('TRUK-019','Haul Truck','Komatsu 930E',290,'ton/trip','Breakdown','PIT-B','Waiting for parts, est 18-Nov','2025-12-02 00:35:49'),('TRUK-020','Haul Truck','Komatsu 930E',290,'ton/trip','Maintenance','Workshop','Scheduled Service, finish 27-Nov EOD','2025-12-02 00:35:49'),('TRUK-021','Haul Truck','Komatsu 930E',290,'ton/trip','Operational','PIT-B',NULL,'2025-12-02 00:35:49'),('TRUK-022','Haul Truck','Komatsu 930E',290,'ton/trip','Operational','PIT-A',NULL,'2025-12-02 00:35:49'),('TRUK-023','Haul Truck','Komatsu 930E',290,'ton/trip','Operational','PIT-B',NULL,'2025-12-02 00:35:49'),('TRUK-024','Haul Truck','Komatsu 930E',290,'ton/trip','Operational','PIT-A',NULL,'2025-12-02 00:35:49'),('TRUK-025','Haul Truck','Komatsu 930E',290,'ton/trip','Operational','PIT-B',NULL,'2025-12-02 00:35:49'),('TRUK-026','Haul Truck','Komatsu 930E',290,'ton/trip','Operational','PIT-A',NULL,'2025-12-02 00:35:49'),('TRUK-027','Haul Truck','Komatsu 930E',290,'ton/trip','Operational','PIT-A',NULL,'2025-12-02 00:35:49'),('TRUK-028','Haul Truck','Komatsu 930E',290,'ton/trip','Operational','PIT-A',NULL,'2025-12-02 00:35:49'),('TRUK-029','Haul Truck','Komatsu 930E',290,'ton/trip','Operational','PIT-B',NULL,'2025-12-02 00:35:49'),('TRUK-030','Haul Truck','Komatsu 930E',290,'ton/trip','Operational','PIT-A',NULL,'2025-12-02 00:35:49');
/*!40000 ALTER TABLE `fleet_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `heavy_equipment`
--

DROP TABLE IF EXISTS `heavy_equipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `heavy_equipment` (
  `equipment_id` int NOT NULL AUTO_INCREMENT,
  `unit_code` varchar(50) DEFAULT NULL,
  `equipment_type` enum('Crusher','Shiploader','Shovel','Haul Truck') DEFAULT NULL,
  `capacity` float DEFAULT NULL,
  `default_status` enum('ready','standby','maintenance') DEFAULT 'ready',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`equipment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `heavy_equipment`
--

LOCK TABLES `heavy_equipment` WRITE;
/*!40000 ALTER TABLE `heavy_equipment` DISABLE KEYS */;
INSERT INTO `heavy_equipment` VALUES (1,'CRUSHER-A','Crusher',1000,'ready','2025-12-06 18:19:04','2025-12-06 18:19:04'),(2,'CRUSHER-B','Crusher',1000,'ready','2025-12-06 18:19:04','2025-12-06 18:19:04'),(3,'SHIPLOADER-01','Shiploader',1000,'ready','2025-12-06 18:19:04','2025-12-06 18:19:04'),(4,'SHIPLOADER-02','Shiploader',1000,'ready','2025-12-06 18:19:04','2025-12-06 18:19:04'),(5,'SHOVEL-01','Shovel',85,'ready','2025-12-06 18:19:04','2025-12-06 18:19:04'),(6,'SHOVEL-02','Shovel',85,'ready','2025-12-06 18:19:04','2025-12-06 18:19:04'),(7,'TRUCK-001','Haul Truck',240,'ready','2025-12-06 18:19:04','2025-12-06 18:19:04'),(8,'TRUCK-002','Haul Truck',240,'ready','2025-12-06 18:19:04','2025-12-06 18:19:04'),(9,'TRUCK-003','Haul Truck',240,'maintenance','2025-12-06 18:19:04','2025-12-06 18:19:04'),(10,'TRUCK-004','Haul Truck',240,'ready','2025-12-06 18:19:04','2025-12-06 18:19:04');
/*!40000 ALTER TABLE `heavy_equipment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `location_id` int NOT NULL AUTO_INCREMENT,
  `location_name` varchar(100) DEFAULT NULL,
  `location_type` enum('pit','disposal','hauling','workshop','stockpile') DEFAULT NULL,
  PRIMARY KEY (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,'PIT-A','pit'),(2,'PIT-B','pit'),(3,'PIT-C','pit'),(4,'WORKSHOP','workshop'),(5,'DISPOSAL-1','disposal'),(6,'DISPOSAL-2','disposal'),(7,'HAULING-ROAD-1','hauling'),(8,'STOCKPILE','stockpile');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_optimization_log`
--

DROP TABLE IF EXISTS `plan_optimization_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan_optimization_log` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `plan_id` varchar(50) NOT NULL,
  `version` int DEFAULT '1',
  `summary_json` json DEFAULT NULL,
  `scenarios_json` json DEFAULT NULL,
  `selected_scenario_id` json DEFAULT NULL,
  `rejection_note` text,
  `current_step` enum('DRAFTING_MINE','DRAFTING_SHIP','SCENARIO_SELECTION','FINAL_APPROVAL','COMPLETED','REJECTED') DEFAULT 'DRAFTING_MINE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_optimization_log`
--

LOCK TABLES `plan_optimization_log` WRITE;
/*!40000 ALTER TABLE `plan_optimization_log` DISABLE KEYS */;
INSERT INTO `plan_optimization_log` VALUES (7,'W50-2025',1,'{\"alerts\": {\"fleet_alert\": \"Optimal\", \"weather_alert\": \"Caution\", \"shipping_alert\": \"High Traffic\"}, \"data_source\": \"AI Calculation\", \"situation_summary\": \"The mine faces a delivery request of 285,000 tons across 5 vessels this week, including one high-priority shipment. Weather conditions present a \'Caution\' with persistent wet roads all week, leading to an estimated 14 hours of lost effective operating time impacting road logistics. The fleet is in \'Optimal\' health, with 29 out of 30 trucks ready; however, TRUK-003 is out of service indefinitely. There is no existing stockpile reported, requiring all demand to be met by new production.\", \"current_stockpile_tons\": 0, \"suggested_baseline_target\": 257058}','{\"scenarios\": [{\"id\": 1, \"name\": \"Execute User Plan\", \"focus\": \"Planner\'s Request\", \"key_cons\": [\"High risk of unmet shipping demand\", \"Potential for significant demurrage costs\", \"Misses opportunity to alleviate critical port congestion\"], \"key_pros\": [\"Aligned with planner intent\", \"Predictable resource allocation\", \"Lower immediate operational risk\"], \"ai_recommended\": false, \"strategy_summary\": \"Attempt to hit the user\'s exact target of 257058 tons. Requires specific resource allocation and close monitoring.\", \"feasibility_score\": \"High\", \"role_specific_plan\": {\"mine_planner\": {\"pit_focus\": \"Maintain consistent production from primary pits, adapting operations to minimize impact from minor weather disturbances.\", \"main_objective\": \"Execute the week\'s production target of 257058 tons as per the draft plan.\", \"fleet_instruction\": \"Operate the fleet at planned daily rates, ensuring close monitoring of road conditions due to wet weather.\"}, \"shipping_planner\": {\"risk_warning\": \"Significant risk of demurrage for multiple vessels due to the inability to meet the full 285000-ton demand, exacerbated by \'CRITICAL\' port status.\", \"main_objective\": \"Manage vessel berthing and loading operations for the projected 257058 tons.\", \"berthing_instruction\": \"Prioritize MV Red Dragon to mitigate high-priority penalties. Communicate potential shortfalls and delays to other vessel agents proactively.\"}}, \"financial_implication\": \"Stable operating costs aligned with planned budget, but high risk of demurrage due to unmet shipping demand.\", \"comparison_to_user_draft\": \"Exact Match\", \"estimated_production_tons\": 257058}, {\"id\": 2, \"name\": \"Maximize Throughput\", \"focus\": \"High Volume\", \"key_cons\": [\"Potential for increased overtime costs\", \"Higher operational intensity during \'CAUTION\' weather\", \"Increased wear and tear on equipment\"], \"key_pros\": [\"Meets full shipping demand\", \"Mitigates demurrage costs and penalties\", \"Alleviates \'CRITICAL\' port congestion\", \"Maintains strong customer relationships\"], \"ai_recommended\": true, \"strategy_summary\": \"Adjusted target to meet the full 285000 tons of shipping demand, pushing operational limits within calculated capacity.\", \"feasibility_score\": \"High\", \"role_specific_plan\": {\"mine_planner\": {\"pit_focus\": \"Prioritize high-yield pits, ensuring continuous and efficient feed to crushers despite challenging wet weather conditions.\", \"main_objective\": \"Maximize coal extraction to meet the 285000-ton shipping demand, prioritizing output.\", \"fleet_instruction\": \"Authorize necessary overtime to maintain production targets. Optimize haulage routes and cycles, implementing stricter wet road operating procedures.\"}, \"shipping_planner\": {\"risk_warning\": \"Minor operational risks from the increased pace and potential for small weather-related delays, but overall, demurrage risk is minimized.\", \"main_objective\": \"Ensure all 5 vessels are fully loaded and dispatched efficiently to alleviate critical port congestion.\", \"berthing_instruction\": \"Maintain and accelerate the current berthing schedule, pushing for rapid loading, with MV Red Dragon as the highest priority.\"}}, \"financial_implication\": \"Increased operational costs due to potential overtime and more aggressive operations during wet weather, but significantly reduces demurrage risk and ensures customer satisfaction.\", \"comparison_to_user_draft\": \"+27942 tons higher\", \"estimated_production_tons\": 285000}, {\"id\": 3, \"name\": \"Operational Resilience\", \"focus\": \"Safety First\", \"key_cons\": [\"Critical unmet shipping demand (55000 tons short)\", \"Very high demurrage and penalty risks\", \"Damage to customer relationships and reputation\", \"Worsens port congestion\"], \"key_pros\": [\"Enhanced safety for personnel\", \"Reduced wear and tear on equipment\", \"Lower immediate operational costs\"], \"ai_recommended\": false, \"strategy_summary\": \"Conservative approach, reducing the target to 230000 tons to prioritize safety and asset health amidst \'CAUTION\' weather conditions.\", \"feasibility_score\": \"High\", \"role_specific_plan\": {\"mine_planner\": {\"pit_focus\": \"Focus on stable, safe production from easily accessible pits, minimizing exposure to higher-risk areas during adverse weather.\", \"main_objective\": \"Prioritize safety and asset protection, aiming for a conservative 230000 tons due to persistent wet road conditions.\", \"fleet_instruction\": \"Reduce operational intensity during peak wet periods, strictly enforcing slower speeds and cautious driving on compromised roads.\"}, \"shipping_planner\": {\"risk_warning\": \"Extreme risk of demurrage, contract breaches, and severe reputation damage due to significant inability to meet demand during a \'CRITICAL\' shipping period.\", \"main_objective\": \"Manage expectations for substantial cargo shortfalls for all vessels and prepare for significant delays.\", \"berthing_instruction\": \"Immediately communicate potential substantial delays and partial loading to all vessel agents, prioritizing MV Red Dragon for the best possible load within reduced capacity.\"}}, \"financial_implication\": \"Lower direct operational costs by reducing intensity, but carries a very high risk of significant demurrage, contractual penalties, and reputational damage due to substantial cargo shortfalls.\", \"comparison_to_user_draft\": \"-27058 tons lower\", \"estimated_production_tons\": 230000}], \"context_check\": {\"market_condition\": \"High Pressure\", \"primary_bottleneck\": \"Shipping Urgency\", \"operational_condition\": \"Constrained (Weather)\"}, \"final_reasoning\": {\"explanation\": \"The port faces a CRITICAL shipping week with a high cargo demand of 285,000 tons and a high-priority vessel (MV Red Dragon) incurring potential penalties. Maximizing throughput to 285,000 tons ensures we meet the full demand, mitigating severe demurrage risks and maintaining customer commitments. This is achievable within the calculated effective operational capacity (296,835 tons) despite the \'CAUTION\' weather, which implies manageable operational adjustments.\", \"trigger_factor\": \"Critical Shipping Status\", \"selected_scenario\": \"Maximize Throughput\", \"immediate_action_items\": [\"Mine Planner to finalize an operational schedule for 285,000 tons, including potential overtime and detailed wet weather operating procedures.\", \"Shipping Planner to reconfirm berthing schedule with all vessel agents and communicate the commitment to meet full demand.\", \"Operations team to prepare for heightened vigilance and maintenance checks to support aggressive throughput during wet conditions.\"]}}','{\"id\": 2, \"name\": \"Maximize Throughput\", \"focus\": \"High Volume\", \"key_cons\": [\"Potential for increased overtime costs\", \"Higher operational intensity during \'CAUTION\' weather\", \"Increased wear and tear on equipment\"], \"key_pros\": [\"Meets full shipping demand\", \"Mitigates demurrage costs and penalties\", \"Alleviates \'CRITICAL\' port congestion\", \"Maintains strong customer relationships\"], \"ai_recommended\": true, \"strategy_summary\": \"Adjusted target to meet the full 285000 tons of shipping demand, pushing operational limits within calculated capacity.\", \"feasibility_score\": \"High\", \"role_specific_plan\": {\"mine_planner\": {\"pit_focus\": \"Prioritize high-yield pits, ensuring continuous and efficient feed to crushers despite challenging wet weather conditions.\", \"main_objective\": \"Maximize coal extraction to meet the 285000-ton shipping demand, prioritizing output.\", \"fleet_instruction\": \"Authorize necessary overtime to maintain production targets. Optimize haulage routes and cycles, implementing stricter wet road operating procedures.\"}, \"shipping_planner\": {\"risk_warning\": \"Minor operational risks from the increased pace and potential for small weather-related delays, but overall, demurrage risk is minimized.\", \"main_objective\": \"Ensure all 5 vessels are fully loaded and dispatched efficiently to alleviate critical port congestion.\", \"berthing_instruction\": \"Maintain and accelerate the current berthing schedule, pushing for rapid loading, with MV Red Dragon as the highest priority.\"}}, \"financial_implication\": \"Increased operational costs due to potential overtime and more aggressive operations during wet weather, but significantly reduces demurrage risk and ensures customer satisfaction.\", \"comparison_to_user_draft\": \"+27942 tons higher\", \"estimated_production_tons\": 285000}',NULL,'FINAL_APPROVAL','2025-12-07 08:59:37','2025-12-07 09:19:22');
/*!40000 ALTER TABLE `plan_optimization_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shifts`
--

DROP TABLE IF EXISTS `shifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shifts` (
  `shift_id` int NOT NULL AUTO_INCREMENT,
  `shift_name` varchar(50) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  PRIMARY KEY (`shift_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shifts`
--

LOCK TABLES `shifts` WRITE;
/*!40000 ALTER TABLE `shifts` DISABLE KEYS */;
INSERT INTO `shifts` VALUES (1,'Morning Shift','06:00:00','14:00:00'),(2,'Evening Shift','14:00:00','22:00:00'),(3,'Night Shift','22:00:00','06:00:00');
/*!40000 ALTER TABLE `shifts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipping_schedule`
--

DROP TABLE IF EXISTS `shipping_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipping_schedule` (
  `vessel_id` char(20) NOT NULL,
  `vessel_name` varchar(100) DEFAULT NULL,
  `eta_date` date DEFAULT NULL,
  `latest_berthing` date DEFAULT NULL,
  `target_load_tons` int DEFAULT NULL,
  `shipping_notes` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`vessel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipping_schedule`
--

LOCK TABLES `shipping_schedule` WRITE;
/*!40000 ALTER TABLE `shipping_schedule` DISABLE KEYS */;
INSERT INTO `shipping_schedule` VALUES ('KPL-DEC01','MV Bara Sejahtera','2025-12-08','2025-12-09',50000,NULL,'2025-12-05 00:20:57'),('KPL-DEC02','MV Ocean Giant','2025-12-09','2025-12-11',75000,NULL,'2025-12-05 00:20:57'),('KPL-DEC03','MV Red Dragon','2025-12-11','2025-12-12',60000,'Urgent, Short Laycan, Penalty applies','2025-12-05 00:20:57'),('KPL-DEC04','MV Pacific Star','2025-12-12','2025-12-13',45000,NULL,'2025-12-05 00:20:57'),('KPL-DEC05','MV Golden Energy','2025-12-14','2025-12-15',55000,NULL,'2025-12-05 00:20:57');
/*!40000 ALTER TABLE `shipping_schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_blending_plan`
--

DROP TABLE IF EXISTS `tb_blending_plan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tb_blending_plan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_week` int NOT NULL,
  `plan_year` int NOT NULL,
  `target_tonnage_weekly` int NOT NULL,
  `target_calori` decimal(6,2) DEFAULT '4800.00',
  `target_ash_max` decimal(4,2) DEFAULT '12.00',
  `initial_ash_draft` decimal(4,2) DEFAULT '12.50',
  `final_ash_result` decimal(4,2) DEFAULT NULL,
  `is_approved_mine` tinyint(1) DEFAULT '0',
  `is_approved_shipping` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_blending_plan`
--

LOCK TABLES `tb_blending_plan` WRITE;
/*!40000 ALTER TABLE `tb_blending_plan` DISABLE KEYS */;
INSERT INTO `tb_blending_plan` VALUES (1,47,2025,112000,4800.00,12.00,12.50,NULL,0,0);
/*!40000 ALTER TABLE `tb_blending_plan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_equipment`
--

DROP TABLE IF EXISTS `tb_equipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tb_equipment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `unit_id` varchar(20) NOT NULL,
  `type` varchar(50) NOT NULL,
  `location` varchar(100) DEFAULT 'Workshop',
  `status` enum('Available','Breakdown','Maintenance','Standby') DEFAULT 'Available',
  `is_available` tinyint(1) DEFAULT '1',
  `productivity_rate` decimal(6,2) DEFAULT '0.00',
  `last_update` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unit_id` (`unit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_equipment`
--

LOCK TABLES `tb_equipment` WRITE;
/*!40000 ALTER TABLE `tb_equipment` DISABLE KEYS */;
INSERT INTO `tb_equipment` VALUES (1,'DT-01','Dump Truck','Pit A','Available',1,55.00,'2025-11-17 09:18:06'),(2,'EX-01','Excavator','Pit A','Available',1,150.00,'2025-11-17 09:18:06'),(3,'DT-02','Dump Truck','Workshop','Breakdown',0,0.00,'2025-11-17 09:18:06'),(4,'DZ-01','Dozer','Pit B','Available',1,30.00,'2025-11-17 09:18:06'),(5,'DT-03','Dump Truck','Pit C','Maintenance',0,0.00,'2025-11-17 09:18:06');
/*!40000 ALTER TABLE `tb_equipment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_karyawan`
--

DROP TABLE IF EXISTS `tb_karyawan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tb_karyawan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `user_id` int DEFAULT NULL,
  `competency` varchar(150) NOT NULL,
  `current_unit_id` int DEFAULT NULL,
  `current_shift` varchar(20) DEFAULT 'Day 1',
  `presence` enum('Hadir','Absen','Sakit','Cuti') DEFAULT 'Hadir',
  PRIMARY KEY (`id`),
  KEY `unit_fk` (`current_unit_id`),
  CONSTRAINT `tb_karyawan_ibfk_1` FOREIGN KEY (`current_unit_id`) REFERENCES `tb_equipment` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_karyawan`
--

LOCK TABLES `tb_karyawan` WRITE;
/*!40000 ALTER TABLE `tb_karyawan` DISABLE KEYS */;
INSERT INTO `tb_karyawan` VALUES (2,'Budi Cahyo',NULL,'Heavy Excavator Certified',2,'Day 1','Hadir'),(3,'Cintya Putri',NULL,'Dump Truck',4,'Day 1','Hadir'),(4,'Doni Rian',NULL,'Dozer, Scraper',5,'Night 1','Hadir'),(5,'Eva Melisa',NULL,'Dump Truck',NULL,'Day 1','Absen');
/*!40000 ALTER TABLE `tb_karyawan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_roles`
--

DROP TABLE IF EXISTS `tb_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tb_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_roles`
--

LOCK TABLES `tb_roles` WRITE;
/*!40000 ALTER TABLE `tb_roles` DISABLE KEYS */;
INSERT INTO `tb_roles` VALUES (1,'shipper_planner','Perencana pengiriman kapal'),(2,'mining_planner','Perencana penambangan');
/*!40000 ALTER TABLE `tb_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_users`
--

DROP TABLE IF EXISTS `tb_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tb_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `pass` varchar(255) NOT NULL,
  `role_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `role_fk` (`role_id`),
  CONSTRAINT `fk_role` FOREIGN KEY (`role_id`) REFERENCES `tb_roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_users`
--

LOCK TABLES `tb_users` WRITE;
/*!40000 ALTER TABLE `tb_users` DISABLE KEYS */;
INSERT INTO `tb_users` VALUES (1,'budi_shipper','budi@example.com','$2y$10$abcdefg1234567890example',1,'2025-11-04 07:55:39'),(2,'andi_mining','andi@example.com','$2y$10$hijklmn0987654321example',2,'2025-11-04 07:55:39'),(3,'kin','waw@gmail.com','$2y$10$hUgDxYUGnmO7GLcHsErshecRi439S4R6TiG86KemwC2tYhdoTtTAO',1,'2025-11-04 08:49:45'),(4,'kalvin','kalvin@gmail.com','$2b$10$ULHfS0nCmjxhoq2XQ7lBi.KlAvVTDalTbD46985xU5mY0/UwCFgl6',2,'2025-12-01 09:28:54'),(5,'Ichika','ichika@gmail.com','$2b$10$qaAh6gulWY/GGhl5zAHOneDlqZm.zgeWhfdFT3NzclmlXDXxNAQC.',1,'2025-12-01 09:45:10'),(6,'Kalvin Ship','kalvinship@gmail.com','$2b$10$ZNdifKunSATirnZKoiNNpefNFX2xetP8VVW0isPLLzeqSICtddWyy',1,'2025-12-01 09:47:03'),(7,'testmine','testmine@gmail.com','$2b$10$MoBt7R5vSNMToj.p2/bdj.vx3aGv2/x7sD.y8jotWwIWoB.D16dRu',2,'2025-12-06 03:28:49');
/*!40000 ALTER TABLE `tb_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `weather`
--

DROP TABLE IF EXISTS `weather`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `weather` (
  `date` date NOT NULL,
  `rainfall_mm` float DEFAULT '0',
  `road_condition` enum('Flooded','Very Slippery','Slippery','Wet','Dry') DEFAULT NULL,
  `max_wave_m` float DEFAULT '0',
  `port_status` enum('Closed','Restricted','Open') DEFAULT NULL,
  `effective_working_hours` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`date`),
  UNIQUE KEY `date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weather`
--

LOCK TABLES `weather` WRITE;
/*!40000 ALTER TABLE `weather` DISABLE KEYS */;
INSERT INTO `weather` VALUES ('2025-12-07',1.3,'Wet',0.5,'Open',22,'2025-12-07 08:46:57'),('2025-12-08',19.1,'Wet',0.62,'Open',22,'2025-12-07 08:46:57'),('2025-12-09',3,'Wet',0.72,'Open',22,'2025-12-07 08:46:57'),('2025-12-10',8.7,'Wet',0.6,'Open',22,'2025-12-07 08:46:57'),('2025-12-11',0.7,'Wet',0.48,'Open',22,'2025-12-07 08:46:57'),('2025-12-12',4.9,'Wet',0.58,'Open',22,'2025-12-07 08:46:57'),('2025-12-13',15.6,'Wet',0.7,'Open',22,'2025-12-07 08:46:57'),('2025-12-14',9.2,'Wet',0.7,'Open',22,'2025-12-07 08:46:57'),('2025-12-15',8.4,'Wet',0.7,'Open',22,'2025-12-07 08:46:57'),('2025-12-16',5,'Wet',NULL,'Open',22,'2025-12-07 08:46:57'),('2025-12-17',4.1,'Wet',NULL,'Open',22,'2025-12-07 08:46:57'),('2025-12-18',3.8,'Wet',NULL,'Open',22,'2025-12-07 08:46:57'),('2025-12-19',4,'Wet',NULL,'Open',22,'2025-12-07 08:46:57'),('2025-12-20',2.2,'Wet',NULL,'Open',22,'2025-12-07 08:46:57');
/*!40000 ALTER TABLE `weather` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `weekly_periods`
--

DROP TABLE IF EXISTS `weekly_periods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `weekly_periods` (
  `period_id` int NOT NULL AUTO_INCREMENT,
  `period_code` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `target_tonnage` float DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weekly_periods`
--

LOCK TABLES `weekly_periods` WRITE;
/*!40000 ALTER TABLE `weekly_periods` DISABLE KEYS */;
INSERT INTO `weekly_periods` VALUES (1,'WEEK-2025-49','2025-12-01','2025-12-07',150000,'2025-12-06 18:25:40'),(2,'WEEK-2025-50','2025-12-08','2025-12-14',155000,'2025-12-06 18:25:40'),(3,'WEEK-2025-51','2025-12-15','2025-12-21',160000,'2025-12-06 18:25:40'),(5,'WEEK-2025-50','2025-11-30','2025-12-06',131000,'2025-12-06 19:26:45'),(6,'WEEK-2025-W52','2025-12-21','2025-12-27',0,'2025-12-07 06:28:02'),(7,'WEEK-2025-W52','2025-12-27','2026-01-02',0,'2025-12-07 06:32:33'),(8,'WEEK-2026-W01','2026-01-02','2026-01-08',0,'2025-12-07 06:32:46');
/*!40000 ALTER TABLE `weekly_periods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `weekly_plan`
--

DROP TABLE IF EXISTS `weekly_plan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `weekly_plan` (
  `plan_id` char(10) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `production_target_tons` int DEFAULT NULL,
  `stockpile_tons` int DEFAULT NULL,
  `plan_status` varchar(50) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weekly_plan`
--

LOCK TABLES `weekly_plan` WRITE;
/*!40000 ALTER TABLE `weekly_plan` DISABLE KEYS */;
INSERT INTO `weekly_plan` VALUES ('W50-2025','2025-12-08','2025-12-14',257058,0,'DRAFT_OPEN','2025-12-07 08:59:37');
/*!40000 ALTER TABLE `weekly_plan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `weekly_schedule`
--

DROP TABLE IF EXISTS `weekly_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `weekly_schedule` (
  `schedule_id` int NOT NULL AUTO_INCREMENT,
  `period_id` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `employee_id` int DEFAULT NULL,
  `equipment_id` int DEFAULT NULL,
  `shift_id` int DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`schedule_id`),
  KEY `period_id` (`period_id`),
  KEY `employee_id` (`employee_id`),
  KEY `equipment_id` (`equipment_id`),
  KEY `shift_id` (`shift_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `weekly_schedule_ibfk_1` FOREIGN KEY (`period_id`) REFERENCES `weekly_periods` (`period_id`),
  CONSTRAINT `weekly_schedule_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`),
  CONSTRAINT `weekly_schedule_ibfk_3` FOREIGN KEY (`equipment_id`) REFERENCES `heavy_equipment` (`equipment_id`),
  CONSTRAINT `weekly_schedule_ibfk_4` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`shift_id`),
  CONSTRAINT `weekly_schedule_ibfk_5` FOREIGN KEY (`location_id`) REFERENCES `locations` (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=211 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weekly_schedule`
--

LOCK TABLES `weekly_schedule` WRITE;
/*!40000 ALTER TABLE `weekly_schedule` DISABLE KEYS */;
INSERT INTO `weekly_schedule` VALUES (141,1,'2025-12-01',1,7,1,1,'Scheduled work','2025-12-06 18:32:40'),(142,1,'2025-12-01',2,5,1,1,'Scheduled work','2025-12-06 18:32:40'),(143,1,'2025-12-01',3,NULL,1,1,'Foreman supervision','2025-12-06 18:32:40'),(144,1,'2025-12-01',4,NULL,1,4,'Mechanic standby','2025-12-06 18:32:40'),(145,1,'2025-12-01',5,NULL,1,4,'Admin monitoring','2025-12-06 18:32:40'),(146,1,'2025-12-01',6,1,1,8,'Crusher ops','2025-12-06 18:32:40'),(147,1,'2025-12-01',7,3,1,8,'Shiploader ops','2025-12-06 18:32:40'),(148,1,'2025-12-01',8,8,1,1,'Truck ops','2025-12-06 18:32:40'),(149,1,'2025-12-01',9,NULL,1,1,'Planning','2025-12-06 18:32:40'),(150,1,'2025-12-01',10,NULL,1,1,'Safety inspection','2025-12-06 18:32:40'),(151,1,'2025-12-02',1,7,1,1,'Scheduled work','2025-12-06 18:32:40'),(152,1,'2025-12-02',2,5,1,1,'Scheduled work','2025-12-06 18:32:40'),(153,1,'2025-12-02',3,NULL,1,1,'Foreman supervision','2025-12-06 18:32:40'),(154,1,'2025-12-02',4,NULL,1,4,'Mechanic standby','2025-12-06 18:32:40'),(155,1,'2025-12-02',5,NULL,1,4,'Admin monitoring','2025-12-06 18:32:40'),(156,1,'2025-12-02',6,2,1,8,'Crusher ops','2025-12-06 18:32:40'),(157,1,'2025-12-02',7,4,1,8,'Shiploader ops','2025-12-06 18:32:40'),(158,1,'2025-12-02',8,8,1,1,'Truck ops','2025-12-06 18:32:40'),(159,1,'2025-12-02',9,NULL,1,1,'Planning','2025-12-06 18:32:40'),(160,1,'2025-12-02',10,NULL,1,1,'Safety inspection','2025-12-06 18:32:40'),(161,1,'2025-12-03',1,7,1,1,'Scheduled work','2025-12-06 18:32:40'),(162,1,'2025-12-03',2,5,1,1,'Scheduled work','2025-12-06 18:32:40'),(163,1,'2025-12-03',3,NULL,1,1,'Foreman supervision','2025-12-06 18:32:40'),(164,1,'2025-12-03',4,NULL,1,4,'Mechanic standby','2025-12-06 18:32:40'),(165,1,'2025-12-03',5,NULL,1,4,'Admin monitoring','2025-12-06 18:32:40'),(166,1,'2025-12-03',6,1,1,8,'Crusher ops','2025-12-06 18:32:40'),(167,1,'2025-12-03',7,3,1,8,'Shiploader ops','2025-12-06 18:32:40'),(168,1,'2025-12-03',8,8,1,1,'Truck ops','2025-12-06 18:32:40'),(169,1,'2025-12-03',9,NULL,1,1,'Planning','2025-12-06 18:32:40'),(170,1,'2025-12-03',10,NULL,1,1,'Safety inspection','2025-12-06 18:32:40'),(171,1,'2025-12-04',1,7,1,1,'Scheduled work','2025-12-06 18:32:40'),(172,1,'2025-12-04',2,5,1,1,'Scheduled work','2025-12-06 18:32:40'),(173,1,'2025-12-04',3,NULL,1,1,'Foreman supervision','2025-12-06 18:32:40'),(174,1,'2025-12-04',4,NULL,1,4,'Mechanic standby','2025-12-06 18:32:40'),(175,1,'2025-12-04',5,NULL,1,4,'Admin monitoring','2025-12-06 18:32:40'),(176,1,'2025-12-04',6,2,1,8,'Crusher ops','2025-12-06 18:32:40'),(177,1,'2025-12-04',7,4,1,8,'Shiploader ops','2025-12-06 18:32:40'),(178,1,'2025-12-04',8,8,1,1,'Truck ops','2025-12-06 18:32:40'),(179,1,'2025-12-04',9,NULL,1,1,'Planning','2025-12-06 18:32:40'),(180,1,'2025-12-04',10,NULL,1,1,'Safety inspection','2025-12-06 18:32:40'),(181,1,'2025-12-05',1,7,1,1,'Scheduled work','2025-12-06 18:32:40'),(182,1,'2025-12-05',2,5,1,1,'Scheduled work','2025-12-06 18:32:40'),(183,1,'2025-12-05',3,NULL,1,1,'Foreman supervision','2025-12-06 18:32:40'),(184,1,'2025-12-05',4,NULL,1,4,'Mechanic standby','2025-12-06 18:32:40'),(185,1,'2025-12-05',5,NULL,1,4,'Admin monitoring','2025-12-06 18:32:40'),(186,1,'2025-12-05',6,1,1,8,'Crusher ops','2025-12-06 18:32:40'),(187,1,'2025-12-05',7,3,1,8,'Shiploader ops','2025-12-06 18:32:40'),(188,1,'2025-12-05',8,8,1,1,'Truck ops','2025-12-06 18:32:40'),(189,1,'2025-12-05',9,NULL,1,1,'Planning','2025-12-06 18:32:40'),(190,1,'2025-12-05',10,NULL,1,1,'Safety inspection','2025-12-06 18:32:40'),(191,1,'2025-12-06',1,7,1,1,'Scheduled work','2025-12-06 18:32:40'),(192,1,'2025-12-06',2,5,1,1,'Scheduled work','2025-12-06 18:32:40'),(193,1,'2025-12-06',3,NULL,1,1,'Foreman supervision','2025-12-06 18:32:40'),(194,1,'2025-12-06',4,NULL,1,4,'Mechanic standby','2025-12-06 18:32:40'),(195,1,'2025-12-06',5,NULL,1,4,'Admin monitoring','2025-12-06 18:32:40'),(196,1,'2025-12-06',6,2,1,8,'Crusher ops','2025-12-06 18:32:40'),(197,1,'2025-12-06',7,4,1,8,'Shiploader ops','2025-12-06 18:32:40'),(198,1,'2025-12-06',8,8,1,1,'Truck ops','2025-12-06 18:32:40'),(199,1,'2025-12-06',9,NULL,1,1,'Planning','2025-12-06 18:32:40'),(200,1,'2025-12-06',10,NULL,1,1,'Safety inspection','2025-12-06 18:32:40'),(201,1,'2025-12-07',1,7,1,1,'Scheduled work','2025-12-06 18:32:40'),(202,1,'2025-12-07',2,5,1,1,'Scheduled work','2025-12-06 18:32:40'),(203,1,'2025-12-07',3,NULL,1,1,'Foreman supervision','2025-12-06 18:32:40'),(204,1,'2025-12-07',4,NULL,1,4,'Mechanic standby','2025-12-06 18:32:40'),(205,1,'2025-12-07',5,NULL,1,4,'Admin monitoring','2025-12-06 18:32:40'),(206,1,'2025-12-07',6,1,1,8,'Crusher ops','2025-12-06 18:32:40'),(207,1,'2025-12-07',7,3,1,8,'Shiploader ops','2025-12-06 18:32:40'),(208,1,'2025-12-07',8,8,1,1,'Truck ops','2025-12-06 18:32:40'),(209,1,'2025-12-07',9,NULL,1,1,'Planning','2025-12-06 18:32:40'),(210,1,'2025-12-07',10,NULL,1,1,'Safety inspection','2025-12-06 18:32:40');
/*!40000 ALTER TABLE `weekly_schedule` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

=======
-- =======================================================
-- BAGIAN 1: TABEL MASTER INDEPENDEN (Tanpa Foreign Key)
-- =======================================================

-- 1. Table: tb_roles (User Management)
DROP TABLE IF EXISTS `tb_roles`;
CREATE TABLE `tb_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Table: employees (Master Karyawan)
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `employee_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `position` varchar(50) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `competency` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Table: heavy_equipment (Master Alat Berat Core)
DROP TABLE IF EXISTS `heavy_equipment`;
CREATE TABLE `heavy_equipment` (
  `equipment_id` int NOT NULL AUTO_INCREMENT,
  `unit_code` varchar(50) DEFAULT NULL,
  `equipment_type` enum('Crusher','Shiploader','Shovel','Haul Truck') DEFAULT NULL,
  `capacity` float DEFAULT NULL,
  `default_status` enum('ready','standby','maintenance') DEFAULT 'ready',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`equipment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. Table: tb_equipment (Master Alat Berat App Baru)
DROP TABLE IF EXISTS `tb_equipment`;
CREATE TABLE `tb_equipment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `unit_id` varchar(20) NOT NULL,
  `type` varchar(50) NOT NULL,
  `location` varchar(100) DEFAULT 'Workshop',
  `status` enum('Available','Breakdown','Maintenance','Standby') DEFAULT 'Available',
  `is_available` tinyint(1) DEFAULT '1',
  `productivity_rate` decimal(6,2) DEFAULT '0.00',
  `last_update` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unit_id` (`unit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. Table: weekly_periods (Periode Mingguan)
DROP TABLE IF EXISTS `weekly_periods`;
CREATE TABLE `weekly_periods` (
  `period_id` int NOT NULL AUTO_INCREMENT,
  `period_code` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `target_tonnage` float DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. Table: weekly_plan (Rencana Mingguan - Standalone)
DROP TABLE IF EXISTS `weekly_plan`;
CREATE TABLE `weekly_plan` (
  `plan_id` char(10) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `production_target_tons` int DEFAULT NULL,
  `stockpile_tons` int DEFAULT NULL,
  `plan_status` varchar(50) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 7. Table: locations (Lokasi Tambang)
DROP TABLE IF EXISTS `locations`;
CREATE TABLE `locations` (
  `location_id` int NOT NULL AUTO_INCREMENT,
  `location_name` varchar(100) DEFAULT NULL,
  `location_type` enum('pit','disposal','hauling','workshop','stockpile') DEFAULT NULL,
  PRIMARY KEY (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 8. Table: shifts (Jadwal Shift)
DROP TABLE IF EXISTS `shifts`;
CREATE TABLE `shifts` (
  `shift_id` int NOT NULL AUTO_INCREMENT,
  `shift_name` varchar(50) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  PRIMARY KEY (`shift_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 9. Table: weather (Data Cuaca)
DROP TABLE IF EXISTS `weather`;
CREATE TABLE `weather` (
  `date` date NOT NULL,
  `rainfall_mm` float DEFAULT '0',
  `road_condition` enum('Flooded','Very Slippery','Slippery','Wet','Dry') DEFAULT NULL,
  `max_wave_m` float DEFAULT '0',
  `port_status` enum('Closed','Restricted','Open') DEFAULT NULL,
  `effective_working_hours` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`date`),
  UNIQUE KEY `date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 10. Table: shipping_schedule (Jadwal Kapal)
DROP TABLE IF EXISTS `shipping_schedule`;
CREATE TABLE `shipping_schedule` (
  `vessel_id` char(20) NOT NULL,
  `vessel_name` varchar(100) DEFAULT NULL,
  `eta_date` date DEFAULT NULL,
  `latest_berthing` date DEFAULT NULL,
  `target_load_tons` int DEFAULT NULL,
  `shipping_notes` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`vessel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 11. Table: fleet_master (Master Armada)
DROP TABLE IF EXISTS `fleet_master`;
CREATE TABLE `fleet_master` (
  `asset_id` char(20) NOT NULL,
  `equipment_type` char(50) DEFAULT NULL,
  `model` char(50) DEFAULT NULL,
  `capacity` smallint DEFAULT NULL,
  `capacity_unit` char(20) DEFAULT NULL,
  `current_status` char(50) DEFAULT NULL,
  `location` char(50) DEFAULT NULL,
  `planner_notes` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`asset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 12. Table: tb_blending_plan (Rencana Blending)
DROP TABLE IF EXISTS `tb_blending_plan`;
CREATE TABLE `tb_blending_plan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_week` int NOT NULL,
  `plan_year` int NOT NULL,
  `target_tonnage_weekly` int NOT NULL,
  `target_calori` decimal(6,2) DEFAULT '4800.00',
  `target_ash_max` decimal(4,2) DEFAULT '12.00',
  `initial_ash_draft` decimal(4,2) DEFAULT '12.50',
  `final_ash_result` decimal(4,2) DEFAULT NULL,
  `is_approved_mine` tinyint(1) DEFAULT '0',
  `is_approved_shipping` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 13. Table: plan_optimization_log (Log Optimasi)
DROP TABLE IF EXISTS `plan_optimization_log`;
CREATE TABLE `plan_optimization_log` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `plan_id` varchar(50) NOT NULL,
  `version` int DEFAULT '1',
  `summary_json` json DEFAULT NULL,
  `scenarios_json` json DEFAULT NULL,
  `selected_scenario_id` json DEFAULT NULL,
  `rejection_note` text,
  `current_step` enum('DRAFTING_MINE','DRAFTING_SHIP','SCENARIO_SELECTION','FINAL_APPROVAL','COMPLETED','REJECTED') DEFAULT 'DRAFTING_MINE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =======================================================
-- BAGIAN 2: TABEL DEPENDENSI (Memiliki Foreign Keys)
-- =======================================================

-- 14. Table: tb_users (Depends on tb_roles)
DROP TABLE IF EXISTS `tb_users`;
CREATE TABLE `tb_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `pass` varchar(255) NOT NULL,
  `role_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `role_fk` (`role_id`),
  CONSTRAINT `fk_role` FOREIGN KEY (`role_id`) REFERENCES `tb_roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 15. Table: tb_karyawan (Depends on tb_equipment)
DROP TABLE IF EXISTS `tb_karyawan`;
CREATE TABLE `tb_karyawan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `user_id` int DEFAULT NULL,
  `competency` varchar(150) NOT NULL,
  `current_unit_id` int DEFAULT NULL,
  `current_shift` varchar(20) DEFAULT 'Day 1',
  `presence` enum('Hadir','Absen','Sakit','Cuti') DEFAULT 'Hadir',
  PRIMARY KEY (`id`),
  KEY `unit_fk` (`current_unit_id`),
  CONSTRAINT `tb_karyawan_ibfk_1` FOREIGN KEY (`current_unit_id`) REFERENCES `tb_equipment` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 16. Table: weekly_schedule (Multi-dependency: periods, employees, equipment, shifts, locations)
DROP TABLE IF EXISTS `weekly_schedule`;
CREATE TABLE `weekly_schedule` (
  `schedule_id` int NOT NULL AUTO_INCREMENT,
  `period_id` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `employee_id` int DEFAULT NULL,
  `equipment_id` int DEFAULT NULL,
  `shift_id` int DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`schedule_id`),
  KEY `period_id` (`period_id`),
  KEY `employee_id` (`employee_id`),
  KEY `equipment_id` (`equipment_id`),
  KEY `shift_id` (`shift_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `weekly_schedule_ibfk_1` FOREIGN KEY (`period_id`) REFERENCES `weekly_periods` (`period_id`),
  CONSTRAINT `weekly_schedule_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`),
  CONSTRAINT `weekly_schedule_ibfk_3` FOREIGN KEY (`equipment_id`) REFERENCES `heavy_equipment` (`equipment_id`),
  CONSTRAINT `weekly_schedule_ibfk_4` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`shift_id`),
  CONSTRAINT `weekly_schedule_ibfk_5` FOREIGN KEY (`location_id`) REFERENCES `locations` (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=211 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 17. Table: daily_attendance (Depends on employees)
DROP TABLE IF EXISTS `daily_attendance`;
CREATE TABLE `daily_attendance` (
  `attendance_id` int NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `employee_id` int DEFAULT NULL,
  `attendance_status` enum('present','sick','permission','absent','leave') DEFAULT 'present',
  `remarks` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attendance_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `daily_attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 18. Table: daily_equipment_status (Depends on heavy_equipment)
DROP TABLE IF EXISTS `daily_equipment_status`;
CREATE TABLE `daily_equipment_status` (
  `status_id` int NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `equipment_id` int DEFAULT NULL,
  `equipment_status` enum('ready','breakdown','maintenance','standby') DEFAULT 'ready',
  `remarks` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`status_id`),
  KEY `equipment_id` (`equipment_id`),
  CONSTRAINT `daily_equipment_status_ibfk_1` FOREIGN KEY (`equipment_id`) REFERENCES `heavy_equipment` (`equipment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 19. Table: daily_reports (Depends on weekly_periods)
DROP TABLE IF EXISTS `daily_reports`;
CREATE TABLE `daily_reports` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `period_id` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `daily_tonnage` float DEFAULT NULL,
  `total_employees_present` int DEFAULT NULL,
  `total_equipment_ready` int DEFAULT NULL,
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_id`),
  KEY `period_id` (`period_id`),
  CONSTRAINT `daily_reports_ibfk_1` FOREIGN KEY (`period_id`) REFERENCES `weekly_periods` (`period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 20. Table: daily_report_details (Depends on daily_reports, heavy_equipment, employees)
DROP TABLE IF EXISTS `daily_report_details`;
CREATE TABLE `daily_report_details` (
  `detail_id` int NOT NULL AUTO_INCREMENT,
  `report_id` int DEFAULT NULL,
  `equipment_id` int DEFAULT NULL,
  `employee_id` int DEFAULT NULL,
  `tonnage` float DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  PRIMARY KEY (`detail_id`),
  KEY `report_id` (`report_id`),
  KEY `equipment_id` (`equipment_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `daily_report_details_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `daily_reports` (`report_id`),
  CONSTRAINT `daily_report_details_ibfk_2` FOREIGN KEY (`equipment_id`) REFERENCES `heavy_equipment` (`equipment_id`),
  CONSTRAINT `daily_report_details_ibfk_3` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
>>>>>>> 9f98f19af362063e3803dee35572af4760ae119f
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

<<<<<<< HEAD
-- Dump completed on 2025-12-07 17:25:22
=======
-- Dump completed
>>>>>>> 9f98f19af362063e3803dee35572af4760ae119f
