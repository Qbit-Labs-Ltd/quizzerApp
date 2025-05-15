package com.example.quizzerApp.repository;

import com.example.quizzerApp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for User entity operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find a user by username
     * 
     * @param username the username to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByUsername(String username);
    
    /**
     * Find a user by email
     * 
     * @param email the email to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if a username is already taken
     * 
     * @param username the username to check
     * @return true if the username exists
     */
    Boolean existsByUsername(String username);
    
    /**
     * Check if an email is already registered
     * 
     * @param email the email to check
     * @return true if the email exists
     */
    Boolean existsByEmail(String email);
}
