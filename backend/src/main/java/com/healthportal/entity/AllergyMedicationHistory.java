package com.healthportal.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "allergies_medication_history", indexes = {
    @Index(name = "idx_allergy_patient", columnList = "patient_id")
})
public class AllergyMedicationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @Column(name = "allergy_name")
    private String allergyName;

    @Column(name = "medication_name")
    private String medicationName;

    @Column(length = 30)
    private String severity = "MODERATE";

    @Column(columnDefinition = "TEXT")
    private String notes;

    public AllergyMedicationHistory() {}

    public AllergyMedicationHistory(User patient, String allergyName, String medicationName, String severity, String notes) {
        this.patient = patient;
        this.allergyName = allergyName;
        this.medicationName = medicationName;
        this.severity = severity;
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getPatient() {
        return patient;
    }

    public void setPatient(User patient) {
        this.patient = patient;
    }

    public String getAllergyName() {
        return allergyName;
    }

    public void setAllergyName(String allergyName) {
        this.allergyName = allergyName;
    }

    public String getMedicationName() {
        return medicationName;
    }

    public void setMedicationName(String medicationName) {
        this.medicationName = medicationName;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
