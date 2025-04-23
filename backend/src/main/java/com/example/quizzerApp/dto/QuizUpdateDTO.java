package com.example.quizzerApp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

/**
 * Data Transfer Object (DTO) for quiz update operations.
 * Used to validate and transfer quiz update data between the controller and
 * service layers.
 * Contains validation constraints to ensure data integrity before updating quiz
 * entities.
 */
public class QuizUpdateDTO {

    /**
     * Name of the quiz. Required and must be between 3 and 100 characters.
     */
    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
    private String name;

    /**
     * Description of the quiz. Optional, but cannot exceed 500 characters.
     */
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    /**
     * Course code associated with the quiz.
     * Required and must follow the pattern XX0000 (2-4 uppercase letters followed
     * by 2-4 digits).
     */
    @NotBlank(message = "Course code is required")
    @Pattern(regexp = "^[A-Z]{2,4}\\d{2,4}$", message = "Course code must be in format XX0000")
    private String courseCode;

    /**
     * Indicates whether the quiz is published and available to users.
     */
    private boolean published;

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
}