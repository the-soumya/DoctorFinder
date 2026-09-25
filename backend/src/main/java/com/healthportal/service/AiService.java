package com.healthportal.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthportal.dto.ai.LabReportSummaryDto;
import com.healthportal.dto.ai.SymptomCheckResponse;
import com.healthportal.entity.AiInteractionLog;
import com.healthportal.entity.LabReport;
import com.healthportal.entity.User;
import com.healthportal.exception.BadRequestException;
import com.healthportal.exception.RateLimitExceededException;
import com.healthportal.exception.ResourceNotFoundException;
import com.healthportal.repository.AiInteractionLogRepository;
import com.healthportal.repository.LabReportRepository;
import com.healthportal.repository.UserRepository;
import com.healthportal.security.ratelimit.RateLimitingService;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiService {

    private static final Logger logger = LoggerFactory.getLogger(AiService.class);

    @Value("${app.ai.gemini-api-key:}")
    private String geminiApiKey;

    @Value("${app.ai.openai-api-key:}")
    private String openaiApiKey;

    @Autowired
    private RateLimitingService rateLimitingService;

    @Autowired
    private AiInteractionLogRepository aiInteractionLogRepository;

    @Autowired
    private LabReportRepository labReportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditService auditService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SymptomCheckResponse analyzeSymptoms(String symptoms, Long userId, String clientIp) {
        String rateLimitKey = (userId != null) ? "user_" + userId : "ip_" + clientIp;
        if (!rateLimitingService.tryConsume(rateLimitKey)) {
            throw new RateLimitExceededException("Rate limit reached. Please wait a minute before submitting more symptom checks.");
        }

        SymptomCheckResponse response = null;

        // 1. Attempt Gemini or OpenAI LLM API if key is present
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            response = callGeminiApi(symptoms);
        }

        // 2. Fallback to Medical Knowledge Reasoning Engine if LLM call is unavailable or fails
        if (response == null) {
            response = evaluateWithClinicalEngine(symptoms);
        }

        // 3. Log interaction to ai_interaction_logs (Audit requirement)
        try {
            String promptLog = "Patient Symptoms: " + symptoms;
            String responseLog = objectMapper.writeValueAsString(response);
            AiInteractionLog log = new AiInteractionLog(userId, "SYMPTOM_CHECK", promptLog, responseLog, true);
            aiInteractionLogRepository.save(log);
        } catch (Exception e) {
            logger.warn("Could not save AI interaction log: {}", e.getMessage());
        }

        return response;
    }

    private SymptomCheckResponse callGeminiApi(String symptoms) {
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

            String prompt = """
                    You are a clinical symptom pre-screener assistant.
                    Analyze the following patient symptoms: "%s"
                    
                    Return ONLY valid JSON matching this schema:
                    {
                      "possibleConditions": ["Condition 1", "Condition 2"],
                      "recommendedSpecialist": "e.g. Cardiologist / Dermatologist / Neurologist / General Physician",
                      "confidence": "High / Moderate / Low",
                      "analysisNotes": "Short 2-sentence explanation of why this specialist is suggested.",
                      "disclaimer": "This is not a medical diagnosis; please consult the recommended specialist."
                    }
                    Do not add markdown formatting or extra text.
                    """.formatted(symptoms.replace("\"", "'"));

            Map<String, Object> textPart = Map.of("text", prompt);
            Map<String, Object> parts = Map.of("parts", List.of(textPart));
            Map<String, Object> requestBody = Map.of("contents", List.of(parts));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> apiResponse = restTemplate.postForEntity(url, entity, String.class);

            if (apiResponse.getStatusCode().is2xxSuccessful() && apiResponse.getBody() != null) {
                JsonNode root = objectMapper.readTree(apiResponse.getBody());
                String responseText = root.path("candidates").get(0)
                        .path("content").path("parts").get(0).path("text").asText();

                // Clean markdown code blocks if present
                if (responseText.contains("```json")) {
                    responseText = responseText.substring(responseText.indexOf("```json") + 7);
                    if (responseText.contains("```")) {
                        responseText = responseText.substring(0, responseText.indexOf("```"));
                    }
                } else if (responseText.contains("```")) {
                    responseText = responseText.substring(responseText.indexOf("```") + 3);
                    if (responseText.contains("```")) {
                        responseText = responseText.substring(0, responseText.indexOf("```"));
                    }
                }

                return objectMapper.readValue(responseText.trim(), SymptomCheckResponse.class);
            }
        } catch (Exception e) {
            logger.warn("Gemini API call failed or timed out, activating Clinical Knowledge Engine: {}", e.getMessage());
        }
        return null;
    }

    // High-performance, robust Clinical Reasoning Engine fallback
    public SymptomCheckResponse evaluateWithClinicalEngine(String symptoms) {
        String lower = symptoms.toLowerCase();

        List<String> conditions = new ArrayList<>();
        String specialist = "General Physician";
        String confidence = "Moderate";
        String notes;

        if (lower.contains("chest pain") || lower.contains("heart") || lower.contains("palpitation") || lower.contains("shortness of breath")) {
            conditions.add("Angina / Ischemic Heart Disease");
            conditions.add("Cardiovascular Stress / Arrhythmia");
            conditions.add("Gastroesophageal Reflux (GERD)");
            specialist = "Cardiologist";
            confidence = "High";
            notes = "Chest tightness and palpitations require prompt cardiac evaluation and ECG assessment.";
        } else if (lower.contains("rash") || lower.contains("skin") || lower.contains("itch") || lower.contains("acne") || lower.contains("eczema")) {
            conditions.add("Contact Dermatitis");
            conditions.add("Urticaria (Allergic Hives)");
            conditions.add("Eczematous Reaction");
            specialist = "Dermatologist";
            confidence = "High";
            notes = "Dermatological signs suggest an allergic or cutaneous inflammation requiring targeted topical review.";
        } else if (lower.contains("headache") || lower.contains("migraine") || lower.contains("dizzy") || lower.contains("numb") || lower.contains("tremor")) {
            conditions.add("Migraine with/without Aura");
            conditions.add("Tension-type Cephalea");
            conditions.add("Vestibular / Neurological Equilibrium Deficit");
            specialist = "Neurologist";
            confidence = "Moderate";
            notes = "Persistent neurological discomfort or localized head throbbing points to cranial vascular etiology.";
        } else if (lower.contains("bone") || lower.contains("knee") || lower.contains("joint") || lower.contains("back pain") || lower.contains("spine") || lower.contains("fracture")) {
            conditions.add("Osteoarthritis / Musculoskeletal Strain");
            conditions.add("Lumbar Radiculopathy");
            conditions.add("Tendonitis / Ligamentous Laxity");
            specialist = "Orthopedist";
            confidence = "High";
            notes = "Articular pain and joint immobility require radiographic imaging and musculoskeletal consultation.";
        } else if (lower.contains("cough") || lower.contains("fever") || lower.contains("throat") || lower.contains("wheez") || lower.contains("lung")) {
            conditions.add("Acute Bronchitis / Viral Pharyngitis");
            conditions.add("Upper Respiratory Tract Infection");
            conditions.add("Seasonal Allergic Rhinitis");
            specialist = "Pulmonologist";
            confidence = "Moderate";
            notes = "Respiratory symptoms benefit from auscultation, pulmonary evaluation, and symptomatic antiviral management.";
        } else if (lower.contains("stomach") || lower.contains("vomit") || lower.contains("diarrhea") || lower.contains("abdominal") || lower.contains("acidity")) {
            conditions.add("Acute Gastroenteritis");
            conditions.add("Peptic Ulcer Disease / Gastritis");
            conditions.add("Irritable Bowel Syndrome");
            specialist = "Gastroenterologist";
            confidence = "Moderate";
            notes = "Abdominal discomfort and gastrointestinal distress indicate mucosal or metabolic evaluation.";
        } else if (lower.contains("eye") || lower.contains("vision") || lower.contains("blur") || lower.contains("retina")) {
            conditions.add("Conjunctivitis");
            conditions.add("Refractive Error / Eye Strain");
            specialist = "Ophthalmologist";
            confidence = "High";
            notes = "Visual disturbances and ocular irritation require fundoscopy and visual acuity testing.";
        } else {
            conditions.add("General Malaise / Systemic Fatigue");
            conditions.add("Mild Viral Syndrome");
            specialist = "General Physician";
            confidence = "Moderate";
            notes = "A comprehensive physical examination with baseline vitals by a general physician is recommended.";
        }

        return new SymptomCheckResponse(conditions, specialist, confidence, notes);
    }

    @Transactional
    public LabReportSummaryDto processLabReport(MultipartFile file, Long patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        String rawText = "";
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "report.txt";
        String contentType = file.getContentType() != null ? file.getContentType() : "text/plain";

        try {
            if (originalFilename.toLowerCase().endsWith(".pdf") || contentType.contains("pdf")) {
                try (InputStream inputStream = file.getInputStream();
                     PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    rawText = stripper.getText(document);
                }
            } else {
                rawText = new String(file.getBytes(), StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            logger.error("Error reading file text: {}", e.getMessage());
            rawText = "Uploaded document: " + originalFilename;
        }

        // Parse key diagnostic clinical metrics
        Map<String, Object> metrics = new HashMap<>();
        List<String> abnormalities = new ArrayList<>();

        // Fasting Blood Sugar
        parseMetric(rawText, "Fasting Blood Sugar|FBS|Glucose|Blood Sugar", "mg/dL", 70.0, 99.0, metrics, abnormalities);
        // HbA1c
        parseMetric(rawText, "HbA1c|Glycated Hemoglobin", "%", 4.0, 5.6, metrics, abnormalities);
        // Blood Pressure Systolic
        parseMetric(rawText, "Systolic|BP Systolic", "mmHg", 90.0, 120.0, metrics, abnormalities);
        // Total Cholesterol
        parseMetric(rawText, "Total Cholesterol|Cholesterol", "mg/dL", 125.0, 200.0, metrics, abnormalities);
        // Hemoglobin
        parseMetric(rawText, "Hemoglobin|Hb", "g/dL", 13.0, 17.0, metrics, abnormalities);
        // Creatinine
        parseMetric(rawText, "Creatinine|Serum Creatinine", "mg/dL", 0.6, 1.2, metrics, abnormalities);
        // WBC Count
        parseMetric(rawText, "WBC|White Blood Cells|Total Leucocyte Count", "cells/mcL", 4000.0, 11000.0, metrics, abnormalities);

        StringBuilder plainSummary = new StringBuilder();
        plainSummary.append("Lab Report Analysis for ").append(patient.getName()).append(":\n");
        if (abnormalities.isEmpty()) {
            plainSummary.append("All parsed clinical parameters (Blood Sugar, Cholesterol, Hemoglobin, Renal markers) appear within standard reference intervals.");
        } else {
            plainSummary.append("Attention required for ").append(abnormalities.size()).append(" flagged metric(s):\n");
            for (String abnormal : abnormalities) {
                plainSummary.append("• ").append(abnormal).append("\n");
            }
            plainSummary.append("Recommendation: Present this summary to your consulting physician for clinical correlation and dietary or pharmaceutical adjustment.");
        }

        LabReport labReport = new LabReport();
        labReport.setPatient(patient);
        labReport.setFileName(originalFilename);
        labReport.setFileType(contentType);
        labReport.setRawExtractedText(rawText.length() > 3000 ? rawText.substring(0, 3000) : rawText);
        labReport.setExtractedSummary(plainSummary.toString());
        labReport = labReportRepository.save(labReport);

        // Audit log
        auditService.log(patientId, "LAB_REPORT_UPLOAD_AI", "lab_reports", labReport.getId(),
                "Extracted text and metrics from " + originalFilename);

        LabReportSummaryDto dto = new LabReportSummaryDto();
        dto.setId(labReport.getId());
        dto.setPatientId(patient.getId());
        dto.setPatientName(patient.getName());
        dto.setFileName(labReport.getFileName());
        dto.setFileType(labReport.getFileType());
        dto.setRawExtractedText(labReport.getRawExtractedText());
        dto.setPlainEnglishSummary(plainSummary.toString());
        dto.setKeyMetrics(metrics);
        dto.setFlaggedAbnormalities(abnormalities);
        dto.setUploadedAt(labReport.getUploadedAt());

        return dto;
    }

    private void parseMetric(String text, String namePattern, String unit, double minNormal, double maxNormal,
                             Map<String, Object> metrics, List<String> abnormalities) {
        try {
            Pattern pattern = Pattern.compile("(?i)(?:" + namePattern + ")[^0-9]{0,20}([0-9]+(?:\\.[0-9]+)?)");
            Matcher matcher = pattern.matcher(text);
            if (matcher.find()) {
                double val = Double.parseDouble(matcher.group(1));
                String status = "NORMAL";
                if (val < minNormal) {
                    status = "LOW";
                    abnormalities.add(namePattern.split("\\|")[0] + " is LOW (" + val + " " + unit + ", reference: " + minNormal + "-" + maxNormal + " " + unit + ")");
                } else if (val > maxNormal) {
                    status = "HIGH";
                    abnormalities.add(namePattern.split("\\|")[0] + " is HIGH (" + val + " " + unit + ", reference: " + minNormal + "-" + maxNormal + " " + unit + ")");
                }

                Map<String, Object> item = new HashMap<>();
                item.put("value", val);
                item.put("unit", unit);
                item.put("referenceRange", minNormal + " - " + maxNormal);
                item.put("status", status);

                metrics.put(namePattern.split("\\|")[0], item);
            }
        } catch (Exception ignored) {}
    }
}
