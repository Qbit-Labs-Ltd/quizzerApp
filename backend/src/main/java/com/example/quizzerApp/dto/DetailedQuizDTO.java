package com.example.quizzerApp.dto;

import com.example.quizzerApp.model.AnswerOption;
import com.example.quizzerApp.model.Question;
import com.example.quizzerApp.model.Quiz;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Data Transfer Object (DTO) for detailed Quiz view including questions and
 * answers.
 * Used for transferring complete quiz data for student view.
 */
public class DetailedQuizDTO {
    private Long id;
    private String name;
    private String description;
    private String courseCode;
    private boolean published;
    private LocalDateTime dateAdded;
    private Long categoryId;
    private String categoryName;
    private List<QuestionDTO> questions;

    /**
     * Constructs a DetailedQuizDTO from a Quiz entity and its questions.
     *
     * @param quiz      The Quiz entity to convert
     * @param questions The list of questions for this quiz
     */
    public DetailedQuizDTO(Quiz quiz, List<Question> questions) {
        this.id = quiz.getId();
        this.name = quiz.getName();
        this.description = quiz.getDescription();
        this.courseCode = quiz.getCourseCode();
        this.published = quiz.isPublished();
        this.dateAdded = quiz.getDateAdded();

        if (quiz.getCategory() != null) {
            this.categoryId = quiz.getCategory().getId();
            this.categoryName = quiz.getCategory().getName();
        }

        this.questions = questions.stream()
                .map(QuestionDTO::fromQuestion)
                .collect(Collectors.toList());
    }

    /**
     * Inner class for Question data with answer options.
     */
    public static class QuestionDTO {
        private Long id;
        private String content;
        private String difficulty;
        private List<AnswerOptionDTO> answers;

        private QuestionDTO(Question question) {
            this.id = question.getId();
            this.content = question.getContent();
            this.difficulty = question.getDifficulty();
            this.answers = question.getAnswers().stream()
                    .map(AnswerOptionDTO::fromAnswerOption)
                    .collect(Collectors.toList());
        }

        public static QuestionDTO fromQuestion(Question question) {
            return new QuestionDTO(question);
        }

        // Getters
        public Long getId() {
            return id;
        }

        public String getContent() {
            return content;
        }

        public String getDifficulty() {
            return difficulty;
        }

        public List<AnswerOptionDTO> getAnswers() {
            return answers;
        }
    }

    /**
     * Inner class for AnswerOption data.
     */
    public static class AnswerOptionDTO {
        private Long id;
        private String text;
        // Note: We don't include the 'correct' field for student view

        private AnswerOptionDTO(AnswerOption answerOption) {
            this.id = answerOption.getId();
            this.text = answerOption.getText();
        }

        public static AnswerOptionDTO fromAnswerOption(AnswerOption answerOption) {
            return new AnswerOptionDTO(answerOption);
        }

        // Getters
        public Long getId() {
            return id;
        }

        public String getText() {
            return text;
        }
    }

    // Getters for all fields
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public boolean isPublished() {
        return published;
    }

    public LocalDateTime getDateAdded() {
        return dateAdded;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public List<QuestionDTO> getQuestions() {
        return questions;
    }
}
