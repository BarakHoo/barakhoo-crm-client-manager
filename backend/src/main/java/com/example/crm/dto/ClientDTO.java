package com.example.crm.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

public class ClientDTO {
	public UUID id;
	public String name;
	public String company;
	public String phone; // may be null or masked for display
	public String phoneForCall; // always contains actual phone for click-to-call functionality
	public String email;
	public String status;
	public LocalDateTime lastContact;
	public String code;
	public List<NoteDTO> notesList;
	public String assignedAgentUsername;

	public ClientDTO() {}

	public static class NoteDTO {
		public UUID id;
		public String content;
		public LocalDateTime createdAt;

		public NoteDTO() {}
		public NoteDTO(UUID id, String content, LocalDateTime createdAt) {
			this.id = id;
			this.content = content;
			this.createdAt = createdAt;
		}
	}
}
