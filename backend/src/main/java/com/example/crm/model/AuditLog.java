package com.example.crm.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
	@Id
	private UUID id;

	private String username; // who performed the action
	private String action; // e.g., NOTE_EDIT, NOTE_DELETE
	private String targetType; // e.g., CLIENT, NOTE
	private UUID targetId;
	private String details; // free text
	private LocalDateTime createdAt;

	@PrePersist
	public void prePersist() {
		if (id == null) id = UUID.randomUUID();
		if (createdAt == null) createdAt = LocalDateTime.now();
	}

	// getters/setters
	public UUID getId() { return id; }
	public void setId(UUID id) { this.id = id; }

	public String getUsername() { return username; }
	public void setUsername(String username) { this.username = username; }

	public String getAction() { return action; }
	public void setAction(String action) { this.action = action; }

	public String getTargetType() { return targetType; }
	public void setTargetType(String targetType) { this.targetType = targetType; }

	public UUID getTargetId() { return targetId; }
	public void setTargetId(UUID targetId) { this.targetId = targetId; }

	public String getDetails() { return details; }
	public void setDetails(String details) { this.details = details; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
