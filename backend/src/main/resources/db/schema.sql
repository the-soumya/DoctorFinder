-- =============================================================================
-- PATIENT HEALTH PORTAL: 3NF NORMALIZED DATABASE SCHEMA (PostgreSQL)
-- =============================================================================

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(35) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON users(role);

-- 3. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    department_id BIGINT NOT NULL,
    specialization VARCHAR(120) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    rating DOUBLE PRECISION DEFAULT 4.8,
    experience_years INT DEFAULT 5,
    bio TEXT,
    city VARCHAR(80) DEFAULT 'Bengaluru',
    district VARCHAR(80) DEFAULT 'Bengaluru Urban',
    state VARCHAR(80) DEFAULT 'Karnataka',
    degree VARCHAR(150) DEFAULT 'MBBS, MD',
    photo_url VARCHAR(500),
    CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_doctor_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_doctor_user ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_department ON doctors(department_id);
CREATE INDEX IF NOT EXISTS idx_doctor_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctor_location ON doctors(state, district, city);

-- 4. Appointments Table (With @Version optimistic lock column & hold expiry)
CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    slot_datetime TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    slot_hold_expiry TIMESTAMP WITH TIME ZONE,
    version BIGINT NOT NULL DEFAULT 0,
    patient_arrival_marked BOOLEAN DEFAULT FALSE,
    cancellation_reason VARCHAR(255),
    refund_status VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_appointment_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointment_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointment_slot ON appointments(slot_datetime);
CREATE INDEX IF NOT EXISTS idx_appointment_status ON appointments(status);

-- 5. Payments Table (Razorpay Integration)
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    refund_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_payment_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payment_appointment ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payment_razorpay_order ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payments(status);

-- 6. Prescriptions Table (Field-Level Encrypted diagnosis_notes)
CREATE TABLE IF NOT EXISTS prescriptions (
    id BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT NOT NULL UNIQUE,
    medicines TEXT NOT NULL,
    dosage_notes TEXT,
    diagnosis_notes TEXT, -- AES-256 encrypted string
    conflict_flag BOOLEAN DEFAULT FALSE,
    conflict_override_reason TEXT,
    is_dispensed BOOLEAN DEFAULT FALSE,
    dispensed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_prescription_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_prescription_appointment ON prescriptions(appointment_id);

-- 7. Lab Reports Table
CREATE TABLE IF NOT EXISTS lab_reports (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500),
    file_type VARCHAR(100),
    raw_extracted_text TEXT,
    extracted_summary TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_labreport_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_labreport_patient ON lab_reports(patient_id);

-- 8. Allergies and Medication History Table (Used by Rule-based Drug Conflict Checker)
CREATE TABLE IF NOT EXISTS allergies_medication_history (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    allergy_name VARCHAR(150),
    medication_name VARCHAR(150),
    severity VARCHAR(30) DEFAULT 'MODERATE',
    notes TEXT,
    CONSTRAINT fk_allergy_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_allergy_patient ON allergies_medication_history(patient_id);

-- 9. AI Interaction Logs Table
CREATE TABLE IF NOT EXISTS ai_interaction_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    feature VARCHAR(50) NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    disclaimer_shown BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_user ON ai_interaction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feature ON ai_interaction_logs(feature);

-- 10. Audit Logs Table (Immutable Append-Only Audit Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    table_affected VARCHAR(100),
    record_id BIGINT,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);

-- =============================================================================
-- DATABASE-LEVEL IMMUTABLE AUDIT LOG SECURITY ENFORCEMENT
-- =============================================================================
-- To enforce that the application role cannot UPDATE or DELETE audit logs:
--
-- 1. Create a dedicated application role:
--    CREATE ROLE portal_app_user WITH LOGIN PASSWORD 'app_secure_pass';
-- 2. Grant table privileges:
--    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO portal_app_user;
-- 3. REVOKE UPDATE and DELETE strictly on audit_logs:
--    REVOKE UPDATE, DELETE ON audit_logs FROM portal_app_user;
-- 4. Create trigger to reject updates and deletes even if privileged:
CREATE OR REPLACE FUNCTION prevent_audit_log_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable. UPDATE and DELETE actions are strictly prohibited.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_audit_logs ON audit_logs;
CREATE TRIGGER trg_immutable_audit_logs
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_tampering();
