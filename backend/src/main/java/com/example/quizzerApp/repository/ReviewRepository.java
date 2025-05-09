package com.example.quizzerApp.repository;

import com.example.quizzerApp.model.review.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByQuizId(Long quizId);
}
