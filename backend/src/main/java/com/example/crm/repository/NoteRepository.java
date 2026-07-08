package com.example.crm.repository;

import com.example.crm.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NoteRepository extends JpaRepository<Note, UUID> {
	List<Note> findByClientIdOrderByCreatedAtDesc(UUID clientId);
}
