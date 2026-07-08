package com.example.crm.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notes")
public class Note {
	@Id
	private UUID id;

	@Lob
	private String content;

	private LocalDateTime createdAt;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "client_id")
	@JsonIgnore
	private Client client;

	@PrePersist
	public void prePersist() {
		if (id == null) id = UUID.randomUUID();
		if (createdAt == null) createdAt = LocalDateTime.now();
	}

	// getters/setters
	public UUID getId() { return id; }
	public void setId(UUID id) { this.id = id; }
	public String getContent() { return content; }
	public void setContent(String content) { this.content = content; }
	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
	public Client getClient() { return client; }
	public void setClient(Client client) { this.client = client; }
}
