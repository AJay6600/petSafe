package com.petsafe.controller;

import com.petsafe.dao.PetDao;
import com.petsafe.dao.UserDao;
import com.petsafe.model.Pet;
import com.petsafe.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

/**
 * VIVA RUBRIC FEATURE 6: Admin View Controller.
 * Restricts platform management operations to ADMIN role users.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserDao userDao;
    private final PetDao petDao;

    public AdminController(UserDao userDao, PetDao petDao) {
        this.userDao = userDao;
        this.petDao = petDao;
    }

    private User getAuthenticatedAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new SecurityException("Unauthenticated request.");
        }
        User user = (User) authentication.getPrincipal();
        if (!"ADMIN".equals(user.getRole())) {
            throw new SecurityException("Access denied. Admin privileges required.");
        }
        return user;
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            getAuthenticatedAdmin();
            List<User> users = userDao.findAll();
            return ResponseEntity.ok(users);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/pets")
    public ResponseEntity<?> getAllPets() {
        try {
            getAuthenticatedAdmin();
            List<Pet> pets = petDao.findAll();
            return ResponseEntity.ok(pets);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
