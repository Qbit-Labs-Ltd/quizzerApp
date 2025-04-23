package com.example.quizzerApp.controller;

import com.example.quizzerApp.dto.QuizDTO;
import com.example.quizzerApp.exception.ResourceNotFoundException;
import com.example.quizzerApp.model.Question;
import com.example.quizzerApp.model.Quiz;
import com.example.quizzerApp.model.AnswerOption; // Add this import
import com.example.quizzerApp.repository.QuestionRepository;
import com.example.quizzerApp.repository.QuizRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller for handling Quiz-related operations.
 * Provides endpoints for managing quizzes and their questions.
 */
@RestController
@RequestMapping("/api/quizzes")
public class QuizRestController {

    /**
     * Repository for Quiz entity operations
     */
    @Autowired
    private QuizRepository quizRepository;

    /**
     * Repository for Question entity operations
     */
    @Autowired
    private QuestionRepository questionRepository;

    /**
     * Retrieves all quizzes
     * 
     * @return List of all quizzes with their question counts
     */
    @GetMapping
    public List<QuizDTO> getAllQuizzes() {
        List<Quiz> quizzes = quizRepository.findAll();
        return QuizDTO.fromQuizList(quizzes, quiz -> questionRepository.countByQuizId(quiz.getId()));
    }

    /**
     * Retrieves a specific quiz by its ID
     * 
     * @param id The ID of the quiz to retrieve
     * @return The quiz with the specified ID
     * @throws ResourceNotFoundException if no quiz exists with the given ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<QuizDTO> getQuiz(@PathVariable Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id " + id));
        int questionCount = questionRepository.countByQuizId(id);
        return ResponseEntity.ok(QuizDTO.fromQuiz(quiz, questionCount));
    }

    /**
     * Creates a new quiz
     * 
     * @param quiz The quiz data to save
     * @return The created quiz
     */
    @PostMapping
    public ResponseEntity<?> createQuiz(@Valid @RequestBody Quiz quiz) {
        try {
            // Set defaults for any null fields if necessary
            if (quiz.getDescription() == null) {
                quiz.setDescription("");
            }
            if (quiz.getCourseCode() == null) {
                quiz.setCourseCode("");
            }

            // Set the dateAdded field explicitly to now
            quiz.setDateAdded(LocalDateTime.now());

            Quiz savedQuiz = quizRepository.save(quiz);

            // Create and return a QuizDTO to avoid serialization issues
            QuizDTO quizDTO = new QuizDTO(savedQuiz, 0);
            return ResponseEntity.ok(quizDTO);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Failed to create quiz",
                            "message", e.getMessage(),
                            "type", e.getClass().getName()));
        }
    }

    /**
     * Updates an existing quiz
     * 
     * @param id          The ID of the quiz to update
     * @param quizDetails The updated quiz data
     * @return The updated quiz
     */
    @PutMapping("/{id}")
    public ResponseEntity<QuizDTO> updateQuiz(@PathVariable Long id, @Valid @RequestBody Quiz quizDetails) {
        return quizRepository.findById(id)
                .map(quiz -> {
                    quiz.setName(quizDetails.getName());
                    quiz.setDescription(quizDetails.getDescription());
                    quiz.setCourseCode(quizDetails.getCourseCode());
                    quiz.setPublished(quizDetails.isPublished());
                    Quiz updatedQuiz = quizRepository.save(quiz);
                    int questionCount = questionRepository.findByQuizId(quiz.getId()).size();
                    return ResponseEntity.ok(new QuizDTO(updatedQuiz, questionCount));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Deletes a quiz by its ID
     * 
     * @param id The ID of the quiz to delete
     * @return Success message if deletion is successful
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable Long id) {
        return quizRepository.findById(id)
                .map(quiz -> {
                    quizRepository.delete(quiz);
                    return ResponseEntity.ok(Map.of("success", true));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Retrieves all published quizzes
     * 
     * @return List of all published quizzes with their question counts
     */
    @GetMapping("/published")
    public List<QuizDTO> getPublishedQuizzes() {
        List<Quiz> publishedQuizzes = quizRepository.findByPublishedTrue();
        return QuizDTO.fromQuizList(publishedQuizzes,
                quiz -> questionRepository.findByQuizId(quiz.getId()).size());
    }

    /**
     * Retrieves all questions for a specific quiz
     * 
     * @param id The ID of the quiz
     * @return List of questions belonging to the specified quiz
     * @throws ResourceNotFoundException if no quiz exists with the given ID
     */
    @GetMapping("/{id}/questions")
    public List<Question> getQuizQuestions(@PathVariable Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id " + id));
        return questionRepository.findByQuizId(id);
    }

    /**
     * Adds a new question to an existing quiz
     * 
     * @param id       The ID of the quiz to add the question to
     * @param question The question data to save
     * @return The created question
     * @throws ResourceNotFoundException if no quiz exists with the given ID
     */
    @PostMapping("/{id}/questions")
    public ResponseEntity<?> addQuestionToQuiz(@PathVariable Long id, @RequestBody Question question) {
        try {
            System.out.println("Received question data: " + question.getContent());
            System.out.println("Answer options count: " +
                    (question.getAnswers() != null ? question.getAnswers().size() : 0));

            // Find the quiz
            Quiz quiz = quizRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id " + id));

            // Create a new question entity instead of using the input directly
            Question newQuestion = new Question();
            newQuestion.setContent(question.getContent());
            newQuestion.setDifficulty(question.getDifficulty());
            newQuestion.setQuiz(quiz);

            // Handle answer options separately
            if (question.getAnswers() != null && !question.getAnswers().isEmpty()) {
                for (AnswerOption inputOption : question.getAnswers()) {
                    AnswerOption newOption = new AnswerOption();
                    newOption.setText(inputOption.getText());
                    newOption.setCorrect(inputOption.isCorrect());
                    newOption.setQuestion(newQuestion);
                    newQuestion.getAnswers().add(newOption);
                }
            }

            // Save the question (cascades to answer options)
            Question savedQuestion = questionRepository.save(newQuestion);

            return ResponseEntity.ok(savedQuestion);
        } catch (Exception e) {
            System.err.println("Error creating question: " + e.getClass().getName() + ": " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Failed to create question",
                            "message", e.getMessage(),
                            "type", e.getClass().getName()));
        }
    }
}