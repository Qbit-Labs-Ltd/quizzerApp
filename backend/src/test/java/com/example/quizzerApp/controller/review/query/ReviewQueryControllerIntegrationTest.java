package com.example.quizzerApp.controller.review.query;

import com.example.quizzerApp.model.Quiz;
import com.example.quizzerApp.model.review.Review;
import com.example.quizzerApp.repository.QuizRepository;
import com.example.quizzerApp.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ReviewQueryControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private QuizRepository quizRepository;
    @Autowired
    private ReviewRepository reviewRepository;

    private Quiz quiz;

    @BeforeEach
    void setUp() {
        reviewRepository.deleteAll();
        quizRepository.deleteAll();
        quiz = new Quiz();
        quiz.setName("Sample Quiz");
        quiz = quizRepository.save(quiz);
    }

    @Test
    void getReviewsReturnsList() throws Exception {
        Review review1 = new Review();
        review1.setNickname("Alice");
        review1.setRating(5);
        review1.setText("Great quiz!");
        review1.setQuiz(quiz);

        Review review2 = new Review();
        review2.setNickname("Bob");
        review2.setRating(3);
        review2.setText("It was ok.");
        review2.setQuiz(quiz);

        reviewRepository.saveAll(List.of(review1, review2));

        mockMvc.perform(get("/api/quizzes/" + quiz.getId() + "/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avgRating", is(closeTo(4.0, 0.01))))
                .andExpect(jsonPath("$.total", is(2)))
                .andExpect(jsonPath("$.reviews", hasSize(2)))
                .andExpect(jsonPath("$.reviews[0].nickname", notNullValue()));
    }

    @Test
    void getReviewsReturns404IfQuizNotFound() throws Exception {
        mockMvc.perform(get("/api/quizzes/99999/reviews"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error", containsString("Quiz not found")));
    }
}
