package com.healthportal.controller;

import com.healthportal.dto.doctor.DoctorDto;
import com.healthportal.security.services.UserDetailsImpl;
import com.healthportal.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@Tag(name = "Doctors", description = "Endpoints for doctor discovery, proximity search, and profile management")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @GetMapping("/near-me")
    @Operation(summary = "Search doctors near patient coordinates using Haversine distance formula with specialty, rating, state, district, city, and locality filters")
    public ResponseEntity<List<DoctorDto>> getDoctorsNearMe(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String locality) {
        Double effectiveLat = latitude != null ? latitude : lat;
        Double effectiveLon = longitude != null ? longitude : lon;
        return ResponseEntity.ok(doctorService.getDoctorsNearMe(effectiveLat, effectiveLon, specialization, departmentId, minRating, state, district, city, locality));
    }

    @GetMapping("/locations")
    @Operation(summary = "Get available states, districts, and cities where doctors practice")
    public ResponseEntity<Map<String, Object>> getAvailableLocations() {
        return ResponseEntity.ok(doctorService.getAvailableLocations());
    }

    @GetMapping
    @Operation(summary = "Get list of all doctors")
    public ResponseEntity<List<DoctorDto>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get current logged-in doctor profile")
    public ResponseEntity<DoctorDto> getMyDoctorProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(doctorService.getDoctorByUserId(userDetails.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get doctor profile details by ID")
    public ResponseEntity<DoctorDto> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    @Operation(summary = "Update doctor profile, consultation fee, or bio (Admin or Doctor only)")
    public ResponseEntity<DoctorDto> updateDoctor(
            @PathVariable Long id,
            @RequestBody DoctorDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(doctorService.updateDoctorProfile(id, dto, userDetails.getId()));
    }
}
