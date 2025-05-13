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
