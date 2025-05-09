package com.example.quizzerApp.controller;

import com.example.quizzerApp.model.Question;
import com.example.quizzerApp.repository.QuestionRepository;
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
class QuestionRestControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private QuestionRepository questionRepository;

    private Question question;

    @BeforeEach
    void setUp() {
        questionRepository.deleteAll();
        question = new Question();
        question.setContent("What is 2+2?");
        question = questionRepository.save(question);
    }

    @Test
    void getQuestionByIdReturnsCorrectQuestion() throws Exception {
        mockMvc.perform(get("/api/questions/" + question.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(question.getId().intValue())))
                .andExpect(jsonPath("$.content", is("What is 2+2?")));
    }

    @Test
    void getQuestionByIdReturns404ForNonexistentQuestion() throws Exception {
        mockMvc.perform(get("/api/questions/99999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateQuestionUpdatesText() throws Exception {
        String updatedJson = "{\"content\":\"What is 3+3?\"}";
        mockMvc.perform(put("/api/questions/" + question.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", is("What is 3+3?")));
    }
}
