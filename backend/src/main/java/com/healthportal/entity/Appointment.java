package com.healthportal.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments", indexes = {
    @Index(name = "idx_appointment_patient", columnList = "patient_id"),
    @Index(name = "idx_appointment_doctor", columnList = "doctor_id"),
    @Index(name = "idx_appointment_slot", columnList = "slot_datetime"),
    @Index(name = "idx_appointment_status", columnList = "status")
})
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "slot_datetime", nullable = false)
    private LocalDateTime slotDatetime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Column(name = "slot_hold_expiry")
    private Instant slotHoldExpiry;

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    @Column(name = "patient_arrival_marked")
    private Boolean patientArrivalMarked = false;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "refund_status")
    private String refundStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Appointment() {}

    public Appointment(User patient, Doctor doctor, LocalDateTime slotDatetime, AppointmentStatus status, Instant slotHoldExpiry) {
        this.patient = patient;
        this.doctor = doctor;
        this.slotDatetime = slotDatetime;
        this.status = status;
        this.slotHoldExpiry = slotHoldExpiry;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getPatient() {
        return patient;
    }

    public void setPatient(User patient) {
        this.patient = patient;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public LocalDateTime getSlotDatetime() {
        return slotDatetime;
    }

    public void setSlotDatetime(LocalDateTime slotDatetime) {
        this.slotDatetime = slotDatetime;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }

    public Instant getSlotHoldExpiry() {
        return slotHoldExpiry;
    }

    public void setSlotHoldExpiry(Instant slotHoldExpiry) {
        this.slotHoldExpiry = slotHoldExpiry;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public Boolean getPatientArrivalMarked() {
        return patientArrivalMarked;
    }

    public void setPatientArrivalMarked(Boolean patientArrivalMarked) {
        this.patientArrivalMarked = patientArrivalMarked;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public String getRefundStatus() {
        return refundStatus;
    }

    public void setRefundStatus(String refundStatus) {
        this.refundStatus = refundStatus;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
