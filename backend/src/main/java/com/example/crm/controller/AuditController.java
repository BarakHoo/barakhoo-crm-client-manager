package com.example.crm.controller;

import com.example.crm.model.AuditLog;
import com.example.crm.repository.AuditLogRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/audit")
public class AuditController {
	private final AuditLogRepository repo;

	public AuditController(AuditLogRepository repo) { this.repo = repo; }

	@PreAuthorize("hasAnyRole('agent_manager', 'big_boss')")
	@GetMapping("/client/{clientId}")
	public List<AuditLog> getForClient(@PathVariable UUID clientId) {
		return repo.findByTargetTypeAndTargetIdOrderByCreatedAtDesc("CLIENT", clientId);
	}

	@PreAuthorize("hasRole('big_boss')")
	@GetMapping("/user/{username}")
	public List<AuditLog> getForUser(@PathVariable String username) {
		return repo.findByUsernameOrderByCreatedAtDesc(username);
	}
}
