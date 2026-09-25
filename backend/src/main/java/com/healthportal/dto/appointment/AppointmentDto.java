package com.healthportal.dto.appointment;

import com.healthportal.entity.AppointmentStatus;
import com.healthportal.entity.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

public class AppointmentDto {

    private Long id;
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private String departmentName;
    private LocalDateTime slotDatetime;
    private AppointmentStatus status;
    private Instant slotHoldExpiry;
    private BigDecimal consultationFee;
    private PaymentStatus paymentStatus;
    private String razorpayOrderId;
    private Boolean patientArrivalMarked;
    private Boolean hasPrescription;
    private String cancellationReason;
    private String refundStatus;
    private Instant createdAt;

    public AppointmentDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getPatientEmail() {
        return patientEmail;
    }

    public void setPatientEmail(String patientEmail) {
        this.patientEmail = patientEmail;
    }

    public String getPatientPhone() {
        return patientPhone;
    }

    public void setPatientPhone(String patientPhone) {
        this.patientPhone = patientPhone;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getDoctorSpecialization() {
        return doctorSpecialization;
    }

    public void setDoctorSpecialization(String doctorSpecialization) {
        this.doctorSpecialization = doctorSpecialization;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
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

    public BigDecimal getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(BigDecimal consultationFee) {
        this.consultationFee = consultationFee;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public Boolean getPatientArrivalMarked() {
        return patientArrivalMarked;
    }

    public void setPatientArrivalMarked(Boolean patientArrivalMarked) {
        this.patientArrivalMarked = patientArrivalMarked;
    }

    public Boolean getHasPrescription() {
        return hasPrescription;
    }

    public void setHasPrescription(Boolean hasPrescription) {
        this.hasPrescription = hasPrescription;
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
