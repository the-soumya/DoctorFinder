package com.healthportal.service;

import com.healthportal.entity.*;
import com.healthportal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminAnalyticsService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalAppointments = appointmentRepository.count();
        long totalDoctors = doctorRepository.count();
        long totalPatients = userRepository.findByRole(Role.ROLE_PATIENT).size();

        List<Payment> successfulPayments = paymentRepository.findByStatus(PaymentStatus.SUCCESS);
        BigDecimal totalRevenue = successfulPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Map<String, Object>> statusCounts = appointmentRepository.countAppointmentsByStatus();
        long cancelledCount = 0;
        long completedCount = 0;
        long confirmedCount = 0;
        long pendingCount = 0;

        for (Map<String, Object> row : statusCounts) {
            String status = String.valueOf(row.get("status"));
            long count = ((Number) row.get("count")).longValue();
            switch (status) {
                case "CANCELLED" -> cancelledCount = count;
                case "COMPLETED" -> completedCount = count;
                case "CONFIRMED" -> confirmedCount = count;
                case "PENDING" -> pendingCount = count;
            }
        }

        double cancellationRate = totalAppointments > 0 ? ((double) cancelledCount / totalAppointments) * 100 : 0.0;

        stats.put("totalAppointments", totalAppointments);
        stats.put("totalDoctors", totalDoctors);
        stats.put("totalPatients", totalPatients);
        stats.put("totalRevenue", totalRevenue);
        stats.put("cancelledAppointments", cancelledCount);
        stats.put("completedAppointments", completedCount);
        stats.put("confirmedAppointments", confirmedCount);
        stats.put("pendingAppointments", pendingCount);
        stats.put("cancellationRate", Math.round(cancellationRate * 10.0) / 10.0);

        // Appointments per Department
        stats.put("departmentDistribution", appointmentRepository.countAppointmentsByDepartment());

        // Doctor Load Distribution
        stats.put("doctorLoad", appointmentRepository.countAppointmentsByDoctor());

        return stats;
    }

    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
