package com.petsafe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

/**
 * Main Spring Boot Application Entry point for PetSafe.
 * Excludes DataSourceAutoConfiguration to ensure plain JDBC (DriverManager)
 * is explicitly used per the academic rubric.
 */
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class PetSafeApplication {

    public static void main(String[] args) {
        SpringApplication.run(PetSafeApplication.class, args);
    }
}
