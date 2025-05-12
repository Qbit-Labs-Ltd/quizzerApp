package com.example.quizzerApp.controller;

import com.example.quizzerApp.model.Quiz;
import com.example.quizzerApp.model.Question;
import com.example.quizzerApp.model.AnswerOption;
import com.example.quizzerApp.repository.QuizRepository;
import com.example.quizzerApp.repository.QuestionRepository;
import com.example.quizzerApp.repository.AnswerOptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AnswerRestControllerTest {
        @Autowired
        private MockMvc mockMvc;
        @Autowired
        private QuizRepository quizRepository;
        @Autowired
        private QuestionRepository questionRepository;
        @Autowired
        private AnswerOptionRepository answerOptionRepository;

        private Quiz quiz;
        private Question question;
        private AnswerOption correctOption;
        private AnswerOption wrongOption;

        @BeforeEach
        void setUp() {
                answerOptionRepository.deleteAll();
                questionRepository.deleteAll();
                quizRepository.deleteAll();
                quiz = new Quiz();
                quiz.setName("Test Quiz");
                quiz = quizRepository.save(quiz);
                question = new Question();
                question.setContent("What is 2+2?");
                question.setQuiz(quiz);
                question = questionRepository.save(question);
                correctOption = new AnswerOption();
                correctOption.setText("4");
                correctOption.setCorrect(true);
                correctOption.setQuestion(question);
                correctOption = answerOptionRepository.save(correctOption);
                wrongOption = new AnswerOption();
                wrongOption.setText("5");
                wrongOption.setCorrect(false);
                wrongOption.setQuestion(question);
                wrongOption = answerOptionRepository.save(wrongOption);
        }

        @Test
        void submitAnswer_Success() throws Exception {
                String submissionJson = "{" +
                                "\"questionId\":" + question.getId() + "," +
                                "\"answerOptionId\":" + correctOption.getId() + "," +
                                "\"userId\":\"testuser\"}";
                mockMvc.perform(post("/api/answers")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(submissionJson))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.questionId").value(question.getId()))
                                .andExpect(jsonPath("$.selectedOptionId").value(correctOption.getId()))
                                .andExpect(jsonPath("$.correct").value(true));
        }

        @Test
        void submitAnswer_QuestionNotFound() throws Exception {
                String submissionJson = "{" +
                                "\"questionId\":999999," +
                                "\"answerOptionId\":" + correctOption.getId() + "," +
                                "\"userId\":\"testuser\"}";
                mockMvc.perform(post("/api/answers")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(submissionJson))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.error")
                                                .value(org.hamcrest.Matchers.containsString("Question not found")));
        }

        @Test
        void submitAnswer_OptionNotBelongToQuestion() throws Exception {
                // Create another question and option
                Question otherQuestion = new Question();
                otherQuestion.setContent("What is 3+3?");
                otherQuestion.setQuiz(quiz);
                otherQuestion = questionRepository.save(otherQuestion);
                AnswerOption otherOption = new AnswerOption();
                otherOption.setText("6");
                otherOption.setCorrect(true);
                otherOption.setQuestion(otherQuestion);
                otherOption = answerOptionRepository.save(otherOption);
                String submissionJson = "{" +
                                "\"questionId\":" + question.getId() + "," +
                                "\"answerOptionId\":" + otherOption.getId() + "," +
                                "\"userId\":\"testuser\"}";
                mockMvc.perform(post("/api/answers")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(submissionJson))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.error")
                                                .value(org.hamcrest.Matchers
                                                                .containsString("Answer option does not belong")));
        }

        @Test
        void submitAnswer_InvalidInput() throws Exception {
                // Missing required fields
                String submissionJson = "{" +
                                "\"userId\":\"testuser\"}";
                mockMvc.perform(post("/api/answers")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(submissionJson))
                                .andExpect(status().isBadRequest());
        }
}