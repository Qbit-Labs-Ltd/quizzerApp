package com.example.quizzerApp.dto;

import com.example.quizzerApp.model.Category;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Data Transfer Object (DTO) for Category entities.
 * Used for transferring category data between layers and to the client.
 */
public class CategoryDTO {

    /**
     * Unique identifier for the category.
     */
    private Long id;

    /**
     * The name of the category.
     * Required and must be between 2 and 100 characters.
     */
    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    private String name;

    /**
     * A detailed description of the category.
     * Optional, but cannot exceed 500 characters.
     */
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    /**
     * Default constructor.
     */
    public CategoryDTO() {
    }

    /**
     * Constructs a CategoryDTO from a Category entity.
     *
     * @param category The Category entity to convert
     */
    public CategoryDTO(Category category) {
        this.id = category.getId();
        this.name = category.getName();
        this.description = category.getDescription();
    }

    /**
     * Static factory method to create a CategoryDTO from a Category entity.
     *
     * @param category The Category entity to convert
     * @return A new CategoryDTO instance
     */
    public static CategoryDTO fromCategory(Category category) {
        return new CategoryDTO(category);
    }

    /**
     * Static factory method to create a list of CategoryDTOs from a list of
     * Category entities.
     *
     * @param categories The list of Category entities to convert
     * @return A list of CategoryDTO instances
     */
    public static List<CategoryDTO> fromCategoryList(List<Category> categories) {
        return categories.stream()
                .map(CategoryDTO::fromCategory)
                .collect(Collectors.toList());
    }

    /**
     * Converts this DTO to a Category entity.
     *
     * @return A new Category entity
     */
    public Category toEntity() {
        Category category = new Category();
        category.setId(this.id);
        category.setName(this.name);
        category.setDescription(this.description);
        return category;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
