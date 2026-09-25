package com.healthportal.dto.appointment;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class HoldSlotRequest {

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Slot datetime is required")
    @Future(message = "Slot datetime must be in the future")
    private LocalDateTime slotDatetime;

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public LocalDateTime getSlotDatetime() {
        return slotDatetime;
    }

    public void setSlotDatetime(LocalDateTime slotDatetime) {
        this.slotDatetime = slotDatetime;
    }
}
