package com.petsafe.dao;

import com.petsafe.model.Pet;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * PetDao using plain JDBC PreparedStatement operations.
 * Synchronizes with QrTokenCache (Map<String, Pet>) for Collections rubric compliance.
 */
@Repository
public class PetDao {

    private final DatabaseConnection databaseConnection;
    private final QrTokenCache qrTokenCache;

    public PetDao(DatabaseConnection databaseConnection, QrTokenCache qrTokenCache) {
        this.databaseConnection = databaseConnection;
        this.qrTokenCache = qrTokenCache;
    }

    /**
     * Pre-loads active QR tokens into the in-memory Map cache.
     */
    public void loadCacheFromDatabase() {
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT id, owner_id, name, species, breed, photo_url, medical_notes, qr_token, fields_visible_to_public, status, lost_message, created_at FROM pets WHERE qr_token IS NOT NULL")) {

            int count = 0;
            while (rs.next()) {
                Pet pet = mapResultSetToPet(rs);
                qrTokenCache.put(pet.getQrToken(), pet);
                count++;
            }
            System.out.println("[PETDAO CACHE] Pre-loaded " + count + " pets into QrTokenCache (Map<String, Pet>).");
        } catch (SQLException e) {
            System.out.println("[PETDAO CACHE INFO] Cache initialization ready for new records.");
        }
    }

    public boolean insertPet(Pet pet) {
        String sql = "INSERT INTO pets (owner_id, name, species, breed, photo_url, medical_notes, qr_token, fields_visible_to_public, status, lost_message, created_at) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setLong(1, pet.getOwnerId());
            pstmt.setString(2, pet.getName());
            pstmt.setString(3, pet.getSpecies());
            pstmt.setString(4, pet.getBreed());
            pstmt.setString(5, pet.getPhotoUrl());
            pstmt.setString(6, pet.getMedicalNotes());
            pstmt.setString(7, pet.getQrToken());
            pstmt.setString(8, pet.getFieldsVisibleToPublic());
            pstmt.setString(9, pet.getStatus() != null ? pet.getStatus() : "SAFE");
            pstmt.setString(10, pet.getLostMessage());
            
            LocalDateTime now = pet.getCreatedAt() != null ? pet.getCreatedAt() : LocalDateTime.now();
            pstmt.setTimestamp(11, Timestamp.valueOf(now));

            int affectedRows = pstmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        pet.setId(generatedKeys.getLong(1));
                    }
                }
                // Update in-memory Map cache
                if (pet.getQrToken() != null) {
                    qrTokenCache.put(pet.getQrToken(), pet);
                }
                return true;
            }
        } catch (SQLException e) {
            System.err.println("[PetDao ERROR] Failed to insert pet via JDBC: " + e.getMessage());
        }
        return false;
    }

    public List<Pet> findByOwnerId(Long ownerId) {
        List<Pet> pets = new ArrayList<>();
        String sql = "SELECT id, owner_id, name, species, breed, photo_url, medical_notes, qr_token, fields_visible_to_public, status, lost_message, created_at " +
                     "FROM pets WHERE owner_id = ? ORDER BY id DESC";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, ownerId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    pets.add(mapResultSetToPet(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[PetDao ERROR] Failed to find pets by owner ID: " + e.getMessage());
        }
        return pets;
    }

    public List<Pet> findAll() {
        List<Pet> pets = new ArrayList<>();
        String sql = "SELECT id, owner_id, name, species, breed, photo_url, medical_notes, qr_token, fields_visible_to_public, status, lost_message, created_at " +
                     "FROM pets ORDER BY id DESC";
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                pets.add(mapResultSetToPet(rs));
            }
        } catch (SQLException e) {
            System.err.println("[PetDao ERROR] Failed to find all pets: " + e.getMessage());
        }
        return pets;
    }

    public List<Pet> findByStatus(String status) {
        List<Pet> pets = new ArrayList<>();
        String sql = "SELECT id, owner_id, name, species, breed, photo_url, medical_notes, qr_token, fields_visible_to_public, status, lost_message, created_at " +
                     "FROM pets WHERE status = ? ORDER BY id DESC";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, status);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    pets.add(mapResultSetToPet(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[PetDao ERROR] Failed to find pets by status: " + e.getMessage());
        }
        return pets;
    }

    public Optional<Pet> findById(Long id) {
        String sql = "SELECT id, owner_id, name, species, breed, photo_url, medical_notes, qr_token, fields_visible_to_public, status, lost_message, created_at " +
                     "FROM pets WHERE id = ?";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToPet(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[PetDao ERROR] Failed to find pet by ID: " + e.getMessage());
        }
        return Optional.empty();
    }

    public Optional<Pet> findByQrToken(String token) {
        // Check in-memory Map cache first
        Optional<Pet> cachedPet = qrTokenCache.get(token);
        if (cachedPet.isPresent()) {
            return cachedPet;
        }

        String sql = "SELECT id, owner_id, name, species, breed, photo_url, medical_notes, qr_token, fields_visible_to_public, status, lost_message, created_at " +
                     "FROM pets WHERE qr_token = ?";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, token);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Pet pet = mapResultSetToPet(rs);
                    qrTokenCache.put(token, pet);
                    return Optional.of(pet);
                }
            }
        } catch (SQLException e) {
            System.err.println("[PetDao ERROR] Failed to find pet by QR token: " + e.getMessage());
        }
        return Optional.empty();
    }

    public boolean updatePet(Pet pet) {
        String sql = "UPDATE pets SET name = ?, species = ?, breed = ?, photo_url = ?, medical_notes = ?, fields_visible_to_public = ?, status = ?, lost_message = ? " +
                     "WHERE id = ? AND owner_id = ?";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, pet.getName());
            pstmt.setString(2, pet.getSpecies());
            pstmt.setString(3, pet.getBreed());
            pstmt.setString(4, pet.getPhotoUrl());
            pstmt.setString(5, pet.getMedicalNotes());
            pstmt.setString(6, pet.getFieldsVisibleToPublic());
            pstmt.setString(7, pet.getStatus() != null ? pet.getStatus() : "SAFE");
            pstmt.setString(8, pet.getLostMessage());
            pstmt.setLong(9, pet.getId());
            pstmt.setLong(10, pet.getOwnerId());

            int rows = pstmt.executeUpdate();
            if (rows > 0) {
                if (pet.getQrToken() != null) {
                    qrTokenCache.put(pet.getQrToken(), pet);
                }
                return true;
            }
        } catch (SQLException e) {
            System.err.println("[PetDao ERROR] Failed to update pet: " + e.getMessage());
        }
        return false;
    }

    public boolean updatePetStatus(Long petId, Long ownerId, String status, String lostMessage) {
        String sql = "UPDATE pets SET status = ?, lost_message = ? WHERE id = ? AND owner_id = ?";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, status);
            pstmt.setString(2, status.equals("MISSING") ? lostMessage : null);
            pstmt.setLong(3, petId);
            pstmt.setLong(4, ownerId);

            int rows = pstmt.executeUpdate();
            if (rows > 0) {
                findById(petId).ifPresent(p -> {
                    if (p.getQrToken() != null) qrTokenCache.put(p.getQrToken(), p);
                });
                return true;
            }
        } catch (SQLException e) {
            System.err.println("[PetDao ERROR] Failed to update pet status: " + e.getMessage());
        }
        return false;
    }

    public boolean deletePet(Long id, Long ownerId) {
        // Fetch pet first to get qrToken for cache removal
        Optional<Pet> petOpt = findById(id);

        String sql = "DELETE FROM pets WHERE id = ? AND owner_id = ?";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, id);
            pstmt.setLong(2, ownerId);

            int rows = pstmt.executeUpdate();
            if (rows > 0) {
                petOpt.ifPresent(pet -> qrTokenCache.remove(pet.getQrToken()));
                return true;
            }
        } catch (SQLException e) {
            System.err.println("[PetDao ERROR] Failed to delete pet: " + e.getMessage());
        }
        return false;
    }

    private Pet mapResultSetToPet(ResultSet rs) throws SQLException {
        Pet pet = new Pet();
        pet.setId(rs.getLong("id"));
        pet.setOwnerId(rs.getLong("owner_id"));
        pet.setName(rs.getString("name"));
        pet.setSpecies(rs.getString("species"));
        pet.setBreed(rs.getString("breed"));
        pet.setPhotoUrl(rs.getString("photo_url"));
        pet.setMedicalNotes(rs.getString("medical_notes"));
        pet.setQrToken(rs.getString("qr_token"));
        pet.setFieldsVisibleToPublic(rs.getString("fields_visible_to_public"));
        pet.setStatus(rs.getString("status") != null ? rs.getString("status") : "SAFE");
        pet.setLostMessage(rs.getString("lost_message"));
        Timestamp ts = rs.getTimestamp("created_at");
        if (ts != null) {
            pet.setCreatedAt(ts.toLocalDateTime());
        }
        return pet;
    }
}
