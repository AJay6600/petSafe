package com.petsafe.model;

import java.time.LocalDateTime;

/**
 * AdminUser subclass inheriting from abstract User.
 * Returns "ADMIN" from getRole().
 */
public class AdminUser extends User {

    public AdminUser() {
        super();
    }

    public AdminUser(Long id, String name, String email, String passwordHash, LocalDateTime createdAt) {
        super(id, name, email, passwordHash, createdAt);
    }

    @Override
    public String getRole() {
        return "ADMIN";
    }
}
