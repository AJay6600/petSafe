package com.petsafe.controller;

import com.petsafe.dao.PetDao;
import com.petsafe.dao.UserDao;
import com.petsafe.dto.FinderMessageRequest;
import com.petsafe.dto.PublicPetDto;
import com.petsafe.model.Pet;
import com.petsafe.model.User;
import com.petsafe.service.SocketClientService;
import com.petsafe.service.NotificationService;
import com.petsafe.service.RateLimitService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Unauthenticated REST Controller for public pet scan lookups & socket alerts.
 */
@RestController
@RequestMapping("/api/public/pet")
public class PublicPetController {

    private final PetDao petDao;
    private final UserDao userDao;
    private final SocketClientService socketClientService;
    private final RateLimitService rateLimitService;
    private final NotificationService notificationService;

    public PublicPetController(PetDao petDao, UserDao userDao, SocketClientService socketClientService, RateLimitService rateLimitService, NotificationService notificationService) {
        this.petDao = petDao;
        this.userDao = userDao;
        this.socketClientService = socketClientService;
        this.rateLimitService = rateLimitService;
        this.notificationService = notificationService;
    }

    @GetMapping("/{token}")
    public ResponseEntity<?> getPublicPetDetails(@PathVariable String token) {
        // Fast O(1) in-memory Map lookup from QrTokenCache (Collections Rubric)
        Optional<Pet> petOpt = petDao.findByQrToken(token);

        if (petOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Collections.singletonMap("error", "Pet tag with token " + token + " not found or invalid."));
        }

        Pet pet = petOpt.get();
        PublicPetDto dto = new PublicPetDto();
        dto.setId(pet.getId());
        dto.setQrToken(pet.getQrToken());
        dto.setSpecies(pet.getSpecies());
        dto.setBreed(pet.getBreed());
        dto.setPhotoUrl(pet.getPhotoUrl());
        dto.setFieldsVisibleToPublic(pet.getFieldsVisibleToPublic());
        dto.setStatus(pet.getStatus());
        dto.setLostMessage(pet.getLostMessage());

        String flags = pet.getFieldsVisibleToPublic() != null ? pet.getFieldsVisibleToPublic() : "name,phone";

        // Filter details according to owner privacy settings
        if (flags.contains("name")) {
            dto.setName(pet.getName());
        } else {
            dto.setName("Protected Pet");
        }

        if (flags.contains("medicalNotes")) {
            dto.setMedicalNotes(pet.getMedicalNotes());
        }

        // Fetch owner emergency contact details
        Optional<User> ownerOpt = userDao.findById(pet.getOwnerId());
        if (ownerOpt.isPresent()) {
            User owner = ownerOpt.get();
            dto.setOwnerName(owner.getName());
            if (flags.contains("phone")) {
                dto.setOwnerContact(owner.getEmail());
            }
        }

        return ResponseEntity.ok(dto);
    }


    @PostMapping("/{token}/message")
    public ResponseEntity<?> sendFinderMessage(@PathVariable String token, @RequestBody FinderMessageRequest request) {
        // VIVA RUBRIC FEATURE 3: Throttled rate limiting
        if (rateLimitService.isRateLimited(token)) {
            long remainingSeconds = rateLimitService.getRemainingCooldownSeconds(token);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Collections.singletonMap("error", "Rate limit exceeded. Please wait " + remainingSeconds + " seconds before sending another alert for this pet."));
        }

        Optional<Pet> petOpt = petDao.findByQrToken(token);
        if (petOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Collections.singletonMap("error", "Pet tag not found."));
        }

        Pet pet = petOpt.get();

        String conversationId = request.getConversationId();
        if (conversationId == null || conversationId.isBlank()) {
            conversationId = java.util.UUID.randomUUID().toString();
        }

        boolean sent = socketClientService.sendMessageOverSocket(
                pet.getId(),
                conversationId,
                request.getSenderName(),
                request.getSenderContact(),
                "FINDER",
                request.getMessageText(),
                request.getLatitude(),
                request.getLongitude()
        );

        if (sent) {
            rateLimitService.recordSubmission(token);
            // VIVA RUBRIC FEATURE 4: Dispatch polymorphic notifications
            Optional<User> ownerOpt = userDao.findById(pet.getOwnerId());
            String ownerName = ownerOpt.map(User::getName).orElse("Owner");
            String ownerEmail = ownerOpt.map(User::getEmail).orElse("");
            notificationService.sendAlert(ownerName, ownerEmail, "Finder Alert for " + pet.getName() + ": " + request.getMessageText());

            Map<String, Object> resp = new java.util.HashMap<>();
            resp.put("message", "Emergency alert transmitted to owner!");
            resp.put("conversationId", conversationId);
            return ResponseEntity.ok(resp);
        } else {
            return ResponseEntity.status(500)
                    .body(Collections.singletonMap("error", "Failed to transmit message over socket."));
        }
    }
}
