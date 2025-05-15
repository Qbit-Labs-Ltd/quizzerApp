-- Create backend/src/main/resources/data.sql
-- Initial Categories
INSERT INTO category (name, description) VALUES 
('Programming', 'Programming and coding related quizzes')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO category (name, description) VALUES 
('Mathematics', 'Math concepts and problem solving')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO category (name, description) VALUES 
('Science', 'Scientific theories and experiments')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO category (name, description) VALUES 
('Languages', 'Language learning and linguistics')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO category (name, description) VALUES 
('History', 'Historical events and figures')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- Add test users with password "password123" (bcrypt encoded)
INSERT INTO users (username, email, password)
VALUES 
('teacher1', 'teacher@example.com', '$2a$12$aOor1PUq5D8qmC1uk8YDL.0xbfL3A79za.KECFuXa4cWxZ9Si6BJe'),
('student1', 'student@example.com', '$2a$12$aOor1PUq5D8qmC1uk8YDL.0xbfL3A79za.KECFuXa4cWxZ9Si6BJe')
ON CONFLICT (email) DO NOTHING;

-- Add roles for test users
INSERT INTO user_roles (user_id, roles) 
VALUES 
((SELECT id FROM users WHERE email = 'teacher@example.com'), 'TEACHER'),
((SELECT id FROM users WHERE email = 'student@example.com'), 'STUDENT')
ON CONFLICT DO NOTHING;
