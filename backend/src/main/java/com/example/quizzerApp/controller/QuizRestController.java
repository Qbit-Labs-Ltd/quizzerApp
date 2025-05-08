package com.example.quizzerApp.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.quizzerApp.dto.DetailedQuizDTO;
import com.example.quizzerApp.dto.QuizDTO;
import com.example.quizzerApp.exception.ResourceNotFoundException;
import com.example.quizzerApp.model.AnswerOption;
import com.example.quizzerApp.model.Question;
import com.example.quizzerApp.model.Quiz;
import com.example.quizzerApp.repository.CategoryRepository;
import com.example.quizzerApp.repository.QuestionRepository;
import com.example.quizzerApp.repository.QuizRepository;

import jakarta.validation.Valid;

/**
 * REST Controller for handling Quiz-related operations.
 * Provides endpoints for managing quizzes and their questions.
 */
@CrossOrigin(origins = { "http://localhost:5173", "https://quizzerapp-1knb.onrender.com" })
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
     * Repository for Category entity operations
     */
    @Autowired
    private CategoryRepository categoryRepository;

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
     * Retrieves a specific quiz by its ID including questions and answer options
     * 
     * @param id The ID of the quiz to retrieve
     * @return The quiz with the specified ID including questions and answer options
     * @throws ResourceNotFoundException if no quiz exists with the given ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getQuiz(@PathVariable Long id,
            @RequestParam(value = "includeQuestions", required = false, defaultValue = "false") boolean includeQuestions) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id " + id));

        // If detailed view is requested, return quiz with questions and answer options
        if (includeQuestions) {
            List<Question> questions = questionRepository.findByQuizId(id);
            return ResponseEntity.ok(new DetailedQuizDTO(quiz, questions));
        }

        // Otherwise, return the standard quiz DTO
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

            // Set the category if categoryId is provided
            if (quiz.getCategory() != null && quiz.getCategory().getId() != null) {
                Long categoryId = quiz.getCategory().getId();
                categoryRepository.findById(categoryId).ifPresent(quiz::setCategory);
            }

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

                    // Update category if provided
                    if (quizDetails.getCategory() != null && quizDetails.getCategory().getId() != null) {
                        Long categoryId = quizDetails.getCategory().getId();
                        categoryRepository.findById(categoryId).ifPresent(quiz::setCategory);
                    } else {
                        quiz.setCategory(null); // Remove category if not provided
                    }

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

    /**
     * Submits answers for a quiz and returns the results
     * 
     * @param id         The ID of the quiz
     * @param submission The submitted answers
     * @return Quiz results including score and feedback
     */
    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitQuizAnswers(
            @PathVariable Long id,
            @RequestBody Map<String, List<Map<String, Long>>> submission) {
        try {
            System.out.println("Received submission for quiz " + id + ": " + submission);

            List<Map<String, Long>> answers = submission.get("answers");
            if (answers == null || answers.isEmpty()) {
                System.out.println("No answers provided in submission");
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "No answers provided"));
            }

            // Verify quiz exists and is published
            Quiz quiz = quizRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id " + id));

            System.out.println("Found quiz: " + quiz.getName() + " (published: " + quiz.isPublished() + ")");

            if (!quiz.isPublished()) {
                System.out.println("Quiz is not published");
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Quiz is not published"));
            }

            // Get all questions for the quiz
            List<Question> questions = questionRepository.findByQuizId(id);
            System.out.println("Found " + questions.size() + " questions for quiz");

            if (questions.isEmpty()) {
                System.out.println("Quiz has no questions");
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Quiz has no questions"));
            }

            // Process each answer
            int correctCount = 0;
            List<Map<String, Object>> questionResults = new ArrayList<>();

            for (Map<String, Long> answer : answers) {
                Long questionId = answer.get("questionId");
                Long selectedAnswerId = answer.get("selectedAnswerId");

                System.out.println(
                        "Processing answer - Question ID: " + questionId + ", Selected Answer ID: " + selectedAnswerId);

                // Find the question
                Question question = questions.stream()
                        .filter(q -> q.getId().equals(questionId))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Question not found with id " + questionId));

                // Find the selected answer option
                AnswerOption selectedOption = question.getAnswers().stream()
                        .filter(a -> a.getId().equals(selectedAnswerId))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Answer option not found with id " + selectedAnswerId));

                // Check if the answer is correct
                boolean isCorrect = selectedOption.isCorrect();
                if (isCorrect) {
                    correctCount++;
                }

                System.out.println("Answer is " + (isCorrect ? "correct" : "incorrect"));

                // Add result for this question
                questionResults.add(Map.of(
                        "questionId", questionId,
                        "isCorrect", isCorrect,
                        "correctAnswerId", question.getAnswers().stream()
                                .filter(AnswerOption::isCorrect)
                                .findFirst()
                                .map(AnswerOption::getId)
                                .orElse(null),
                        "explanation", isCorrect ? "Correct answer!" : "The selected answer is incorrect."));
            }

            // Calculate score
            int totalQuestions = questions.size();
            int score = totalQuestions > 0 ? Math.round((float) correctCount / totalQuestions * 100) : 0;

            System.out.println(
                    "Quiz completed - Score: " + score + "%, Correct answers: " + correctCount + "/" + totalQuestions);

            // Return results
            return ResponseEntity.ok(Map.of(
                    "quizId", id,
                    "score", score,
                    "totalQuestions", totalQuestions,
                    "correctAnswers", correctCount,
                    "questionResults", questionResults));

        } catch (ResourceNotFoundException e) {
            System.err.println("Resource not found: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Error processing quiz submission: " + e.getClass().getName() + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Failed to submit quiz answers",
                            "message", e.getMessage(),
                            "type", e.getClass().getName()));
        }
    }
}