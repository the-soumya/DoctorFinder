package com.healthportal.dto.payment;

import java.math.BigDecimal;

public class OrderCreationResponse {

    private String orderId;
    private Long amount; // in paise
    private String currency = "INR";
    private Long appointmentId;
    private String razorpayKeyId;
    private String doctorName;
    private BigDecimal consultationFee;
    private boolean mockMode;

    public OrderCreationResponse(String orderId, Long amount, Long appointmentId, String razorpayKeyId, String doctorName, BigDecimal consultationFee, boolean mockMode) {
        this.orderId = orderId;
        this.amount = amount;
        this.currency = "INR";
        this.appointmentId = appointmentId;
        this.razorpayKeyId = razorpayKeyId;
        this.doctorName = doctorName;
        this.consultationFee = consultationFee;
        this.mockMode = mockMode;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getRazorpayKeyId() {
        return razorpayKeyId;
    }

    public void setRazorpayKeyId(String razorpayKeyId) {
        this.razorpayKeyId = razorpayKeyId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public BigDecimal getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(BigDecimal consultationFee) {
        this.consultationFee = consultationFee;
    }

    public boolean isMockMode() {
        return mockMode;
    }

    public void setMockMode(boolean mockMode) {
        this.mockMode = mockMode;
    }
}
