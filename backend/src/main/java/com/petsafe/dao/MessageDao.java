package com.petsafe.dao;

import com.petsafe.model.Message;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * MessageDao using plain JDBC PreparedStatement operations.
 */
@Repository
public class MessageDao {

    private final DatabaseConnection databaseConnection;

    public MessageDao(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    public boolean save(Message message) {
        String sql = "INSERT INTO messages (pet_id, conversation_id, sender_name, sender_contact, sender_type, message_text, sent_at, is_read, responded_at, latitude, longitude) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setLong(1, message.getPetId());
            pstmt.setString(2, message.getConversationId());
            pstmt.setString(3, message.getSenderName());
            pstmt.setString(4, message.getSenderContact());
            pstmt.setString(5, message.getSenderType() != null ? message.getSenderType() : "FINDER");
            pstmt.setString(6, message.getMessageText());
            pstmt.setTimestamp(7, message.getSentAt() != null ? 
                    Timestamp.valueOf(message.getSentAt()) : new Timestamp(System.currentTimeMillis()));
            pstmt.setBoolean(8, message.isRead());
            pstmt.setTimestamp(9, message.getRespondedAt() != null ? Timestamp.valueOf(message.getRespondedAt()) : null);
            if (message.getLatitude() != null) {
                pstmt.setDouble(10, message.getLatitude());
            } else {
                pstmt.setNull(10, Types.DOUBLE);
            }
            if (message.getLongitude() != null) {
                pstmt.setDouble(11, message.getLongitude());
            } else {
                pstmt.setNull(11, Types.DOUBLE);
            }

            int affectedRows = pstmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        message.setId(generatedKeys.getLong(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            System.err.println("[MessageDao ERROR] Error saving message via JDBC: " + e.getMessage());
        }
        return false;
    }

    public List<Message> findByPetId(Long petId) {
        List<Message> messages = new ArrayList<>();
        String sql = "SELECT id, pet_id, conversation_id, sender_name, sender_contact, sender_type, message_text, sent_at, is_read, responded_at, latitude, longitude " +
                     "FROM messages WHERE pet_id = ? ORDER BY sent_at DESC";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, petId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    messages.add(mapResultSetToMessage(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[MessageDao ERROR] Error finding messages by pet ID: " + e.getMessage());
        }
        return messages;
    }

    public List<Message> findByOwnerId(Long ownerId) {
        List<Message> messages = new ArrayList<>();
        String sql = "SELECT m.id, m.pet_id, m.conversation_id, m.sender_name, m.sender_contact, m.sender_type, m.message_text, m.sent_at, m.is_read, m.responded_at, m.latitude, m.longitude " +
                     "FROM messages m JOIN pets p ON m.pet_id = p.id WHERE p.owner_id = ? ORDER BY m.sent_at DESC";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, ownerId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    messages.add(mapResultSetToMessage(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[MessageDao ERROR] Error finding messages by owner ID: " + e.getMessage());
        }
        return messages;
    }

    public List<Message> findByConversationId(String conversationId) {
        List<Message> messages = new ArrayList<>();
        String sql = "SELECT id, pet_id, conversation_id, sender_name, sender_contact, sender_type, message_text, sent_at, is_read, responded_at, latitude, longitude " +
                     "FROM messages WHERE conversation_id = ? ORDER BY sent_at ASC";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, conversationId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    messages.add(mapResultSetToMessage(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[MessageDao ERROR] Error finding messages by conversation ID: " + e.getMessage());
        }
        return messages;
    }

    public boolean markAsRead(Long messageId, Long ownerId) {
        String sql = "UPDATE messages m JOIN pets p ON m.pet_id = p.id SET m.is_read = TRUE " +
                     "WHERE m.id = ? AND p.owner_id = ?";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, messageId);
            pstmt.setLong(2, ownerId);

            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[MessageDao ERROR] Error marking message as read: " + e.getMessage());
        }
        return false;
    }

    public boolean deleteByConversationId(String conversationId, Long ownerId) {
        String sql = "DELETE m FROM messages m JOIN pets p ON m.pet_id = p.id " +
                     "WHERE m.conversation_id = ? AND p.owner_id = ?";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, conversationId);
            pstmt.setLong(2, ownerId);

            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[MessageDao ERROR] Error deleting conversation: " + e.getMessage());
        }
        return false;
    }

    public boolean deleteByPetId(Long petId, Long ownerId) {
        String sql = "DELETE m FROM messages m JOIN pets p ON m.pet_id = p.id " +
                     "WHERE m.pet_id = ? AND p.owner_id = ?";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, petId);
            pstmt.setLong(2, ownerId);

            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[MessageDao ERROR] Error deleting messages for pet: " + e.getMessage());
        }
        return false;
    }

    public boolean deleteAllByOwnerId(Long ownerId) {
        String sql = "DELETE m FROM messages m JOIN pets p ON m.pet_id = p.id " +
                     "WHERE p.owner_id = ?";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, ownerId);

            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[MessageDao ERROR] Error deleting all messages for owner: " + e.getMessage());
        }
        return false;
    }

    private Message mapResultSetToMessage(ResultSet rs) throws SQLException {
        Message msg = new Message();
        msg.setId(rs.getLong("id"));
        msg.setPetId(rs.getLong("pet_id"));
        msg.setConversationId(rs.getString("conversation_id"));
        msg.setSenderName(rs.getString("sender_name"));
        msg.setSenderContact(rs.getString("sender_contact"));
        msg.setSenderType(rs.getString("sender_type"));
        msg.setMessageText(rs.getString("message_text"));
        Timestamp ts = rs.getTimestamp("sent_at");
        if (ts != null) {
            msg.setSentAt(ts.toLocalDateTime());
        }
        msg.setRead(rs.getBoolean("is_read"));
        Timestamp respTs = rs.getTimestamp("responded_at");
        if (respTs != null) {
            msg.setRespondedAt(respTs.toLocalDateTime());
        }
        msg.setLatitude(rs.getObject("latitude", Double.class));
        msg.setLongitude(rs.getObject("longitude", Double.class));
        return msg;
    }
}
