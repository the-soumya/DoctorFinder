-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: patient_portal
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `patient_portal`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `patient_portal` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `patient_portal`;

--
-- Table structure for table `ai_interaction_logs`
--

DROP TABLE IF EXISTS `ai_interaction_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_interaction_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `disclaimer_shown` bit(1) DEFAULT NULL,
  `feature` varchar(50) NOT NULL,
  `prompt` text NOT NULL,
  `response` text NOT NULL,
  `timestamp` datetime(6) NOT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ai_user` (`user_id`),
  KEY `idx_ai_feature` (`feature`),
  KEY `idx_ai_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_interaction_logs`
--

LOCK TABLES `ai_interaction_logs` WRITE;
/*!40000 ALTER TABLE `ai_interaction_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_interaction_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `allergies_medication_history`
--

DROP TABLE IF EXISTS `allergies_medication_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `allergies_medication_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `allergy_name` varchar(255) DEFAULT NULL,
  `medication_name` varchar(255) DEFAULT NULL,
  `notes` text,
  `severity` varchar(30) DEFAULT NULL,
  `patient_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_allergy_patient` (`patient_id`),
  CONSTRAINT `FK4e3fkoqafni7ftxjfukfw0jtu` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `allergies_medication_history`
--

LOCK TABLES `allergies_medication_history` WRITE;
/*!40000 ALTER TABLE `allergies_medication_history` DISABLE KEYS */;
INSERT INTO `allergies_medication_history` VALUES (1,'Penicillin','None','Documented history of hives, bronchospasm, and anaphylaxis to beta-lactam antibiotics','SEVERE',7),(2,'None','Warfarin','Takes 5mg Warfarin daily for atrial fibrillation. Severe bleeding risk with NSAIDs / Aspirin.','HIGH',7);
/*!40000 ALTER TABLE `allergies_medication_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cancellation_reason` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `patient_arrival_marked` bit(1) DEFAULT NULL,
  `refund_status` varchar(255) DEFAULT NULL,
  `slot_datetime` datetime(6) NOT NULL,
  `slot_hold_expiry` datetime(6) DEFAULT NULL,
  `status` enum('CANCELLED','COMPLETED','CONFIRMED','PENDING') NOT NULL,
  `version` bigint NOT NULL,
  `doctor_id` bigint NOT NULL,
  `patient_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_appointment_patient` (`patient_id`),
  KEY `idx_appointment_doctor` (`doctor_id`),
  KEY `idx_appointment_slot` (`slot_datetime`),
  KEY `idx_appointment_status` (`status`),
  CONSTRAINT `FKmujeo4tymoo98cmf7uj3vsv76` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`),
  CONSTRAINT `FKopb2h9yhin1rb4dqote8bws6w` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (1,NULL,'2026-09-30 20:24:23.718672',_binary '\0',NULL,'2026-10-03 04:30:23.718672',NULL,'CONFIRMED',0,1,7);
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(100) NOT NULL,
  `details` text,
  `record_id` bigint DEFAULT NULL,
  `table_affected` varchar(100) DEFAULT NULL,
  `timestamp` datetime(6) NOT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_action` (`action`),
  KEY `idx_audit_timestamp` (`timestamp`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,'AUTH_LOGIN','User logged in: patient@health.com',7,'users','2026-09-30 20:24:55.335107',7);
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` text,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKj6cwks7xecs5jov19ro8ge3qk` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'Cardiovascular health, coronary care, and heart failure management','Cardiology'),(2,'Skin disorders, cosmetic procedures, eczema, and allergy therapeutics','Dermatology'),(3,'Disorders of the brain, spinal cord, and peripheral nervous system','Neurology'),(4,'Bones, joints, ligaments, sports injuries, and spine wellness','Orthopedics'),(5,'Primary care, seasonal infections, lifestyle disorders, and wellness','General Medicine'),(6,'Respiratory tract, lung health, asthma, and chronic cough management','Pulmonology');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctors` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bio` text,
  `city` varchar(80) DEFAULT NULL,
  `clinic_address` varchar(250) DEFAULT NULL,
  `consultation_fee` decimal(10,2) NOT NULL,
  `degree` varchar(150) DEFAULT NULL,
  `district` varchar(80) DEFAULT NULL,
  `experience_years` int DEFAULT NULL,
  `latitude` double NOT NULL,
  `locality` varchar(120) DEFAULT NULL,
  `longitude` double NOT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `rating` double DEFAULT NULL,
  `specialization` varchar(120) NOT NULL,
  `state` varchar(80) DEFAULT NULL,
  `department_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKt1f6cueqyjwx5ghew9ar1exe3` (`user_id`),
  KEY `idx_doctor_user` (`user_id`),
  KEY `idx_doctor_department` (`department_id`),
  KEY `idx_doctor_specialization` (`specialization`),
  KEY `idx_doctor_location` (`state`,`district`,`city`),
  CONSTRAINT `FKe9pf5qtxxkdyrwibaevo9frtk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKl2mro81neln9topymd898urh1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors`
--

LOCK TABLES `doctors` WRITE;
/*!40000 ALTER TABLE `doctors` DISABLE KEYS */;
INSERT INTO `doctors` VALUES (1,'Newly registered orthopedic surgeon awaiting hospital board verification.','Uttarpara','Kotrung Hospital Road, Uttarpara',600.00,'MBBS, MS (Orthopedics)','Hooghly',9,22.681,'Kotrung',88.347,'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',4.8,'Orthopedic & Joint Surgeon','West Bengal',4,5),(2,'Specialist in coronary angioplasty, heart failure, and complex cardiac arrhythmias with over 14 years clinical experience.','Uttarpara','Near Makhla High School & Market, Uttarpara',750.00,'MBBS, MD (Medicine), DM (Cardiology, AIIMS)','Hooghly',14,22.673,'Makhla',88.334,'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',4.9,'Senior Interventional Cardiologist','West Bengal',1,9),(3,'Comprehensive internal medicine consultant focusing on hypertension, thyroid, uncontrolled diabetes, and fever diagnostics.','Uttarpara','GT Road near Jaykrishna Public Library, Uttarpara',450.00,'MBBS, MD (General Medicine)','Hooghly',14,22.671,'Uttarpara GT Road',88.352,'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=400',4.8,'Consultant Physician & Metabolic Health Specialist','West Bengal',5,10),(4,'Orthopedic surgeon specializing in slip disc, cervical spondylosis, joint replacement, ligament tears, and fracture care.','Uttarpara','Uttarpara Station Road West, Near Railway Overbridge',650.00,'MBBS, MS (Orthopedics), MCh','Hooghly',11,22.676,'Uttarpara Railway Station',88.341,'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=400',4.8,'Consultant Spine & Joint Replacement Surgeon','West Bengal',4,11),(5,'Consultant dermatologist with extensive experience in acne therapies, fungal dermatosis, allergy diagnostics, and hair loss control.','Uttarpara','Kotrung Ferry Ghat Road, Uttarpara',500.00,'MBBS, DVD, DNB (Dermatology)','Hooghly',10,22.682,'Kotrung Riverfront',88.349,'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400',4.9,'Senior Dermatologist & Aesthetic Specialist','West Bengal',2,12),(6,'Expert chest physician specialized in seasonal allergy management, bronchial asthma, COPD, and respiratory infections.','Uttarpara','Near Bhadrakali Government Colony & Girls School, Uttarpara',600.00,'MBBS, MD (Chest Diseases), DTCD','Hooghly',12,22.668,'Bhadrakali',88.346,'https://images.unsplash.com/photo-1637059824899-a441006a6875?auto=format&fit=crop&q=80&w=400',4.7,'Consultant Chest Physician & Allergist','West Bengal',6,13),(7,'Consultant neurologist treating nerve disorders, chronic headache, sleep disturbances, peripheral neuropathy, and cognitive care.','Uttarpara','Makhla 2 No. Government Colony, Uttarpara',800.00,'MBBS, MD, DM (Neurology)','Hooghly',13,22.678,'Makhla Uttar',88.331,'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=400',4.9,'Consultant Neurologist & Cognitive Specialist','West Bengal',3,14),(8,'Senior family physician and diabetes specialist practicing near Konnagar Station Road. Expert in chronic disease and seasonal infections.','Konnagar','Konnagar Station Road East, Near Bus Stand',400.00,'MBBS, MD (Medicine, Calcutta Medical College)','Hooghly',16,22.702,'Station Road / Masterpara',88.348,'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',4.9,'Senior Family Physician & Diabetologist','West Bengal',5,15),(9,'Consultant cardiologist focusing on coronary artery disease, heart palpitations, ECG assessment, and hypertension management.','Konnagar','GT Road near Rajrajeshwari Mandir, Konnagar',700.00,'MBBS, MD, DM (Cardiology, IPGMER SSKM)','Hooghly',12,22.699,'Konnagar GT Road',88.356,'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',4.9,'Consultant Cardiologist & Heart Failure Specialist','West Bengal',1,16),(10,'Specialist in eczema, skin allergy patch tests, psoriasis, acne scar therapeutics, and pediatric dermatology.','Konnagar','Nabagram Hiralal Paul College Road, Konnagar',500.00,'MBBS, MD (Dermatology, R.G. Kar)','Hooghly',10,22.705,'Nabagram',88.338,'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',4.8,'Consultant Dermatologist & Dermatosurgeon','West Bengal',2,17),(11,'Expert in osteoarthritis, knee arthroscopy, spinal spondylosis, slip disc therapy, and sports trauma rehabilitation.','Konnagar','Near Criper Road Health Centre, Konnagar',600.00,'MBBS, MS (Orthopedics), DNB','Hooghly',13,22.696,'Criper Road',88.351,'https://images.unsplash.com/photo-1594824813501-5264b304c45b?auto=format&fit=crop&q=80&w=400',4.9,'Senior Orthopedic & Joint Replacement Surgeon','West Bengal',4,18),(12,'Consultant chest physician treating bronchial asthma, COPD, bronchitis, allergic rhinitis, and post-viral chronic cough.','Konnagar','Near Ganga Ghat, East Konnagar',550.00,'MBBS, MD (Pulmonary Medicine), FCCP','Hooghly',11,22.701,'Baro Mandir Ghat',88.358,'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=400',4.7,'Consultant Pulmonologist & Chest Physician','West Bengal',6,19),(13,'Specializes in recurrent migraine, vertigo, epilepsy management, neuropathy, Parkinson\'s disease, and stroke prevention.','Konnagar','Indira Nagar More, Konnagar',750.00,'MBBS, MD, DM (Neurology, Bangur Institute)','Hooghly',14,22.703,'Indira Nagar',88.343,'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=400',4.9,'Consultant Neurologist & Stroke Specialist','West Bengal',3,20),(14,'Interventional cardiologist expert in angiograms, stents, and cardiac emergencies in Shibpur area.','Howrah','Near Mandirtala Bus Terminus, Shibpur, Howrah',750.00,'MBBS, MD, DM (Cardiology)','Howrah',15,22.571,'Shibpur Mandirtala',88.324,'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',4.9,'Senior Cardiologist & Interventional Fellow','West Bengal',1,21),(15,'Expert internal medicine specialist near Howrah station handling infectious illnesses and hypertension.','Howrah','Opposite Howrah Railway Station, Golabari, Howrah',450.00,'MBBS, MD (Internal Medicine)','Howrah',14,22.589,'Howrah Station Road',88.341,'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',4.8,'Senior Consultant Physician','West Bengal',5,22),(16,'Specialist in joint replacement, fractures, and spine rehabilitation in Kadamtala.','Howrah','Near Bantra Police Station, Kadamtala, Howrah',600.00,'MBBS, MS (Orthopedics)','Howrah',12,22.582,'Kadamtala',88.328,'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',4.8,'Senior Orthopedic Surgeon','West Bengal',4,23),(17,'Dermatologist focused on acne, allergy patch testing, and laser therapies along Salkia GT Road.','Howrah','GT Road North, Salkia Chaurasta, Howrah',500.00,'MBBS, MD (DVL)','Howrah',9,22.605,'Salkia GT Road',88.349,'https://images.unsplash.com/photo-1594824813501-5264b304c45b?auto=format&fit=crop&q=80&w=400',4.8,'Consultant Dermatologist','West Bengal',2,24),(18,'Chest physician treating asthma, COPD, and respiratory allergies near Ramrajatala.','Howrah','Near Ramrajatala Railway Station, Howrah',550.00,'MBBS, MD (Chest)','Howrah',11,22.578,'Ramrajatala',88.312,'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',4.7,'Consultant Pulmonologist','West Bengal',6,25),(19,'Consultant neurologist treating nerve problems, migraine, and neuropathy in Botanical Garden & B.Garden area.','Howrah','Andul Road near Botanical Garden Gate, Howrah',750.00,'MBBS, MD, DM (Neurology)','Howrah',14,22.564,'Botanical Garden / B.Garden',88.318,'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',4.9,'Consultant Neurologist','West Bengal',3,26),(20,'Primary care physician managing chronic ailments and seasonal fever near Bally Bazar.','Bally','Near Bally Bazar Tram Depot / Market, Bally',400.00,'MBBS, DNB (Medicine)','Howrah',13,22.652,'Bally Bazar',88.344,'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=400',4.8,'Family Physician & Diabetologist','West Bengal',5,27),(21,'Cardiologist focused on non-invasive heart evaluation and blood pressure control near Belur Math.','Bally','GT Road near Belur Math Gate, Belur',700.00,'MBBS, MD, DM (Cardiology)','Howrah',12,22.631,'Belur Math GT Road',88.353,'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=400',4.9,'Consultant Cardiologist','West Bengal',1,28),(22,'Expert in knee pain, fracture setting, and arthritis management at Bally Halt.','Bally','Station Road near Bally Halt Platform, Bally',600.00,'MBBS, MS (Ortho)','Howrah',10,22.654,'Bally Halt',88.337,'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=400',4.7,'Orthopedic Specialist','West Bengal',4,29),(23,'Skin, hair, and nail specialist offering comprehensive clinical care in Goswami Para.','Bally','Near Goswami Para Park, Bally',500.00,'MBBS, MD (Dermatology)','Howrah',8,22.648,'Goswami Para',88.341,'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400',4.8,'Clinical Dermatologist','West Bengal',2,30),(24,'Neurologist treating epilepsy, migraine, stroke, and nerve pains near Liluah Don Bosco.','Bally','Near Don Bosco Gate, Liluah-Bally Road',750.00,'MBBS, MD, DM (Neuro)','Howrah',15,22.625,'Liluah / Bally South',88.342,'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',4.9,'Consultant Neurologist','West Bengal',3,31),(25,'Chest physician treating asthma, respiratory allergy, and chronic cough near Bally Khal.','Bally','GT Road near Bally Khal Bridge, Bally',550.00,'MBBS, MD (Pulmonology)','Howrah',12,22.658,'Bally Khal / Dewan Gazi',88.351,'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',4.8,'Consultant Chest Physician','West Bengal',6,32),(26,'Senior physician treating metabolic conditions, diabetes, and fevers near Rishra Station.','Rishra','Near Rishra Railway Station Platform 1, Rishra',400.00,'MBBS, MD (Medicine)','Hooghly',14,22.711,'Rishra Station Road',88.348,'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',4.7,'Consultant Physician','West Bengal',5,33),(27,'Cardiovascular specialist focused on ECG, lipid management, and preventive heart care on Rishra GT Road.','Rishra','GT Road near Jayashree Textiles, Rishra',700.00,'MBBS, MD, DM (Cardiology)','Hooghly',11,22.714,'GT Road Rishra',88.356,'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',4.9,'Cardiologist & Vascular Consultant','West Bengal',1,34),(28,'Expert in spine disorders, knee arthroscopy, and accidental trauma repair in Morepukur.','Rishra','Morepukur Bangur Park, Rishra',600.00,'MBBS, MS (Orthopedics)','Hooghly',12,22.717,'Morepukur',88.339,'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=400',4.8,'Orthopedic & Trauma Surgeon','West Bengal',4,35),(29,'Specialist in eczema, skin allergy patch tests, and acne therapy near Sandhya Bazar.','Rishra','Sandhya Bazar Market Complex, Rishra',500.00,'MBBS, DVD, DNB','Hooghly',9,22.708,'Sandhya Bazar',88.352,'https://images.unsplash.com/photo-1594824813501-5264b304c45b?auto=format&fit=crop&q=80&w=400',4.8,'Consultant Dermatologist','West Bengal',2,36),(30,'Chest specialist treating asthma, persistent cough, and allergy near Hastings Mill colony.','Rishra','Near Hastings Jute Mill Colony, Rishra',550.00,'MBBS, MD (Pulmonary Medicine)','Hooghly',13,22.715,'Hastings Ground',88.361,'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',4.7,'Chest Physician','West Bengal',6,37),(31,'Neurology specialist handling stroke rehabilitation, tremor, and headache near Bangur Park.','Rishra','Bangur Park Residential Enclave, Rishra',750.00,'MBBS, MD, DM (Neurology)','Hooghly',15,22.719,'Bangur Park',88.344,'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=400',4.9,'Consultant Neurologist','West Bengal',3,38),(32,'Eminent cardiologist at Serampore Battala, expert in coronary care and pacemaker implantation.','Serampore','Near Serampore Railway Station Platform 2, Battala',750.00,'MBBS, MD, DM (Cardiology)','Hooghly',16,22.752,'Battala / Station Road',88.337,'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',4.9,'Senior Cardiologist','West Bengal',1,39),(33,'Comprehensive medicine consultant near Walsh Hospital court compound area.','Serampore','Court Compound near Walsh Sub-divisional Hospital, Serampore',450.00,'MBBS, MD (Medicine)','Hooghly',15,22.755,'Walsh Hospital Road',88.345,'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=400',4.8,'Senior Consultant Physician','West Bengal',5,40),(34,'Orthopedic surgeon specializing in joint replacement, sports injury, and spondylitis near Tinbazar.','Serampore','GT Road near Tinbazar Crossing, Serampore',650.00,'MBBS, MS (Orthopedics)','Hooghly',12,22.748,'Tinbazar GT Road',88.347,'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=400',4.9,'Joint & Spine Surgeon','West Bengal',4,41),(35,'Skin specialist near Mahesh Jagannath temple, expert in chronic skin allergy and trichology.','Serampore','Mahesh Temple Road, Serampore',500.00,'MBBS, MD (Dermatology)','Hooghly',10,22.736,'Mahesh Jagannath Temple',88.349,'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400',4.8,'Senior Dermatologist','West Bengal',2,42),(36,'Expert in chronic asthma, bronchitis, COPD, and sleep apnea near Manikpir.','Serampore','Manikpir Crossing, West Serampore',600.00,'MBBS, MD, FCCP','Hooghly',11,22.744,'Manikpir',88.335,'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',4.7,'Pulmonologist & Sleep Specialist','West Bengal',6,43),(37,'Neurologist dealing with epilepsy, stroke rehabilitation, and recurrent headaches in Chatra.','Serampore','Near Chatra Sitalatala, Serampore',800.00,'MBBS, MD, DM (Neurology)','Hooghly',14,22.758,'Chatra',88.341,'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=400',4.9,'Consultant Neurologist','West Bengal',3,44),(38,'Cardiologist practicing near the historic Chandannagar Strand. Expert in echocardiography.','Chandannagar','Strand Road overlooking River Hooghly, Chandannagar',750.00,'MBBS, MD, DM (Cardiology)','Hooghly',14,22.868,'Chandannagar Strand',88.371,'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',4.9,'Senior Cardiologist','West Bengal',1,45),(39,'Internal medicine practitioner focused on diabetes, geriatric care, and infection near Barabazar.','Chandannagar','Barabazar Commercial Crossing, Chandannagar',400.00,'MBBS, DNB (Family Medicine)','Hooghly',12,22.869,'Barabazar',88.368,'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',4.8,'Family Physician','West Bengal',5,46),(40,'Specialist in arthritis, knee joint injections, and bone fracture on Station Road.','Chandannagar','Station Road near Laxmiganj, Chandannagar',600.00,'MBBS, MS (Ortho)','Hooghly',11,22.865,'Chandannagar Station Road',88.361,'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',4.8,'Consultant Orthopedist','West Bengal',4,47),(41,'Skin consultant expert in eczema, acne scar treatments, and pigmentation in Fatokgora.','Chandannagar','Near French Cemetery & Fatokgora, Chandannagar',550.00,'MBBS, MD (Dermatology)','Hooghly',9,22.872,'Fatokgora',88.358,'https://images.unsplash.com/photo-1594824813501-5264b304c45b?auto=format&fit=crop&q=80&w=400',4.9,'Dermatologist & Cosmetologist','West Bengal',2,48),(42,'Neuro physician specialized in nerve conduction, neuropathy, and vertigo in Urdi Bazar.','Chandannagar','Urdi Bazar Road, Chandannagar',750.00,'MBBS, MD, DM (Neuro)','Hooghly',13,22.864,'Urdi Bazar',88.369,'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=400',4.8,'Consultant Neurologist','West Bengal',3,49),(43,'Pulmonologist treating asthma, post-COVID symptoms, and bronchitis in Mankundu.','Chandannagar','Mankundu Station Road, Chandannagar',550.00,'MBBS, MD (Chest)','Hooghly',11,22.855,'Mankundu Station Road',88.355,'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',4.8,'Consultant Pulmonologist','West Bengal',6,50),(44,'Practicing near Chinsurah Clock Tower, expert in complex metabolic illnesses.','Chinsurah','Chinsurah Clock Tower Chaurasta, GT Road',450.00,'MBBS, MD (Medicine)','Hooghly',15,22.902,'Clock Tower / GT Road',88.395,'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=400',4.8,'Senior Consultant Physician','West Bengal',5,51),(45,'Cardiac specialist near Hooghly Mohsin College, expert in hypertension and coronary care.','Chinsurah','Pipulpati More near Hooghly Mohsin College, Chinsurah',750.00,'MBBS, MD, DM (Cardiology)','Hooghly',13,22.898,'Pipulpati',88.389,'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=400',4.9,'Consultant Cardiologist','West Bengal',1,52),(46,'Orthopedic consultant near Imambara Sadar Hospital, expert in joint replacement.','Chinsurah','Near Imambara Sadar Hospital, Tolafatak, Chinsurah',650.00,'MBBS, MS (Orthopedics)','Hooghly',14,22.908,'Tolafatak / Imambara Hospital',88.398,'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400',4.8,'Senior Orthopedic Surgeon','West Bengal',4,53),(47,'Skin allergy, pediatric eczema, and dermatitis specialist near Chinsurah Station.','Chinsurah','Near Chinsurah Railway Station East, Chinsurah',500.00,'MBBS, DVD','Hooghly',10,22.9,'Chinsurah Station Road',88.384,'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=400',4.7,'Consultant Dermatologist','West Bengal',2,54),(48,'Respiratory physician treating chronic bronchitis, asthma, and pneumonia in Khadina More.','Chinsurah','Khadina More Commercial Arcade, Chinsurah',550.00,'MBBS, MD (Pulmonary)','Hooghly',12,22.895,'Khadina More',88.382,'https://images.unsplash.com/photo-1637059824899-a441006a6875?auto=format&fit=crop&q=80&w=400',4.8,'Chest Physician','West Bengal',6,55),(49,'Neurology specialist treating headache, epilepsy, and cervical nerve issues in Dharampur.','Chinsurah','Near Hooghly District Court, Dharampur, Chinsurah',800.00,'MBBS, MD, DM (Neurology)','Hooghly',13,22.905,'Dharampur / Court',88.391,'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=400',4.9,'Consultant Neurologist','West Bengal',3,56),(50,'Senior physician practicing near Bandel Junction station, treating all common and complex ailments.','Bandel','Station Road near Bandel Railway Junction',400.00,'MBBS, MD (Medicine)','Hooghly',14,22.924,'Bandel Junction Station Road',88.376,'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',4.8,'Senior Family Physician','West Bengal',5,57),(51,'Cardiologist practicing near the historic Bandel Church road. Expert in ECG & heart care.','Bandel','Near Historic Basilica of the Holy Rosary (Bandel Church)',700.00,'MBBS, MD, DM (Cardiology)','Hooghly',12,22.92,'Bandel Church Road',88.388,'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',4.9,'Consultant Cardiologist','West Bengal',1,58),(52,'Orthopedic surgeon handling back pain, arthritis, and slip disc in Debanandapur.','Bandel','GT Road near Sarat Chandra Memorial, Debanandapur, Bandel',600.00,'MBBS, MS (Ortho)','Hooghly',11,22.932,'Debanandapur GT Road',88.365,'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',4.7,'Joint & Trauma Specialist','West Bengal',4,59),(53,'Dermatologist specialized in skin infections, psoriasis, acne, and cosmetic advice at Kodalia.','Bandel','Kodalia More, Bandel',500.00,'MBBS, MD (DVL)','Hooghly',9,22.918,'Kodalia',88.372,'https://images.unsplash.com/photo-1594824813501-5264b304c45b?auto=format&fit=crop&q=80&w=400',4.8,'Consultant Dermatologist','West Bengal',2,60),(54,'Neurologist expert in migraine, vertigo, nerve numbness, and neurological tests at Keota Laldighi.','Bandel','Keota Laldighi Housing Complex, Bandel',750.00,'MBBS, MD, DM (Neuro)','Hooghly',13,22.928,'Keota Laldighi',88.379,'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',4.9,'Consultant Neurologist','West Bengal',3,61),(55,'Respiratory medicine specialist treating COPD, lung infections, and allergies in Sahaganj.','Bandel','Near Dunlop Estate Road, Sahaganj, Bandel',550.00,'MBBS, MD (Chest Diseases)','Hooghly',10,22.921,'Sahaganj',88.382,'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',4.7,'Consultant Pulmonologist','West Bengal',6,62);
/*!40000 ALTER TABLE `doctors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_reports`
--

DROP TABLE IF EXISTS `lab_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_reports` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `extracted_summary` text,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `raw_extracted_text` text,
  `uploaded_at` datetime(6) NOT NULL,
  `patient_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_labreport_patient` (`patient_id`),
  CONSTRAINT `FKqqtjinqyy0233s62fmw49urmi` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_reports`
--

LOCK TABLES `lab_reports` WRITE;
/*!40000 ALTER TABLE `lab_reports` DISABLE KEYS */;
INSERT INTO `lab_reports` VALUES (1,'Lab Report Summary for Rohan Verma:\nAttention needed for 3 flagged value(s):\n• Fasting Blood Sugar is HIGH (118.0 mg/dL, normal: 70.0 - 99.0 mg/dL)\n• HbA1c is HIGH (6.2 %, normal: 4.0 - 5.6 %)\n• Total Cholesterol is HIGH (215.0 mg/dL, normal: 125.0 - 200.0 mg/dL)\nAdvice: Schedule a consultation with a General Physician or Cardiologist for diet and lifestyle advice.','Comprehensive_Metabolic_Profile.pdf','application/pdf',NULL,'Fast Blood Glucose: 118 mg/dL\nHbA1c: 6.2 %\nTotal Cholesterol: 215 mg/dL\nSerum Creatinine: 0.9 mg/dL\nHemoglobin: 14.2 g/dL','2026-09-30 20:24:23.744620',7);
/*!40000 ALTER TABLE `lab_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `razorpay_order_id` varchar(255) DEFAULT NULL,
  `razorpay_payment_id` varchar(255) DEFAULT NULL,
  `razorpay_signature` varchar(255) DEFAULT NULL,
  `refund_id` varchar(255) DEFAULT NULL,
  `status` enum('FAILED','PENDING','REFUNDED','SUCCESS') NOT NULL,
  `appointment_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_payment_appointment` (`appointment_id`),
  KEY `idx_payment_razorpay_order` (`razorpay_order_id`),
  KEY `idx_payment_status` (`status`),
  CONSTRAINT `FK9a0odew03qao7nlbdsesrux5u` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pharmacies`
--

DROP TABLE IF EXISTS `pharmacies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacies` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) NOT NULL,
  `city` varchar(80) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `district` varchar(80) DEFAULT NULL,
  `is_approved` bit(1) NOT NULL,
  `latitude` double DEFAULT NULL,
  `license_number` varchar(100) DEFAULT NULL,
  `locality` varchar(100) DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `operating_hours` varchar(100) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `state` varchar(80) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKidb4iqtyt8vw86ngjh6scj3qp` (`user_id`),
  CONSTRAINT `FKmetjb871tcig2ijxurh7qop5b` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pharmacies`
--

LOCK TABLES `pharmacies` WRITE;
/*!40000 ALTER TABLE `pharmacies` DISABLE KEYS */;
INSERT INTO `pharmacies` VALUES (1,'GT Road, Rishra, Hooghly','Rishra','2026-09-30 20:24:02.472157','Hooghly',_binary '\0',22.714,'WB-LIC-PENDING-994','GT Road Rishra',88.356,'Care & Cure Chemists & Doctor Chamber','09:00 AM - 09:30 PM','+91 98399 22110','West Bengal',6),(2,'Near Makhla High School More, Uttarpara, Hooghly','Uttarpara','2026-09-30 20:24:23.762908','Hooghly',_binary '',22.6735,'WB-PHA-2024-8841','Makhla',88.3345,'Makhla Medicare Chemists & Polyclinic','08:00 AM - 10:00 PM','+91 98311 55667','West Bengal',3),(3,'Konnagar Station Road East, Near Bus Stand','Konnagar','2026-09-30 20:24:23.887446','Hooghly',_binary '',22.7022,'WB-PHA-2024-9102','Station Road / Masterpara',88.3482,'Bengal Swasthya Chemists & Doctor Chamber','07:30 AM - 10:30 PM','+91 98765 43211','West Bengal',4);
/*!40000 ALTER TABLE `pharmacies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pharmacy_doctor_slots`
--

DROP TABLE IF EXISTS `pharmacy_doctor_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacy_doctor_slots` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `available_days` varchar(100) NOT NULL,
  `chamber_room` varchar(50) DEFAULT NULL,
  `consultation_fee` decimal(38,2) DEFAULT NULL,
  `max_tokens` int DEFAULT NULL,
  `time_slot` varchar(100) NOT NULL,
  `doctor_id` bigint NOT NULL,
  `pharmacy_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKfle2g5bag3j762ruc59tggnp0` (`doctor_id`),
  KEY `FKnw2bjq3ndafi5gjnkutp00lor` (`pharmacy_id`),
  CONSTRAINT `FKfle2g5bag3j762ruc59tggnp0` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`),
  CONSTRAINT `FKnw2bjq3ndafi5gjnkutp00lor` FOREIGN KEY (`pharmacy_id`) REFERENCES `pharmacies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pharmacy_doctor_slots`
--

LOCK TABLES `pharmacy_doctor_slots` WRITE;
/*!40000 ALTER TABLE `pharmacy_doctor_slots` DISABLE KEYS */;
INSERT INTO `pharmacy_doctor_slots` VALUES (1,'Mon, Wed, Fri','Chamber 1',750.00,20,'05:00 PM - 07:30 PM',2,2),(2,'Tue, Thu, Sat','Chamber 2',450.00,25,'10:00 AM - 12:30 PM',3,2),(3,'Sunday','Chamber 1',650.00,15,'09:30 AM - 12:00 PM',4,2),(4,'Mon, Wed, Fri, Sat','Chamber A',400.00,30,'06:00 PM - 08:30 PM',8,3),(5,'Tue, Thu','Chamber B',700.00,20,'05:30 PM - 07:30 PM',9,3),(6,'Wednesday & Sunday','Chamber A',600.00,15,'11:00 AM - 01:00 PM',11,3);
/*!40000 ALTER TABLE `pharmacy_doctor_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescriptions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `conflict_flag` bit(1) DEFAULT NULL,
  `conflict_override_reason` text,
  `created_at` datetime(6) NOT NULL,
  `diagnosis_notes` text,
  `is_dispensed` bit(1) DEFAULT NULL,
  `dispensed_at` datetime(6) DEFAULT NULL,
  `dosage_notes` text,
  `medicines` text NOT NULL,
  `appointment_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKr0yn695qg51gn0iskc8p0h2ii` (`appointment_id`),
  KEY `idx_prescription_appointment` (`appointment_id`),
  CONSTRAINT `FKe2fpvlkkcgcd40k4ufyyju2al` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescriptions`
--

LOCK TABLES `prescriptions` WRITE;
/*!40000 ALTER TABLE `prescriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `prescriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(150) NOT NULL,
  `emergency_contact` varchar(50) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `is_approved` bit(1) NOT NULL,
  `name` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('ROLE_ADMIN','ROLE_DOCTOR','ROLE_PATIENT','ROLE_PHARMACIST_RECEPTIONIST') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_email` (`email`),
  KEY `idx_user_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,30,'O+','2026-09-30 20:24:00.667554','admin@health.com',NULL,'Not specified',_binary '','Hospital Administrator','$2a$12$IeN286vHZhfsYgx52wRvQe44DwPDN0HLcGdBrAha0L5ww648HtJXa','+91 98765 43210','ROLE_ADMIN'),(2,NULL,30,'O+','2026-09-30 20:24:01.021531','admin@hospital.com',NULL,'Not specified',_binary '','Admin Director','$2a$12$HET2UEkCIYNSrSbsHR6fMOppQWMKpTiYrlfw2gdVPc6MNutU/iyzS','+91 98765 43210','ROLE_ADMIN'),(3,'Makhla More, Uttarpara, Hooghly',30,'O+','2026-09-30 20:24:01.380045','pharmacy@health.com',NULL,'Not specified',_binary '','Makhla Medicare Pharmacy & Polyclinic','$2a$12$mnztHFHaDWSrZwL.j89KTO4iwwQK05j8c64Zbe0ufrBmFPz4yaWuW','+91 98311 55667','ROLE_PHARMACIST_RECEPTIONIST'),(4,NULL,30,'O+','2026-09-30 20:24:01.731442','staff@hospital.com',NULL,'Not specified',_binary '','Reception & Pharmacy Desk','$2a$12$SVeOocQJfefQE6x/nC/O1ue0xXGWeEDSKf9xb86b1lqmIZU8tYpc.','+91 98765 43211','ROLE_PHARMACIST_RECEPTIONIST'),(5,'Kotrung, Uttarpara, Hooghly',30,'O+','2026-09-30 20:24:02.086889','dr.aniket.pending@hospital.com',NULL,'Not specified',_binary '\0','Aniket Sen','$2a$12$44zY7NZpne9kZN/0X6usfeXZf.qcwGYb1Ln/YXhNJmVs6jZmk1STy','+91 98322 77889','ROLE_DOCTOR'),(6,'GT Road, Rishra, Hooghly',30,'O+','2026-09-30 20:24:02.465558','care.pharmacy.pending@health.com',NULL,'Not specified',_binary '\0','Care & Cure Chemists & Doctor Chamber','$2a$12$5M74XdphuYnpdJC52iKWWubKgWRpT.5bEZBk9ifgOjl4BXInjBg.G','+91 98399 22110','ROLE_PHARMACIST_RECEPTIONIST'),(7,'Makhla, Uttarpara, Hooghly, West Bengal 712245',30,'O+','2026-09-30 20:24:02.832107','patient@health.com',NULL,'Not specified',_binary '','Rohan Verma','$2a$12$Tj362Y60AiMncNT0Uk0n.el756eB0iZniqQlc7nxAl8ttT5yU0xj6','+91 98111 22233','ROLE_PATIENT'),(8,NULL,30,'O+','2026-09-30 20:24:03.252850','meera@health.com',NULL,'Not specified',_binary '','Meera Nambiar','$2a$12$/PJ8Xp43KXWbSjPEOnrcjutFfGlT4qjzlXN2hEoUOww8LUKq0v8KO','+91 98222 33344','ROLE_PATIENT'),(9,NULL,30,'O+','2026-09-30 20:24:03.623339','dr.sharma@hospital.com',NULL,'Not specified',_binary '','Vikram Sharma','$2a$12$KXG3hb2q.ZI0008SQmpgoO0NtVnMMsGmrNldZeJugigMVZMw4PGDS','+91 9814580 91632','ROLE_DOCTOR'),(10,NULL,30,'O+','2026-09-30 20:24:03.980753','dr.mousumi@hospital.com',NULL,'Not specified',_binary '','Mousumi Dutta','$2a$12$VUN3YlIaMDnDs6KJgyHLu.zkTESDlWCGmvMGzfLLVCiQ92CQqH4Gy','+91 9855639 25626','ROLE_DOCTOR'),(11,NULL,30,'O+','2026-09-30 20:24:04.358370','dr.sayan@hospital.com',NULL,'Not specified',_binary '','Sayan Chakraborty','$2a$12$S0073zOoLDdU2Tx0JZWIaepSpu0JqRNDSYjaTb3Xf9Skvlmi59126','+91 9851102 89152','ROLE_DOCTOR'),(12,NULL,30,'O+','2026-09-30 20:24:04.730246','dr.rupa@hospital.com',NULL,'Not specified',_binary '','Rupa Majumder','$2a$12$TvCA0Q5sSN70GunfV4n10uprp9HVr.buf/vd68CwQX4Bxpp/I/soa','+91 9870806 57273','ROLE_DOCTOR'),(13,NULL,30,'O+','2026-09-30 20:24:05.131263','dr.abhijit@hospital.com',NULL,'Not specified',_binary '','Abhijit Das','$2a$12$uCjfflE1/6mBc3FKggw1xOoejs1LKjvXq.bUvyZf1xMXn.R5evx4i','+91 9832293 89942','ROLE_DOCTOR'),(14,NULL,30,'O+','2026-09-30 20:24:05.513156','dr.sharmila@hospital.com',NULL,'Not specified',_binary '','Sharmila Bose','$2a$12$atR0tZxTszyL2Cmcgur.e./gOH8qal0YpSZqBqTiZQjhlybN3W8pa','+91 9835881 22074','ROLE_DOCTOR'),(15,NULL,30,'O+','2026-09-30 20:24:05.871572','dr.subhashish@hospital.com',NULL,'Not specified',_binary '','Subhashish Mukherjee','$2a$12$31WgrEBvm9o/tXqw.1y1leMdEqfW2l7LLM0bO0eTtPTygdVrgORia','+91 9860900 31836','ROLE_DOCTOR'),(16,NULL,30,'O+','2026-09-30 20:24:06.245650','dr.debolina@hospital.com',NULL,'Not specified',_binary '','Debolina Chatterjee','$2a$12$nn49zMyeCttyLFks5yQeb.HvHQtqUDHSsGGm5G/vP0DzM4hPjpecS','+91 9895799 57806','ROLE_DOCTOR'),(17,NULL,30,'O+','2026-09-30 20:24:06.613628','dr.souvik@hospital.com',NULL,'Not specified',_binary '','Souvik Sen','$2a$12$MXqX6QBlV4wLUbOlj1oESOO3SlQP9JBYMSJjLA550DjhSffkI65lK','+91 9850318 10259','ROLE_DOCTOR'),(18,NULL,30,'O+','2026-09-30 20:24:06.975531','dr.ananya@hospital.com',NULL,'Not specified',_binary '','Ananya Roy','$2a$12$bIpY8aH6blhgPn6fFvKfpOpLK9nuhuRbeIWe/ads46fKfgPIBBQCq','+91 9827489 35785','ROLE_DOCTOR'),(19,NULL,30,'O+','2026-09-30 20:24:07.364113','dr.tanmoy@hospital.com',NULL,'Not specified',_binary '','Tanmoy Bhattacharya','$2a$12$ajhzJtRcxhfFYC6SrzxM4.8K/zdRXxqF6hWkG9DWnK./Hqb85EGLu','+91 9838562 85973','ROLE_DOCTOR'),(20,NULL,30,'O+','2026-09-30 20:24:07.739708','dr.paramita@hospital.com',NULL,'Not specified',_binary '','Paramita Ghosh','$2a$12$ivcO4RhEM8IfjJYrtt32COriX9..OMsP5ozZcg37ARB4CTuqBbaBu','+91 9870555 58351','ROLE_DOCTOR'),(21,NULL,30,'O+','2026-09-30 20:24:08.102638','dr.anupam@hospital.com',NULL,'Not specified',_binary '','Anupam Sengupta','$2a$12$.Z.KEXACo9f9qv6a7HBCGeSukQU7QwT8HEof97GL1Qg9XM/4JcIWi','+91 9856041 42457','ROLE_DOCTOR'),(22,NULL,30,'O+','2026-09-30 20:24:08.480754','dr.sharmistha@hospital.com',NULL,'Not specified',_binary '','Sharmistha Sen','$2a$12$GhalfklBS9NaBDrI0sJM9OivZxCXeBhiSdGtIgid8ojVOUKh34vHK','+91 9898803 41919','ROLE_DOCTOR'),(23,NULL,30,'O+','2026-09-30 20:24:08.872036','dr.rajat@hospital.com',NULL,'Not specified',_binary '','Rajat Ghosh','$2a$12$rQHvi8rAidL4ha1nBMVU0ejpPxrOdNhc7EUfm6abx0uayRYZXNabm','+91 9889440 28722','ROLE_DOCTOR'),(24,NULL,30,'O+','2026-09-30 20:24:09.251014','dr.poushali@hospital.com',NULL,'Not specified',_binary '','Poushali Roy','$2a$12$SSeRSm9Tv6ipdvQiL4WTZ.jdf6wTIuO5qZ6HQ3FXR17Qi2LIuQBzG','+91 9868016 62519','ROLE_DOCTOR'),(25,NULL,30,'O+','2026-09-30 20:24:09.626057','dr.amitava@hospital.com',NULL,'Not specified',_binary '','Amitava Das','$2a$12$9XS6RbLq0qN3F9pSixk0FuVOfMAQKa3Bu8dsYVHghMcVmavG4R02y','+91 9899103 62642','ROLE_DOCTOR'),(26,NULL,30,'O+','2026-09-30 20:24:10.001283','dr.tapas@hospital.com',NULL,'Not specified',_binary '','Tapas Adhikari','$2a$12$Y4SBpkXtEpEJL6lP5c6EZO/7fRrJYP52qypT7d2kXGMowvbSF3GfC','+91 9819416 35189','ROLE_DOCTOR'),(27,NULL,30,'O+','2026-09-30 20:24:10.405710','dr.debasis@hospital.com',NULL,'Not specified',_binary '','Debasis Chakraborty','$2a$12$3ycoab4J0YfoG1eE.DOl7eNgdJYnrMEJpVjOyu5CsDmJ7MS3FpsBq','+91 9872722 71863','ROLE_DOCTOR'),(28,NULL,30,'O+','2026-09-30 20:24:10.789555','dr.suparna@hospital.com',NULL,'Not specified',_binary '','Suparna Mitra','$2a$12$.x37XVdgDlzPgabRZx/C5.pSaNyBJxWPJ/aVrgtQEpCd0eh2fSuKS','+91 9837577 90747','ROLE_DOCTOR'),(29,NULL,30,'O+','2026-09-30 20:24:11.152669','dr.arnab@hospital.com',NULL,'Not specified',_binary '','Arnab Mukherjee','$2a$12$v3cFgFDnc0qXvKDbuGkC1ex3Du2OI3jsA7OWeRUaZV9TCMRQCJoWW','+91 9813839 94232','ROLE_DOCTOR'),(30,NULL,30,'O+','2026-09-30 20:24:11.530142','dr.madhumita@hospital.com',NULL,'Not specified',_binary '','Madhumita Saha','$2a$12$.I9uZSy7NCJY7dgwWrpAQO6wPyKTTQGofPaGfQBazCjWB.oeGwc4C','+91 9896120 93501','ROLE_DOCTOR'),(31,NULL,30,'O+','2026-09-30 20:24:11.896160','dr.pranab@hospital.com',NULL,'Not specified',_binary '','Pranab Ghosh','$2a$12$FtdlIX/cLehdZMATLpyOkeo6vDPiO..YPN/d1iKVGjgQzylb0C.7S','+91 9819699 97371','ROLE_DOCTOR'),(32,NULL,30,'O+','2026-09-30 20:24:12.265053','dr.biman@hospital.com',NULL,'Not specified',_binary '','Biman Halder','$2a$12$L1UGfFadKyG1v1xhI9JH8e4d7g3e.0cvhQAgOlGDeziqNxm98ny/W','+91 9894498 81244','ROLE_DOCTOR'),(33,NULL,30,'O+','2026-09-30 20:24:12.655043','dr.tapan@hospital.com',NULL,'Not specified',_binary '','Tapan Karmakar','$2a$12$Fw9az44g/RZq9ncQewTll.7xFpifECXr9hRVhe3j.One4kfSm8jmK','+91 9829328 67463','ROLE_DOCTOR'),(34,NULL,30,'O+','2026-09-30 20:24:13.051644','dr.sangeeta@hospital.com',NULL,'Not specified',_binary '','Sangeeta Dey','$2a$12$Nmr2VVaemOkVluL4fMgNSeahIkY0hEfzmdykWe40S7SkwYNK6MvYm','+91 9864397 44569','ROLE_DOCTOR'),(35,NULL,30,'O+','2026-09-30 20:24:13.443960','dr.somnath@hospital.com',NULL,'Not specified',_binary '','Somnath Halder','$2a$12$bhU5hRo88TrnuE/CjBo06eKwJgIn1.hUgWGT4SWQcCh9qDEplF0nG','+91 9829361 50634','ROLE_DOCTOR'),(36,NULL,30,'O+','2026-09-30 20:24:13.831389','dr.barnali@hospital.com',NULL,'Not specified',_binary '','Barnali Mondal','$2a$12$kHbxEDBHcajD/Wh7yxEDzugGDRcv2Z7auHptuhB7ulHVhTZ2joQiy','+91 9844856 85936','ROLE_DOCTOR'),(37,NULL,30,'O+','2026-09-30 20:24:14.204522','dr.alokroy@hospital.com',NULL,'Not specified',_binary '','Alok Kumar Roy','$2a$12$NIFoYCYCMH.NLwh24FCaJOxyz2pf177wo3GdT86RLsnWPwqJZngzq','+91 9882102 36416','ROLE_DOCTOR'),(38,NULL,30,'O+','2026-09-30 20:24:14.585598','dr.goutammukherjee@hospital.com',NULL,'Not specified',_binary '','Goutam Mukherjee','$2a$12$4HJLAUTetZhYDHorjPy57.gCQiVdQeI02CqKWzjxfNgIxb8PtBAd2','+91 9821057 80202','ROLE_DOCTOR'),(39,NULL,30,'O+','2026-09-30 20:24:14.955842','dr.joydeep@hospital.com',NULL,'Not specified',_binary '','Joydeep Bose','$2a$12$EHctF9TylQ1565kCHX1Rweh3F3m4Jcp/2fXAHh41tcEz7bXjDylm6','+91 9877596 51679','ROLE_DOCTOR'),(40,NULL,30,'O+','2026-09-30 20:24:15.319834','dr.rina@hospital.com',NULL,'Not specified',_binary '','Rina Bhattacharya','$2a$12$lhju79fP3GvcYq6FFnU2dejVGEKapqd8/DGu26U5V/9ywqMkZLU2.','+91 9872934 47412','ROLE_DOCTOR'),(41,NULL,30,'O+','2026-09-30 20:24:15.687008','dr.kunal@hospital.com',NULL,'Not specified',_binary '','Kunal Sarkar','$2a$12$PI/4dubksp5szbBdRhxZc.2V0DaHJFyJ9N/zLEPfHbk.Z2b5HikT.','+91 9879038 55163','ROLE_DOCTOR'),(42,NULL,30,'O+','2026-09-30 20:24:16.063050','dr.monalisa@hospital.com',NULL,'Not specified',_binary '','Monalisa Das','$2a$12$aBhQGPy1S9syYSZO6Zarr.oiNdMfYADgEaYpKaCt.8WGD0OTUj2LW','+91 9826235 85508','ROLE_DOCTOR'),(43,NULL,30,'O+','2026-09-30 20:24:16.426530','dr.subir@hospital.com',NULL,'Not specified',_binary '','Subir Mallick','$2a$12$sDCuD45GK1F40on5FF3uferwGMu/o943Y28JrQAr7E6o.1H0.j9TG','+91 9818794 67270','ROLE_DOCTOR'),(44,NULL,30,'O+','2026-09-30 20:24:16.796603','dr.dipankar@hospital.com',NULL,'Not specified',_binary '','Dipankar Samanta','$2a$12$cst1YP8Wc1l3OvH5mvILleFDlHM8H0ZoVW7SQeNRxpsHONe3Y/MQq','+91 9840482 85323','ROLE_DOCTOR'),(45,NULL,30,'O+','2026-09-30 20:24:17.183785','dr.supratim@hospital.com',NULL,'Not specified',_binary '','Supratim Paul','$2a$12$A.IGo16sdHoF6feIiMEq6emj.iXa3JiZcFJtGQCF2lNHhejegkzdK','+91 9850484 17141','ROLE_DOCTOR'),(46,NULL,30,'O+','2026-09-30 20:24:17.568751','dr.archana@hospital.com',NULL,'Not specified',_binary '','Archana Ghosh','$2a$12$GRg1mRdzmJBm3z4i4yBc2.lOatxiJCq7CBby.EKxPQmYszVndsYqC','+91 9865389 62743','ROLE_DOCTOR'),(47,NULL,30,'O+','2026-09-30 20:24:17.973178','dr.somen@hospital.com',NULL,'Not specified',_binary '','Somen Roy','$2a$12$UGeBEzjXy8JRUNdrte4.YOqb6ZcnzNROAE9WpwUymyNH9E4jm3lPa','+91 9881125 89200','ROLE_DOCTOR'),(48,NULL,30,'O+','2026-09-30 20:24:18.374094','dr.piyali@hospital.com',NULL,'Not specified',_binary '','Piyali Kundu','$2a$12$BIZKt8G3kZ3Roa6ypR1Lxun.DfFPcjokD4HOw49hU0l4AWnxbT8aC','+91 9889743 83226','ROLE_DOCTOR'),(49,NULL,30,'O+','2026-09-30 20:24:18.739034','dr.aniruddha@hospital.com',NULL,'Not specified',_binary '','Aniruddha Dutta','$2a$12$48vZQ5HBFeWgR1k9fS7upeABm97zChlxikvJJBoTqO8z1PkFyfXCy','+91 9856153 54338','ROLE_DOCTOR'),(50,NULL,30,'O+','2026-09-30 20:24:19.108180','dr.amitganguly@hospital.com',NULL,'Not specified',_binary '','Amit Ganguly','$2a$12$ECON5h7/x6YvkCIvOPNVHewPfa39YIQWIaw0kgoYPXVd1LBjOBf7e','+91 9814468 92017','ROLE_DOCTOR'),(51,NULL,30,'O+','2026-09-30 20:24:19.476067','dr.bhaswati@hospital.com',NULL,'Not specified',_binary '','Bhaswati Roy','$2a$12$9P8phcs.mIYkWNGSZg869ugruLFxdrICvljSt10SpyBYQtw6QMqYq','+91 9819310 76665','ROLE_DOCTOR'),(52,NULL,30,'O+','2026-09-30 20:24:19.831709','dr.soumen@hospital.com',NULL,'Not specified',_binary '','Soumen Mukherjee','$2a$12$IYQNTqA48fGcm9IfDIZncelHbZYw9HiXzhrpcGTAFlpU/eQg/IUYK','+91 9844680 89342','ROLE_DOCTOR'),(53,NULL,30,'O+','2026-09-30 20:24:20.188270','dr.ranjan@hospital.com',NULL,'Not specified',_binary '','Ranjan Biswas','$2a$12$YuVdn5aS5RTEoaHqCx5MWuMkwFqgqAKllRfIsWmT.IXkU36.FKlKK','+91 9888828 45427','ROLE_DOCTOR'),(54,NULL,30,'O+','2026-09-30 20:24:20.557719','dr.swati@hospital.com',NULL,'Not specified',_binary '','Swati Dasgupta','$2a$12$TqeRTjBZQBQX13JO1KiVJucIDAlHsDdZ9oL95uA3jKbr6yPbIgwaC','+91 9883905 93601','ROLE_DOCTOR'),(55,NULL,30,'O+','2026-09-30 20:24:20.939885','dr.kalyan@hospital.com',NULL,'Not specified',_binary '','Kalyan Nandi','$2a$12$TwU4w23SsRIP0OsXrsfGCuCRbF69zLIXzqbSavRuQNe003vKVTB8a','+91 9861143 23033','ROLE_DOCTOR'),(56,NULL,30,'O+','2026-09-30 20:24:21.312978','dr.sandip@hospital.com',NULL,'Not specified',_binary '','Sandip Majumdar','$2a$12$Lr6KDxb4eQbPra1ki4aaP.XH8t0Au9KVW/FrleXmx0UOGxfsEKcf6','+91 9877287 97210','ROLE_DOCTOR'),(57,NULL,30,'O+','2026-09-30 20:24:21.670372','dr.pradipta@hospital.com',NULL,'Not specified',_binary '','Pradipta Sarkar','$2a$12$5FRvh..LtXCW.sW1zHiRYuaOdfnY1bP9c0RDG9vMZdk2lDFMnoJPy','+91 9863412 44405','ROLE_DOCTOR'),(58,NULL,30,'O+','2026-09-30 20:24:22.024531','dr.anuradha@hospital.com',NULL,'Not specified',_binary '','Anuradha Das','$2a$12$9O3.GgybBv8nT/z8w562UeaXcpYaKg1gVLVCZ.kDn1M/Mz0cD0Tki','+91 9879631 39044','ROLE_DOCTOR'),(59,NULL,30,'O+','2026-09-30 20:24:22.431865','dr.subhasis@hospital.com',NULL,'Not specified',_binary '','Subhasis Pal','$2a$12$jNEEXafvZ5Rw0KrMaaLSaOiB3QDAAppWU2uwi2oWpN.cJbQCQI80m','+91 9856577 79898','ROLE_DOCTOR'),(60,NULL,30,'O+','2026-09-30 20:24:22.863020','dr.rituja@hospital.com',NULL,'Not specified',_binary '','Rituja Banik','$2a$12$PYMzoriTDpgxEjiJcXdx6.5pO0YccO.pcnVZzt.gPNd9X./JQvuNW','+91 9888444 44710','ROLE_DOCTOR'),(61,NULL,30,'O+','2026-09-30 20:24:23.258069','dr.bikash@hospital.com',NULL,'Not specified',_binary '','Bikash Chandra Roy','$2a$12$ctijD.nHi71dlDZFYTQRYeUVRRxx3Z/rwq5mVfqIhoQR4.ompTw0m','+91 9891359 43879','ROLE_DOCTOR'),(62,NULL,30,'O+','2026-09-30 20:24:23.634182','dr.kakoli@hospital.com',NULL,'Not specified',_binary '','Kakoli Chatterjee','$2a$12$ZKLTVb0QctMQ7xMOHMuU7eFoCLaIKRwZbxyMU2YIgJ./GnCmh115K','+91 9871720 20840','ROLE_DOCTOR');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-01  2:30:37
