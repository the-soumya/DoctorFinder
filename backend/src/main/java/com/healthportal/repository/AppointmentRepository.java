package com.healthportal.repository;

import com.healthportal.entity.Appointment;
import com.healthportal.entity.AppointmentStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientIdOrderBySlotDatetimeDesc(Long patientId);

    List<Appointment> findByDoctorIdOrderBySlotDatetimeDesc(Long doctorId);

    List<Appointment> findByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);

    List<Appointment> findByDoctorIdAndSlotDatetimeBetween(Long doctorId, LocalDateTime start, LocalDateTime end);

    // Concurrency-safe check with pessimistic lock (SELECT ... FOR UPDATE)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.slotDatetime = :slotDatetime AND a.status IN ('PENDING', 'CONFIRMED')")
    Optional<Appointment> findConflictingSlotWithLock(@Param("doctorId") Long doctorId, @Param("slotDatetime") LocalDateTime slotDatetime);

    @Query("SELECT a FROM Appointment a WHERE a.status = 'PENDING' AND a.slotHoldExpiry IS NOT NULL AND a.slotHoldExpiry < :now")
    List<Appointment> findExpiredPendingHolds(@Param("now") Instant now);

    // Analytics queries for Admin Dashboard
    @Query("SELECT dept.name AS department, COUNT(a.id) AS count " +
           "FROM Appointment a JOIN a.doctor d JOIN d.department dept " +
           "GROUP BY dept.name")
    List<Map<String, Object>> countAppointmentsByDepartment();

    @Query("SELECT u.name AS doctorName, COUNT(a.id) AS appointmentCount " +
           "FROM Appointment a JOIN a.doctor d JOIN d.user u " +
           "GROUP BY u.name")
    List<Map<String, Object>> countAppointmentsByDoctor();

    @Query("SELECT a.status AS status, COUNT(a.id) AS count FROM Appointment a GROUP BY a.status")
    List<Map<String, Object>> countAppointmentsByStatus();
}
