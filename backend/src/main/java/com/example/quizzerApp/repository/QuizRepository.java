package com.example.quizzerApp.repository;

import com.example.quizzerApp.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository interface for Quiz data access operations.
 * Provides methods to query and manipulate Quiz data in the database.
 */
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    /**
     * Finds all quizzes that are marked as published.
     * Published quizzes are available for users to take.
     * 
     * @return List of published quizzes
     */
    List<Quiz> findByPublishedTrue();
}