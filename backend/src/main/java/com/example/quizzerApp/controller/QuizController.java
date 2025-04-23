package com.example.quizzerApp.controller;

import com.example.quizzerApp.dto.QuizUpdateDTO;
import com.example.quizzerApp.model.AnswerOption;
import com.example.quizzerApp.model.Question;
import com.example.quizzerApp.model.Quiz;
import com.example.quizzerApp.repository.AnswerOptionRepository;
import com.example.quizzerApp.repository.QuestionRepository;
import com.example.quizzerApp.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
public class QuizController {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AnswerOptionRepository answerOptionRepository;

    @GetMapping("/quizzes/new")
    public String showQuizForm(Model model) {
        model.addAttribute("quiz", new Quiz());
        return "quiz_form";
    }

    @PostMapping("/quizzes")
    public String saveQuiz(@ModelAttribute Quiz quiz) {
        quizRepository.save(quiz);
        return "redirect:/quizzes";
    }

    @GetMapping("/quizzes")
    public String listQuizzes(Model model) {
        model.addAttribute("quizzes", quizRepository.findAll());
        return "quiz_list";
    }

    @GetMapping("/quizzes/{id}/edit")
    public String editQuizForm(@PathVariable Long id, Model model) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid quiz Id:" + id));

        model.addAttribute("quiz", quiz);
        return "quiz_edit_form";
    }

    @PostMapping("/quizzes/{id}")
    public String updateQuiz(@PathVariable Long id, @ModelAttribute QuizUpdateDTO quizDto) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid quiz Id:" + id));

        quiz.setName(quizDto.getName());
        quiz.setDescription(quizDto.getDescription());
        quiz.setCourseCode(quizDto.getCourseCode());
        quiz.setPublished(quizDto.isPublished());

        quizRepository.save(quiz);

        return "redirect:/quizzes";
    }

    @GetMapping("/quizzes/{id}/questions/new")
    public String showQuestionForm(@PathVariable Long id, Model model) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid quiz ID: " + id));

        model.addAttribute("quiz", quiz);
        return "question_form";
    }

    @PostMapping("/quizzes/{id}/questions")
    public String addQuestionToQuiz(@PathVariable Long id, @RequestParam String content,
            @RequestParam String difficulty) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid quiz ID: " + id));

        Question question = new Question();
        question.setContent(content);
        question.setDifficulty(difficulty);
        question.setQuiz(quiz);

        questionRepository.save(question);

        return "redirect:/quizzes";
    }

    @PostMapping("/questions/{id}/answers")
    public String addAnswerOption(@PathVariable Long id, @RequestParam String text,
            @RequestParam(required = false) boolean correct) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid question ID: " + id));

        AnswerOption option = new AnswerOption();
        option.setText(text);
        option.setCorrect(correct);
        option.setQuestion(question);

        answerOptionRepository.save(option);

        return "redirect:/quizzes";
    }

    @GetMapping("/questions/{id}/answers/new")
    public String showAnswerForm(@PathVariable Long id, Model model) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid question ID: " + id));

        model.addAttribute("question", question);
        return "answer_form";
    }

    @GetMapping("/questions/{id}/answers")
    public String listAnswersForQuestion(@PathVariable Long id, Model model) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid question ID: " + id));

        model.addAttribute("question", question);
        model.addAttribute("answers", answerOptionRepository.findAll()
                .stream()
                .filter(a -> a.getQuestion().getId().equals(id))
                .toList());

        return "answer_list";
    }

    @GetMapping("/quizzes/{id}/questions")
    public String listQuestionsForQuiz(@PathVariable Long id, Model model) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid quiz ID: " + id));

        model.addAttribute("quiz", quiz);
        model.addAttribute("questions", questionRepository.findByQuizId(id));
        return "question_list";
    }

    @DeleteMapping("/answers/{id}")
    public ResponseEntity<?> deleteAnswerOption(@PathVariable Long id) {
        // Check if answer exists
        if (!answerOptionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        // Delete the answer
        answerOptionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        // Check if question exists
        if (!questionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        // Get question to access its quiz ID for redirection
        Question question = questionRepository.findById(id).get();
        Long quizId = question.getQuiz().getId();

        // Delete the question (this will cascade delete answer options)
        questionRepository.deleteById(id);

        return ResponseEntity.ok().body(Map.of("quizId", quizId));
    }

    @DeleteMapping("/quizzes/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable Long id) {
        // Check if quiz exists
        if (!quizRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        // Delete the quiz (this will cascade delete questions and answers)
        quizRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

}