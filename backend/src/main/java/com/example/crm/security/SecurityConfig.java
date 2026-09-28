package com.example.crm.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

import java.util.Arrays;
import org.springframework.web.filter.CorsFilter;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
	@Value("${app.jwt.secret:}")
	private String jwtSecret;

	@Value("${app.jwt.expiration-ms:86400000}")
	private long jwtExpirationMs;

	@Value("${app.cors.allowed-origins:}")
	private String allowedOrigins;

	@Bean
	public JwtUtil jwtUtil() {
		if (jwtSecret == null || jwtSecret.trim().length() < 32) {
			throw new IllegalStateException(
				"app.jwt.secret must be set to a value of at least 32 characters. "
				+ "Refusing to start with a missing or weak JWT signing secret.");
		}
		return new JwtUtil(jwtSecret, jwtExpirationMs);
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		var jwtFilter = new JwtAuthenticationFilter(jwtUtil());
		var reqLog = new RequestLoggingFilter();
		http.cors().and()
			.csrf().disable()
			.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
			.authorizeHttpRequests()
			.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
			.requestMatchers("/api/auth/**", "/", "/index.html", "/static/**", "/favicon.ico").permitAll()
			.anyRequest().authenticated();
		// Log requests early to see Authorization header presence
		http.addFilterBefore(reqLog, UsernamePasswordAuthenticationFilter.class);
		http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		return buildCorsSource();
	}

	// A global CorsFilter to ensure CORS headers are present even if security short-circuits
	@Bean
	public CorsFilter corsFilter() {
		return new CorsFilter(buildCorsSource());
	}

	private UrlBasedCorsConfigurationSource buildCorsSource() {
		var configuration = new CorsConfiguration();
		var origins = parseOrigins();
		if (origins.isEmpty()) {
			// No cross-origin access configured: same-origin only (production is proxied via Caddy).
			configuration.setAllowedOrigins(List.of());
		} else {
			configuration.setAllowedOrigins(origins);
			configuration.setAllowCredentials(true);
		}
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
		var source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	private List<String> parseOrigins() {
		if (allowedOrigins == null || allowedOrigins.isBlank()) return List.of();
		return Arrays.stream(allowedOrigins.split(","))
			.map(String::trim)
			.filter(s -> !s.isEmpty())
			.toList();
	}
}
