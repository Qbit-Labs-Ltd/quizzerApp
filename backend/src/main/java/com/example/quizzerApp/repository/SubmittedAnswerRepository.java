package com.example.quizzerApp.repository;

import com.example.quizzerApp.model.SubmittedAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubmittedAnswerRepository extends JpaRepository<SubmittedAnswer, Long> {
    List<SubmittedAnswer> findByAnswerOptionQuestionQuizId(Long quizId);
}