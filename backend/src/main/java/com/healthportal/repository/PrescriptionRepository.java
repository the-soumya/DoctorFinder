package com.healthportal.repository;

import com.healthportal.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    Optional<Prescription> findByAppointmentId(Long appointmentId);
    List<Prescription> findByAppointmentPatientId(Long patientId);
    List<Prescription> findByDispensed(Boolean dispensed);
}
