package com.example.crm.service;

import com.example.crm.model.CallStatus;
import com.example.crm.model.Client;
import com.example.crm.repository.ClientRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.example.crm.exception.DuplicateClientException;
import com.example.crm.model.Note;
import com.example.crm.repository.NoteRepository;
import com.example.crm.model.AuditLog;
import com.example.crm.repository.AuditLogRepository;

@Service
public class ClientService {
	private final ClientRepository repo;
	private final NoteRepository noteRepo;
	private final AuditLogRepository auditRepo;

	public ClientService(ClientRepository repo, NoteRepository noteRepo, AuditLogRepository auditRepo) { this.repo = repo; this.noteRepo = noteRepo; this.auditRepo = auditRepo; }

	public List<Client> getAll() { return repo.findAll(); }

	public Optional<Client> get(UUID id) { return repo.findById(id); }
	public Optional<Client> getByCode(String code) { return repo.findByCode(code); }

	public Client create(Client client) { return repo.save(client); }

	public Client createWithDuplicateCheck(Client client) {
		var name = client.getName() != null ? client.getName().trim() : null;
		var company = client.getCompany() != null ? client.getCompany().trim() : null;
		var email = client.getEmail() != null ? client.getEmail().trim() : null;
		var phone = client.getPhone() != null ? client.getPhone().trim() : null;

		if (email != null && !email.isBlank() && repo.existsByEmailIgnoreCase(email)) {
			throw new DuplicateClientException("Client with this email already exists");
		}
		if (phone != null && !phone.isBlank() && repo.existsByPhone(phone)) {
			throw new DuplicateClientException("Client with this phone already exists");
		}
		if (name != null && !name.isBlank() && company != null && !company.isBlank() && repo.existsByNameIgnoreCaseAndCompanyIgnoreCase(name, company)) {
			throw new DuplicateClientException("Client with this name and company already exists");
		}

		return repo.save(client);
	}

	public Optional<Client> update(UUID id, Client updated) {
		return repo.findById(id).map(existing -> {
			var name = updated.getName() != null ? updated.getName().trim() : null;
			var company = updated.getCompany() != null ? updated.getCompany().trim() : null;
			var email = updated.getEmail() != null ? updated.getEmail().trim() : null;
			var phone = updated.getPhone() != null ? updated.getPhone().trim() : null;

			if (email != null && !email.isBlank() && repo.existsByEmailIgnoreCaseAndIdNot(email, id)) {
				throw new DuplicateClientException("Client with this email already exists");
			}
			if (phone != null && !phone.isBlank() && repo.existsByPhoneAndIdNot(phone, id)) {
				throw new DuplicateClientException("Client with this phone already exists");
			}
			if (name != null && !name.isBlank() && company != null && !company.isBlank() && repo.existsByNameIgnoreCaseAndCompanyIgnoreCaseAndIdNot(name, company, id)) {
				throw new DuplicateClientException("Client with this name and company already exists");
			}

			existing.setName(updated.getName());
			existing.setCompany(updated.getCompany());
			existing.setPhone(updated.getPhone());
			existing.setEmail(updated.getEmail());
			existing.setNotes(updated.getNotes());
			existing.setStatus(updated.getStatus());
			existing.setLastContact(updated.getLastContact());
			return repo.save(existing);
		});
	}

	public void delete(UUID id) { repo.deleteById(id); }

	public void deleteByCode(String code) {
		repo.findByCode(code).ifPresent(c -> repo.deleteById(c.getId()));
	}

	public List<Client> search(String term) {
		if (term == null || term.isBlank()) return getAll();
		return repo.findByNameContainingIgnoreCaseOrCompanyContainingIgnoreCaseOrPhoneContainingOrEmailContainingIgnoreCase(
				term, term, term, term);
	}

	public Optional<Client> appendNote(UUID id, String note) {
		// Create a Note entity and attach to client
		return repo.findById(id).map(c -> {
			var n = new Note();
			n.setContent(note);
			n.setClient(c);
			noteRepo.save(n);
			c.setLastContact(LocalDateTime.now());
			return repo.save(c);
		});
	}

