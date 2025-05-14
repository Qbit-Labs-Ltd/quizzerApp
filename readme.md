# Quizzer

Quick Quizzer Application made for customer.

## Team members:

- [Jami Nurmi](https://github.com/JamiNurmi)
- [Eemeli Hurmerinta](https://github.com/DooMi42)
- [Herkko Kovanen](https://github.com/Gigaheku)
- [Santeri Kuusisto](https://github.com/Santeri67)
- [Henri Tomperi](https://github.com/t0mperi)

## Project Goal:

We create a web-based quiz platform for Haaga-Helia teachers and students.

### Teacher Features:

    Manage quizzes: add, edit, delete
    Add multiple-choice questions with difficulty levels
    Add and manage answer options (mark correct answers)
    Categorize quizzes with tags (e.g., Agile, Databases)

### Student Features:

    Browse and take published quizzes
    Receive feedback after each answer
    View quiz results (correct %, per-question stats)
    Write, edit, and delete quiz reviews

### Tech Stack:

    Backend: Java + Spring Boot
    Frontend: React
    Two separate web apps: one for teachers (dashboard) and one for students

## Swagger Review

- [Swagger Review Document](https://docs.google.com/document/d/1uplIyucbE9nlv_DSu_333Yy0IMWkm_kbE6ZeKCXs1_Y/edit?usp=sharing)

## Retrospectives

- [Sprint 1 Flinga board](https://edu.flinga.fi/s/EDNHYTF)
- [Sprint 2 Flinga board](https://edu.flinga.fi/s/EK7XZFV)
  
## Sprint Backlogs:

- [Sprint 1 Backlog](https://github.com/orgs/Qbit-Labs-Ltd/projects/1/views/1)

- [Sprint 2 Backlog](https://github.com/orgs/Qbit-Labs-Ltd/projects/3/views/1)
  
- [Sprint 3 Backlog](https://github.com/orgs/Qbit-Labs-Ltd/projects/6/views/1)

## Logo

![App Logo](/applogo.png "App logo")

## How to Run App

To run the application, follow these detailed instructions:

### Backend Setup and Run:
1. Navigate to the backend directory:
```bash
cd backend
```

2. Make sure you have Java 17 or later installed. You can check your Java version with:
```bash
java -version
```

3. Install dependencies and build the project:
```bash
./mvnw clean install
```

4. Run the Spring Boot application:
```bash
./mvnw spring-boot:run
```

The backend server will start on http://localhost:8080

### Frontend Setup and Run:
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Make sure you have Node.js installed (version 16 or later). You can check your Node version with:
```bash
node --version
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

The frontend application will be available at http://localhost:5173

### Development Notes:
- The backend uses Spring Boot and requires Java 17+
- The frontend uses React and requires Node.js 16+
- Make sure both backend and frontend are running simultaneously for full functionality
- Backend API documentation is available at http://localhost:8080/swagger-ui.html when the server is running

## Docker Instructions

### Prerequisites
- Docker installed on your system
- Docker Compose installed on your system

### Running with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd quizzer
```

2. Build and start the containers:
```bash
docker-compose up --build
```

This will:
- Build and start the backend Spring Boot application
- Build and start the frontend React application
- Set up the necessary database

The applications will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080

### Stopping the containers
To stop the running containers:
```bash
docker-compose down
```

### Additional Docker Commands

- To view running containers:
```bash
docker-compose ps
```

- To view logs:
```bash
docker-compose logs -f
```

- To rebuild a specific service:
```bash
docker-compose up --build <service-name>
```
