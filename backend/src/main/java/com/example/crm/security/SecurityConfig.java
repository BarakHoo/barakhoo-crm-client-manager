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
	// No-op patch: trigger rebuild
	@Value("${app.jwt.secret:ReplaceWithASecretKeyOf32charsMinimum}")
	private String jwtSecret;

	@Value("${app.jwt.expiration-ms:86400000}")
	private long jwtExpirationMs;

	@Bean
	public JwtUtil jwtUtil() {
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
		var configuration = new CorsConfiguration();
		configuration.setAllowedOriginPatterns(List.of("*"));
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList("*"));
		configuration.setAllowCredentials(true);
		var source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	// A global CorsFilter to ensure CORS headers are present even if security short-circuits
	@Bean
	public CorsFilter corsFilter() {
		var config = new CorsConfiguration();
		config.setAllowedOriginPatterns(List.of("*"));
		config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		config.setAllowedHeaders(Arrays.asList("*"));
		config.setAllowCredentials(true);
		var source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return new CorsFilter(source);
	}
}
