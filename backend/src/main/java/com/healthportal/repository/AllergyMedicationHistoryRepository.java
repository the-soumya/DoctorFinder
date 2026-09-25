package com.healthportal.repository;

import com.healthportal.entity.AllergyMedicationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllergyMedicationHistoryRepository extends JpaRepository<AllergyMedicationHistory, Long> {
    List<AllergyMedicationHistory> findByPatientId(Long patientId);
}
