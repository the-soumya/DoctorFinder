package com.healthportal.controller;

import com.healthportal.entity.AllergyMedicationHistory;
import com.healthportal.entity.User;
import com.healthportal.exception.ResourceNotFoundException;
import com.healthportal.repository.AllergyMedicationHistoryRepository;
import com.healthportal.repository.UserRepository;
import com.healthportal.security.services.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/allergies")
@Tag(name = "Allergies & Medication History", description = "Endpoints for patient allergy records and active medications for conflict checking")
public class AllergyController {

    @Autowired
    private AllergyMedicationHistoryRepository allergyRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Get allergy and medication history for a specific patient")
    public ResponseEntity<List<AllergyMedicationHistory>> getPatientAllergies(@PathVariable Long patientId) {
        return ResponseEntity.ok(allergyRepository.findByPatientId(patientId));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get allergy and medication history for current patient")
    public ResponseEntity<List<AllergyMedicationHistory>> getMyAllergies(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(allergyRepository.findByPatientId(userDetails.getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Add an allergy or medication history record for a patient")
    public ResponseEntity<AllergyMedicationHistory> addAllergy(
            @RequestParam(required = false) Long patientId,
            @RequestBody AllergyMedicationHistory request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long targetId = (patientId != null && !userDetails.getRole().name().equals("ROLE_PATIENT"))
                ? patientId : userDetails.getId();
        User patient = userRepository.findById(targetId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + targetId));

        request.setPatient(patient);
        return ResponseEntity.ok(allergyRepository.save(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Remove an allergy or medication entry")
    public ResponseEntity<Void> deleteAllergy(@PathVariable Long id) {
        allergyRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
