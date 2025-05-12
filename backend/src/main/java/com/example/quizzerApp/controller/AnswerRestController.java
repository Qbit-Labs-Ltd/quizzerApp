package com.example.quizzerApp.controller;

import com.example.quizzerApp.dto.AnswerResponseDTO;
import com.example.quizzerApp.dto.AnswerSubmissionDTO;
import com.example.quizzerApp.exception.ResourceNotFoundException;
import com.example.quizzerApp.model.Answer;
import com.example.quizzerApp.model.AnswerOption;
import com.example.quizzerApp.model.Question;
import com.example.quizzerApp.repository.AnswerOptionRepository;
import com.example.quizzerApp.repository.AnswerRepository;
import com.example.quizzerApp.repository.QuestionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * REST Controller for handling Answer-related operations.
 * Provides endpoints for submitting and retrieving answers to quiz questions.
 */
@RestController
@RequestMapping("/api/answers")
@CrossOrigin(origins = { "http://localhost:5173", "https://quizzerapp-1knb.onrender.com" })
@Tag(name = "Answer", description = "The Answer API. Contains operations for submitting and retrieving quiz answers.")
public class AnswerRestController {

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AnswerOptionRepository answerOptionRepository;

    /**
     * Global exception handler for validation errors
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    /**
     * Submits an answer for a question
     * 
     * @param answerSubmissionDTO The answer data to save
     * @return Feedback on the submitted answer, including whether it was correct
     */
    @Operation(summary = "Submit an answer to a question", description = "Submits an answer and returns feedback on correctness")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Answer successfully submitted", content = @Content(schema = @Schema(implementation = AnswerResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "404", description = "Question or answer option not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping
    public ResponseEntity<?> submitAnswer(@Valid @RequestBody AnswerSubmissionDTO answerSubmissionDTO) {
        try {
            // Validate question exists
            Question question = questionRepository.findById(answerSubmissionDTO.getQuestionId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Question not found with id " + answerSubmissionDTO.getQuestionId()));

            // Validate answer option exists and belongs to the question
            AnswerOption selectedOption = answerOptionRepository.findById(answerSubmissionDTO.getAnswerOptionId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Answer option not found with id " + answerSubmissionDTO.getAnswerOptionId()));

            // Verify the answer option belongs to the question
            if (!selectedOption.getQuestion().getId().equals(question.getId())) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Answer option does not belong to the specified question"));
            }

            // Generate temporary user ID if not provided (for demo purposes)
            String userId = answerSubmissionDTO.getUserId();
            if (userId == null || userId.isEmpty()) {
                userId = "temp-user-" + UUID.randomUUID().toString();
            }

            // Create and save the answer
            Answer answer = new Answer(userId, question, selectedOption);
            Answer savedAnswer = answerRepository.save(answer);

            // Return response with feedback
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(new AnswerResponseDTO(savedAnswer));

        } catch (ResourceNotFoundException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Failed to submit answer",
                            "message", e.getMessage(),
                            "type", e.getClass().getName()));
        }
    }

    /**
     * Retrieves all answers for a specific quiz submitted by a user
     * 
     * @param quizId The ID of the quiz
     * @param userId The ID of the user (optional)
     * @return List of answers for the specified quiz from the specified user
     */
    @Operation(summary = "Get answers for a quiz", description = "Returns all answers for a specific quiz, optionally filtered by user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved answers")
    })
    @GetMapping("/quiz/{quizId}")
    public List<AnswerResponseDTO> getAnswersForQuiz(
            @PathVariable Long quizId,
            @RequestParam(required = false) String userId) {

        List<Answer> answers;
        if (userId != null && !userId.isEmpty()) {
            // Get answers for specific user and quiz
            answers = answerRepository.findByUserIdAndQuestionQuizId(userId, quizId);
        } else {
            // Get all answers for the quiz
            answers = answerRepository.findByQuestionQuizId(quizId);
        }

        return answers.stream()
                .map(AnswerResponseDTO::new)
                .collect(Collectors.toList());
    }
}
