package com.example.quizzerApp.controller;

import com.example.quizzerApp.model.Question;
import com.example.quizzerApp.model.Quiz;
import com.example.quizzerApp.model.AnswerOption;
import com.example.quizzerApp.repository.QuestionRepository;
import com.example.quizzerApp.repository.QuizRepository;
import com.example.quizzerApp.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
public class QuestionRestController {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuizRepository quizRepository;

    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id " + id));
        return ResponseEntity.ok(question);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuestion(@PathVariable Long id, @RequestBody Question questionDetails) {
        try {
            System.out.println("Updating question: " + id);
            System.out.println("Answer options count: " +
                    (questionDetails.getAnswers() != null ? questionDetails.getAnswers().size() : 0));

            Question question = questionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Question not found with id " + id));

            question.setContent(questionDetails.getContent());
            question.setDifficulty(questionDetails.getDifficulty());

            // Handle answer options if they are present in the request
            if (questionDetails.getAnswers() != null && !questionDetails.getAnswers().isEmpty()) {
                // Clear existing answers and re-add them all
                question.getAnswers().clear();

                // Ensure at least one answer is marked as correct
                boolean hasCorrectAnswer = false;
                for (AnswerOption answerOption : questionDetails.getAnswers()) {
                    if (answerOption.isCorrect()) {
                        hasCorrectAnswer = true;
                    }

                    // Create a new answer option to avoid ID conflicts
                    AnswerOption newOption = new AnswerOption();
                    newOption.setText(answerOption.getText());
                    newOption.setCorrect(answerOption.isCorrect());
                    newOption.setQuestion(question);
                    question.getAnswers().add(newOption);
                }

                // Validate that at least one answer is marked as correct
                if (!hasCorrectAnswer && !question.getAnswers().isEmpty()) {
                    return ResponseEntity
                            .status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "At least one answer must be marked as correct"));
                }
            }

            Question updatedQuestion = questionRepository.save(question);
            return ResponseEntity.ok(updatedQuestion);
        } catch (Exception e) {
            System.err.println("Error updating question: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Failed to update question",
                            "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id " + id));

        questionRepository.delete(question);
        return ResponseEntity.ok().build();
    }
}
