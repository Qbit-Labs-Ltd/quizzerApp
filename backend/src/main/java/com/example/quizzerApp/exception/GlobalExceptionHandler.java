package com.example.quizzerApp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

/**
 * Global exception handler for centralizing error handling across the
 * application.
 * Catches and processes exceptions thrown by controllers.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles all uncaught exceptions in the application.
     * Logs the exception and returns a standardized error response.
     * 
     * @param ex The exception that was thrown
     * @return A ResponseEntity with error details
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGlobalException(Exception ex) {
        // Log the exception
        System.err.println("Global exception handler caught: " + ex.getMessage());
        ex.printStackTrace();

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "error", "An unexpected error occurred",
                        "message", ex.getMessage(),
                        "type", ex.getClass().getName()));
    }
}
