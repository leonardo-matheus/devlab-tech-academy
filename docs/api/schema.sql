-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS devlab_newsletter CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE devlab_newsletter;

-- Tabela de inscritos
CREATE TABLE IF NOT EXISTS subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    status ENUM('active', 'unsubscribed') DEFAULT 'active',
    created_at DATETIME NOT NULL,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
