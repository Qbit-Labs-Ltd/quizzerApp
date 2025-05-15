package com.example.quizzerApp.service;

import com.example.quizzerApp.dto.AuthResponse;
import com.example.quizzerApp.dto.LoginRequest;
import com.example.quizzerApp.dto.RegisterRequest;
import com.example.quizzerApp.model.Role;
import com.example.quizzerApp.model.User;
import com.example.quizzerApp.repository.UserRepository;
import com.example.quizzerApp.security.jwt.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.Set;

/**
 * Service class for authentication operations
 */
@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder encoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    
    /**
     * Register a new user
     */
    public AuthResponse register(RegisterRequest registerRequest) {
        // Check if username already exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is already taken");
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already in use");
        }
        
        // Create and save the new user
        User user = new User(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                encoder.encode(registerRequest.getPassword())
        );
        
        // Set roles or use default STUDENT role
        Set<Role> roles = registerRequest.getRoles();
        if (roles == null || roles.isEmpty()) {
            roles = new HashSet<>();
            roles.add(Role.STUDENT);
        }
        user.setRoles(roles);
        
        userRepository.save(user);
        
        // Authenticate the new user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(registerRequest.getEmail(), registerRequest.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenUtil.generateToken(authentication);
        
        // Determine the primary role to return (if multiple, prioritize TEACHER over STUDENT)
        Role primaryRole = user.getRoles().contains(Role.TEACHER) ? Role.TEACHER : Role.STUDENT;
        
        return new AuthResponse(jwt, user.getUsername(), primaryRole);
    }
    
    /**
     * Authenticate a user and generate a token
     */
    public AuthResponse login(LoginRequest loginRequest) {
        // Find the user by email
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        
        // Authenticate with the email and password
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenUtil.generateToken(authentication);
        
        // Determine the primary role from the authorities (if multiple, prioritize TEACHER over STUDENT)
        Role primaryRole = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> auth.startsWith("ROLE_"))
                .map(auth -> auth.substring(5))
                .map(Role::valueOf)
                .filter(role -> role == Role.TEACHER)
                .findFirst()
                .orElse(Role.STUDENT);
        
        return new AuthResponse(jwt, user.getUsername(), primaryRole);
    }
}
