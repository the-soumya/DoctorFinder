package com.healthportal.repository;

import com.healthportal.entity.AiInteractionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiInteractionLogRepository extends JpaRepository<AiInteractionLog, Long> {
    List<AiInteractionLog> findAllByOrderByTimestampDesc();
    List<AiInteractionLog> findByUserIdOrderByTimestampDesc(Long userId);
}
