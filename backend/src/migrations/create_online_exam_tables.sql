-- ============================================
-- Online Exam System Database Schema
-- ============================================

-- 1. EXAMS table
CREATE TABLE IF NOT EXISTS online_exams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INT DEFAULT 60 COMMENT 'Thời gian làm bài (phút)',
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. SECTIONS table
CREATE TABLE IF NOT EXISTS online_sections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    type ENUM('reading', 'listening') NOT NULL,
    title VARCHAR(255),
    content TEXT COMMENT 'Reading passage text',
    audio_url VARCHAR(500) COMMENT 'Audio file path for listening',
    audio_filename VARCHAR(255),
    section_order INT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES online_exams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. QUESTIONS table
CREATE TABLE IF NOT EXISTS online_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    section_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false', 'fill_blank') DEFAULT 'multiple_choice',
    order_index INT DEFAULT 1,
    points DECIMAL(5,2) DEFAULT 1.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES online_sections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. ANSWERS table
CREATE TABLE IF NOT EXISTS online_answers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT NOT NULL,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    answer_order INT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES online_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. RESULTS table
CREATE TABLE IF NOT EXISTS online_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    exam_id INT NOT NULL,
    score DECIMAL(5,2) DEFAULT 0,
    total_questions INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    time_spent INT DEFAULT 0 COMMENT 'Thời gian làm bài (giây)',
    status ENUM('in_progress', 'completed') DEFAULT 'in_progress',
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES online_exams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. USER_ANSWERS table
CREATE TABLE IF NOT EXISTS online_user_answers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    result_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_answer TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    points_earned DECIMAL(5,2) DEFAULT 0,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (result_id) REFERENCES online_results(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES online_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes for better performance
CREATE INDEX idx_sections_exam ON online_sections(exam_id);
CREATE INDEX idx_questions_section ON online_questions(section_id);
CREATE INDEX idx_answers_question ON online_answers(question_id);
CREATE INDEX idx_results_user ON online_results(user_id);
CREATE INDEX idx_results_exam ON online_results(exam_id);
CREATE INDEX idx_user_answers_result ON online_user_answers(result_id);
CREATE INDEX idx_user_answers_question ON online_user_answers(question_id);