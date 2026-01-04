SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
CREATE DATABASE IF NOT EXISTS ssoj CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ssoj;
CREATE TABLE user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    nickname VARCHAR(100),
    password VARCHAR(255) NOT NULL COMMENT '加密后密码',
    email VARCHAR(100) UNIQUE NOT NULL,
    profile TEXT,
    avatar VARCHAR(500) COMMENT '头像URL',
    background_image VARCHAR(500) COMMENT '背景图URL',
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE problem(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    input_format TEXT,
    output_format TEXT,
    sample_input TEXT,
    sample_output TEXT,
    sample_explanation TEXT,
    difficulty VARCHAR(20) NOT NULL,
    time_limit DOUBLE DEFAULT 1.0 COMMENT '时间限制(秒)',
    memory_limit INT DEFAULT 262144 COMMENT '内存限制(KB)',
    author_id BIGINT,
    number_of_submissions INT DEFAULT 0,
    number_of_accepted INT DEFAULT 0,
    likes INT DEFAULT 0,
    dislikes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES user(id) ON DELETE
    SET NULL,
        INDEX idx_difficulty(difficulty),
        INDEX idx_author_id(author_id),
        INDEX idx_created_at(created_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE tag(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE problem_tag(
    problem_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(problem_id, tag_id),
    FOREIGN KEY(problem_id) REFERENCES problem(id) ON DELETE CASCADE,
    FOREIGN KEY(tag_id) REFERENCES tag(id) ON DELETE CASCADE,
    INDEX idx_tag_id(tag_id)
);
CREATE TABLE test_case(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    problem_id BIGINT NOT NULL,
    input_path VARCHAR(500) NOT NULL COMMENT '输入文件路径',
    output_path VARCHAR(500) NOT NULL COMMENT '输出文件路径',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_problem_id(problem_id),
    FOREIGN KEY(problem_id) REFERENCES problem(id) ON DELETE CASCADE
);
CREATE TABLE submission(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    problem_id BIGINT NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL,
    max_time_used INT DEFAULT NULL COMMENT '最大运行时间(ms)',
    max_memory_used INT DEFAULT NULL COMMENT '最大内存使用(KB)',
    error_message TEXT DEFAULT NULL COMMENT '整体错误信息（如编译错误）',
    submitted_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_problem_time(user_id, problem_id, submitted_at),
    INDEX idx_status(status),
    FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY(problem_id) REFERENCES problem(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE result(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    submission_id BIGINT NOT NULL,
    test_case_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL COMMENT 'AC/WA/TLE/MLE/RE/CE等',
    error_message TEXT COMMENT '编译/运行错误信息',
    actual_output TEXT COMMENT '实际输出（部分）',
    time_used INT DEFAULT NULL COMMENT '运行时间(ms)',
    memory_used INT DEFAULT NULL COMMENT '内存使用(KB)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_submission_id (submission_id),
    INDEX idx_test_case_id (test_case_id),
    INDEX idx_status (status),
    FOREIGN KEY(submission_id) REFERENCES submission(id) ON DELETE CASCADE,
    FOREIGN KEY(test_case_id) REFERENCES test_case(id) ON DELETE CASCADE
);
CREATE TABLE announcement (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES user(id) ON DELETE
    SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE discussion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    problem_id BIGINT DEFAULT NULL COMMENT '关联题目ID，为NULL表示全局讨论',
    user_id BIGINT NOT NULL,
    parent_id BIGINT DEFAULT NULL COMMENT '父讨论ID，用于回复',
    title VARCHAR(200) DEFAULT NULL COMMENT '讨论标题，回复时可为NULL',
    content TEXT NOT NULL,
    likes INT DEFAULT 0,
    dislikes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES problem(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES discussion(id) ON DELETE CASCADE,
    INDEX idx_problem_id (problem_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_id (parent_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE vote (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL COMMENT 'PROBLEM or DISCUSSION',
    target_id BIGINT NOT NULL,
    vote_type TINYINT NOT NULL COMMENT '1 for up, -1 for down',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_target (user_id, type, target_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;