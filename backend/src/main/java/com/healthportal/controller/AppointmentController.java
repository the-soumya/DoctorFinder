package com.healthportal.controller;

import com.healthportal.dto.appointment.*;
import com.healthportal.security.services.UserDetailsImpl;
import com.healthportal.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@Tag(name = "Appointments", description = "Endpoints for appointment holding, booking, rescheduling, and cancellation")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping("/hold-slot")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Hold an appointment slot with concurrency-safe locking and 10-minute hold window (Patient only)")
    public ResponseEntity<AppointmentDto> holdSlot(
            @Valid @RequestBody HoldSlotRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(appointmentService.holdSlot(request, userDetails.getId()));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Cancel appointment with automated refund rule evaluation (>=24h full refund)")
    public ResponseEntity<AppointmentDto> cancelAppointment(
            @PathVariable Long id,
            @Valid @RequestBody CancelAppointmentRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(id, request.getReason(), userDetails.getId(), userDetails.getRole()));
    }

    @PostMapping("/{id}/reschedule")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('PATIENT')")
    @Operation(summary = "Reschedule appointment to a new slot datetime (Doctor or Patient)")
    public ResponseEntity<AppointmentDto> rescheduleAppointment(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(appointmentService.rescheduleAppointment(id, request.getNewSlotDatetime(), userDetails.getId()));
    }

    @PostMapping("/{id}/mark-arrival")
    @PreAuthorize("hasRole('PHARMACIST_RECEPTIONIST') or hasRole('ADMIN')")
    @Operation(summary = "Mark patient physical arrival at hospital (Receptionist/Pharmacist only)")
    public ResponseEntity<AppointmentDto> markArrival(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(appointmentService.markPatientArrival(id, userDetails.getId()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get list of appointments for current logged in patient")
    public ResponseEntity<List<AppointmentDto>> getMyPatientAppointments(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(appointmentService.getPatientAppointments(userDetails.getId()));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('PHARMACIST_RECEPTIONIST')")
    @Operation(summary = "Get list of appointments assigned to a specific doctor")
    public ResponseEntity<List<AppointmentDto>> getDoctorAppointments(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(doctorId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PHARMACIST_RECEPTIONIST')")
    @Operation(summary = "Get all appointments in system (Admin / Receptionist only)")
    public ResponseEntity<List<AppointmentDto>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single appointment by ID")
    public ResponseEntity<AppointmentDto> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }
}
