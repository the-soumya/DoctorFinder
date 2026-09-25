package com.healthportal.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "pharmacies")
public class Pharmacy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "license_number", length = 100)
    private String licenseNumber;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(length = 80)
    private String city = "Uttarpara";

    @Column(length = 80)
    private String district = "Hooghly";

    @Column(length = 80)
    private String state = "West Bengal";

    @Column(length = 100)
    private String locality;

    private Double latitude;
    private Double longitude;

    @Column(length = 30)
    private String phone;

    @Column(name = "operating_hours", length = 100)
    private String operatingHours = "08:00 AM - 10:00 PM";

    @Column(name = "is_approved", nullable = false)
    private Boolean isApproved = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Pharmacy() {}

    public Pharmacy(String name, String licenseNumber, User user, String address, String city, String district, String state, String locality, Double latitude, Double longitude, String phone, String operatingHours, Boolean isApproved) {
        this.name = name;
        this.licenseNumber = licenseNumber;
        this.user = user;
        this.address = address;
        this.city = city;
        this.district = district;
        this.state = state;
        this.locality = locality;
        this.latitude = latitude;
        this.longitude = longitude;
        this.phone = phone;
        this.operatingHours = operatingHours;
        this.isApproved = isApproved != null ? isApproved : true;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getOperatingHours() {
        return operatingHours;
    }

    public void setOperatingHours(String operatingHours) {
        this.operatingHours = operatingHours;
    }

    public Boolean getIsApproved() {
        return isApproved;
    }

    public void setIsApproved(Boolean isApproved) {
        this.isApproved = isApproved;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
