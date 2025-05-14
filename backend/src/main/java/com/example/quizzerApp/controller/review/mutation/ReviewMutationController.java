package com.example.quizzerApp.controller.review.mutation;

import com.example.quizzerApp.exception.ResourceNotFoundException;
import com.example.quizzerApp.model.Quiz;
import com.example.quizzerApp.model.review.Review;
import com.example.quizzerApp.repository.QuizRepository;
import com.example.quizzerApp.repository.ReviewRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ReviewMutationController {
    private static final Logger logger = LoggerFactory.getLogger(ReviewMutationController.class);

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private QuizRepository quizRepository;

    @PostMapping("/quizzes/{quizId}/reviews")
    public ResponseEntity<?> createReview(
            @PathVariable Long quizId,
            @Valid @RequestBody ReviewRequest reviewRequest) {
        try {
            logger.debug("Creating review for quiz {} with request: {}", quizId, reviewRequest);

            // Find the quiz
            Quiz quiz = quizRepository.findById(quizId)
                    .orElseThrow(() -> {
                        logger.error("Quiz not found with id: {}", quizId);
                        return new ResourceNotFoundException("Quiz not found with id " + quizId);
                    });

            logger.debug("Found quiz: {}", quiz);

            // Check if quiz is published
            if (!quiz.isPublished()) {
                logger.warn("Attempted to review unpublished quiz: {}", quizId);
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Cannot review an unpublished quiz"));
            }

            // Validate rating range (1-5)
            if (reviewRequest.getRating() < 1 || reviewRequest.getRating() > 5) {
                logger.warn("Invalid rating value: {}", reviewRequest.getRating());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Rating must be between 1 and 5"));
            }

            // Create and save the review
            Review review = new Review();
            review.setNickname(reviewRequest.getNickname());
            review.setRating(reviewRequest.getRating());
            review.setText(reviewRequest.getText());
            review.setQuiz(quiz);

            logger.debug("Created review object: {}", review);

            // Add the review to the quiz's reviews collection
            quiz.addReview(review);

            // Save the review
            Review savedReview = reviewRepository.save(review);
            logger.debug("Saved review: {}", savedReview);

            // Save the quiz to update the reviews collection
            quizRepository.save(quiz);
            logger.debug("Updated quiz with new review");

            return ResponseEntity.status(HttpStatus.CREATED).body(savedReview);
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found while creating review", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error creating review", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create review: " + e.getMessage()));
        }
    }

    @PutMapping("/reviews/{id}")
    public ResponseEntity<?> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewUpdateRequest updateRequest) {

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id " + id));

        // Validate rating range (1-5)
        if (updateRequest.getRating() < 1 || updateRequest.getRating() > 5) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Rating must be between 1 and 5"));
        }

        review.setRating(updateRequest.getRating());
        review.setText(updateRequest.getText());

        Review updatedReview = reviewRepository.save(review);
        return ResponseEntity.ok(updatedReview);
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("Review not found with id " + id);
        }
        reviewRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // DTOs matching the test DTOs
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
}
