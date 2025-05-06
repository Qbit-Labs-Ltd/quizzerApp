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

    /**
     * Finds all quizzes by category ID.
     * 
     * @param categoryId ID of the category
     * @return List of quizzes in the specified category
     */
    List<Quiz> findByCategoryId(Long categoryId);

    /**
     * Finds all published quizzes by category ID.
     * Published quizzes are available for users to take.
     * 
     * @param categoryId ID of the category
     * @return List of published quizzes in the specified category
     */
    List<Quiz> findByCategoryIdAndPublishedTrue(Long categoryId);
}