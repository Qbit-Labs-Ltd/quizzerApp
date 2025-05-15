package com.example.quizzerApp.dto;

import com.example.quizzerApp.model.Role;

/**
 * DTO for authentication response containing the JWT token and user info
 */
public class AuthResponse {
    
    private String token;
    private String username;
    private Role role;
    
    public AuthResponse() {
    }
    
    public AuthResponse(String token, String username, Role role) {
        this.token = token;
        this.username = username;
        this.role = role;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public Role getRole() {
        return role;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
}
