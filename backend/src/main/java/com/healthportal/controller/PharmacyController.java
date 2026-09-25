package com.healthportal.controller;

import com.healthportal.security.services.UserDetailsImpl;
import com.healthportal.service.PharmacyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pharmacies")
@Tag(name = "Pharmacies", description = "Endpoints for pharmacy chambers and visiting doctor time slots")
public class PharmacyController {

    @Autowired
    private PharmacyService pharmacyService;

    @GetMapping
    @Operation(summary = "Get list of all approved pharmacies with their visiting doctors and time slots")
    public ResponseEntity<List<Map<String, Object>>> getAllPharmacies(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String locality) {
        return ResponseEntity.ok(pharmacyService.getAllApprovedPharmacies(city, locality));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get pharmacy details and visiting doctor time slots by pharmacy ID")
    public ResponseEntity<Map<String, Object>> getPharmacyById(@PathVariable Long id) {
        return ResponseEntity.ok(pharmacyService.getPharmacyById(id));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PHARMACIST_RECEPTIONIST')")
    @Operation(summary = "Get logged in pharmacy profile")
    public ResponseEntity<Map<String, Object>> getMyPharmacy(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(pharmacyService.getPharmacyByUserId(userDetails.getId()));
    }

    @PostMapping("/{id}/slots")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST_RECEPTIONIST')")
    @Operation(summary = "Add a visiting doctor with specific days and time slots to pharmacy")
    public ResponseEntity<Map<String, Object>> addDoctorSlot(
            @PathVariable Long id,
            @RequestBody Map<String, Object> req) {
        Long doctorId = Long.valueOf(req.get("doctorId").toString());
        String days = req.getOrDefault("availableDays", "Mon, Wed, Fri").toString();
        String timeSlot = req.getOrDefault("timeSlot", "05:00 PM - 07:30 PM").toString();
        String room = req.getOrDefault("chamberRoom", "Chamber 1").toString();
        BigDecimal fee = req.containsKey("consultationFee") ? new BigDecimal(req.get("consultationFee").toString()) : null;
        Integer maxTokens = req.containsKey("maxTokens") ? Integer.valueOf(req.get("maxTokens").toString()) : 20;

        return ResponseEntity.ok(pharmacyService.addDoctorSlot(id, doctorId, days, timeSlot, room, fee, maxTokens));
    }

    @DeleteMapping("/slots/{slotId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST_RECEPTIONIST')")
    @Operation(summary = "Remove a doctor visiting slot from pharmacy")
    public ResponseEntity<Void> removeDoctorSlot(@PathVariable Long slotId) {
        pharmacyService.removeDoctorSlot(slotId);
        return ResponseEntity.noContent().build();
    }
}
