package com.example.quizzerApp.controller.review.mutation;

import com.example.quizzerApp.model.Quiz;
import com.example.quizzerApp.model.review.Review;
import com.example.quizzerApp.repository.QuizRepository;
import com.example.quizzerApp.repository.ReviewRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ReviewMutationControllerTest {

    // Test DTOs that match the controller DTOs
    public static class ReviewRequest {
        private String nickname;
        private int rating;
        private String text;

        public String getNickname() {
            return nickname;
        }

        public void setNickname(String nickname) {
            this.nickname = nickname;
        }

        public int getRating() {
            return rating;
        }

        public void setRating(int rating) {
            this.rating = rating;
        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }
    }

    public static class ReviewUpdateRequest {
        private int rating;
        private String text;

        public int getRating() {
            return rating;
        }

        public void setRating(int rating) {
            this.rating = rating;
        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    private Quiz publishedQuiz;

    @BeforeEach
    void setUp() {
        // Clear existing data
        reviewRepository.deleteAll();
        quizRepository.deleteAll();

        // Create a published quiz
        Quiz quiz = new Quiz();
        quiz.setName("Test Quiz");
        quiz.setCourseCode("TEST101");
        quiz.setDescription("A test quiz for reviews");
        quiz.setPublished(true);

        publishedQuiz = quizRepository.save(quiz);
    }

    @Test
    void createReviewSavesValidReview() throws Exception {
        // Arrange
        ReviewRequest reviewRequest = new ReviewRequest();
        reviewRequest.setNickname("TestUser");
        reviewRequest.setRating(4);
        reviewRequest.setText("This is a great quiz!");

        // Act
        ResultActions result = mockMvc.perform(post("/api/quizzes/{quizId}/reviews", publishedQuiz.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reviewRequest)));

        // Assert
        result.andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.nickname").value("TestUser"))
                .andExpect(jsonPath("$.rating").value(4))
                .andExpect(jsonPath("$.text").value("This is a great quiz!"))
                .andExpect(jsonPath("$.createdAt").exists());

        // Verify one review in the repository
        assertThat(reviewRepository.count()).isEqualTo(1);
    }

    @Test
    void updateReviewUpdatesFields() throws Exception {
        // Arrange - Create a review first
        Review review = new Review();
        review.setNickname("InitialUser");
        review.setRating(3);
        review.setText("Initial review text");
        review.setQuiz(publishedQuiz);
        review = reviewRepository.save(review); // Update request
        ReviewUpdateRequest updateRequest = new ReviewUpdateRequest();
        updateRequest.setRating(5);
        updateRequest.setText("Updated review text");

        // Act
        ResultActions updateResult = mockMvc.perform(put("/api/reviews/{id}", review.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)));

        // Assert
        updateResult.andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(review.getId()))
                .andExpect(jsonPath("$.nickname").value("InitialUser")) // Nickname should not change
                .andExpect(jsonPath("$.rating").value(5)) // Updated rating
                .andExpect(jsonPath("$.text").value("Updated review text")); // Updated text
    }

    @Test
    void deleteReviewRemovesIt() throws Exception {
        // Arrange - Create a review first
        Review review = new Review();
        review.setNickname("UserToDelete");
        review.setRating(2);
        review.setText("Review to delete");
        review.setQuiz(publishedQuiz);
        review = reviewRepository.save(review);

        // Verify we have one review
        assertThat(reviewRepository.count()).isEqualTo(1);

        // Act
        ResultActions deleteResult = mockMvc.perform(delete("/api/reviews/{id}", review.getId()));

        // Assert
        deleteResult.andExpect(status().isNoContent());

        // Verify review was deleted
        assertThat(reviewRepository.count()).isZero();
    }

    @Test
    void createReviewRejects_WhenRatingOutOfRange() throws Exception {
        // Arrange
        ReviewRequest invalidRequest = new ReviewRequest();
        invalidRequest.setNickname("TestUser");
        invalidRequest.setRating(6); // Invalid rating > 5
        invalidRequest.setText("This is a review with invalid rating");

        // Act & Assert
        mockMvc.perform(post("/api/quizzes/{quizId}/reviews", publishedQuiz.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        // Verify no reviews saved
        assertThat(reviewRepository.count()).isZero();
    }

    @Test
    void createReviewRejects_WhenQuizNotFound() throws Exception {
        // Arrange
        ReviewRequest validRequest = new ReviewRequest();
        validRequest.setNickname("TestUser");
        validRequest.setRating(4);
        validRequest.setText("This is a valid review");

        // Act & Assert
        mockMvc.perform(post("/api/quizzes/{quizId}/reviews", 999L) // Non-existent quiz ID
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isNotFound());
    }

    @Test
    void createReviewRejects_WhenQuizNotPublished() throws Exception {
        // Arrange - Create an unpublished quiz
        Quiz unpublishedQuiz = new Quiz();
        unpublishedQuiz.setName("Unpublished Quiz");
        unpublishedQuiz.setCourseCode("UNTEST101");
        unpublishedQuiz.setPublished(false); // Not published
        unpublishedQuiz = quizRepository.save(unpublishedQuiz);
        ReviewRequest validRequest = new ReviewRequest();
        validRequest.setNickname("TestUser");
        validRequest.setRating(4);
        validRequest.setText("Review for unpublished quiz");

        // Act & Assert
        mockMvc.perform(post("/api/quizzes/{quizId}/reviews", unpublishedQuiz.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isConflict());
    }
}
