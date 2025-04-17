package com.example.quizzerApp.dto;

import jakarta.validation.constraints.NotBlank;

public class QuizUpdateDTO {

    @NotBlank
    private String name;

    private String description;

    @NotBlank
    private String courseCode;

    private boolean published;


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
}