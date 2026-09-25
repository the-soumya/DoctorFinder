package com.healthportal.dto.prescription;

import java.time.Instant;
import java.util.List;

public class PrescriptionDto {

    private Long id;
    private Long appointmentId;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private List<MedicineDto> medicines;
    private String dosageNotes;
    private String diagnosisNotes;
    private Boolean conflictFlag;
    private String conflictOverrideReason;
    private Boolean dispensed;
    private Instant dispensedAt;
    private Instant createdAt;

    public PrescriptionDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getDoctorSpecialization() {
        return doctorSpecialization;
    }

    public void setDoctorSpecialization(String doctorSpecialization) {
        this.doctorSpecialization = doctorSpecialization;
    }

    public List<MedicineDto> getMedicines() {
        return medicines;
    }

    public void setMedicines(List<MedicineDto> medicines) {
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
