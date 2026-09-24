-- MySQL Schema DDL for PetSafe Platform
-- Database: petsafe_db

CREATE DATABASE IF NOT EXISTS petsafe_db;
USE petsafe_db;

-- 1. Users Table (Supports polymorphic hierarchy: PET_OWNER, FINDER, ADMIN)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(30) NOT NULL DEFAULT 'PET_OWNER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Pets Table (Contains pet profile and unique QR token mapping)
CREATE TABLE IF NOT EXISTS pets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(50),
    photo_url TEXT,
    medical_notes TEXT,
    qr_token VARCHAR(64) UNIQUE,
    fields_visible_to_public VARCHAR(255) DEFAULT 'name,phone',
    status VARCHAR(20) DEFAULT 'SAFE',
    lost_message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pets_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. QR Tokens Table (Manages active QR tokens generated for pets)
CREATE TABLE IF NOT EXISTS qr_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pet_id BIGINT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    CONSTRAINT fk_qr_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

-- 4. Messages Table (Stores messages sent from public finder scan page to owner)
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pet_id BIGINT NOT NULL,
    conversation_id VARCHAR(64) NOT NULL,
    sender_name VARCHAR(100) NOT NULL,
    sender_contact VARCHAR(100) NOT NULL,
    sender_type VARCHAR(20) DEFAULT 'FINDER',
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    latitude DOUBLE NULL,
    longitude DOUBLE NULL,
    CONSTRAINT fk_messages_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);
