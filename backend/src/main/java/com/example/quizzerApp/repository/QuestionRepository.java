package com.example.quizzerApp.repository;

import com.example.quizzerApp.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuizId(Long quizId);

    int countByQuizId(Long quizId);
}