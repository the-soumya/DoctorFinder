package com.healthportal.controller;

import com.healthportal.dto.payment.OrderCreationResponse;
import com.healthportal.dto.payment.PaymentVerificationRequest;
import com.healthportal.entity.Payment;
import com.healthportal.repository.PaymentRepository;
import com.healthportal.security.services.UserDetailsImpl;
import com.healthportal.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments", description = "Endpoints for Razorpay order generation and cryptographic signature verification")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PaymentRepository paymentRepository;

    @PostMapping("/create-order")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Create Razorpay Order for held appointment slot")
    public ResponseEntity<OrderCreationResponse> createOrder(
            @RequestParam Long appointmentId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(paymentService.createOrder(appointmentId, userDetails.getId()));
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Verify Razorpay payment signature (HMAC-SHA256) and mark appointment confirmed")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @Valid @RequestBody PaymentVerificationRequest request) {
        boolean verified = paymentService.verifyPaymentSignature(request);
        return ResponseEntity.ok(Map.of("success", verified, "message", "Payment verified and appointment confirmed!"));
    }

    @GetMapping("/appointment/{appointmentId}")
    @Operation(summary = "Get payment record for an appointment")
    public ResponseEntity<Payment> getPaymentByAppointment(@PathVariable Long appointmentId) {
        return paymentRepository.findByAppointmentId(appointmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
