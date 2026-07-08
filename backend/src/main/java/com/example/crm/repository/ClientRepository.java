package com.example.crm.repository;

import com.example.crm.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ClientRepository extends JpaRepository<Client, UUID> {
	List<Client> findByNameContainingIgnoreCaseOrCompanyContainingIgnoreCaseOrPhoneContainingOrEmailContainingIgnoreCase(
			String name, String company, String phone, String email);

	boolean existsByEmailIgnoreCase(String email);
	boolean existsByPhone(String phone);
	boolean existsByNameIgnoreCaseAndCompanyIgnoreCase(String name, String company);

	boolean existsByEmailIgnoreCaseAndIdNot(String email, java.util.UUID id);
	boolean existsByPhoneAndIdNot(String phone, java.util.UUID id);
	boolean existsByNameIgnoreCaseAndCompanyIgnoreCaseAndIdNot(String name, String company, java.util.UUID id);

	java.util.Optional<Client> findByCode(String code);
	boolean existsByCode(String code);
}
