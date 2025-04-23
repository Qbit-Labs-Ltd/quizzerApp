package com.example.quizzerApp.repository;

import com.example.quizzerApp.model.AnswerOption;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository interface for AnswerOption data access operations.
 * Provides standard methods to query and manipulate AnswerOption data in the
 * database.
 * Extends JpaRepository to inherit basic CRUD operations.
 */
public interface AnswerOptionRepository extends JpaRepository<AnswerOption, Long> {
}