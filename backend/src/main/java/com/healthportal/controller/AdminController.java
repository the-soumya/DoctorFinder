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
    private com.healthportal.repository.DepartmentRepository departmentRepository;

    @Autowired
    private com.healthportal.repository.AppointmentRepository appointmentRepository;

    @Autowired
    private com.healthportal.repository.PharmacyDoctorSlotRepository slotRepository;

    @Autowired
    private com.healthportal.service.AppointmentService appointmentService;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

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

    @GetMapping("/appointments")
    @Operation(summary = "Get all appointments in the system for admin overview")
    public ResponseEntity<List<com.healthportal.dto.appointment.AppointmentDto>> getAllAppointmentsAdmin() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @DeleteMapping("/appointments/{id}")
    @Operation(summary = "Cancel and remove an appointment (Admin master override)")
    public ResponseEntity<Map<String, Object>> deleteAppointmentAdmin(@PathVariable Long id) {
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
        appt.setStatus(com.healthportal.entity.AppointmentStatus.CANCELLED);
        appt.setCancellationReason("Cancelled by Hospital Administrator");
        appointmentRepository.save(appt);
        auditService.log(null, "ADMIN_CANCELLED_APPOINTMENT", "appointments", id, "Admin cancelled appointment #" + id);
        Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("success", true);
        resp.put("message", "Appointment #" + id + " has been cancelled by Administrator.");
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/doctors")
    @Operation(summary = "Add a new Doctor directly to the hospital system (Admin)")
    public ResponseEntity<Map<String, Object>> addDoctorAdmin(@RequestBody Map<String, Object> req) {
        String name = req.get("name").toString();
        String email = req.get("email").toString();
        String password = req.getOrDefault("password", "doctor123").toString();
        String phone = req.getOrDefault("phone", "+91 98765 43210").toString();
        String spec = req.getOrDefault("specialization", "General Physician").toString();
        String degree = req.getOrDefault("degree", "MBBS, MD").toString();
        String clinicAddress = req.getOrDefault("clinicAddress", "Central Outpatient Clinic").toString();
        String city = req.getOrDefault("city", "Uttarpara").toString();
        String locality = req.getOrDefault("locality", "Makhla").toString();
        java.math.BigDecimal fee = new java.math.BigDecimal(req.getOrDefault("consultationFee", "500").toString());
        Integer exp = Integer.valueOf(req.getOrDefault("experienceYears", "5").toString());
        String photoUrl = req.getOrDefault("photoUrl", "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400").toString();

        if (userRepository.existsByEmail(email)) {
            throw new com.healthportal.exception.BadRequestException("Email is already registered: " + email);
        }

        User user = new User(name, email, passwordEncoder.encode(password), Role.ROLE_DOCTOR, phone);
        user.setIsApproved(true);
        user = userRepository.save(user);

        Department dept = departmentRepository.findAll().stream().findFirst()
                .orElseGet(() -> departmentRepository.save(new Department("General Medicine", "Primary healthcare")));
        if (req.containsKey("departmentId")) {
            Long deptId = Long.valueOf(req.get("departmentId").toString());
            dept = departmentRepository.findById(deptId).orElse(dept);
        }

        Doctor doc = new Doctor(user, dept, spec, 22.6730, 88.3340, fee, 4.8, exp, "Consulting specialist", degree, photoUrl);
        doc.setCity(city);
        doc.setLocality(locality);
        doc.setClinicAddress(clinicAddress);
        doc = doctorRepository.save(doc);

        auditService.log(null, "ADMIN_ADDED_DOCTOR", "doctors", doc.getId(), "Admin added Dr. " + name);
        Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("success", true);
        resp.put("doctorId", doc.getId());
        resp.put("message", "Dr. " + name + " has been registered successfully.");
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/doctors/{id}")
    @Operation(summary = "Remove a doctor from the hospital platform (Admin)")
    public ResponseEntity<Map<String, Object>> deleteDoctorAdmin(@PathVariable Long id) {
        Doctor doc = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + id));
        slotRepository.findAll().stream()
                .filter(s -> s.getDoctor().getId().equals(id))
                .forEach(slotRepository::delete);
        doctorRepository.delete(doc);
        auditService.log(null, "ADMIN_DELETED_DOCTOR", "doctors", id, "Admin removed doctor #" + id);
        Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("success", true);
        resp.put("message", "Doctor has been removed successfully.");
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/pharmacies")
    @Operation(summary = "Add a new Pharmacy / Chamber location (Admin)")
    public ResponseEntity<Map<String, Object>> addPharmacyAdmin(@RequestBody Map<String, Object> req) {
        String name = req.get("name").toString();
        String license = req.getOrDefault("licenseNumber", "WB-DL-" + (System.currentTimeMillis() % 100000)).toString();
        String address = req.get("address").toString();
        String city = req.getOrDefault("city", "Uttarpara").toString();
        String locality = req.getOrDefault("locality", "Makhla").toString();
        String phone = req.getOrDefault("phone", "+91 98311 00000").toString();
        String operatingHours = req.getOrDefault("operatingHours", "08:00 AM - 10:00 PM").toString();

        Pharmacy pharmacy = new Pharmacy(name, license, null, address, city, "Hooghly", "West Bengal", locality, 22.6730, 88.3340, phone, operatingHours, true);
        pharmacy = pharmacyRepository.save(pharmacy);

        auditService.log(null, "ADMIN_ADDED_PHARMACY", "pharmacies", pharmacy.getId(), "Admin created pharmacy: " + name);
        Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("success", true);
        resp.put("pharmacyId", pharmacy.getId());
        resp.put("message", "Pharmacy chamber '" + name + "' added successfully.");
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/pharmacies/{id}")
    @Operation(summary = "Remove a pharmacy / chamber location (Admin)")
    public ResponseEntity<Map<String, Object>> deletePharmacyAdmin(@PathVariable Long id) {
        Pharmacy p = pharmacyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacy not found with ID: " + id));
        slotRepository.findByPharmacyId(id).forEach(slotRepository::delete);
        pharmacyRepository.delete(p);
        auditService.log(null, "ADMIN_DELETED_PHARMACY", "pharmacies", id, "Admin deleted pharmacy: " + p.getName());
        Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("success", true);
        resp.put("message", "Pharmacy '" + p.getName() + "' has been removed.");
        return ResponseEntity.ok(resp);
    }
}
