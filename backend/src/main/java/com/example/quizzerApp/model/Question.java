package com.example.quizzerApp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    private String difficulty;

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    @JsonIgnoreProperties("questions") // Prevents circular references
    private Quiz quiz;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("question") // Prevents circular references
    private List<AnswerOption> answers = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }

    public List<AnswerOption> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AnswerOption> answers) {
        this.answers = answers;
    }

    // Helper method to add an answer option
    public void addAnswerOption(AnswerOption option) {
        option.setQuestion(this);
        this.answers.add(option);
    }
}