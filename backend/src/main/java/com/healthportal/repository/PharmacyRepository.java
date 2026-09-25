package com.healthportal.repository;

import com.healthportal.entity.Pharmacy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PharmacyRepository extends JpaRepository<Pharmacy, Long> {
    Optional<Pharmacy> findByUserId(Long userId);
    List<Pharmacy> findByIsApproved(Boolean isApproved);
    List<Pharmacy> findByCityIgnoreCase(String city);
    List<Pharmacy> findByLocalityIgnoreCase(String locality);
}
