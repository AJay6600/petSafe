package com.petsafe.service;

import com.petsafe.dao.UserDao;
import com.petsafe.dto.AuthResponse;
import com.petsafe.dto.LoginRequest;
import com.petsafe.dto.RegisterRequest;
import com.petsafe.dto.UserDto;
import com.petsafe.model.User;
import com.petsafe.model.UserFactory;
import com.petsafe.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Authentication service handling polymorphic user creation, BCrypt hashing,
 * credential verification, and JWT issuance.
 */
@Service
public class AuthService {

    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserDao userDao, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userDao = userDao;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userDao.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("User with email " + request.getEmail() + " already exists.");
        }

        // BCrypt Password Hashing
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        String role = request.getRole() != null ? request.getRole() : "PET_OWNER";

        // Polymorphic factory instantiation: creates PetOwner or AdminUser
        User newUser = UserFactory.createUser(
                role,
                null,
                request.getName(),
                request.getEmail(),
                hashedPassword,
                LocalDateTime.now()
        );

        // Plain JDBC insert (calls user.getRole() polymorphically)
        boolean inserted = userDao.insertUser(newUser);
        if (!inserted) {
            throw new RuntimeException("Failed to register user to database via JDBC.");
        }

        // Issue JWT token
        String token = tokenProvider.generateToken(newUser);

        return new AuthResponse(token, new UserDto(newUser));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userDao.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        // Issue JWT token
        String token = tokenProvider.generateToken(user);

        return new AuthResponse(token, new UserDto(user));
    }
}
