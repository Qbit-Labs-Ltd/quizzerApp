package com.example.quizzerApp.dto;

import com.example.quizzerApp.model.Answer;
import com.example.quizzerApp.model.AnswerOption;
import com.example.quizzerApp.model.Question;
import java.time.LocalDateTime;

/**
 * Data Transfer Object (DTO) for answer response.
 * Provides feedback on a submitted answer, including whether it was correct.
 */
public class AnswerResponseDTO {

    private Long id;
    private Long questionId;
    private String questionContent;
    private Long selectedOptionId;
    private String selectedOptionText;
    private boolean correct;
    private LocalDateTime submittedAt;
    private String feedback;

    /**
     * Constructs an AnswerResponseDTO from an Answer entity.
     *
     * @param answer The Answer entity to convert
     */
    public AnswerResponseDTO(Answer answer) {
        this.id = answer.getId();

        Question question = answer.getQuestion();
        this.questionId = question.getId();
        this.questionContent = question.getContent();

        AnswerOption selectedOption = answer.getSelectedOption();
        this.selectedOptionId = selectedOption.getId();
        this.selectedOptionText = selectedOption.getText();

        this.correct = answer.isCorrect();
        this.submittedAt = answer.getSubmittedAt();

        // Generate feedback based on correctness
        this.feedback = this.correct ? "Correct! Well done!" : "Incorrect. Please review the question and try again.";
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getQuestionContent() {
        return questionContent;
    }

    public void setQuestionContent(String questionContent) {
        this.questionContent = questionContent;
    }

    public Long getSelectedOptionId() {
        return selectedOptionId;
    }

    public void setSelectedOptionId(Long selectedOptionId) {
        this.selectedOptionId = selectedOptionId;
    }

    public String getSelectedOptionText() {
        return selectedOptionText;
    }

    public void setSelectedOptionText(String selectedOptionText) {
        this.selectedOptionText = selectedOptionText;
    }

    public boolean isCorrect() {
        return correct;
    }

    public void setCorrect(boolean correct) {
        this.correct = correct;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
