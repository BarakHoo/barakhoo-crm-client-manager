package com.example.crm.repository;

import com.example.crm.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
	List<AuditLog> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(String targetType, UUID targetId);
	List<AuditLog> findByUsernameOrderByCreatedAtDesc(String username);
}
