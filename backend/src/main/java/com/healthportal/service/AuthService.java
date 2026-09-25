package com.healthportal.service;

import com.healthportal.dto.auth.*;
import com.healthportal.entity.*;
import com.healthportal.exception.BadRequestException;
import com.healthportal.exception.ResourceNotFoundException;
import com.healthportal.repository.DepartmentRepository;
import com.healthportal.repository.DoctorRepository;
import com.healthportal.repository.UserRepository;
import com.healthportal.security.jwt.JwtUtils;
import com.healthportal.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuditService auditService;

    @Autowired
    private com.healthportal.repository.PharmacyRepository pharmacyRepository;

    @Transactional
    public JwtResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!Boolean.TRUE.equals(user.getIsApproved())) {
            throw new com.healthportal.exception.ForbiddenException(
                "Your account is pending verification and approval by the hospital administrator. Please wait for hospital administration approval before logging in."
            );
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", userDetails.getRole().name());
        claims.put("name", userDetails.getName());

        String jwt = jwtUtils.generateJwtToken(authentication, claims);
        String refreshToken = jwtUtils.generateRefreshToken(userDetails.getUsername());

        Long doctorId = null;
        if (user.getRole() == Role.ROLE_DOCTOR) {
            doctorId = doctorRepository.findByUserId(user.getId())
                    .map(Doctor::getId)
                    .orElse(null);
        }

        auditService.log(user.getId(), "AUTH_LOGIN", "users", user.getId(), "User logged in: " + user.getEmail());

        return new JwtResponse(jwt, refreshToken, user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getPhone(), doctorId, user.getAddress(), true, "Login successful");
    }

    @Transactional
    public JwtResponse signup(SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new BadRequestException("Email is already registered: " + signupRequest.getEmail());
        }

        boolean requiresApproval = (signupRequest.getRole() == Role.ROLE_DOCTOR || signupRequest.getRole() == Role.ROLE_PHARMACIST_RECEPTIONIST);

        User user = new User(
                signupRequest.getName(),
                signupRequest.getEmail(),
                passwordEncoder.encode(signupRequest.getPassword()),
                signupRequest.getRole(),
                signupRequest.getPhone()
        );
        user.setIsApproved(!requiresApproval);

        user = userRepository.save(user);

        Long doctorId = null;
        if (user.getRole() == Role.ROLE_DOCTOR) {
            Department department = null;
            if (signupRequest.getDepartmentId() != null) {
                department = departmentRepository.findById(signupRequest.getDepartmentId()).orElse(null);
            }
            if (department == null) {
                department = departmentRepository.findAll().stream().findFirst()
                        .orElseGet(() -> departmentRepository.save(new Department("General Medicine", "Primary healthcare & family medicine")));
            }

            Doctor doctor = new Doctor(
                    user,
                    department,
                    signupRequest.getSpecialization() != null ? signupRequest.getSpecialization() : "General Physician",
                    signupRequest.getLatitude() != null ? signupRequest.getLatitude() : 22.6730,
                    signupRequest.getLongitude() != null ? signupRequest.getLongitude() : 88.3340,
                    signupRequest.getConsultationFee() != null ? signupRequest.getConsultationFee() : new BigDecimal("500.00"),
                    4.8,
                    signupRequest.getExperienceYears() != null ? signupRequest.getExperienceYears() : 5,
                    signupRequest.getBio() != null ? signupRequest.getBio() : "Experienced healthcare specialist committed to patient wellness.",
                    "MBBS, MD",
                    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
                    "Uttarpara",
                    "Hooghly",
                    "West Bengal",
                    "Uttarpara Central",
                    "Main Clinic, Uttarpara"
            );
            doctor = doctorRepository.save(doctor);
            doctorId = doctor.getId();
        } else if (user.getRole() == Role.ROLE_PHARMACIST_RECEPTIONIST) {
            Pharmacy pharmacy = new Pharmacy(
                    user.getName(),
                    "WB-LIC-" + user.getId(),
                    user,
                    user.getAddress() != null ? user.getAddress() : "GT Road, Uttarpara, Hooghly",
                    "Uttarpara",
                    "Hooghly",
                    "West Bengal",
                    "Uttarpara GT Road",
                    22.6710,
                    88.3520,
                    user.getPhone() != null ? user.getPhone() : "+91 98300 11223",
                    "08:00 AM - 10:00 PM",
                    false
            );
            pharmacyRepository.save(pharmacy);
        }

        if (requiresApproval) {
            auditService.log(user.getId(), "AUTH_SIGNUP_PENDING_APPROVAL", "users", user.getId(), "Registered new " + user.getRole() + " awaiting admin approval: " + user.getEmail());
            return new JwtResponse(null, null, user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getPhone(), doctorId, user.getAddress(), false, "Registration submitted successfully! Your account is pending verification and approval by the hospital administrator before you can log in.");
        }

        auditService.log(user.getId(), "AUTH_SIGNUP", "users", user.getId(), "Registered new user with role " + user.getRole());

        // Generate tokens for approved users (e.g. patients)
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("name", user.getName());

        String jwt = jwtUtils.generateTokenFromUsername(user.getEmail(), claims, 86400000);
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

        return new JwtResponse(jwt, refreshToken, user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getPhone(), doctorId, user.getAddress(), true, "Registration successful");
    }

    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();
        if (jwtUtils.validateJwtToken(requestRefreshToken)) {
            String email = jwtUtils.getUserNameFromJwtToken(requestRefreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

            Map<String, Object> claims = new HashMap<>();
            claims.put("role", user.getRole().name());
            claims.put("name", user.getName());

            String newAccessToken = jwtUtils.generateTokenFromUsername(user.getEmail(), claims, 86400000);
            return new TokenRefreshResponse(newAccessToken, requestRefreshToken);
        }
        throw new BadRequestException("Invalid or expired refresh token");
    }
}
