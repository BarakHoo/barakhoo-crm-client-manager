package com.example.crm.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {
	@ExceptionHandler(DuplicateClientException.class)
	public ResponseEntity<String> handleDuplicate(DuplicateClientException ex) {
		return ResponseEntity.status(409).body(ex.getMessage());
	}
}
