package com.example.crm.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "clients")
public class Client {
	@Id
	private UUID id;

	@Column(unique = true)
	private String code;

	@NotBlank(message = "Name is required")
	@Size(max = 100)
	private String name;

	@Size(max = 100)
	private String company;

	@Pattern(regexp = "^[0-9+\\- ()]{7,20}$", message = "Phone must be 7-20 characters and contain only digits, spaces, +, -, ()")
	private String phone;

	@Email(message = "Email must be valid")
	@Size(max = 200)
	private String email;

	private LocalDateTime lastContact;

	@Lob
	@Size(max = 1000)
	private String notes;

	// New per-note entity storage. Keep legacy `notes` string for backward compatibility/migration.
	@OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
	private java.util.List<Note> notesList = new java.util.ArrayList<>();

	@Enumerated(EnumType.STRING)
	private CallStatus status;

	@Size(max = 100)
	private String assignedAgentUsername;

	@PrePersist
	public void prePersist() {
		if (id == null) id = UUID.randomUUID();
		if (status == null) status = CallStatus.New;
		if (code == null || code.isBlank()) {
			// generate a short alphanumeric code
			this.code = "C-" + java.util.UUID.randomUUID().toString().substring(0, 8);
		}
	}

	// getters and setters
	public UUID getId() { return id; }
	public void setId(UUID id) { this.id = id; }
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
	public String getCompany() { return company; }
	public void setCompany(String company) { this.company = company; }
	public String getPhone() { return phone; }
	public void setPhone(String phone) { this.phone = phone; }
	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }
	public LocalDateTime getLastContact() { return lastContact; }
	public void setLastContact(LocalDateTime lastContact) { this.lastContact = lastContact; }
	public String getNotes() { return notes; }
	public void setNotes(String notes) { this.notes = notes; }

	public java.util.List<Note> getNotesList() { return notesList; }
	public void setNotesList(java.util.List<Note> notesList) { this.notesList = notesList; }
	public CallStatus getStatus() { return status; }
	public void setStatus(CallStatus status) { this.status = status; }
	public String getCode() { return code; }
	public void setCode(String code) { this.code = code; }
	public String getAssignedAgentUsername() { return assignedAgentUsername; }
	public void setAssignedAgentUsername(String assignedAgentUsername) { this.assignedAgentUsername = assignedAgentUsername; }
}
