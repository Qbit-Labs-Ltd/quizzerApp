package com.example.quizzerApp.dto;

import com.example.quizzerApp.model.Quiz;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class QuizDTO {
    private Long id;
    private String name;
    private String description;
    private String courseCode;
    private boolean published;
    private LocalDateTime dateAdded;
    private int questionCount;

    public QuizDTO(Quiz quiz, int questionCount) {
        this.id = quiz.getId();
        this.name = quiz.getName();
        this.description = quiz.getDescription();
        this.courseCode = quiz.getCourseCode();
        this.published = quiz.isPublished();
        this.dateAdded = quiz.getDateAdded();
        this.questionCount = questionCount;
    }

    public static QuizDTO fromQuiz(Quiz quiz, int questionCount) {
        return new QuizDTO(quiz, questionCount);
    }

    public static List<QuizDTO> fromQuizList(List<Quiz> quizzes,
            java.util.function.Function<Quiz, Integer> questionCounter) {
        return quizzes.stream()
                .map(q -> new QuizDTO(q, questionCounter.apply(q)))
                .collect(Collectors.toList());
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public boolean isPublished() {
        return published;
    }

    public void setPublished(boolean published) {
        this.published = published;
    }

    public LocalDateTime getDateAdded() {
        return dateAdded;
    }

    public void setDateAdded(LocalDateTime dateAdded) {
        this.dateAdded = dateAdded;
    }

    public int getQuestionCount() {
        return questionCount;
    }

    public void setQuestionCount(int questionCount) {
        this.questionCount = questionCount;
    }
}