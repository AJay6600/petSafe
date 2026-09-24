package com.petsafe.model;

import java.time.LocalDateTime;

/**
 * Factory class for instantiating concrete User subclasses polymorphically.
 * Demonstrates clean OOP design patterns for viva defense.
 */
public class UserFactory {

    public static User createUser(String role, Long id, String name, String email, String passwordHash, LocalDateTime createdAt) {
        if ("ADMIN".equalsIgnoreCase(role)) {
            return new AdminUser(id, name, email, passwordHash, createdAt);
        }
        // Default to PetOwner
        return new PetOwner(id, name, email, passwordHash, createdAt);
    }
}
