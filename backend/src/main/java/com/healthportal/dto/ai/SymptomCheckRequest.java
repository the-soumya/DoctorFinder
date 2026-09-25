package com.healthportal.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SymptomCheckRequest {

    @NotBlank(message = "Symptoms description is required")
    @Size(min = 5, message = "Please provide more details about your symptoms")
    private String symptoms;

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }
}
