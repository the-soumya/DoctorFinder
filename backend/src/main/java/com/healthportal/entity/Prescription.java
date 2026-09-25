package com.healthportal.entity;

import com.healthportal.security.encryption.DiagnosisNotesConverter;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "prescriptions", indexes = {
    @Index(name = "idx_prescription_appointment", columnList = "appointment_id")
})
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;

    // Stored as JSON string representation of array: [{name, dosage, frequency, duration, instructions}]
    @Column(columnDefinition = "TEXT", nullable = false)
    private String medicines;

    @Column(name = "dosage_notes", columnDefinition = "TEXT")
    private String dosageNotes;

    // Field-level AES-256 encrypted column
    @Convert(converter = DiagnosisNotesConverter.class)
    @Column(name = "diagnosis_notes", columnDefinition = "TEXT")
    private String diagnosisNotes;

    @Column(name = "conflict_flag")
    private Boolean conflictFlag = false;

    @Column(name = "conflict_override_reason", columnDefinition = "TEXT")
    private String conflictOverrideReason;

    @Column(name = "is_dispensed")
    private Boolean dispensed = false;

    @Column(name = "dispensed_at")
    private Instant dispensedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Prescription() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }

    public String getMedicines() {
        return medicines;
    }

    public void setMedicines(String medicines) {
        this.medicines = medicines;
    }

    public String getDosageNotes() {
        return dosageNotes;
    }

    public void setDosageNotes(String dosageNotes) {
        this.dosageNotes = dosageNotes;
    }

    public String getDiagnosisNotes() {
        return diagnosisNotes;
    }

    public void setDiagnosisNotes(String diagnosisNotes) {
        this.diagnosisNotes = diagnosisNotes;
    }

    public Boolean getConflictFlag() {
        return conflictFlag;
    }

    public void setConflictFlag(Boolean conflictFlag) {
        this.conflictFlag = conflictFlag;
    }

    public String getConflictOverrideReason() {
        return conflictOverrideReason;
    }

    public void setConflictOverrideReason(String conflictOverrideReason) {
        this.conflictOverrideReason = conflictOverrideReason;
    }

    public Boolean getDispensed() {
        return dispensed;
    }

    public void setDispensed(Boolean dispensed) {
        this.dispensed = dispensed;
    }

    public Instant getDispensedAt() {
        return dispensedAt;
    }

    public void setDispensedAt(Instant dispensedAt) {
        this.dispensedAt = dispensedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
