package com.example.quizzerApp.repository;

import com.example.quizzerApp.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository interface for Question data access operations.
 * Provides methods to query and manipulate Question data in the database.
 */
public interface QuestionRepository extends JpaRepository<Question, Long> {

    /**
     * Finds all questions belonging to a specific quiz.
     * 
     * @param quizId The ID of the quiz to retrieve questions for
     * @return List of questions associated with the specified quiz
     */
    List<Question> findByQuizId(Long quizId);

    /**
     * Counts the number of questions belonging to a specific quiz.
     * 
     * @param quizId The ID of the quiz to count questions for
     * @return The number of questions associated with the specified quiz
     */
    int countByQuizId(Long quizId);
}