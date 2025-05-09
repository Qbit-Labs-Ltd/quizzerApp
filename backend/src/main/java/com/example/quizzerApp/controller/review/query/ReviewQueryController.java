package com.example.quizzerApp.controller.review.query;

import com.example.quizzerApp.model.review.Review;
import com.example.quizzerApp.repository.ReviewRepository;
import com.example.quizzerApp.repository.QuizRepository;
import com.example.quizzerApp.model.Quiz;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/quizzes/{quizId}/reviews")
public class ReviewQueryController {
    private final ReviewRepository reviewRepository;
    private final QuizRepository quizRepository;

    public ReviewQueryController(ReviewRepository reviewRepository, QuizRepository quizRepository) {
        this.reviewRepository = reviewRepository;
        this.quizRepository = quizRepository;
    }

    @GetMapping
    public ResponseEntity<?> getReviewsByQuiz(@PathVariable Long quizId) {
        Optional<Quiz> quizOpt = quizRepository.findById(quizId);
        if (quizOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Quiz not found"));
        }
        List<Review> reviews = reviewRepository.findByQuizId(quizId);
        double avgRating = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        int total = reviews.size();
        Map<String, Object> response = new HashMap<>();
        response.put("avgRating", avgRating);
        response.put("total", total);
        response.put("reviews", reviews);
        return ResponseEntity.ok(response);
    }
}
