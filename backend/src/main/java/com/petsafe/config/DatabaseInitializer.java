package com.petsafe.config;

import com.petsafe.dao.DatabaseConnection;
import jakarta.annotation.PostConstruct;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Statement;

/**
 * Automatic Database & Schema Initializer.
 * Ensures database tables and column additions are automatically applied on startup.
 */
@Component
@Order(1)
public class DatabaseInitializer {

    private final DatabaseConnection databaseConnection;

    public DatabaseInitializer(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    @PostConstruct
    public void initializeSchema() {
        System.out.println("[DB INITIALIZER] Verifying database connection and schema tables...");
        
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            // Create users table
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS users (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "email VARCHAR(150) NOT NULL UNIQUE, " +
                    "password_hash VARCHAR(255) NOT NULL, " +
                    "user_type VARCHAR(30) NOT NULL DEFAULT 'PET_OWNER', " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                    ")");

            // Create pets table
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS pets (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "owner_id BIGINT NOT NULL, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "species VARCHAR(50) NOT NULL, " +
                    "breed VARCHAR(50), " +
                    "photo_url TEXT, " +
                    "medical_notes TEXT, " +
                    "qr_token VARCHAR(64) UNIQUE, " +
                    "fields_visible_to_public VARCHAR(255) DEFAULT 'name,phone', " +
                    "status VARCHAR(20) DEFAULT 'SAFE', " +
                    "lost_message TEXT NULL, " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "CONSTRAINT fk_pets_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE" +
                    ")");

            // Create qr_tokens table
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS qr_tokens (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "pet_id BIGINT NOT NULL, " +
                    "token VARCHAR(64) NOT NULL UNIQUE, " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "expires_at TIMESTAMP NULL, " +
                    "CONSTRAINT fk_qr_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE" +
                    ")");

            // Create messages table
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS messages (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "pet_id BIGINT NOT NULL, " +
                    "conversation_id VARCHAR(64) NOT NULL, " +
                    "sender_name VARCHAR(100) NOT NULL, " +
                    "sender_contact VARCHAR(100) NOT NULL, " +
                    "sender_type VARCHAR(20) DEFAULT 'FINDER', " +
                    "message_text TEXT NOT NULL, " +
                    "is_read BOOLEAN DEFAULT FALSE, " +
                    "sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "responded_at TIMESTAMP NULL, " +
                    "CONSTRAINT fk_messages_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE" +
                    ")");

            // Alter tables to guarantee new columns exist on existing databases
            try { stmt.executeUpdate("ALTER TABLE pets ADD COLUMN status VARCHAR(20) DEFAULT 'SAFE'"); } catch (Exception ignored) {}
            try { stmt.executeUpdate("ALTER TABLE pets ADD COLUMN lost_message TEXT NULL"); } catch (Exception ignored) {}
            try { stmt.executeUpdate("ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE"); } catch (Exception ignored) {}
            try { stmt.executeUpdate("ALTER TABLE messages ADD COLUMN responded_at TIMESTAMP NULL"); } catch (Exception ignored) {}
            try { stmt.executeUpdate("ALTER TABLE messages ADD COLUMN conversation_id VARCHAR(64)"); } catch (Exception ignored) {}
            try { stmt.executeUpdate("ALTER TABLE messages ADD COLUMN sender_type VARCHAR(20) DEFAULT 'FINDER'"); } catch (Exception ignored) {}
            try { stmt.executeUpdate("ALTER TABLE messages ADD COLUMN latitude DOUBLE NULL"); } catch (Exception ignored) {}
            try { stmt.executeUpdate("ALTER TABLE messages ADD COLUMN longitude DOUBLE NULL"); } catch (Exception ignored) {}

            System.out.println("[DB INITIALIZER SUCCESS] Schema tables verified successfully on active JDBC engine!");
        } catch (Exception e) {
            System.err.println("[DB INITIALIZER ERROR] Failed initializing schema: " + e.getMessage());
        }
    }
}
