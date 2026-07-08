package com.example.crm.controller;

import com.example.crm.model.AuditLog;
import com.example.crm.repository.AuditLogRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/audit")
public class AuditController {
	private final AuditLogRepository repo;

	public AuditController(AuditLogRepository repo) { this.repo = repo; }

	@GetMapping("/client/{clientId}")
	public List<AuditLog> getForClient(@PathVariable UUID clientId) {
		return repo.findByTargetTypeAndTargetIdOrderByCreatedAtDesc("CLIENT", clientId);
	}

	@GetMapping("/user/{username}")
	public List<AuditLog> getForUser(@PathVariable String username) {
		return repo.findByUsernameOrderByCreatedAtDesc(username);
	}
}
