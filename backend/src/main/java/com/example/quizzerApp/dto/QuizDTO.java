package com.example.quizzerApp.dto;

import com.example.quizzerApp.model.Quiz;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Data Transfer Object (DTO) for Quiz entities.
 * Provides a simplified view of Quiz data with added information like question
 * count.
 * Used for transferring quiz data between layers and to the client.
 */
public class QuizDTO {
    /**
     * Unique identifier for the quiz.
     */
    private Long id;

    /**
     * The name of the quiz.
     */
    private String name;

    /**
     * A detailed description of the quiz.
     */
    private String description;

    /**
     * The course code associated with the quiz (e.g., "CS101").
     */
    private String courseCode;

    /**
     * Indicates whether the quiz is published and available to users.
     */
    private boolean published;

    /**
     * The date and time when the quiz was created.
     */
    private LocalDateTime dateAdded;

    /**
     * The number of questions in this quiz.
     * Useful for display without needing to fetch all questions.
     */
    private int questionCount;

    /**
     * The ID of the category this quiz belongs to.
     */
    private Long categoryId;

    /**
     * The name of the category this quiz belongs to.
     */
    private String categoryName;

    /**
     * Constructs a QuizDTO from a Quiz entity and its question count.
     *
     * @param quiz          The Quiz entity to convert
     * @param questionCount The number of questions in the quiz
     */
    public QuizDTO(Quiz quiz, int questionCount) {
        this.id = quiz.getId();
        this.name = quiz.getName();
        this.description = quiz.getDescription();
        this.courseCode = quiz.getCourseCode();
        this.published = quiz.isPublished();
        this.dateAdded = quiz.getDateAdded();
        this.questionCount = questionCount;

        // Set category information if category exists
        if (quiz.getCategory() != null) {
            this.categoryId = quiz.getCategory().getId();
            this.categoryName = quiz.getCategory().getName();
        }
    }

    /**
     * Static factory method to create a QuizDTO from a Quiz entity.
     *
     * @param quiz          The Quiz entity to convert
     * @param questionCount The number of questions in the quiz
     * @return A new QuizDTO instance
     */
    public static QuizDTO fromQuiz(Quiz quiz, int questionCount) {
        return new QuizDTO(quiz, questionCount);
    }

    /**
     * Static factory method to create a list of QuizDTOs from a list of Quiz
     * entities.
     * Uses a provided function to count questions for each quiz.
     *
     * @param quizzes         The list of Quiz entities to convert
     * @param questionCounter A function that takes a Quiz and returns its question
     *                        count
     * @return A list of QuizDTO instances
     */
    public static List<QuizDTO> fromQuizList(List<Quiz> quizzes,
            java.util.function.Function<Quiz, Integer> questionCounter) {
        return quizzes.stream()
                .map(q -> new QuizDTO(q, questionCounter.apply(q)))
                .collect(Collectors.toList());
    }

    /**
     * Retrieves the ID of the quiz.
     *
     * @return The quiz ID
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the ID of the quiz.
     *
     * @param id The quiz ID to set
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Retrieves the name of the quiz.
     *
     * @return The quiz name
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the name of the quiz.
     *
     * @param name The quiz name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Retrieves the description of the quiz.
     *
     * @return The quiz description
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the description of the quiz.
     *
     * @param description The quiz description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Retrieves the course code associated with the quiz.
     *
     * @return The course code
     */
    public String getCourseCode() {
        return courseCode;
    }

    /**
     * Sets the course code associated with the quiz.
     *
     * @param courseCode The course code to set
     */
    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    /**
     * Checks if the quiz is published.
     *
     * @return true if the quiz is published, false otherwise
     */
    public boolean isPublished() {
        return published;
    }

    /**
     * Sets the published status of the quiz.
     *
     * @param published The published status to set
     */
    public void setPublished(boolean published) {
        this.published = published;
    }

    /**
     * Retrieves the date and time when the quiz was created.
     *
     * @return The creation date and time
     */
    public LocalDateTime getDateAdded() {
        return dateAdded;
    }

    /**
     * Sets the date and time when the quiz was created.
     *
     * @param dateAdded The creation date and time to set
     */
    public void setDateAdded(LocalDateTime dateAdded) {
        this.dateAdded = dateAdded;
    }

    /**
     * Retrieves the number of questions in the quiz.
     *
     * @return The question count
     */
    public int getQuestionCount() {
        return questionCount;
    }

    /**
     * Sets the number of questions in the quiz.
     *
     * @param questionCount The question count to set
     */
    public void setQuestionCount(int questionCount) {
        this.questionCount = questionCount;
    }

    /**
     * Retrieves the ID of the category.
     *
     * @return The category ID
     */
    public Long getCategoryId() {
        return categoryId;
    }

    /**
     * Sets the ID of the category.
     *
     * @param categoryId The category ID to set
     */
    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    /**
     * Retrieves the name of the category.
     *
     * @return The category name
     */
    public String getCategoryName() {
        return categoryName;
    }

    /**
     * Sets the name of the category.
     *
     * @param categoryName The category name to set
     */
    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
}