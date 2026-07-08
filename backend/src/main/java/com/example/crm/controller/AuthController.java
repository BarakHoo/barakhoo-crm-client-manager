package com.example.crm.controller;

import com.example.crm.model.AuditLog;
import com.example.crm.model.Role;
import com.example.crm.model.User;
import com.example.crm.repository.AuditLogRepository;
import com.example.crm.repository.RoleRepository;
import com.example.crm.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.example.crm.security.JwtUtil;
import java.util.stream.Collectors;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
	private final UserRepository userRepo;
	private final RoleRepository roleRepo;
	private final AuditLogRepository auditRepo;
	private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

	private final JwtUtil jwtUtil;

	public AuthController(UserRepository userRepo, RoleRepository roleRepo, JwtUtil jwtUtil, AuditLogRepository auditRepo) {
		this.userRepo = userRepo;
		this.roleRepo = roleRepo;
		this.jwtUtil = jwtUtil;
		this.auditRepo = auditRepo;
	}

	private void recordAuthAttempt(String username, String action, String details, HttpServletRequest request) {
		try {
			var audit = new AuditLog();
			audit.setUsername(username == null || username.isBlank() ? "anonymous" : username);
			audit.setAction(action);
			audit.setTargetType("USER");
			audit.setDetails(details + " ip=" + (request != null ? request.getRemoteAddr() : "unknown"));
			auditRepo.save(audit);
		} catch (Exception ex) {
			// swallow - auditing should not break auth flow
		}
	}

	@PostMapping("/register")
	public ResponseEntity<?> register(@RequestBody Map<String, String> body, HttpServletRequest request) {
		var username = body.getOrDefault("username", "").trim();
		var email = body.getOrDefault("email", "").trim();
		var password = body.getOrDefault("password", "");
		var requestedRole = body.getOrDefault("requestedRole", "sales_agent");

		if (username.isBlank() || email.isBlank() || password.isBlank()) {
			recordAuthAttempt(username, "AUTH_REGISTER", "missing fields", request);
			return ResponseEntity.badRequest().body("Missing fields");
		}
		if (userRepo.findByUsername(username).isPresent()) {
			recordAuthAttempt(username, "AUTH_REGISTER", "username exists", request);
			return ResponseEntity.status(409).body("Username exists");
		}
		if (userRepo.findByEmail(email).isPresent()) {
			recordAuthAttempt(username, "AUTH_REGISTER", "email exists", request);
			return ResponseEntity.status(409).body("Email exists");
		}

		var u = new User();
		u.setUsername(username);
		u.setEmail(email);
		u.setPasswordHash(encoder.encode(password));
		u.setEnabled(false); // pending approval
		u.setRequestedRole(requestedRole);
		userRepo.save(u);

		// For dev-only flow, no email sent. Admin will approve in UI.
		recordAuthAttempt(username, "AUTH_REGISTER", "registered - pending approval", request);
		return ResponseEntity.ok(Map.of("message", "registered", "userId", u.getId()));
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpServletRequest request) {
		var username = body.getOrDefault("username", "");
		var password = body.getOrDefault("password", "");
		var userOpt = userRepo.findByUsername(username);
		if (userOpt.isEmpty()) {
			recordAuthAttempt(username, "AUTH_LOGIN", "invalid credentials - user not found", request);
			return ResponseEntity.status(401).body("invalid credentials");
		}
		var user = userOpt.get();
		if (!user.isEnabled()) {
			recordAuthAttempt(username, "AUTH_LOGIN", "account not enabled", request);
			return ResponseEntity.status(403).body("account not enabled");
		}
		var encoder = new BCryptPasswordEncoder();
		if (!encoder.matches(password, user.getPasswordHash())) {
			recordAuthAttempt(username, "AUTH_LOGIN", "invalid credentials - bad password", request);
			return ResponseEntity.status(401).body("invalid credentials");
		}
		var roles = user.getRoles() == null ? java.util.List.<String>of() : user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList());
		var token = jwtUtil.generateToken(user.getUsername(), roles);
		recordAuthAttempt(username, "AUTH_LOGIN", "success", request);
		return ResponseEntity.ok(Map.of("token", token, "username", user.getUsername(), "roles", roles));
	}
}
