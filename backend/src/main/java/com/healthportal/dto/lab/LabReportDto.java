package com.healthportal.dto.lab;

import java.time.Instant;

public class LabReportDto {
    private Long id;
    private Long patientId;
    private String patientName;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private String extractedSummary;
    private Instant uploadedAt;

    public LabReportDto() {}

    public LabReportDto(Long id, Long patientId, String patientName, String fileName, String fileUrl,
                        String fileType, String extractedSummary, Instant uploadedAt) {
        this.id = id;
        this.patientId = patientId;
        this.patientName = patientName;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
        this.extractedSummary = extractedSummary;
        this.uploadedAt = uploadedAt;
    }

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

    public String getExtractedSummary() {
        return extractedSummary;
    }

    public void setExtractedSummary(String extractedSummary) {
        this.extractedSummary = extractedSummary;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
