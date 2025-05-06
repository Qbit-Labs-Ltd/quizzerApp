package com.example.quizzerApp.controller;

import com.example.quizzerApp.dto.CategoryDTO;
import com.example.quizzerApp.exception.ResourceNotFoundException;
import com.example.quizzerApp.model.Category;
import com.example.quizzerApp.model.Quiz;
import com.example.quizzerApp.repository.CategoryRepository;
import com.example.quizzerApp.repository.QuizRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for handling Category-related operations.
 * Provides endpoints for managing categories.
 */
@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = { "http://localhost:5173", "https://quizzerapp-1knb.onrender.com" })
@Tag(name = "Category", description = "The Category API. Contains all operations that can be performed on categories.")
public class CategoryRestController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private QuizRepository quizRepository;

    /**
     * Retrieves all categories
     * 
     * @return List of all categories
     */
    @Operation(summary = "Get all categories", description = "Returns a list of all categories")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved all categories")
    @GetMapping
    public List<CategoryDTO> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return CategoryDTO.fromCategoryList(categories);
    }

    /**
     * Retrieves a specific category by its ID
     * 
     * @param id The ID of the category to retrieve
     * @return The category with the specified ID
     * @throws ResourceNotFoundException if no category exists with the given ID
     */
    @Operation(summary = "Get a category by ID", description = "Returns a single category identified by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the category"),
            @ApiResponse(responseCode = "404", description = "Category not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategory(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + id));
        return ResponseEntity.ok(CategoryDTO.fromCategory(category));
    }

    /**
     * Retrieves quizzes belonging to a specific category
     * 
     * @param id        The ID of the category
     * @param published Optional parameter to filter by published status
     * @return List of quizzes belonging to the specified category
     * @throws ResourceNotFoundException if no category exists with the given ID
     */
    @Operation(summary = "Get quizzes for a category", description = "Returns quizzes belonging to a specific category")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved quizzes"),
            @ApiResponse(responseCode = "404", description = "Category not found")
    })
    @GetMapping("/{id}/quizzes")
    public ResponseEntity<List<Quiz>> getQuizzesByCategory(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean published) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + id));

        if (Boolean.TRUE.equals(published)) {
            return ResponseEntity.ok(quizRepository.findByCategoryIdAndPublishedTrue(id));
        } else {
            return ResponseEntity.ok(quizRepository.findByCategoryId(id));
        }
    }

    /**
     * Creates a new category
     * 
     * @param categoryDTO The category data to save
     * @return The created category
     */
    @Operation(summary = "Create a new category", description = "Creates a new category and returns the created entity")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Category successfully created", content = @Content(schema = @Schema(implementation = CategoryDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data or category name already exists"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        try {
            // Check if category with same name already exists
            if (categoryRepository.existsByName(categoryDTO.getName())) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "A category with this name already exists"));
            }

            Category category = categoryDTO.toEntity();
            Category savedCategory = categoryRepository.save(category);
            return ResponseEntity.status(HttpStatus.CREATED).body(CategoryDTO.fromCategory(savedCategory));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Failed to create category",
                            "message", e.getMessage(),
                            "type", e.getClass().getName()));
        }
    }

    /**
     * Updates an existing category
     * 
     * @param id          The ID of the category to update
     * @param categoryDTO The updated category data
     * @return The updated category
     */
    @Operation(summary = "Update a category", description = "Updates an existing category's data")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Category successfully updated"),
            @ApiResponse(responseCode = "400", description = "Invalid input data or category name already exists"),
            @ApiResponse(responseCode = "404", description = "Category not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryDTO categoryDTO) {
        return categoryRepository.findById(id)
                .map(category -> {
                    // Check if category with same name already exists (except this one)
                    if (!category.getName().equals(categoryDTO.getName()) &&
                            categoryRepository.existsByName(categoryDTO.getName())) {
                        return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("error", "A category with this name already exists"));
                    }

                    category.setName(categoryDTO.getName());
                    category.setDescription(categoryDTO.getDescription());
                    Category updatedCategory = categoryRepository.save(category);
                    return ResponseEntity.ok(CategoryDTO.fromCategory(updatedCategory));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Deletes a category by its ID
     * 
     * @param id The ID of the category to delete
     * @return Success message if deletion is successful
     */
    @Operation(summary = "Delete a category", description = "Deletes a category identified by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Category successfully deleted"),
            @ApiResponse(responseCode = "404", description = "Category not found"),
            @ApiResponse(responseCode = "409", description = "Category is in use by quizzes")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(category -> {
                    // Check if any quizzes are using this category
                    List<Quiz> quizzes = quizRepository.findByCategoryId(id);
                    if (!quizzes.isEmpty()) {
                        return ResponseEntity
                                .status(HttpStatus.CONFLICT)
                                .body(Map.of("error", "Category is in use by quizzes and cannot be deleted"));
                    }

                    categoryRepository.delete(category);
                    return ResponseEntity.ok(Map.of("success", true));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
