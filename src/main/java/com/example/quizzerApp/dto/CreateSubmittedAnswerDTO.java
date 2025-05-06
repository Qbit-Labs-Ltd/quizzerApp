package com.example.quizzerApp.dto;

import jakarta.validation.constraints.NotNull;

public class CreateSubmittedAnswerDTO {

    @NotNull(message = "Answer option ID is required")
    private Long answerOptionId;

    public Long getAnswerOptionId() {
        return answerOptionId;
    }

    public void setAnswerOptionId(Long answerOptionId) {
        this.answerOptionId = answerOptionId;
    }
}