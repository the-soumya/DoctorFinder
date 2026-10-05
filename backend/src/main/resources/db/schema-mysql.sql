-- =============================================================================
-- PATIENT HEALTH PORTAL: 3NF NORMALIZED DATABASE SCHEMA (MySQL 8.0+)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS patient_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE patient_portal;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(35) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255),
    is_approved BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    department_id BIGINT NOT NULL,
    specialization VARCHAR(120) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    consultation_fee DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
    rating DOUBLE DEFAULT 4.8,
    experience_years INT DEFAULT 5,
    bio TEXT,
    city VARCHAR(80) DEFAULT 'Bengaluru',
    district VARCHAR(80) DEFAULT 'Bengaluru Urban',
    state VARCHAR(80) DEFAULT 'Karnataka',
    degree VARCHAR(150) DEFAULT 'MBBS, MD',
    photo_url VARCHAR(500),
    is_approved BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_doctor_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    INDEX idx_doctor_user (user_id),
    INDEX idx_doctor_department (department_id),
    INDEX idx_doctor_specialization (specialization),
    INDEX idx_doctor_location (state, district, city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    slot_datetime DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    slot_hold_expiry DATETIME,
    version BIGINT NOT NULL DEFAULT 0,
    patient_arrival_marked BOOLEAN DEFAULT FALSE,
    cancellation_reason VARCHAR(255),
    refund_status VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_appointment_patient (patient_id),
    INDEX idx_appointment_doctor (doctor_id),
    INDEX idx_appointment_slot (slot_datetime),
    INDEX idx_appointment_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Payments Table (Razorpay Integration)
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    refund_id VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_payment_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    INDEX idx_payment_appointment (appointment_id),
    INDEX idx_payment_razorpay_order (razorpay_order_id),
    INDEX idx_payment_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT NOT NULL UNIQUE,
    medicines TEXT NOT NULL,
    dosage_notes TEXT,
    diagnosis_notes TEXT,
    conflict_flag BOOLEAN DEFAULT FALSE,
    conflict_override_reason TEXT,
    is_dispensed BOOLEAN DEFAULT FALSE,
    dispensed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_prescription_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    INDEX idx_prescription_appointment (appointment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Lab Reports Table
CREATE TABLE IF NOT EXISTS lab_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500),
    file_type VARCHAR(100),
    raw_extracted_text TEXT,
    extracted_summary TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_labreport_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_labreport_patient (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Allergies and Medication History Table
CREATE TABLE IF NOT EXISTS allergies_medication_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    allergy_name VARCHAR(150),
    medication_name VARCHAR(150),
    severity VARCHAR(30) DEFAULT 'MODERATE',
    notes TEXT,
    CONSTRAINT fk_allergy_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_allergy_patient (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. AI Interaction Logs Table
CREATE TABLE IF NOT EXISTS ai_interaction_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    feature VARCHAR(50) NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    disclaimer_shown BOOLEAN DEFAULT TRUE,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    INDEX idx_ai_user (user_id),
    INDEX idx_ai_feature (feature)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    table_affected VARCHAR(100),
    record_id BIGINT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Pharmacies Table
CREATE TABLE IF NOT EXISTS pharmacies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    license_number VARCHAR(100),
    address VARCHAR(255) NOT NULL,
    city VARCHAR(80),
    district VARCHAR(80),
    state VARCHAR(80),
    phone VARCHAR(20),
    latitude DOUBLE,
    longitude DOUBLE,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pharmacy_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_pharmacy_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Pharmacy Doctor Slots Table
CREATE TABLE IF NOT EXISTS pharmacy_doctor_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pharmacy_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INT DEFAULT 15,
    consultation_fee DECIMAL(10, 2) DEFAULT 500.00,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_slot_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
    CONSTRAINT fk_slot_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_slot_pharmacy (pharmacy_id),
    INDEX idx_slot_doctor (doctor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
