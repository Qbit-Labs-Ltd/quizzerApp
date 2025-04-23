package com.example.quizzerApp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a requested resource cannot be found.
 * Results in an HTTP 404 Not Found response being returned to the client.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Creates a new ResourceNotFoundException with the specified detail message.
     * 
     * @param message The detail message explaining which resource could not be
     *                found
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
