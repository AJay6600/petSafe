package com.petsafe.dao;

import com.petsafe.model.User;
import com.petsafe.model.UserFactory;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * UserDao using plain JDBC java.sql.PreparedStatement and java.sql.ResultSet.
 * Operates polymorphically on abstract User base class.
 */
@Repository
public class UserDao {

    private final DatabaseConnection databaseConnection;

    public UserDao(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    /**
     * Inserts a user polymorphically. Calls user.getRole() to store the subclass role.
     */
    public boolean insertUser(User user) {
        String sql = "INSERT INTO users (name, email, password_hash, user_type, created_at) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setString(1, user.getName());
            pstmt.setString(2, user.getEmail());
            pstmt.setString(3, user.getPasswordHash());
            // Polymorphic method call: user.getRole() returns "PET_OWNER" or "ADMIN"
            pstmt.setString(4, user.getRole());
            
            LocalDateTime now = user.getCreatedAt() != null ? user.getCreatedAt() : LocalDateTime.now();
            pstmt.setTimestamp(5, Timestamp.valueOf(now));

            int affectedRows = pstmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        user.setId(generatedKeys.getLong(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            System.err.println("[UserDao ERROR] Failed to insert user: " + e.getMessage());
            throw new RuntimeException("Database error during user registration: " + e.getMessage(), e);
        }
        return false;
    }

    public Optional<User> findByEmail(String email) {
        String sql = "SELECT id, name, email, password_hash, user_type, created_at FROM users WHERE email = ?";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, email);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToUser(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[UserDao ERROR] Error in findByEmail: " + e.getMessage());
        }
        return Optional.empty();
    }

    public Optional<User> findById(Long id) {
        String sql = "SELECT id, name, email, password_hash, user_type, created_at FROM users WHERE id = ?";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToUser(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[UserDao ERROR] Error in findById: " + e.getMessage());
        }
        return Optional.empty();
    }

    public List<User> findAll() {
        List<User> users = new ArrayList<>();
        String sql = "SELECT id, name, email, password_hash, user_type, created_at FROM users";
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                users.add(mapResultSetToUser(rs));
            }
        } catch (SQLException e) {
            System.err.println("[UserDao ERROR] Error in findAll: " + e.getMessage());
        }
        return users;
    }

    private User mapResultSetToUser(ResultSet rs) throws SQLException {
        Long id = rs.getLong("id");
        String name = rs.getString("name");
        String email = rs.getString("email");
        String passwordHash = rs.getString("password_hash");
        String userType = rs.getString("user_type");
        Timestamp ts = rs.getTimestamp("created_at");
        LocalDateTime createdAt = ts != null ? ts.toLocalDateTime() : LocalDateTime.now();

        // Polymorphic factory instantiation
        return UserFactory.createUser(userType, id, name, email, passwordHash, createdAt);
    }
}
