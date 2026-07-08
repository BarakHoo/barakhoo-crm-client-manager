package com.example.crm.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class RequestLoggingFilter extends OncePerRequestFilter {
	private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
		try {
			var auth = request.getHeader("Authorization");
			var present = auth != null && !auth.isBlank();
			var masked = present ? (auth.length() > 20 ? auth.substring(0,10) + "..." : "[present]") : "[none]";
			log.info("Incoming {} {} from {} Authorization={}", request.getMethod(), request.getRequestURI(), request.getRemoteAddr(), masked);
		} catch (Exception ex) {
			// ignore logging failures
		}
		filterChain.doFilter(request, response);
	}
}
