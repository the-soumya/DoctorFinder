package com.healthportal.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "lab_reports", indexes = {
    @Index(name = "idx_labreport_patient", columnList = "patient_id")
})
public class LabReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "raw_extracted_text", columnDefinition = "TEXT")
    private String rawExtractedText;

    @Column(name = "extracted_summary", columnDefinition = "TEXT")
    private String extractedSummary;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private Instant uploadedAt = Instant.now();

    public LabReport() {}

    public LabReport(User patient, String fileName, String fileUrl, String fileType, String rawExtractedText, String extractedSummary) {
        this.patient = patient;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
        this.rawExtractedText = rawExtractedText;
        this.extractedSummary = extractedSummary;
        this.uploadedAt = Instant.now();
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
