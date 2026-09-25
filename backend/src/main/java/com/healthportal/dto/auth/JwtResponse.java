package com.healthportal.dto.auth;

import com.healthportal.entity.Role;

public class JwtResponse {

    private String token;
    private String refreshToken;
    private String type = "Bearer";
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String phone;
    private Long doctorId;
    private String address;
    private Boolean isApproved = true;
    private String message;

    public JwtResponse(String accessToken, String refreshToken, Long id, String name, String email, Role role, String phone, Long doctorId) {
        this(accessToken, refreshToken, id, name, email, role, phone, doctorId, null);
    }

    public JwtResponse(String accessToken, String refreshToken, Long id, String name, String email, Role role, String phone, Long doctorId, String address) {
        this(accessToken, refreshToken, id, name, email, role, phone, doctorId, address, true, null);
    }

    public JwtResponse(String accessToken, String refreshToken, Long id, String name, String email, Role role, String phone, Long doctorId, String address, Boolean isApproved, String message) {
        this.token = accessToken;
        this.refreshToken = refreshToken;
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.phone = phone;
        this.doctorId = doctorId;
        this.address = address;
        this.isApproved = isApproved;
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Boolean getIsApproved() {
        return isApproved;
    }

    public void setIsApproved(Boolean isApproved) {
        this.isApproved = isApproved;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
