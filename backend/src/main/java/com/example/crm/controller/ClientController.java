package com.example.crm.controller;

import com.example.crm.model.CallStatus;
import com.example.crm.model.Client;
import com.example.crm.service.ClientService;
import com.example.crm.dto.ClientDTO;
import com.example.crm.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/clients")
public class ClientController {
	private final ClientService service;
	private final UserRepository userRepository;

	public ClientController(ClientService service, UserRepository userRepository) { 
		this.service = service;
		this.userRepository = userRepository;
	}

	@GetMapping
	public List<ClientDTO> all(@RequestParam(required = false) String search) {
		var auth = SecurityContextHolder.getContext().getAuthentication();
		var username = auth != null ? auth.getName() : null;
		var roles = auth == null ? java.util.List.<String>of() : auth.getAuthorities().stream().map(a -> a.getAuthority()).toList();
		boolean isSales = roles.contains("ROLE_sales_agent") && !roles.contains("ROLE_agent_manager") && !roles.contains("ROLE_big_boss");

		// Filter clients based on role
		var allClients = service.search(search);
		if (isSales) {
			// Sales agents only see clients assigned to them
			allClients = allClients.stream()
				.filter(c -> username != null && username.equals(c.getAssignedAgentUsername()))
				.toList();
		}

		return allClients.stream().map(c -> toDto(c, isSales)).toList();
	}

	@GetMapping("/{id}")
	public ResponseEntity<ClientDTO> get(@PathVariable UUID id) {
		var auth = SecurityContextHolder.getContext().getAuthentication();
		var username = auth != null ? auth.getName() : null;
		var roles = auth == null ? java.util.List.<String>of() : auth.getAuthorities().stream().map(a -> a.getAuthority()).toList();
		boolean isSales = roles.contains("ROLE_sales_agent") && !roles.contains("ROLE_agent_manager") && !roles.contains("ROLE_big_boss");

		var clientOpt = service.get(id);
		if (clientOpt.isEmpty()) return ResponseEntity.notFound().build();

		var client = clientOpt.get();
		// Sales agents can only access their assigned clients
		if (isSales && (username == null || !username.equals(client.getAssignedAgentUsername()))) {
			return ResponseEntity.status(403).build();
		}

		return ResponseEntity.ok(toDto(client, isSales));
	}

	@GetMapping("/code/{code}")
	public ResponseEntity<ClientDTO> getByCode(@PathVariable String code) {
		var auth = SecurityContextHolder.getContext().getAuthentication();
		var username = auth != null ? auth.getName() : null;
		var roles = auth == null ? java.util.List.<String>of() : auth.getAuthorities().stream().map(a -> a.getAuthority()).toList();
		boolean isSales = roles.contains("ROLE_sales_agent") && !roles.contains("ROLE_agent_manager") && !roles.contains("ROLE_big_boss");

		var clientOpt = service.getByCode(code);
		if (clientOpt.isEmpty()) return ResponseEntity.notFound().build();

		var client = clientOpt.get();
		// Sales agents can only access their assigned clients
		if (isSales && (username == null || !username.equals(client.getAssignedAgentUsername()))) {
			return ResponseEntity.status(403).build();
		}

		return ResponseEntity.ok(toDto(client, isSales));
	}

	@PreAuthorize("hasAnyRole('agent_manager', 'big_boss')")
	@DeleteMapping("/code/{code}")
	public ResponseEntity<Void> deleteByCode(@PathVariable String code) {
		service.deleteByCode(code);
		return ResponseEntity.noContent().build();
	}

