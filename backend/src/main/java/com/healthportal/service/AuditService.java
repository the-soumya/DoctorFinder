package com.healthportal.service;

import com.healthportal.entity.AuditLog;
import com.healthportal.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(Long userId, String action, String tableAffected, Long recordId, String details) {
        try {
            AuditLog auditLog = new AuditLog(userId, action, tableAffected, recordId, details);
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            // Log failure to console, never break business flow
            System.err.println("Failed to write audit log: " + e.getMessage());
        }
    }
}
