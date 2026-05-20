-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: smart_budget
-- ------------------------------------------------------
-- Server version	9.2.0

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

CREATE DATABASE IF NOT EXISTS smart_budget;
USE smart_budget;

--
-- Table structure for table budget_categories
--

DROP TABLE IF EXISTS budget_categories;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE budget_categories (
  id int NOT NULL AUTO_INCREMENT,
  user_id int NOT NULL,
  month int NOT NULL,
  year int NOT NULL,
  category_name varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  allocated_amount decimal(12,2) NOT NULL DEFAULT '0.00',
  spent_amount decimal(12,2) NOT NULL DEFAULT '0.00',
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_user_month_year_cat (user_id,month,year,category_name),
  KEY idx_user (user_id),
  CONSTRAINT budget_categories_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table expenses
--

DROP TABLE IF EXISTS expenses;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE expenses (
  id int NOT NULL AUTO_INCREMENT,
  user_id int NOT NULL,
  description varchar(255) NOT NULL,
  amount decimal(12,2) NOT NULL,
  category varchar(100) DEFAULT 'Other',
  date date NOT NULL,
  transaction_type varchar(50) DEFAULT NULL,
  raw_sms longtext,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id,date),
  KEY user_id_2 (user_id,created_at),
  CONSTRAINT expenses_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=361 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table notifications
--

DROP TABLE IF EXISTS notifications;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE notifications (
  id int NOT NULL AUTO_INCREMENT,
  user_id int NOT NULL,
  type enum('sms','expense','income','budget','savings','system','withdrawal','review','warning') COLLATE utf8mb4_unicode_ci NOT NULL,
  title varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  message text COLLATE utf8mb4_unicode_ci NOT NULL,
  action_url varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  reference_id int DEFAULT NULL,
  reference_type varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  is_read tinyint(1) DEFAULT '0',
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user (user_id),
  KEY idx_is_read (is_read),
  KEY idx_created (created_at),
  CONSTRAINT notifications_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table savings_goals
--

DROP TABLE IF EXISTS savings_goals;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE savings_goals (
  id int NOT NULL AUTO_INCREMENT,
  user_id int NOT NULL,
  month int NOT NULL,
  year int NOT NULL,
  goal_name varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  target_amount decimal(12,2) DEFAULT NULL,
  current_amount decimal(12,2) DEFAULT '0.00',
  deadline date DEFAULT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_user_month_year_goal (user_id,month,year,goal_name),
  KEY idx_user_month_year (user_id,month,year),
  CONSTRAINT savings_goals_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table sms_raw_ingest
--

DROP TABLE IF EXISTS sms_raw_ingest;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE sms_raw_ingest (
  id int NOT NULL AUTO_INCREMENT,
  user_id int NOT NULL,
  sms_from varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  sms_text longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  sent_stamp bigint DEFAULT NULL,
  received_stamp bigint NOT NULL,
  sim_slot varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  sms_hash varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  is_duplicate tinyint(1) DEFAULT '0',
  notification_sent tinyint(1) DEFAULT '0',
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY sms_hash (sms_hash),
  KEY idx_user (user_id),
  KEY idx_hash (sms_hash),
  KEY idx_received (received_stamp),
  CONSTRAINT sms_raw_ingest_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table transactions
--

DROP TABLE IF EXISTS transactions;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE transactions (
  id int NOT NULL AUTO_INCREMENT,
  user_id int NOT NULL,
  sms_raw_id int DEFAULT NULL,
  log_date varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  log_time varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  sender varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  sim varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  trans_date varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  trans_time varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  transaction_type varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  total_amount decimal(12,2) DEFAULT NULL,
  recipient_source varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  reference varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  is_categorized tinyint(1) DEFAULT '0',
  categorized_at timestamp NULL DEFAULT NULL,
  cash_usage_category varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  cash_usage_description longtext COLLATE utf8mb4_unicode_ci,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY sms_raw_id (sms_raw_id),
  KEY idx_user (user_id),
  KEY idx_user_date (user_id,trans_date),
  KEY idx_is_categorized (is_categorized),
  KEY idx_created (created_at),
  CONSTRAINT transactions_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT transactions_ibfk_2 FOREIGN KEY (sms_raw_id) REFERENCES sms_raw_ingest (id) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table user_budgets
--

DROP TABLE IF EXISTS user_budgets;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE user_budgets (
  id int NOT NULL AUTO_INCREMENT,
  user_id int NOT NULL,
  monthly_budget decimal(12,2) NOT NULL DEFAULT '0.00',
  total_spent decimal(12,2) NOT NULL DEFAULT '0.00',
  total_saved decimal(12,2) NOT NULL DEFAULT '0.00',
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  month int NOT NULL DEFAULT '1',
  year int NOT NULL DEFAULT '2024',
  PRIMARY KEY (id),
  UNIQUE KEY unique_user_month_year (user_id,month,year),
  KEY user_id_2 (user_id),
  KEY updated_at (updated_at),
  KEY idx_user_month_year (user_id,month,year),
  CONSTRAINT user_budgets_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table users
--

DROP TABLE IF EXISTS users;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE users (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  phone_number varchar(20) DEFAULT NULL,
  ingest_secret varchar(255) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY email (email),
  UNIQUE KEY phone_number (phone_number),
  UNIQUE KEY ingest_secret (ingest_secret),
  KEY email_2 (email)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-02 14:14:54
