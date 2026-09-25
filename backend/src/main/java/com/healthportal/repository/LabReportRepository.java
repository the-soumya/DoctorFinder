package com.healthportal.repository;

import com.healthportal.entity.LabReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabReportRepository extends JpaRepository<LabReport, Long> {
    List<LabReport> findByPatientIdOrderByUploadedAtDesc(Long patientId);
}
