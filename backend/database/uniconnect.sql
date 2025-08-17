-- Create Database
CREATE DATABASE uniconnect;

-- Step 1: Create ENUM types
CREATE TYPE user_role AS ENUM ('student', 'faculty', 'admin');
CREATE TYPE appointment_status AS ENUM ('booked', 'cancelled', 'completed', 'waitlist');
CREATE TYPE meeting_type AS ENUM ('in_person', 'virtual');
CREATE TYPE weekday AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

-- Step 2: Create Tables

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    full_name VARCHAR(200),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
    appointment_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    faculty_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status appointment_status DEFAULT 'booked',
    purpose TEXT,
    meeting_type meeting_type DEFAULT 'in_person',
    meeting_link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE faculty_availability (
    availability_id SERIAL PRIMARY KEY,
    faculty_id INT NOT NULL,
    day_of_week weekday NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (faculty_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE waitlist (
    waitlist_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    faculty_id INT NOT NULL,
    requested_date DATE NOT NULL,
    requested_time TIME NOT NULL,
    priority INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES users(user_id) ON DELETE CASCADE
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_salt TEXT;

