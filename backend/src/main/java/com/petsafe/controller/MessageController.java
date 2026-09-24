package com.petsafe.controller;

import com.petsafe.dao.MessageDao;
import com.petsafe.model.Message;
import com.petsafe.model.User;
import com.petsafe.service.PetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

/**
 * Controller allowing pet owners to view inbox messages for their pets.
 */
import com.petsafe.service.SocketClientService;
import com.petsafe.socket.SocketServerRunner;
import java.util.Map;

/**
 * Controller allowing pet owners to view inbox messages for their pets and send replies.
 */
@RestController
public class MessageController {

    private final MessageDao messageDao;
    private final PetService petService;
    private final SocketClientService socketClientService;
    private final SocketServerRunner socketServerRunner;

    public MessageController(MessageDao messageDao, PetService petService, SocketClientService socketClientService, SocketServerRunner socketServerRunner) {
        this.messageDao = messageDao;
        this.petService = petService;
        this.socketClientService = socketClientService;
        this.socketServerRunner = socketServerRunner;
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() 
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new SecurityException("Unauthenticated request.");
        }
        return (User) authentication.getPrincipal();
    }

    @GetMapping("/api/messages/pet/{petId}")
    public ResponseEntity<?> getPetMessages(@PathVariable Long petId) {
        try {
            User user = getAuthenticatedUser();
            // Validate pet ownership
            petService.getPetById(petId, user.getId());

            List<Message> messages = messageDao.findByPetId(petId);
            return ResponseEntity.ok(messages);
        } catch (SecurityException e) {
            return ResponseEntity.status(403)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/api/messages/owner")
    public ResponseEntity<?> getOwnerMessages() {
        try {
            User user = getAuthenticatedUser();
            List<Message> messages = messageDao.findByOwnerId(user.getId());
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/api/messages/{id}/read")
    public ResponseEntity<?> markMessageAsRead(@PathVariable Long id) {
        try {
            User user = getAuthenticatedUser();
            boolean updated = messageDao.markAsRead(id, user.getId());
            if (updated) {
                return ResponseEntity.ok(Collections.singletonMap("message", "Message marked as read."));
            } else {
                return ResponseEntity.status(404).body(Collections.singletonMap("error", "Message not found or unauthorized."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/api/conversations/{id}/reply")
    public ResponseEntity<?> ownerReply(@PathVariable("id") String conversationId, @RequestBody Map<String, Object> body) {
        try {
            User user = getAuthenticatedUser();
            String messageText = (String) body.get("messageText");
            Object petIdObj = body.get("petId");
            Long petId = petIdObj != null ? Long.valueOf(petIdObj.toString()) : null;

            if (messageText == null || messageText.isBlank()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Reply text cannot be empty."));
            }

            if (petId == null) {
                List<Message> existing = messageDao.findByConversationId(conversationId);
                if (!existing.isEmpty()) {
                    petId = existing.get(0).getPetId();
                } else {
                    return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Pet ID is required for reply."));
                }
            }

            // Verify pet ownership
            petService.getPetById(petId, user.getId());

            boolean sent = socketClientService.sendMessageOverSocket(
                    petId,
                    conversationId,
                    user.getName() + " (Owner)",
                    user.getEmail(),
                    "OWNER",
                    messageText
            );

            if (sent) {
                socketServerRunner.broadcastToConversation(conversationId, messageText);
                return ResponseEntity.ok(Collections.singletonMap("message", "Owner reply sent successfully."));
            } else {
                return ResponseEntity.status(500).body(Collections.singletonMap("error", "Failed to save reply."));
            }
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @DeleteMapping("/api/conversations/{id}")
    public ResponseEntity<?> deleteConversation(@PathVariable("id") String conversationId) {
        try {
            User user = getAuthenticatedUser();
            boolean deleted = messageDao.deleteByConversationId(conversationId, user.getId());
            if (deleted) {
                return ResponseEntity.ok(Collections.singletonMap("message", "Conversation thread deleted successfully."));
            } else {
                return ResponseEntity.status(404).body(Collections.singletonMap("error", "Conversation not found or unauthorized."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @DeleteMapping("/api/messages/pet/{petId}")
    public ResponseEntity<?> deletePetMessages(@PathVariable Long petId) {
        try {
            User user = getAuthenticatedUser();
            boolean deleted = messageDao.deleteByPetId(petId, user.getId());
            if (deleted) {
                return ResponseEntity.ok(Collections.singletonMap("message", "Pet inbox cleared successfully."));
            } else {
                return ResponseEntity.status(404).body(Collections.singletonMap("error", "No messages found for this pet or unauthorized."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @DeleteMapping("/api/messages/owner/all")
    public ResponseEntity<?> deleteAllOwnerMessages() {
        try {
            User user = getAuthenticatedUser();
            boolean deleted = messageDao.deleteAllByOwnerId(user.getId());
            if (deleted) {
                return ResponseEntity.ok(Collections.singletonMap("message", "Entire inbox cleared successfully."));
            } else {
                return ResponseEntity.ok(Collections.singletonMap("message", "Inbox is already empty."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
