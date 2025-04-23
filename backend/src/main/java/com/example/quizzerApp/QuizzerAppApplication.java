package com.example.quizzerApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application class for the QuizzerApp application.
 * This class bootstraps the Spring Boot application and initializes the
 * application context.
 */
@SpringBootApplication
public class QuizzerAppApplication {

	/**
	 * Main method that starts the Spring Boot application.
	 * 
	 * @param args Command line arguments passed to the application
	 */
	public static void main(String[] args) {
		SpringApplication.run(QuizzerAppApplication.class, args);
	}
}
