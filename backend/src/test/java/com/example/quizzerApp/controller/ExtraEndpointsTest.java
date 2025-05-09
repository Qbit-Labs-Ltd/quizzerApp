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
class ExtraEndpointsTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private QuizRepository quizRepository;
    @Autowired
    private com.example.quizzerApp.repository.QuestionRepository questionRepository;
    @Autowired
    private com.example.quizzerApp.repository.AnswerOptionRepository answerOptionRepository;

    @BeforeEach
    void setUp() {
        quizRepository.deleteAll();
    }

    @Test
    void submitAnswerReturnsCorrectness() throws Exception {
        // Setup: create a quiz, question, and answer option
        com.example.quizzerApp.model.Quiz quiz = new com.example.quizzerApp.model.Quiz();
        quiz.setName("Test Quiz");
        quiz = quizRepository.save(quiz);

        com.example.quizzerApp.model.Question question = new com.example.quizzerApp.model.Question();
        question.setContent("What is 2+2?");
        question.setQuiz(quiz);
        question = questionRepository.save(question);

        com.example.quizzerApp.model.AnswerOption answerOption = new com.example.quizzerApp.model.AnswerOption();
        answerOption.setText("4");
        answerOption.setCorrect(true);
        answerOption.setQuestion(question);
        answerOption = answerOptionRepository.save(answerOption);

        String submissionJson = "{" +
                "\"questionId\":" + question.getId() + "," +
                "\"answerOptionId\":" + answerOption.getId() + "," +
                "\"userId\":\"testuser\"}";
        mockMvc.perform(post("/api/answers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(submissionJson))
                .andExpect(status().isCreated()); // Adjust checks as needed
    }

    @Test
    void getQuestionsForQuizReturnsList() throws Exception {
        Quiz quiz = new Quiz();
        quiz.setName("Extra Quiz");
        quiz = quizRepository.save(quiz);
        mockMvc.perform(get("/api/quizzes/" + quiz.getId() + "/questions"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllCategoriesReturnsList() throws Exception {
        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void createQuizWithDetails() throws Exception {
        String quizJson = "{\"name\":\"Detailed Quiz\"}";
        mockMvc.perform(post("/api/quizzes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(quizJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Detailed Quiz")));
    }
}
