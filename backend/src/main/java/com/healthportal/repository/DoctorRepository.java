package com.healthportal.repository;

import com.healthportal.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByUserId(Long userId);

    List<Doctor> findByDepartmentId(Long departmentId);

    List<Doctor> findBySpecializationContainingIgnoreCase(String specialization);

    @Query(value = """
        SELECT d.*, 
        (6371 * acos(least(1.0, greatest(-1.0, 
            cos(radians(:latitude)) * cos(radians(d.latitude)) * 
            cos(radians(d.longitude) - radians(:longitude)) + 
            sin(radians(:latitude)) * sin(radians(d.latitude))
        )))) AS distance_km
        FROM doctors d
        JOIN departments dept ON d.department_id = dept.id
        WHERE (:specialization IS NULL OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :specialization, '%')))
          AND (:departmentId IS NULL OR d.department_id = :departmentId)
          AND (:minRating IS NULL OR d.rating >= :minRating)
        ORDER BY distance_km ASC
        """, nativeQuery = true)
    List<Doctor> findDoctorsNearMe(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("specialization") String specialization,
            @Param("departmentId") Long departmentId,
            @Param("minRating") Double minRating
    );
}