	public Note addNote(UUID clientId, String content) {
		var client = repo.findById(clientId).orElseThrow();
		var n = new Note();
		n.setContent(content);
		n.setClient(client);
		client.setLastContact(LocalDateTime.now());
		repo.save(client);
		var saved = noteRepo.save(n);
		// audit - record user from security context if available
		var audit = new AuditLog();
		try {
			var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
			audit.setUsername(auth != null ? String.valueOf(auth.getPrincipal()) : "system");
		} catch (Exception ex) {
			audit.setUsername("system");
		}
		audit.setAction("NOTE_CREATE");
		audit.setTargetType("CLIENT");
		audit.setTargetId(clientId);
		audit.setDetails("Created note id=" + saved.getId());
		auditRepo.save(audit);
		return saved;
	}

	public Optional<Note> updateNote(UUID noteId, String content) {
		return noteRepo.findById(noteId).map(n -> {
			n.setContent(content);
			var saved = noteRepo.save(n);
			var audit = new AuditLog();
			try {
				var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
				audit.setUsername(auth != null ? String.valueOf(auth.getPrincipal()) : "system");
			} catch (Exception ex) { audit.setUsername("system"); }
			audit.setAction("NOTE_EDIT");
			audit.setTargetType("NOTE");
			audit.setTargetId(noteId);
			audit.setDetails("Edited note id=" + noteId);
			auditRepo.save(audit);
			return saved;
		});
	}

	public void deleteNote(UUID noteId) {
		// capture client id for audit
		noteRepo.findById(noteId).ifPresent(n -> {
			var clientId = n.getClient() != null ? n.getClient().getId() : null;
			noteRepo.deleteById(noteId);
			var audit = new AuditLog();
			try { var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication(); audit.setUsername(auth != null ? String.valueOf(auth.getPrincipal()) : "system"); } catch (Exception ex) { audit.setUsername("system"); }
			audit.setAction("NOTE_DELETE");
			audit.setTargetType("NOTE");
			audit.setTargetId(noteId);
			audit.setDetails("Deleted note id=" + noteId + (clientId != null ? " for client=" + clientId : ""));
			auditRepo.save(audit);
		});
	}

	public java.util.List<Note> getNotesForClient(UUID clientId) {
		return noteRepo.findByClientIdOrderByCreatedAtDesc(clientId);
	}

	public Optional<Client> updateStatus(UUID id, CallStatus status) {
		return repo.findById(id).map(c -> {
			c.setStatus(status);
			c.setLastContact(LocalDateTime.now());
			var saved = repo.save(c);
			// audit
			var audit = new AuditLog();
			try { var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication(); audit.setUsername(auth != null ? String.valueOf(auth.getPrincipal()) : "system"); } catch (Exception ex) { audit.setUsername("system"); }
			audit.setAction("STATUS_UPDATE");
			audit.setTargetType("CLIENT");
			audit.setTargetId(c.getId());
			audit.setDetails("Status changed to=" + status.name());
			auditRepo.save(audit);
			return saved;
		});
	}

	public Optional<Client> updateStatusByCode(String code, CallStatus status) {
		return repo.findByCode(code).map(c -> {
			c.setStatus(status);
			c.setLastContact(LocalDateTime.now());
			var saved = repo.save(c);
			var audit = new AuditLog();
			try { var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication(); audit.setUsername(auth != null ? String.valueOf(auth.getPrincipal()) : "system"); } catch (Exception ex) { audit.setUsername("system"); }
			audit.setAction("STATUS_UPDATE");
			audit.setTargetType("CLIENT");
			audit.setTargetId(c.getId());
			audit.setDetails("Status changed to=" + status.name());
			auditRepo.save(audit);
			return saved;
		});
	}

	public Optional<Client> assignClient(UUID clientId, String assignedAgentUsername) {
		return repo.findById(clientId).map(c -> {
			c.setAssignedAgentUsername(assignedAgentUsername);
			var saved = repo.save(c);
			// audit
			var audit = new AuditLog();
			try { 
				var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication(); 
				audit.setUsername(auth != null ? String.valueOf(auth.getPrincipal()) : "system"); 
			} catch (Exception ex) { audit.setUsername("system"); }
			audit.setAction("CLIENT_ASSIGN");
			audit.setTargetType("CLIENT");
			audit.setTargetId(clientId);
			audit.setDetails("Assigned to agent: " + (assignedAgentUsername != null ? assignedAgentUsername : "unassigned"));
			auditRepo.save(audit);
			return saved;
		});
	}
}
