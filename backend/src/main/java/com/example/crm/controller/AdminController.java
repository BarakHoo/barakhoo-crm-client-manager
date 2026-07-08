package com.example.crm.controller;

import com.example.crm.model.Role;
import com.example.crm.model.User;
import com.example.crm.repository.RoleRepository;
import com.example.crm.model.AuditLog;
import com.example.crm.repository.AuditLogRepository;
import com.example.crm.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/admin")
public class AdminController {
	private final UserRepository userRepo;
	private final RoleRepository roleRepo;
	private final AuditLogRepository auditRepo;

	public AdminController(UserRepository userRepo, RoleRepository roleRepo, AuditLogRepository auditRepo) { this.userRepo = userRepo; this.roleRepo = roleRepo; this.auditRepo = auditRepo; }

	@PreAuthorize("hasRole('big_boss')")
	@GetMapping("/pending")
	public List<User> pending() {
		// return users that are not enabled (pending approval)
		return userRepo.findAll().stream().filter(u -> !u.isEnabled()).toList();
	}

	@PreAuthorize("hasRole('big_boss')")
	@PostMapping("/approve/{userId}")
	public ResponseEntity<?> approve(@PathVariable UUID userId) {
		var userOpt = userRepo.findById(userId);
		if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
		var u = userOpt.get();
		// assign role based on requestedRole
		var roleName = Optional.ofNullable(u.getRequestedRole()).orElse("sales_agent");
		var role = roleRepo.findByName(roleName).orElseGet(() -> {
			var r = new Role(); r.setName(roleName); roleRepo.save(r); return r; });
		u.setRoles(new java.util.HashSet<>(Set.of(role)));
		u.setEnabled(true);
		userRepo.save(u);
		// audit
		try {
			var audit = new AuditLog();
			audit.setUsername("system");
			audit.setAction("ADMIN_APPROVE");
			audit.setTargetType("USER");
			audit.setTargetId(userId);
			audit.setDetails("Approved user " + u.getUsername());
			auditRepo.save(audit);
		} catch (Exception ex) { /* swallow */ }
		return ResponseEntity.ok(Map.of("message","approved"));
	}

	@PreAuthorize("hasRole('big_boss')")
	@PostMapping("/deny/{userId}")
	public ResponseEntity<?> deny(@PathVariable UUID userId) {
		var userOpt = userRepo.findById(userId);
		if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
		var user = userOpt.get();
		userRepo.deleteById(userId);
		try {
			var audit = new AuditLog();
			audit.setUsername("system");
			audit.setAction("ADMIN_DENY");
			audit.setTargetType("USER");
			audit.setTargetId(userId);
			audit.setDetails("Denied user " + user.getUsername());
			auditRepo.save(audit);
		} catch (Exception ex) { /* swallow */ }
		return ResponseEntity.ok(Map.of("message","denied"));
	}

	@PreAuthorize("hasRole('big_boss')")
	@GetMapping("/users")
	public List<Map<String, Object>> allUsers() {
		// Get current user's username from security context
		var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
		var currentUsername = auth != null ? auth.getName() : null;

		// Find the first big_boss (earliest created user with big_boss role)
		var firstBigBossOpt = userRepo.findAll().stream()
			.filter(User::isEnabled)
			.filter(u -> u.getRoles() != null && u.getRoles().stream()
				.anyMatch(r -> "big_boss".equals(r.getName())))
			.min(java.util.Comparator.comparing(
				u -> u.getCreatedAt() != null ? u.getCreatedAt() : java.time.LocalDateTime.MAX
			));
		var firstBigBossUsername = firstBigBossOpt.map(User::getUsername).orElse(null);

		// return all enabled users with their roles and metadata
		return userRepo.findAll().stream()
			.filter(User::isEnabled)
			.map(u -> {
				Map<String, Object> map = new java.util.HashMap<>();
				map.put("id", u.getId());
				map.put("username", u.getUsername());
				map.put("email", u.getEmail());
				map.put("enabled", u.isEnabled());
				var roleNames = u.getRoles().stream().map(Role::getName).toList();
				map.put("roles", roleNames);
				map.put("isSelf", currentUsername != null && currentUsername.equals(u.getUsername()));
				map.put("isFirstBigBoss", firstBigBossUsername != null && firstBigBossUsername.equals(u.getUsername()));
				map.put("isBigBoss", roleNames.contains("big_boss"));
				return map;
			})
			.toList();
	}

	@PreAuthorize("hasRole('big_boss')")
	@DeleteMapping("/users/{userId}")
	public ResponseEntity<?> deleteUser(@PathVariable UUID userId) {
		var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
		var currentUsername = auth != null ? auth.getName() : null;

		var userOpt = userRepo.findById(userId);
		if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
		var user = userOpt.get();

		// Prevent self-deletion
		if (currentUsername != null && currentUsername.equals(user.getUsername())) {
			return ResponseEntity.status(403).body(Map.of("error", "Cannot delete yourself"));
		}

		userRepo.deleteById(userId);
		try {
			var audit = new AuditLog();
			audit.setUsername(currentUsername != null ? currentUsername : "system");
			audit.setAction("ADMIN_DELETE_USER");
			audit.setTargetType("USER");
			audit.setTargetId(userId);
			audit.setDetails("Deleted user " + user.getUsername());
			auditRepo.save(audit);
		} catch (Exception ex) { /* swallow */ }
		return ResponseEntity.ok(Map.of("message","deleted"));
	}

	@PreAuthorize("hasRole('big_boss')")
	@PostMapping("/users/{userId}/disable")
	public ResponseEntity<?> disableUser(@PathVariable UUID userId) {
		var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
		var currentUsername = auth != null ? auth.getName() : null;

		var userOpt = userRepo.findById(userId);
		if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
		var user = userOpt.get();

		// Prevent self-disable
		if (currentUsername != null && currentUsername.equals(user.getUsername())) {
			return ResponseEntity.status(403).body(Map.of("error", "Cannot disable yourself"));
		}

		// Check if target user is a big_boss
		boolean targetIsBigBoss = user.getRoles() != null && user.getRoles().stream()
			.anyMatch(r -> "big_boss".equals(r.getName()));

		if (targetIsBigBoss) {
			// Find the first big_boss
			var firstBigBossOpt = userRepo.findAll().stream()
				.filter(User::isEnabled)
				.filter(u -> u.getRoles() != null && u.getRoles().stream()
					.anyMatch(r -> "big_boss".equals(r.getName())))
				.min(java.util.Comparator.comparing(
					u -> u.getCreatedAt() != null ? u.getCreatedAt() : java.time.LocalDateTime.MAX
				));

			var firstBigBossUsername = firstBigBossOpt.map(User::getUsername).orElse(null);

			// Only the first big_boss can disable other big_bosses
			if (currentUsername == null || !currentUsername.equals(firstBigBossUsername)) {
				return ResponseEntity.status(403).body(Map.of("error", "Only the first big_boss can disable other big_bosses"));
			}
		}

		user.setEnabled(false);
		userRepo.save(user);
		try {
			var audit = new AuditLog();
			audit.setUsername(currentUsername != null ? currentUsername : "system");
			audit.setAction("ADMIN_DISABLE_USER");
			audit.setTargetType("USER");
			audit.setTargetId(userId);
			audit.setDetails("Disabled user " + user.getUsername());
			auditRepo.save(audit);
		} catch (Exception ex) { /* swallow */ }
		return ResponseEntity.ok(Map.of("message","disabled"));
	}
}
