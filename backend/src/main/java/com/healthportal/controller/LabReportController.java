package com.healthportal.controller;

import com.healthportal.dto.ai.LabReportSummaryDto;
import com.healthportal.dto.lab.LabReportDto;
import com.healthportal.entity.LabReport;
import com.healthportal.entity.Role;
import com.healthportal.exception.ForbiddenException;
import com.healthportal.repository.LabReportRepository;
import com.healthportal.security.services.UserDetailsImpl;
import com.healthportal.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lab-reports")
@Tag(name = "Lab Reports", description = "Endpoints for lab report upload, PDF extraction, and history viewing")
public class LabReportController {

    @Autowired
    private AiService aiService;

    @Autowired
    private LabReportRepository labReportRepository;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Upload PDF/text lab report and extract summary")
    public ResponseEntity<LabReportSummaryDto> uploadReport(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "patientId", required = false) Long patientIdParam,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long targetPatientId = (patientIdParam != null && !userDetails.getRole().name().equals("ROLE_PATIENT"))
                ? patientIdParam : userDetails.getId();
        return ResponseEntity.ok(aiService.processLabReport(file, targetPatientId));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get current patient's lab reports")
    public ResponseEntity<List<LabReportDto>> getMyReports(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<LabReport> reports = labReportRepository.findByPatientIdOrderByUploadedAtDesc(userDetails.getId());
        return ResponseEntity.ok(reports.stream().map(this::mapToDto).collect(Collectors.toList()));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('PATIENT')")
    @Operation(summary = "Get lab reports for specific patient with strict IDOR verification")
    public ResponseEntity<List<LabReportDto>> getReportsByPatient(
            @PathVariable Long patientId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        // Enforce strict BOLA / IDOR protection
        if (userDetails.getRole() == Role.ROLE_PATIENT && !userDetails.getId().equals(patientId)) {
            throw new ForbiddenException("Unauthorized: You do not have permission to view other patients' lab reports.");
        }

        List<LabReport> reports = labReportRepository.findByPatientIdOrderByUploadedAtDesc(patientId);
        return ResponseEntity.ok(reports.stream().map(this::mapToDto).collect(Collectors.toList()));
    }

    private LabReportDto mapToDto(LabReport report) {
        return new LabReportDto(
                report.getId(),
                report.getPatient().getId(),
                report.getPatient().getName(),
                report.getFileName(),
                report.getFileUrl(),
                report.getFileType(),
                report.getExtractedSummary(),
                report.getUploadedAt()
        );
    }
}
