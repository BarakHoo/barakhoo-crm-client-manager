package com.example.crm.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;

import java.security.Key;
import java.util.Date;
import java.util.List;

public class JwtUtil {
	private final Key key;
	private final long expirationMs;

	public JwtUtil(String secret, long expirationMs) {
		this.key = Keys.hmacShaKeyFor(secret.getBytes());
		this.expirationMs = expirationMs;
	}

	public String generateToken(String username, List<String> roles) {
		var now = new Date();
		return Jwts.builder()
				.setSubject(username)
				.claim("roles", roles)
				.setIssuedAt(now)
				.setExpiration(new Date(now.getTime() + expirationMs))
				.signWith(key, SignatureAlgorithm.HS256)
				.compact();
	}

	public Claims parseClaims(String token) {
		return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
	}
}
