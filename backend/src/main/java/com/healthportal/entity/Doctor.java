package com.healthportal.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "doctors", indexes = {
    @Index(name = "idx_doctor_user", columnList = "user_id"),
    @Index(name = "idx_doctor_department", columnList = "department_id"),
    @Index(name = "idx_doctor_specialization", columnList = "specialization"),
    @Index(name = "idx_doctor_location", columnList = "state, district, city")
})
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false, length = 120)
    private String specialization;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(length = 80)
    private String city = "Bengaluru";

    @Column(length = 80)
    private String district = "Bengaluru Urban";

    @Column(length = 80)
    private String state = "West Bengal";

    @Column(length = 120)
    private String locality;

    @Column(name = "clinic_address", length = 250)
    private String clinicAddress;

    @Column(length = 150)
    private String degree = "MBBS, MD";

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(name = "consultation_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal consultationFee = new BigDecimal("500.00");

    @Column
    private Double rating = 4.8;

    @Column(name = "experience_years")
    private Integer experienceYears = 5;

    @Column(columnDefinition = "TEXT")
    private String bio;

    public Doctor() {}

    public Doctor(User user, Department department, String specialization, Double latitude, Double longitude, BigDecimal consultationFee, Double rating, Integer experienceYears, String bio) {
        this.user = user;
        this.department = department;
        this.specialization = specialization;
        this.latitude = latitude;
        this.longitude = longitude;
        this.consultationFee = consultationFee;
        this.rating = rating;
        this.experienceYears = experienceYears;
        this.bio = bio;
    }

    public Doctor(User user, Department department, String specialization, Double latitude, Double longitude, BigDecimal consultationFee, Double rating, Integer experienceYears, String bio, String degree, String photoUrl) {
        this.user = user;
        this.department = department;
        this.specialization = specialization;
        this.latitude = latitude;
        this.longitude = longitude;
        this.consultationFee = consultationFee;
        this.rating = rating;
        this.experienceYears = experienceYears;
        this.bio = bio;
        this.degree = degree;
        this.photoUrl = photoUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public BigDecimal getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(BigDecimal consultationFee) {
        this.consultationFee = consultationFee;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public Doctor(User user, Department department, String specialization, Double latitude, Double longitude, BigDecimal consultationFee, Double rating, Integer experienceYears, String bio, String degree, String photoUrl, String city, String district, String state) {
        this.user = user;
        this.department = department;
        this.specialization = specialization;
        this.latitude = latitude;
        this.longitude = longitude;
        this.consultationFee = consultationFee;
        this.rating = rating;
        this.experienceYears = experienceYears;
        this.bio = bio;
        this.degree = degree;
        this.photoUrl = photoUrl;
        this.city = city;
        this.district = district;
        this.state = state;
    }

    public Doctor(User user, Department department, String specialization, Double latitude, Double longitude, BigDecimal consultationFee, Double rating, Integer experienceYears, String bio, String degree, String photoUrl, String city, String district, String state, String locality, String clinicAddress) {
        this.user = user;
        this.department = department;
        this.specialization = specialization;
        this.latitude = latitude;
        this.longitude = longitude;
        this.consultationFee = consultationFee;
        this.rating = rating;
        this.experienceYears = experienceYears;
        this.bio = bio;
        this.degree = degree;
        this.photoUrl = photoUrl;
        this.city = city;
        this.district = district;
        this.state = state;
        this.locality = locality;
        this.clinicAddress = clinicAddress;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getLocality() {
        return locality;
    }

    public void setLocality(String locality) {
        this.locality = locality;
    }

    public String getClinicAddress() {
        return clinicAddress;
    }

    public void setClinicAddress(String clinicAddress) {
        this.clinicAddress = clinicAddress;
    }
}
