package com.healthportal.dto.prescription;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class PrescriptionRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @NotEmpty(message = "At least one medicine is required")
    @Valid
    private List<MedicineDto> medicines;

    private String dosageNotes;

    private String diagnosisNotes;

    private Boolean overrideConflict = false;

    private String overrideReason;

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
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

    public Boolean getOverrideConflict() {
        return overrideConflict;
    }

    public void setOverrideConflict(Boolean overrideConflict) {
        this.overrideConflict = overrideConflict;
    }

    public String getOverrideReason() {
        return overrideReason;
    }

    public void setOverrideReason(String overrideReason) {
        this.overrideReason = overrideReason;
    }
}
