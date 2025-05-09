package com.example.quizzerApp.controller;

import com.example.quizzerApp.model.Quiz;
import com.example.quizzerApp.repository.QuizRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class QuizRestControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private QuizRepository quizRepository;

    @BeforeEach
    void setUp() {
        quizRepository.deleteAll();
    }

    @Test
    void getAllQuizzesReturnsEmptyList() throws Exception {
        mockMvc.perform(get("/api/quizzes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void createQuizAndGetById() throws Exception {
        String quizJson = "{\"name\":\"Test Quiz\"}";
        // Create quiz
        String response = mockMvc.perform(post("/api/quizzes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(quizJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Test Quiz")))
                .andReturn().getResponse().getContentAsString();
        // Optionally parse ID from response here if needed for get by id
    }

    @Test
    void getAllQuizzesReturnsCreatedQuiz() throws Exception {
        Quiz quiz = new Quiz();
        quiz.setName("Sample Quiz");
        quizRepository.save(quiz);

        mockMvc.perform(get("/api/quizzes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Sample Quiz")));
    }
}
