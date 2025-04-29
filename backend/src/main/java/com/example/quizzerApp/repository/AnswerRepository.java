package com.example.quizzerApp.repository;

import com.example.quizzerApp.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository interface for Answer data access operations.
 * Provides methods to query and manipulate Answer data in the database.
 */
public interface AnswerRepository extends JpaRepository<Answer, Long> {

    /**
     * Finds all answers submitted by a specific user.
     * 
     * @param userId The ID of the user
     * @return List of answers from the specified user
     */
    List<Answer> findByUserId(String userId);

    /**
     * Finds all answers for a specific question.
     * 
     * @param questionId The ID of the question
     * @return List of answers for the specified question
     */
    List<Answer> findByQuestionId(Long questionId);

    /**
     * Finds all answers for questions in a specific quiz.
     * 
     * @param quizId The ID of the quiz
     * @return List of answers for questions in the specified quiz
     */
    List<Answer> findByQuestionQuizId(Long quizId);

    /**
     * Finds all answers submitted by a specific user for a specific quiz.
     * 
     * @param userId The ID of the user
     * @param quizId The ID of the quiz
     * @return List of answers from the specified user for the specified quiz
     */
    List<Answer> findByUserIdAndQuestionQuizId(String userId, Long quizId);
}
