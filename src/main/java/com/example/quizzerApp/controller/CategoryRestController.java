package com.example.quizzerApp.controller;

import com.example.quizzerApp.model.Category;
import com.example.quizzerApp.model.Quiz;
import com.example.quizzerApp.repository.CategoryRepository;
import com.example.quizzerApp.repository.QuizRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
@Tag(name = "Categories", description = "Category-related operations")
public class CategoryRestController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Operation(summary = "Get all categories", description = "Returns a list of all categories in alphabetical order")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Categories retrieved successfully")
    })
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc();
    }

    @Operation(summary = "Get category by id", description = "Returns a single category by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Category retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Category not found")
    })
    @GetMapping("/{id}")
    public Category getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    }

    @Operation(summary = "Get published quizzes of a category", description = "Returns quizzes of a specific category (optionally only published)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Quizzes retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Category not found")
    })
    @GetMapping("/{id}/quizzes")
    public List<Quiz> getQuizzesByCategory(@PathVariable Long id, @RequestParam(required = false) Boolean published) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        if (Boolean.TRUE.equals(published)) {
            return quizRepository.findByCategoryIdAndPublishedTrue(id);
        } else {
            return quizRepository.findByCategoryId(id);
        }
    }

    @Operation(summary = "Delete category by id", description = "Deletes a category if it is not used by any quizzes")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Category deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Category not found"),
            @ApiResponse(responseCode = "409", description = "Category is in use by quizzes")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        List<Quiz> quizzes = quizRepository.findByCategoryId(id);
        if (!quizzes.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category is in use by quizzes and cannot be deleted");
        }

        categoryRepository.deleteById(id);
    }
}