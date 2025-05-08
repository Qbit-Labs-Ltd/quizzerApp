package com.example.quizzerApp;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
class QuizzerAppApplicationTests {

    @Test
    void contextLoads() {
        // Empty test that verifies the Spring context loads
    }
}
