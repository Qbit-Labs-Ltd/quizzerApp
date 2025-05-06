package com.example.quizzerApp.controller;

import com.example.quizzerApp.model.Quiz;
import com.example.quizzerApp.repository.QuizRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "*")
@Tag(name = "Quizzes", description = "Quiz-related operations")
public class QuizRestController {

    @Autowired
    private QuizRepository quizRepository;

    @Operation(summary = "Get quizzes", description = "Returns all quizzes or only published quizzes if 'published=true' query param is set")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Quizzes retrieved successfully")
    })
    @GetMapping
    public List<Quiz> getQuizzes(@RequestParam(required = false) Boolean published) {
        if (Boolean.TRUE.equals(published)) {
            return quizRepository.findByPublishedTrue();
        } else {
            return quizRepository.findAll();
        }
    }
}