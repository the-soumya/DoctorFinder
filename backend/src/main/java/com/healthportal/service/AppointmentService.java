package com.healthportal.service;

import com.healthportal.dto.appointment.AppointmentDto;
import com.healthportal.dto.appointment.HoldSlotRequest;
import com.healthportal.entity.*;
import com.healthportal.exception.BadRequestException;
import com.healthportal.exception.ConflictException;
import com.healthportal.exception.ForbiddenException;
import com.healthportal.exception.ResourceNotFoundException;
import com.healthportal.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentService.class);

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private AuditService auditService;

    @Autowired
    private PaymentService paymentService;

    @Value("${app.cancellation.full-refund-hours:24}")
    private int fullRefundHours;

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public AppointmentDto holdSlot(HoldSlotRequest request, Long patientId) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + request.getDoctorId()));

        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        // Concurrency-safe slot lock check: SELECT ... FOR UPDATE
        Optional<Appointment> conflictingOpt = appointmentRepository.findConflictingSlotWithLock(
                doctor.getId(), request.getSlotDatetime());

        if (conflictingOpt.isPresent()) {
            Appointment conflicting = conflictingOpt.get();
            if (conflicting.getStatus() == AppointmentStatus.CONFIRMED) {
                throw new ConflictException("This appointment slot is already confirmed and booked.");
            } else if (conflicting.getStatus() == AppointmentStatus.PENDING) {
                // If the hold has expired, release it
                if (conflicting.getSlotHoldExpiry() != null && conflicting.getSlotHoldExpiry().isBefore(Instant.now())) {
                    conflicting.setStatus(AppointmentStatus.CANCELLED);
                    conflicting.setCancellationReason("Hold expired before payment");
                    appointmentRepository.save(conflicting);
                } else {
                    throw new ConflictException("This slot is currently held by another patient. Please try another slot or check back shortly.");
                }
            }
        }

        // Lock slot for 10 minutes
        Instant holdExpiry = Instant.now().plus(10, ChronoUnit.MINUTES);
        Appointment appointment = new Appointment(
                patient,
                doctor,
                request.getSlotDatetime(),
                AppointmentStatus.PENDING,
                holdExpiry
        );

        appointment = appointmentRepository.save(appointment);
        auditService.log(patientId, "SLOT_HOLD", "appointments", appointment.getId(),
                "Held slot for doctor ID " + doctor.getId() + " at " + request.getSlotDatetime());

        return mapToDto(appointment);
    }

    @Transactional
    public AppointmentDto cancelAppointment(Long appointmentId, String reason, Long requestingUserId, Role userRole) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        // Ownership and permission check
        boolean isPatient = appointment.getPatient().getId().equals(requestingUserId);
        boolean isAssignedDoctor = appointment.getDoctor().getUser().getId().equals(requestingUserId);
        boolean isAdmin = userRole == Role.ROLE_ADMIN;

        if (!isPatient && !isAssignedDoctor && !isAdmin) {
            throw new BadRequestException("You do not have permission to cancel this appointment");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED || appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Appointment is already " + appointment.getStatus());
        }

        // Configurable Business Rule for Refund:
        // Full refund if cancelled >= fullRefundHours before slot; no refund otherwise
        LocalDateTime now = LocalDateTime.now();
        Duration durationUntilSlot = Duration.between(now, appointment.getSlotDatetime());
        long hoursRemaining = durationUntilSlot.toHours();

        String refundStatus = "NO_PAYMENT_MADE";
        Optional<Payment> paymentOpt = paymentRepository.findByAppointmentId(appointment.getId());

        if (paymentOpt.isPresent() && paymentOpt.get().getStatus() == PaymentStatus.SUCCESS) {
            if (hoursRemaining >= fullRefundHours) {
                // Trigger full refund
                paymentService.processRefund(appointment.getId(), "Full refund: Cancelled " + hoursRemaining + " hours before appointment");
                refundStatus = "FULL_REFUND_PROCESSED";
            } else {
                refundStatus = "NO_REFUND_LATE_CANCELLATION (Cancelled < " + fullRefundHours + "h before slot)";
            }
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(reason);
        appointment.setRefundStatus(refundStatus);
        appointment = appointmentRepository.save(appointment);

        auditService.log(requestingUserId, "APPOINTMENT_CANCEL", "appointments", appointment.getId(),
                "Appointment cancelled. Reason: " + reason + ", Refund: " + refundStatus);

        return mapToDto(appointment);
    }

    @Transactional
    public AppointmentDto rescheduleAppointment(Long appointmentId, LocalDateTime newSlotDatetime, Long requestingUserId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        Optional<Appointment> conflicting = appointmentRepository.findConflictingSlotWithLock(
                appointment.getDoctor().getId(), newSlotDatetime);

        if (conflicting.isPresent() && !conflicting.get().getId().equals(appointment.getId())) {
            throw new ConflictException("Requested new slot is not available");
        }

        appointment.setSlotDatetime(newSlotDatetime);
        appointment = appointmentRepository.save(appointment);

        auditService.log(requestingUserId, "APPOINTMENT_RESCHEDULE", "appointments", appointment.getId(),
                "Rescheduled appointment to " + newSlotDatetime);

        return mapToDto(appointment);
    }

    @Transactional
    public AppointmentDto markPatientArrival(Long appointmentId, Long staffUserId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        appointment.setPatientArrivalMarked(true);
        appointment = appointmentRepository.save(appointment);

        auditService.log(staffUserId, "PATIENT_ARRIVAL_MARKED", "appointments", appointment.getId(), "Patient arrival checked in");
        return mapToDto(appointment);
    }

    public List<AppointmentDto> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientIdOrderBySlotDatetimeDesc(patientId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AppointmentDto> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderBySlotDatetimeDesc(doctorId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AppointmentDto getAppointmentById(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));
        return mapToDto(appointment);
    }

    public List<AppointmentDto> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Scheduled task running every 60 seconds to release expired holds
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanExpiredHolds() {
        Instant now = Instant.now();
        List<Appointment> expired = appointmentRepository.findExpiredPendingHolds(now);
        if (!expired.isEmpty()) {
            logger.info("Releasing {} expired slot holds", expired.size());
            for (Appointment appt : expired) {
                appt.setStatus(AppointmentStatus.CANCELLED);
                appt.setCancellationReason("Slot hold expired automatically after 10 minutes");
                appointmentRepository.save(appt);
                auditService.log(null, "SLOT_HOLD_EXPIRED", "appointments", appt.getId(), "Auto-released expired slot hold");
            }
        }
    }

    public AppointmentDto mapToDto(Appointment a) {
        AppointmentDto dto = new AppointmentDto();
        dto.setId(a.getId());
        dto.setPatientId(a.getPatient().getId());
        dto.setPatientName(a.getPatient().getName());
        dto.setPatientEmail(a.getPatient().getEmail());
        dto.setPatientPhone(a.getPatient().getPhone());
        dto.setDoctorId(a.getDoctor().getId());
        dto.setDoctorName(a.getDoctor().getUser().getName());
        dto.setDoctorSpecialization(a.getDoctor().getSpecialization());
        dto.setDepartmentName(a.getDoctor().getDepartment().getName());
        dto.setSlotDatetime(a.getSlotDatetime());
        dto.setStatus(a.getStatus());
        dto.setSlotHoldExpiry(a.getSlotHoldExpiry());
        dto.setConsultationFee(a.getDoctor().getConsultationFee());
        dto.setPatientArrivalMarked(a.getPatientArrivalMarked());
        dto.setCancellationReason(a.getCancellationReason());
        dto.setRefundStatus(a.getRefundStatus());
        dto.setCreatedAt(a.getCreatedAt());

        Optional<Payment> paymentOpt = paymentRepository.findByAppointmentId(a.getId());
        if (paymentOpt.isPresent()) {
            dto.setPaymentStatus(paymentOpt.get().getStatus());
            dto.setRazorpayOrderId(paymentOpt.get().getRazorpayOrderId());
        }

        boolean hasPrescription = prescriptionRepository.findByAppointmentId(a.getId()).isPresent();
        dto.setHasPrescription(hasPrescription);

        return dto;
    }
}
