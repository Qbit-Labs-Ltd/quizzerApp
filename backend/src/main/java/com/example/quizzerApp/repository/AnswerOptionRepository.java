package com.example.quizzerApp.repository;

import com.example.quizzerApp.model.AnswerOption;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnswerOptionRepository extends JpaRepository<AnswerOption, Long> {
}