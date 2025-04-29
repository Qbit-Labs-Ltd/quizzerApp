package com.example.quizzerApp.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Data Transfer Object (DTO) for submitting an answer to a question.
 * Used to transfer answer data from client to server.
 */
public class AnswerSubmissionDTO {

    /**
     * The ID of the question being answered.
     */
    @NotNull(message = "Question ID is required")
    private Long questionId;

    /**
     * The ID of the selected answer option.
     */
    @NotNull(message = "Answer option ID is required")
    private Long answerOptionId;

    /**
     * The ID of the user submitting the answer.
     * This could be expanded when user authentication is implemented.
     */
    private String userId;

    // Getters and Setters

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public Long getAnswerOptionId() {
        return answerOptionId;
    }

    public void setAnswerOptionId(Long answerOptionId) {
        this.answerOptionId = answerOptionId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
