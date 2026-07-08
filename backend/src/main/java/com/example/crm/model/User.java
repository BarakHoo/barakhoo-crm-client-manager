package com.example.crm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {
	@Id
	private UUID id;

	private String username;
	private String email;
	private String passwordHash;
	private boolean enabled;
	// requested role chosen at registration; actual roles assigned only on approval
	private String requestedRole;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@ManyToMany(fetch = FetchType.EAGER)
	@JoinTable(name = "user_roles",
			joinColumns = @JoinColumn(name = "user_id"),
			inverseJoinColumns = @JoinColumn(name = "role_id"))
	private Set<Role> roles;

	@PrePersist
	public void prePersist() {
		if (id == null) id = UUID.randomUUID();
		if (roles == null) roles = java.util.Set.of();
		if (requestedRole == null) requestedRole = "sales_agent";
		if (createdAt == null) createdAt = LocalDateTime.now();
	}

	// getters and setters
	public UUID getId() { return id; }
	public void setId(UUID id) { this.id = id; }
	public String getUsername() { return username; }
	public void setUsername(String username) { this.username = username; }
	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }
	public String getPasswordHash() { return passwordHash; }
	public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
	public boolean isEnabled() { return enabled; }
	public void setEnabled(boolean enabled) { this.enabled = enabled; }
	public String getRequestedRole() { return requestedRole; }
	public void setRequestedRole(String requestedRole) { this.requestedRole = requestedRole; }
	public Set<Role> getRoles() { return roles; }
	public void setRoles(Set<Role> roles) { this.roles = roles; }
	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
