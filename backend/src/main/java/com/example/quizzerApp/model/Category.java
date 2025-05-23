package com.example.quizzerApp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Entity representing a category for quizzes.
 * Categories allow organizing quizzes by subject or topic.
 */
@Entity
public class Category {

    /**
     * Unique identifier for the category.
     * Automatically generated by the database.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The name of the category.
     * Required and must be between 2 and 100 characters.
     */
    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    @Column(unique = true)
    private String name;

    /**
     * A detailed description of the category.
     * Optional, but cannot exceed 500 characters.
     */
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    /**
     * Default constructor required by JPA.
     */
    public Category() {
    }

    /**
     * Constructor with name and description parameters.
     *
     * @param name        The name of the category
     * @param description The description of the category
     */
    public Category(String name, String description) {
        this.name = name;
        this.description = description;
    }

    /**
     * Retrieves the ID of the category.
     *
     * @return The category ID
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the ID of the category.
     *
     * @param id The category ID to set
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Retrieves the name of the category.
     *
     * @return The category name
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the name of the category.
     *
     * @param name The category name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Retrieves the description of the category.
     *
     * @return The category description
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the description of the category.
     *
     * @param description The category description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }
}
