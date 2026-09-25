package com.healthportal.controller;

import com.healthportal.entity.AuditLog;
import com.healthportal.entity.Role;
import com.healthportal.entity.User;
import com.healthportal.exception.ResourceNotFoundException;
import com.healthportal.repository.UserRepository;
import com.healthportal.service.AdminAnalyticsService;
import com.healthportal.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Endpoints for administrative analytics, audit inspection, and user management")
public class AdminController {

    @Autowired
    private AdminAnalyticsService adminAnalyticsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.healthportal.repository.DoctorRepository doctorRepository;

    @Autowired
    private com.healthportal.repository.PharmacyRepository pharmacyRepository;

    @Autowired
    private AuditService auditService;

    @GetMapping("/stats")
    @Operation(summary = "Get overall hospital analytics: appointments/department, doctor load, revenue, cancellation rate")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminAnalyticsService.getDashboardStats());
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "View immutable append-only audit trail records (Admin read-only)")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(adminAnalyticsService.getAuditLogs());
    }

    @GetMapping("/users")
    @Operation(summary = "Get list of all registered users in the hospital system")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/pending-approvals")
    @Operation(summary = "Get doctors and pharmacies awaiting admin verification and approval")
    public ResponseEntity<List<Map<String, Object>>> getPendingApprovals() {
        List<User> unapprovedUsers = userRepository.findAll().stream()
                .filter(u -> Boolean.FALSE.equals(u.getIsApproved()))
                .toList();

        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (User u : unapprovedUsers) {
            Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("phone", u.getPhone());
            map.put("address", u.getAddress());
            map.put("createdAt", u.getCreatedAt());

            if (u.getRole() == Role.ROLE_DOCTOR) {
                doctorRepository.findByUserId(u.getId()).ifPresent(d -> {
                    map.put("specialization", d.getSpecialization());
                    map.put("department", d.getDepartment() != null ? d.getDepartment().getName() : "General");
                    map.put("degree", d.getDegree());
                    map.put("city", d.getCity());
                    map.put("locality", d.getLocality());
                    map.put("clinicAddress", d.getClinicAddress());
                    map.put("consultationFee", d.getConsultationFee());
                });
            } else if (u.getRole() == Role.ROLE_PHARMACIST_RECEPTIONIST) {
                pharmacyRepository.findByUserId(u.getId()).ifPresent(p -> {
                    map.put("pharmacyName", p.getName());
                    map.put("licenseNumber", p.getLicenseNumber());
                    map.put("operatingHours", p.getOperatingHours());
                    map.put("city", p.getCity());
                    map.put("locality", p.getLocality());
                    map.put("pharmacyAddress", p.getAddress());
                });
            }
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/users/{id}/approve")
    @Operation(summary = "Approve doctor or pharmacy account to allow login")
    public ResponseEntity<Map<String, Object>> approveUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        user.setIsApproved(true);
        userRepository.save(user);

        // Also approve doctor or pharmacy record if present
        if (user.getRole() == Role.ROLE_PHARMACIST_RECEPTIONIST) {
            pharmacyRepository.findByUserId(user.getId()).ifPresent(p -> {
                p.setIsApproved(true);
                pharmacyRepository.save(p);
            });
        }

        auditService.log(null, "ADMIN_APPROVED_USER", "users", user.getId(), "Administrator approved " + user.getRole() + ": " + user.getEmail());

        Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("success", true);
        resp.put("message", "User " + user.getName() + " (" + user.getRole() + ") has been approved. They can now log in.");
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/users/{id}/reject")
    @Operation(summary = "Reject or revoke approval of a doctor or pharmacy account")
    public ResponseEntity<Map<String, Object>> rejectUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        user.setIsApproved(false);
        userRepository.save(user);

        if (user.getRole() == Role.ROLE_PHARMACIST_RECEPTIONIST) {
            pharmacyRepository.findByUserId(user.getId()).ifPresent(p -> {
                p.setIsApproved(false);
                pharmacyRepository.save(p);
            });
        }

        auditService.log(null, "ADMIN_REJECTED_USER", "users", user.getId(), "Administrator revoked/rejected " + user.getRole() + ": " + user.getEmail());

        Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("success", true);
        resp.put("message", "User " + user.getName() + " (" + user.getRole() + ") approval has been revoked/rejected.");
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/users/{id}/role")
    @Operation(summary = "Change role of a user")
    public ResponseEntity<User> updateUserRole(@PathVariable Long id, @RequestParam Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        user.setRole(role);
        user = userRepository.save(user);
        auditService.log(null, "USER_ROLE_UPDATED", "users", user.getId(), "Updated role to " + role);
        return ResponseEntity.ok(user);
    }
}
