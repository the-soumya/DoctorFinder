package com.healthportal.repository;

import com.healthportal.entity.PharmacyDoctorSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PharmacyDoctorSlotRepository extends JpaRepository<PharmacyDoctorSlot, Long> {
    List<PharmacyDoctorSlot> findByPharmacyId(Long pharmacyId);
    List<PharmacyDoctorSlot> findByDoctorId(Long doctorId);
}
