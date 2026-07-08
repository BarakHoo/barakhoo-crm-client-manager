package com.example.crm.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "roles")
public class Role {
	@Id
	private UUID id;

	private String name;

	@PrePersist
	public void prePersist() {
		if (id == null) id = UUID.randomUUID();
	}

	// getters/setters
	public UUID getId() { return id; }
	public void setId(UUID id) { this.id = id; }
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
}
