package com.example.quizzerApp.controller.review.mutation;

import com.example.quizzerApp.exception.ResourceNotFoundException;
import com.example.quizzerApp.model.Quiz;
import com.example.quizzerApp.model.review.Review;
import com.example.quizzerApp.repository.QuizRepository;
import com.example.quizzerApp.repository.ReviewRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ReviewMutationController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private QuizRepository quizRepository;

    @PostMapping("/quizzes/{quizId}/reviews")
    public ResponseEntity<?> createReview(
            @PathVariable Long quizId,
            @Valid @RequestBody ReviewRequest reviewRequest) {

        // Find the quiz
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id " + quizId));

        // Check if quiz is published
        if (!quiz.isPublished()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Cannot review an unpublished quiz"));
        }

        // Validate rating range (1-5)
        if (reviewRequest.getRating() < 1 || reviewRequest.getRating() > 5) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Rating must be between 1 and 5"));
        }

        // Create and save the review
        Review review = new Review();
        review.setQuiz(quiz);
        review.setNickname(reviewRequest.getNickname());
        review.setRating(reviewRequest.getRating());
        review.setText(reviewRequest.getText());

        Review savedReview = reviewRepository.save(review);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedReview);
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
