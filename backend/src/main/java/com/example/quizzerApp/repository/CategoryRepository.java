package com.example.quizzerApp.repository;

import com.example.quizzerApp.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository interface for Category data access operations.
 * Provides methods to query and manipulate Category data in the database.
 */
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Finds a category by its name.
     * 
     * @param name The name of the category to search for
     * @return Optional containing the category if found, empty otherwise
     */
    Optional<Category> findByName(String name);

    /**
     * Checks if a category with the given name exists.
     * 
     * @param name The name to check
     * @return true if a category with the name exists, false otherwise
     */
    boolean existsByName(String name);
}