	@PreAuthorize("hasAnyRole('agent_manager', 'big_boss')")
	@PostMapping
	public ResponseEntity<ClientDTO> create(@Valid @RequestBody Client client) {
		var created = service.createWithDuplicateCheck(client);
		return ResponseEntity.ok(toDto(created, false));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ClientDTO> update(@PathVariable UUID id, @Valid @RequestBody Client client) {
		// Enforce access control: sales agents may only update their own assigned clients.
		var existingOpt = service.get(id);
		if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();
		if (!canAccessClient(existingOpt.get())) return ResponseEntity.status(403).build();
		return service.update(id, client).map(c -> {
			var auth = SecurityContextHolder.getContext().getAuthentication();
			var roles = auth == null ? java.util.List.<String>of() : auth.getAuthorities().stream().map(a -> a.getAuthority()).toList();
			boolean isSales = roles.contains("ROLE_sales_agent") && roles.size() == 1;
			return toDto(c, isSales);
		}).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
	}

	@PreAuthorize("hasAnyRole('agent_manager', 'big_boss')")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable UUID id) {
		service.delete(id);
		return ResponseEntity.noContent().build();
	}

	@PatchMapping("/{id}/notes")
	public ResponseEntity<Client> appendNotes(@PathVariable UUID id, @RequestBody Map<String, String> body) {
		var note = body.getOrDefault("note", "");
		if (note.isBlank()) return ResponseEntity.badRequest().build();
		// keep backward-compatible behavior: create a Note entity
		try {
			var clientOpt = service.get(id);
			if (clientOpt.isEmpty()) return ResponseEntity.notFound().build();
			if (!canAccessClient(clientOpt.get())) return ResponseEntity.status(403).build();
			service.addNote(id, note);
			return ResponseEntity.ok().build();
		} catch (Exception ex) {
			return ResponseEntity.notFound().build();
		}
	}

	@PatchMapping("/code/{code}/notes")
	public ResponseEntity<Client> appendNotesByCode(@PathVariable String code, @RequestBody Map<String, String> body) {
		var note = body.getOrDefault("note", "");
		if (note.isBlank()) return ResponseEntity.badRequest().build();
		try {
			var clientOpt = service.getByCode(code);
			if (clientOpt.isEmpty()) return ResponseEntity.notFound().build();
			if (!canAccessClient(clientOpt.get())) return ResponseEntity.status(403).build();
			service.addNote(clientOpt.get().getId(), note);
			return ResponseEntity.ok().build();
		} catch (Exception ex) {
			return ResponseEntity.notFound().build();
		}
	}

	@PostMapping("/{id}/notes")
	public ResponseEntity<?> createNote(@PathVariable UUID id, @RequestBody Map<String, String> body) {
		var note = body.getOrDefault("note", "");
		if (note.isBlank()) return ResponseEntity.badRequest().build();
		try {
			var clientOpt = service.get(id);
			if (clientOpt.isEmpty()) return ResponseEntity.notFound().build();
			if (!canAccessClient(clientOpt.get())) return ResponseEntity.status(403).build();
			var created = service.addNote(id, note);
			return ResponseEntity.ok(created);
		} catch (Exception ex) {
			return ResponseEntity.notFound().build();
		}
	}

	@PostMapping("/code/{code}/notes")
	public ResponseEntity<?> createNoteByCode(@PathVariable String code, @RequestBody Map<String, String> body) {
		var note = body.getOrDefault("note", "");
		if (note.isBlank()) return ResponseEntity.badRequest().build();
		try {
			var clientOpt = service.getByCode(code);
			if (clientOpt.isEmpty()) return ResponseEntity.notFound().build();
			if (!canAccessClient(clientOpt.get())) return ResponseEntity.status(403).build();
			var created = service.addNote(clientOpt.get().getId(), note);
			return ResponseEntity.ok(created);
		} catch (Exception ex) {
			return ResponseEntity.notFound().build();
		}
	}

	@PatchMapping("/notes/{noteId}")
	public ResponseEntity<?> updateNote(@PathVariable UUID noteId, @RequestBody Map<String, String> body) {
		var content = body.getOrDefault("note", "");
		if (content.isBlank()) return ResponseEntity.badRequest().build();
		return service.updateNote(noteId, content).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
	}

