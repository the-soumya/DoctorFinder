package com.healthportal.controller;

import com.healthportal.dto.ai.LabReportSummaryDto;
import com.healthportal.dto.ai.SymptomCheckRequest;
import com.healthportal.dto.ai.SymptomCheckResponse;
import com.healthportal.entity.AiInteractionLog;
import com.healthportal.repository.AiInteractionLogRepository;
import com.healthportal.security.services.UserDetailsImpl;
import com.healthportal.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Features", description = "Endpoints for AI Symptom Pre-Screener and PDF Lab Report Summarization")
public class AiController {

    @Autowired
    private AiService aiService;

    @Autowired
    private AiInteractionLogRepository aiInteractionLogRepository;

    @PostMapping("/symptom-check")
    @Operation(summary = "Submit symptoms to AI pre-screener for recommended specialist, confidence score, and conditions (Rate-limited)")
    public ResponseEntity<SymptomCheckResponse> symptomCheck(
            @Valid @RequestBody SymptomCheckRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            HttpServletRequest servletRequest) {
        String clientIp = servletRequest.getRemoteAddr();
        Long userId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(aiService.analyzeSymptoms(request.getSymptoms(), userId, clientIp));
    }

    @PostMapping(value = "/summarize-report", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Upload PDF/text lab report for automated metric extraction, abnormality flagging, and plain-English summary")
    public ResponseEntity<LabReportSummaryDto> summarizeReport(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "patientId", required = false) Long patientIdParam,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long targetPatientId = (patientIdParam != null && !userDetails.getRole().name().equals("ROLE_PATIENT"))
                ? patientIdParam : userDetails.getId();
        return ResponseEntity.ok(aiService.processLabReport(file, targetPatientId));
    }

    @GetMapping("/logs")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "View audit history of all AI symptom and report interactions (Admin only)")
    public ResponseEntity<List<AiInteractionLog>> getAiLogs() {
        return ResponseEntity.ok(aiInteractionLogRepository.findAllByOrderByTimestampDesc());
    }
}
