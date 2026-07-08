package com.example.crm.repository;

import com.example.crm.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {
	Optional<Role> findByName(String name);
}
