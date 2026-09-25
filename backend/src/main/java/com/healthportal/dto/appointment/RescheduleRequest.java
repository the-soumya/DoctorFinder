package com.healthportal.dto.appointment;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class RescheduleRequest {

    @NotNull(message = "New slot datetime is required")
    @Future(message = "New slot datetime must be in the future")
    private LocalDateTime newSlotDatetime;

    public LocalDateTime getNewSlotDatetime() {
        return newSlotDatetime;
    }

    public void setNewSlotDatetime(LocalDateTime newSlotDatetime) {
        this.newSlotDatetime = newSlotDatetime;
    }
}
