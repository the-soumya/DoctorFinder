package com.healthportal.controller;

import com.healthportal.dto.prescription.DrugConflictResult;
import com.healthportal.dto.prescription.MedicineDto;
import com.healthportal.dto.prescription.PrescriptionDto;
import com.healthportal.dto.prescription.PrescriptionRequest;
import com.healthportal.security.services.UserDetailsImpl;
import com.healthportal.service.PrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prescriptions")
@Tag(name = "Prescriptions", description = "Endpoints for electronic prescriptions, drug-allergy conflict checking, and pharmacy dispensing")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @PostMapping("/check-conflicts")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Check prescribed medicines against patient allergy and drug-interaction history (Doctor only)")
    public ResponseEntity<List<DrugConflictResult>> checkConflicts(
            @RequestParam Long patientId,
            @RequestBody List<MedicineDto> medicines) {
        return ResponseEntity.ok(prescriptionService.checkConflicts(patientId, medicines));
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Save prescription with encrypted diagnosis notes and conflict override validation (Doctor only)")
    public ResponseEntity<PrescriptionDto> savePrescription(
            @Valid @RequestBody PrescriptionRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(prescriptionService.savePrescription(request, userDetails.getId()));
    }

    @PostMapping("/{id}/dispense")
    @PreAuthorize("hasRole('PHARMACIST_RECEPTIONIST') or hasRole('ADMIN')")
    @Operation(summary = "Mark prescription as dispensed by pharmacist (Pharmacist/Receptionist only)")
    public ResponseEntity<PrescriptionDto> dispensePrescription(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(prescriptionService.markDispensed(id, userDetails.getId()));
    }

    @GetMapping("/appointment/{appointmentId}")
    @Operation(summary = "Get prescription for appointment (Medical notes automatically redacted for Pharmacy/Reception role)")
    public ResponseEntity<PrescriptionDto> getPrescriptionByAppointment(
            @PathVariable Long appointmentId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionByAppointmentId(appointmentId, userDetails.getRole()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get all prescriptions for current logged in patient")
    public ResponseEntity<List<PrescriptionDto>> getMyPrescriptions(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(prescriptionService.getPatientPrescriptions(userDetails.getId()));
    }

    @GetMapping("/undispensed")
    @PreAuthorize("hasRole('PHARMACIST_RECEPTIONIST') or hasRole('ADMIN')")
    @Operation(summary = "Get undispensed prescription queue for pharmacy dispensing")
    public ResponseEntity<List<PrescriptionDto>> getUndispensedPrescriptions() {
        return ResponseEntity.ok(prescriptionService.getUndispensedPrescriptions());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PHARMACIST_RECEPTIONIST')")
    @Operation(summary = "Get all prescriptions (Admin and Pharmacy)")
    public ResponseEntity<List<PrescriptionDto>> getAllPrescriptions(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(prescriptionService.getAllPrescriptions(userDetails.getRole()));
    }
}
