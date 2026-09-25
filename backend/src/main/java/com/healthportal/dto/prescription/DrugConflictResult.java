package com.healthportal.dto.prescription;

public class DrugConflictResult {

    private boolean hasConflict;
    private String conflictType;
    private String conflictingMedicine;
    private String matchedEntity;
    private String severity;
    private String warningMessage;

    public DrugConflictResult() {
        this.hasConflict = false;
    }

    public DrugConflictResult(boolean hasConflict, String conflictType, String conflictingMedicine,
                              String matchedEntity, String severity, String warningMessage) {
        this.hasConflict = hasConflict;
        this.conflictType = conflictType;
        this.conflictingMedicine = conflictingMedicine;
        this.matchedEntity = matchedEntity;
        this.severity = severity;
        this.warningMessage = warningMessage;
    }

    public boolean isHasConflict() {
        return hasConflict;
    }

    public void setHasConflict(boolean hasConflict) {
        this.hasConflict = hasConflict;
    }

    public String getConflictType() {
        return conflictType;
    }

    public void setConflictType(String conflictType) {
        this.conflictType = conflictType;
    }

    public String getConflictingMedicine() {
        return conflictingMedicine;
    }

    public void setConflictingMedicine(String conflictingMedicine) {
        this.conflictingMedicine = conflictingMedicine;
    }

    public String getMatchedEntity() {
        return matchedEntity;
    }

    public void setMatchedEntity(String matchedEntity) {
        this.matchedEntity = matchedEntity;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getWarningMessage() {
        return warningMessage;
    }

    public void setWarningMessage(String warningMessage) {
        this.warningMessage = warningMessage;
    }
}
