# JWT Authentication System for QuizzerApp

This document provides an overview of the JWT-based authentication system implemented in the QuizzerApp.

## Overview

The authentication system uses JSON Web Tokens (JWT) to secure the application and provide role-based access control. It includes:

- User registration and login endpoints
- Role-based access control (TEACHER and STUDENT roles)
- Protected routes on the frontend
- JWT token generation, validation, and refresh

## Backend Components

### Security Configuration

- `SecurityConfig`: Configures Spring Security with JWT support, stateless sessions, and CORS configuration
- `JwtTokenUtil`: Utility class for JWT token generation, validation, and parsing
- `JwtRequestFilter`: Filter that intercepts requests to validate JWT tokens
- `JwtAuthenticationEntryPoint`: Handler for authentication failure events

### User Model

- `User` entity with username, email, password, and roles
- `Role` enum defining STUDENT and TEACHER roles
- `UserRepository` with methods to find and validate users

### Authentication Controllers and Services

- `AuthController`: REST endpoints for registration and login
- `AuthService`: Business logic for authentication operations
- `UserDetailsServiceImpl`: Implementation of Spring Security's UserDetailsService

## Frontend Components

### Authentication Context

- `AuthContext.jsx`: React context for managing authentication state
- Provides current user information, token management, and authentication methods

### API Configuration

- Axios instance with JWT token inclusion in headers
- Interceptors for handling authentication errors

### Protected Routes

- `ProtectedRoute`: Component for securing routes based on authentication and roles
- Redirects unauthorized users to login

### Authentication Forms

- `Login.jsx`: Login form component
- `Register.jsx`: Registration form component

### Role-Based Dashboards

- `TeacherDashboard.jsx`: Dashboard for teacher users
- `StudentDashboard.jsx`: Dashboard for student users

## How to Use

### Backend

1. Application properties:
   - `jwt.secret`: Secret key for token signing
   - `jwt.expiration`: Token expiration time in milliseconds (default 24 hours)

2. Test users (from data.sql):
   - Teacher: email=teacher@example.com, password=password123
   - Student: email=student@example.com, password=password123

### Frontend

1. Login with the provided test credentials
2. Based on the user's role, they will be redirected to the appropriate dashboard
3. Protected routes will check both authentication and required role

## Authentication Flow

1. User submits login credentials
2. Backend authenticates user and generates JWT token
3. Token is stored in localStorage on frontend
4. Token is included in API requests via Authorization header
5. Protected routes check for valid token and roles
6. When token expires, user is redirected to login

## Security Considerations

- Passwords are encrypted using BCrypt
- JWT tokens are signed using HMAC-SHA256
- CORS is configured to allow only specific origins
- All authentication endpoints use HTTPS (in production)
- Token expiration prevents long-term token abuse

## Development and Testing

During development and testing, you can use the predefined test accounts:

- Teacher account:
  - Email: teacher@example.com
  - Password: password123

- Student account:
  - Email: student@example.com
  - Password: password123
