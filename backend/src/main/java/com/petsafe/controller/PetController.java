package com.petsafe.controller;

import com.petsafe.model.Pet;
import com.petsafe.model.PetOwner;
import com.petsafe.model.User;
import com.petsafe.service.PetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Pet CRUD operations & QR code generation.
 * All endpoints require a valid JWT token.
 */
@RestController
@RequestMapping("/api/pets")
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() 
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new SecurityException("Unauthenticated request.");
        }
        return (User) authentication.getPrincipal();
    }

    @PostMapping
    public ResponseEntity<?> createPet(@RequestBody Pet pet) {
        try {
            User user = getAuthenticatedUser();
            Pet createdPet = petService.createPet(user.getId(), pet);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPet);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getOwnerPets() {
        try {
            User user = getAuthenticatedUser();
            if (!(user instanceof PetOwner)) {
                // If admin or other user type, cast or create dummy PetOwner for list fetch
                PetOwner owner = new PetOwner(user.getId(), user.getName(), user.getEmail(), user.getPasswordHash(), user.getCreatedAt());
                List<Pet> pets = petService.getPetsForOwner(owner);
                return ResponseEntity.ok(pets);
            }
            
            PetOwner owner = (PetOwner) user;
            List<Pet> pets = petService.getPetsForOwner(owner);
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPetById(@PathVariable Long id) {
        try {
            User user = getAuthenticatedUser();
            Pet pet = petService.getPetById(id, user.getId());
            return ResponseEntity.ok(pet);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePet(@PathVariable Long id, @RequestBody Pet updatedPet) {
        try {
            User user = getAuthenticatedUser();
            Pet pet = petService.updatePet(id, user.getId(), updatedPet);
            return ResponseEntity.ok(pet);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePet(@PathVariable Long id) {
        try {
            User user = getAuthenticatedUser();
            petService.deletePet(id, user.getId());
            return ResponseEntity.ok(Collections.singletonMap("message", "Pet deleted successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updatePetStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            User user = getAuthenticatedUser();
            String status = body.get("status");
            String lostMessage = body.get("lostMessage");
            if (status == null || (!status.equals("SAFE") && !status.equals("MISSING"))) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Status must be 'SAFE' or 'MISSING'"));
            }
            if (status.equals("MISSING") && (lostMessage == null || lostMessage.isBlank())) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "A lost message description is required when reporting a pet as missing."));
            }
            Pet pet = petService.updatePetStatus(id, user.getId(), status, lostMessage);
            return ResponseEntity.ok(pet);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/qr-sheet")
    public ResponseEntity<?> downloadQrSheet() {
        try {
            User user = getAuthenticatedUser();
            byte[] pdfBytes = petService.generateQrSheetForOwner(user.getId());
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"petsafe-qr-sheet.pdf\"")
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/qr")
    public ResponseEntity<?> getPetQrCode(@PathVariable Long id) {
        try {
            User user = getAuthenticatedUser();
            String qrBase64 = petService.getPetQrCodeBase64(id, user.getId());
            Map<String, String> response = Collections.singletonMap("qrCodeBase64", qrBase64);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
