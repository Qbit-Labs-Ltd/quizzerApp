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

/**
 * Controller for handling web-based quiz operations.
 * Provides endpoints for the traditional web interface (non-REST)
 * for managing quizzes, questions, and answer options.
 */
@Controller
public class QuizController {

    /**
     * Repository for Quiz entity operations
     */
    @Autowired
    private QuizRepository quizRepository;

    /**
     * Repository for Question entity operations
     */
    @Autowired
    private QuestionRepository questionRepository;

    /**
     * Repository for AnswerOption entity operations
     */
    @Autowired
    private AnswerOptionRepository answerOptionRepository;

    /**
     * Displays the form for creating a new quiz
     * 
     * @param model Model object for passing data to the view
     * @return The name of the view template
     */
    @GetMapping("/quizzes/new")
    public String showQuizForm(Model model) {
        model.addAttribute("quiz", new Quiz());
        return "quiz_form";
    }

    /**
     * Handles the submission of a new quiz
     * 
     * @param quiz The quiz data from the form
     * @return Redirect to the quiz list page
     */
    @PostMapping("/quizzes")
    public String saveQuiz(@ModelAttribute Quiz quiz) {
        quizRepository.save(quiz);
        return "redirect:/quizzes";
    }

    /**
     * Displays a list of all quizzes
     * 
     * @param model Model object for passing data to the view
     * @return The name of the view template
     */
    @GetMapping("/quizzes")
    public String listQuizzes(Model model) {
        model.addAttribute("quizzes", quizRepository.findAll());
        return "quiz_list";
    }

    /**
     * Displays the form for editing an existing quiz
     * 
     * @param id    The ID of the quiz to edit
     * @param model Model object for passing data to the view
     * @return The name of the view template
     * @throws IllegalArgumentException if no quiz exists with the given ID
     */
    @GetMapping("/quizzes/{id}/edit")
    public String editQuizForm(@PathVariable Long id, Model model) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid quiz Id:" + id));

        model.addAttribute("quiz", quiz);
        return "quiz_edit_form";
    }

    /**
     * Handles the update of an existing quiz
     * 
     * @param id      The ID of the quiz to update
     * @param quizDto DTO containing the updated quiz data
     * @return Redirect to the quiz list page
     * @throws IllegalArgumentException if no quiz exists with the given ID
     */
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

    /**
     * Displays the form for adding a new question to a quiz
     * 
     * @param id    The ID of the quiz to add the question to
     * @param model Model object for passing data to the view
     * @return The name of the view template
     * @throws IllegalArgumentException if no quiz exists with the given ID
     */
    @GetMapping("/quizzes/{id}/questions/new")
    public String showQuestionForm(@PathVariable Long id, Model model) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid quiz ID: " + id));

        model.addAttribute("quiz", quiz);
        return "question_form";
    }

    /**
     * Handles the submission of a new question for a quiz
     * 
     * @param id         The ID of the quiz to add the question to
     * @param content    The content of the question
     * @param difficulty The difficulty level of the question
     * @return Redirect to the quiz list page
     * @throws IllegalArgumentException if no quiz exists with the given ID
     */
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

    /**
     * Handles the submission of a new answer option for a question
     * 
     * @param id      The ID of the question to add the answer to
     * @param text    The text of the answer option
     * @param correct Whether the answer option is correct
     * @return Redirect to the quiz list page
     * @throws IllegalArgumentException if no question exists with the given ID
     */
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

    /**
     * Displays the form for adding a new answer to a question
     * 
     * @param id    The ID of the question to add the answer to
     * @param model Model object for passing data to the view
     * @return The name of the view template
     * @throws IllegalArgumentException if no question exists with the given ID
     */
    @GetMapping("/questions/{id}/answers/new")
    public String showAnswerForm(@PathVariable Long id, Model model) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid question ID: " + id));

        model.addAttribute("question", question);
        return "answer_form";
    }

    /**
     * Displays a list of all answers for a specific question
     * 
     * @param id    The ID of the question to list answers for
     * @param model Model object for passing data to the view
     * @return The name of the view template
     * @throws IllegalArgumentException if no question exists with the given ID
     */
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

    /**
     * Displays a list of all questions for a specific quiz
     * 
     * @param id    The ID of the quiz to list questions for
     * @param model Model object for passing data to the view
     * @return The name of the view template
     * @throws IllegalArgumentException if no quiz exists with the given ID
     */
    @GetMapping("/quizzes/{id}/questions")
    public String listQuestionsForQuiz(@PathVariable Long id, Model model) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid quiz ID: " + id));

        model.addAttribute("quiz", quiz);
        model.addAttribute("questions", questionRepository.findByQuizId(id));
        return "question_list";
    }

    /**
     * Handles the deletion of an answer option
     * 
     * @param id The ID of the answer option to delete
     * @return Response entity with success or not found status
     */
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

    /**
     * Handles the deletion of a question
     * 
     * @param id The ID of the question to delete
     * @return Response entity with quiz ID for redirect or not found status
     */
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

    /**
     * Handles the deletion of a quiz
     * 
     * @param id The ID of the quiz to delete
     * @return Response entity with success or not found status
     */
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