package com.healthportal.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "pharmacy_doctor_slots")
public class PharmacyDoctorSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pharmacy_id", nullable = false)
    private Pharmacy pharmacy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "available_days", nullable = false, length = 100)
    private String availableDays; // e.g. "Mon, Wed, Fri" or "Tue, Thu, Sat" or "Everyday"

    @Column(name = "time_slot", nullable = false, length = 100)
    private String timeSlot; // e.g. "05:00 PM - 07:30 PM", "10:00 AM - 12:30 PM"

    @Column(name = "chamber_room", length = 50)
    private String chamberRoom = "Chamber 1";

    @Column(name = "consultation_fee")
    private BigDecimal consultationFee;

    @Column(name = "max_tokens")
    private Integer maxTokens = 20;

    public PharmacyDoctorSlot() {}

    public PharmacyDoctorSlot(Pharmacy pharmacy, Doctor doctor, String availableDays, String timeSlot, String chamberRoom, BigDecimal consultationFee, Integer maxTokens) {
        this.pharmacy = pharmacy;
        this.doctor = doctor;
        this.availableDays = availableDays;
        this.timeSlot = timeSlot;
        this.chamberRoom = chamberRoom != null ? chamberRoom : "Chamber 1";
        this.consultationFee = consultationFee != null ? consultationFee : doctor.getConsultationFee();
        this.maxTokens = maxTokens != null ? maxTokens : 20;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Pharmacy getPharmacy() {
        return pharmacy;
    }

    public void setPharmacy(Pharmacy pharmacy) {
        this.pharmacy = pharmacy;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public String getAvailableDays() {
        return availableDays;
    }

    public void setAvailableDays(String availableDays) {
        this.availableDays = availableDays;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    public String getChamberRoom() {
        return chamberRoom;
    }

    public void setChamberRoom(String chamberRoom) {
        this.chamberRoom = chamberRoom;
    }

    public BigDecimal getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(BigDecimal consultationFee) {
        this.consultationFee = consultationFee;
    }

    public Integer getMaxTokens() {
        return maxTokens;
    }

    public void setMaxTokens(Integer maxTokens) {
        this.maxTokens = maxTokens;
    }
}
