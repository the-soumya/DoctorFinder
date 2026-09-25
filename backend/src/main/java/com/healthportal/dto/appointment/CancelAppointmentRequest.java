package com.healthportal.dto.appointment;

import jakarta.validation.constraints.NotBlank;

public class CancelAppointmentRequest {

    @NotBlank(message = "Cancellation reason is required")
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
