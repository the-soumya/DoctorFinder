package com.healthportal.controller;

import com.healthportal.dto.auth.*;
import com.healthportal.security.services.UserDetailsImpl;
import com.healthportal.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user registration, login, and JWT token refresh")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and return JWT access and refresh tokens")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @PostMapping("/signup")
    @Operation(summary = "Register a new user (Patient, Doctor, Pharmacist/Receptionist, Admin)")
    public ResponseEntity<JwtResponse> signup(@Valid @RequestBody SignupRequest signupRequest) {
        return ResponseEntity.ok(authService.signup(signupRequest));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh expired JWT access token using a valid refresh token")
    public ResponseEntity<TokenRefreshResponse> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @Autowired
    private com.healthportal.repository.UserRepository userRepository;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", userDetails.getId());
        response.put("name", userDetails.getName());
        response.put("email", userDetails.getUsername());
        response.put("role", userDetails.getRole());

        userRepository.findById(userDetails.getId()).ifPresent(user -> {
            response.put("phone", user.getPhone());
            response.put("age", user.getAge());
            response.put("gender", user.getGender());
            response.put("bloodGroup", user.getBloodGroup());
            response.put("emergencyContact", user.getEmergencyContact());
            response.put("address", user.getAddress());
        });

        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    @Operation(summary = "Update current authenticated user profile")
    public ResponseEntity<Map<String, Object>> updateCurrentUser(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Object> updates) {
        
        com.healthportal.entity.User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("name") && updates.get("name") != null) {
            user.setName(updates.get("name").toString());
        }
        if (updates.containsKey("phone")) {
            user.setPhone(updates.get("phone") != null ? updates.get("phone").toString() : null);
        }
        if (updates.containsKey("age") && updates.get("age") != null) {
            try {
                user.setAge(Integer.parseInt(updates.get("age").toString()));
            } catch (Exception ignored) {}
        }
        if (updates.containsKey("gender")) {
            user.setGender(updates.get("gender") != null ? updates.get("gender").toString() : null);
        }
        if (updates.containsKey("bloodGroup")) {
            user.setBloodGroup(updates.get("bloodGroup") != null ? updates.get("bloodGroup").toString() : null);
        }
        if (updates.containsKey("emergencyContact")) {
            user.setEmergencyContact(updates.get("emergencyContact") != null ? updates.get("emergencyContact").toString() : null);
        }
        if (updates.containsKey("address")) {
            user.setAddress(updates.get("address") != null ? updates.get("address").toString() : null);
        }

        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("phone", user.getPhone());
        response.put("age", user.getAge());
        response.put("gender", user.getGender());
        response.put("bloodGroup", user.getBloodGroup());
        response.put("emergencyContact", user.getEmergencyContact());
        response.put("address", user.getAddress());

        return ResponseEntity.ok(response);
    }
}
