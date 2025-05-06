package com.example.quizzerApp.repository;

import com.example.quizzerApp.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByCategoryId(Long categoryId);

    List<Quiz> findByPublishedTrue();

    List<Quiz> findByCategoryIdAndPublishedTrue(Long categoryId);
}