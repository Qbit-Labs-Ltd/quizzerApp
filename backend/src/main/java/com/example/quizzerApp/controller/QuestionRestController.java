package com.example.quizzerApp.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.quizzerApp.exception.ResourceNotFoundException;
import com.example.quizzerApp.model.AnswerOption;
import com.example.quizzerApp.model.Question;
import com.example.quizzerApp.repository.QuestionRepository;
import com.example.quizzerApp.repository.QuizRepository;

/**
 * REST Controller for handling Question-related operations.
 * Provides endpoints for retrieving, updating, and deleting questions.
 */
// @CrossOrigin(origins = { "http://localhost:5173",
// "https://quizzerapp-1knb.onrender.com" })
@RestController
@RequestMapping("/api/questions")
public class QuestionRestController {

    /**
     * Repository for Question entity operations
     */
    @Autowired
    private QuestionRepository questionRepository;

    /**
     * Repository for Quiz entity operations
     */
    @Autowired
    private QuizRepository quizRepository;

    /**
     * Retrieves a specific question by its ID
     * 
     * @param id The ID of the question to retrieve
     * @return The question with the specified ID
     * @throws ResourceNotFoundException if no question exists with the given ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id " + id));
        return ResponseEntity.ok(question);
    }

    /**
     * Updates an existing question
     * 
     * @param id              The ID of the question to update
     * @param questionDetails The updated question data
     * @return The updated question
     * @throws ResourceNotFoundException if no question exists with the given ID
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuestion(@PathVariable Long id, @RequestBody Question questionDetails) {
        try {
            System.out.println("Updating question: " + id);
            System.out.println("Answer options count: " +
                    (questionDetails.getAnswers() != null ? questionDetails.getAnswers().size() : 0));

            Question question = questionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Question not found with id " + id));

            question.setContent(questionDetails.getContent());
            question.setDifficulty(questionDetails.getDifficulty());

            // Handle answer options if they are present in the request
            if (questionDetails.getAnswers() != null && !questionDetails.getAnswers().isEmpty()) {
                // Clear existing answers and re-add them all
                question.getAnswers().clear();

                // Ensure at least one answer is marked as correct
                boolean hasCorrectAnswer = false;
                for (AnswerOption answerOption : questionDetails.getAnswers()) {
                    if (answerOption.isCorrect()) {
                        hasCorrectAnswer = true;
                    }

                    // Create a new answer option to avoid ID conflicts
                    AnswerOption newOption = new AnswerOption();
                    newOption.setText(answerOption.getText());
                    newOption.setCorrect(answerOption.isCorrect());
                    newOption.setQuestion(question);
                    question.getAnswers().add(newOption);
                }

                // Validate that at least one answer is marked as correct
                if (!hasCorrectAnswer && !question.getAnswers().isEmpty()) {
                    return ResponseEntity
                            .status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "At least one answer must be marked as correct"));
                }
            }

            Question updatedQuestion = questionRepository.save(question);
            return ResponseEntity.ok(updatedQuestion);
        } catch (Exception e) {
            System.err.println("Error updating question: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Failed to update question",
                            "message", e.getMessage()));
        }
    }

    /**
     * Deletes a question by its ID
     * 
     * @param id The ID of the question to delete
     * @return Empty response with status 200 if successful
     * @throws ResourceNotFoundException if no question exists with the given ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id " + id));

        questionRepository.delete(question);
        return ResponseEntity.ok().build();
    }
}
