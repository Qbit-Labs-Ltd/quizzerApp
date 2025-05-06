package com.example.quizzerApp.controller;

import com.example.quizzerApp.model.AnswerOption;
import com.example.quizzerApp.model.Quiz;
import com.example.quizzerApp.model.SubmittedAnswer;
import com.example.quizzerApp.repository.AnswerOptionRepository;
import com.example.quizzerApp.repository.SubmittedAnswerRepository;
import com.example.quizzerApp.dto.CreateSubmittedAnswerDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/answers")
@CrossOrigin(origins = "*")
@Tag(name = "Answers", description = "Submitting quiz answers")
public class AnswerRestController {

    @Autowired
    private AnswerOptionRepository answerOptionRepository;

    @Autowired
    private SubmittedAnswerRepository submittedAnswerRepository;

    @Operation(summary = "Submit an answer", description = "Student submits an answer option to a question")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Answer submitted successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request"),
            @ApiResponse(responseCode = "404", description = "Answer option not found or quiz is not published")
    })
    @PostMapping
    public ResponseEntity<?> submitAnswer(@Valid @RequestBody CreateSubmittedAnswerDTO dto, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    bindingResult.getAllErrors().get(0).getDefaultMessage());
        }

        AnswerOption option = answerOptionRepository.findById(dto.getAnswerOptionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Answer option not found"));
                
        Quiz quiz = option.getQuestion().getQuiz();
        if (!quiz.isPublished()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz is not published");
        }

        SubmittedAnswer answer = new SubmittedAnswer();
        answer.setAnswerOption(option);
        submittedAnswerRepository.save(answer);

        Map<String, Object> response = new HashMap<>();
        response.put("correct", option.isCorrect());
        response.put("message", option.isCorrect()
                ? "That is correct, good job!"
                : "That is not correct, try again.");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}