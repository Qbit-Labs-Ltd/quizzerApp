-- Create backend/src/main/resources/data.sql
-- Initial Categories
MERGE INTO category (name, description) KEY(name) VALUES 
('Programming', 'Programming and coding related quizzes');
MERGE INTO category (name, description) KEY(name) VALUES 
('Mathematics', 'Math concepts and problem solving');
MERGE INTO category (name, description) KEY(name) VALUES 
('Science', 'Scientific theories and experiments');
MERGE INTO category (name, description) KEY(name) VALUES 
('Languages', 'Language learning and linguistics');
MERGE INTO category (name, description) KEY(name) VALUES 
('History', 'Historical events and figures');