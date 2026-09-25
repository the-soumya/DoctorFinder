package com.healthportal.controller;

import com.healthportal.dto.ai.LabReportSummaryDto;
import com.healthportal.entity.LabReport;
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
    public ResponseEntity<List<LabReport>> getMyReports(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(labReportRepository.findByPatientIdOrderByUploadedAtDesc(userDetails.getId()));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('PATIENT')")
    @Operation(summary = "Get lab reports for specific patient (Doctor or Admin)")
    public ResponseEntity<List<LabReport>> getReportsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(labReportRepository.findByPatientIdOrderByUploadedAtDesc(patientId));
    }
}
