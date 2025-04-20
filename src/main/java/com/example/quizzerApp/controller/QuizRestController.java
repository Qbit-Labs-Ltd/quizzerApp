package com.example.quizzerApp.controller;

import com.example.quizzerApp.dto.QuizDTO;
import com.example.quizzerApp.model.Quiz;
import com.example.quizzerApp.repository.QuestionRepository;
import com.example.quizzerApp.repository.QuizRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quizzes")
public class QuizRestController {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @GetMapping
    public List<QuizDTO> getAllQuizzes() {
        List<Quiz> quizzes = quizRepository.findAll();
        return QuizDTO.fromQuizList(quizzes,
                quiz -> questionRepository.findByQuizId(quiz.getId()).size());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizDTO> getQuiz(@PathVariable Long id) {
        return quizRepository.findById(id)
                .map(quiz -> {
                    int questionCount = questionRepository.findByQuizId(quiz.getId()).size();
                    return ResponseEntity.ok(new QuizDTO(quiz, questionCount));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<QuizDTO> createQuiz(@Valid @RequestBody Quiz quiz) {
        Quiz savedQuiz = quizRepository.save(quiz);
        return ResponseEntity.ok(new QuizDTO(savedQuiz, 0));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuizDTO> updateQuiz(@PathVariable Long id, @Valid @RequestBody Quiz quizDetails) {
        return quizRepository.findById(id)
                .map(quiz -> {
                    quiz.setName(quizDetails.getName());
                    quiz.setDescription(quizDetails.getDescription());
                    quiz.setCourseCode(quizDetails.getCourseCode());
                    quiz.setPublished(quizDetails.isPublished());
                    Quiz updatedQuiz = quizRepository.save(quiz);
                    int questionCount = questionRepository.findByQuizId(quiz.getId()).size();
                    return ResponseEntity.ok(new QuizDTO(updatedQuiz, questionCount));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable Long id) {
        return quizRepository.findById(id)
                .map(quiz -> {
                    quizRepository.delete(quiz);
                    return ResponseEntity.ok(Map.of("success", true));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/published")
    public List<QuizDTO> getPublishedQuizzes() {
        List<Quiz> publishedQuizzes = quizRepository.findByPublishedTrue();
        return QuizDTO.fromQuizList(publishedQuizzes,
                quiz -> questionRepository.findByQuizId(quiz.getId()).size());
    }
}