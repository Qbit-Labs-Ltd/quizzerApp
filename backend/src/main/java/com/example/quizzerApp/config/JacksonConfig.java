package com.example.quizzerApp.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Configuration class for Jackson JSON serialization settings.
 * Customizes how JSON data is serialized and deserialized.
 */
@Configuration
public class JacksonConfig {

    /**
     * Creates and configures an ObjectMapper bean for JSON handling.
     * 
     * @return A configured ObjectMapper instance with custom settings
     *         - Adds Java 8 time module support
     *         - Disables timestamp format for dates
     *         - Disables failure on empty beans
     */
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        objectMapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        return objectMapper;
    }
}