	@DeleteMapping("/notes/{noteId}")
	public ResponseEntity<Void> deleteNote(@PathVariable UUID noteId) {
		service.deleteNote(noteId);
		return ResponseEntity.noContent().build();
	}

	@PatchMapping("/{id}/status")
	public ResponseEntity<Client> updateStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
		var s = body.getOrDefault("status", "");
		try {
			var status = CallStatus.valueOf(s);
			var clientOpt = service.get(id);
			if (clientOpt.isEmpty()) return ResponseEntity.notFound().build();
			if (!canAccessClient(clientOpt.get())) return ResponseEntity.status(403).build();
			return service.updateStatus(id, status).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.badRequest().build();
		}
	}

	@PatchMapping("/code/{code}/status")
	public ResponseEntity<Client> updateStatusByCode(@PathVariable String code, @RequestBody Map<String, String> body) {
		var s = body.getOrDefault("status", "");
		try {
			var status = CallStatus.valueOf(s);
			var clientOpt = service.getByCode(code);
			if (clientOpt.isEmpty()) return ResponseEntity.notFound().build();
			if (!canAccessClient(clientOpt.get())) return ResponseEntity.status(403).build();
			return service.updateStatusByCode(code, status).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.badRequest().build();
		}
	}

	@PreAuthorize("hasAnyRole('agent_manager', 'big_boss')")
	@PatchMapping("/{id}/assign")
	public ResponseEntity<ClientDTO> assignClient(@PathVariable UUID id, @RequestBody Map<String, String> body) {
		var assignedUsername = body.get("assignedAgentUsername");
		return service.assignClient(id, assignedUsername)
			.map(c -> toDto(c, false))
			.map(ResponseEntity::ok)
			.orElseGet(() -> ResponseEntity.notFound().build());
	}

	@PreAuthorize("hasAnyRole('agent_manager', 'big_boss')")
	@GetMapping("/agents")
	public ResponseEntity<List<String>> getAvailableAgents() {
		// Return usernames of all enabled users who have sales_agent role
		var agents = userRepository.findAll().stream()
			.filter(u -> u.isEnabled())
			.filter(u -> u.getRoles() != null && u.getRoles().stream()
				.anyMatch(r -> "sales_agent".equals(r.getName())))
			.map(u -> u.getUsername())
			.sorted()
			.toList();
		return ResponseEntity.ok(agents);
	}

	/**
	 * Helper method to check if current user can access a client.
	 * Sales agents can only access clients assigned to them.
	 * Managers and big bosses can access all clients.
	 */
	private boolean canAccessClient(Client client) {
		var auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null) return false;

		var username = auth.getName();
		var roles = auth.getAuthorities().stream().map(a -> a.getAuthority()).toList();
		boolean isSales = roles.contains("ROLE_sales_agent") 
			&& !roles.contains("ROLE_agent_manager") 
			&& !roles.contains("ROLE_big_boss");

		if (isSales) {
			return username != null && username.equals(client.getAssignedAgentUsername());
		}
		return true;
	}

	private ClientDTO toDto(Client c, boolean maskPhone) {
		var dto = new ClientDTO();
		dto.id = c.getId();
		dto.name = c.getName();
		dto.company = c.getCompany();
		dto.email = c.getEmail();
		dto.status = c.getStatus() != null ? c.getStatus().name() : null;
		dto.lastContact = c.getLastContact();
		dto.code = c.getCode();
		dto.assignedAgentUsername = c.getAssignedAgentUsername();
		// Always provide phoneForCall for click-to-call functionality
		dto.phoneForCall = c.getPhone();
		if (maskPhone) {
			// keep phone hidden for display; only provide click-to-call behavior on frontend
			dto.phone = null;
		} else {
			dto.phone = c.getPhone();
		}
		// Populate notesList from Note entities
		dto.notesList = service.getNotesForClient(c.getId()).stream()
			.map(n -> new ClientDTO.NoteDTO(n.getId(), n.getContent(), n.getCreatedAt()))
			.toList();
		return dto;
	}
}
