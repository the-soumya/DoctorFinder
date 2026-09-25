package com.healthportal.dto.ai;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public class LabReportSummaryDto {

    private Long id;
    private Long patientId;
    private String patientName;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private String rawExtractedText;
    private String plainEnglishSummary;
    private Map<String, Object> keyMetrics;
    private List<String> flaggedAbnormalities;
    private Instant uploadedAt;

    public LabReportSummaryDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getRawExtractedText() {
        return rawExtractedText;
    }

    public void setRawExtractedText(String rawExtractedText) {
        this.rawExtractedText = rawExtractedText;
    }

    public String getPlainEnglishSummary() {
        return plainEnglishSummary;
    }

    public void setPlainEnglishSummary(String plainEnglishSummary) {
        this.plainEnglishSummary = plainEnglishSummary;
    }

    public Map<String, Object> getKeyMetrics() {
        return keyMetrics;
    }

    public void setKeyMetrics(Map<String, Object> keyMetrics) {
        this.keyMetrics = keyMetrics;
    }

    public List<String> getFlaggedAbnormalities() {
        return flaggedAbnormalities;
    }

    public void setFlaggedAbnormalities(List<String> flaggedAbnormalities) {
        this.flaggedAbnormalities = flaggedAbnormalities;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
