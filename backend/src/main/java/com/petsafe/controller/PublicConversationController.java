package com.petsafe.controller;

import com.petsafe.dao.MessageDao;
import com.petsafe.dto.FinderMessageRequest;
import com.petsafe.model.Message;
import com.petsafe.service.SocketClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

/**
 * Unauthenticated REST Controller for public 2-way conversation threads.
 */
@RestController
@RequestMapping("/api/public/conversations")
public class PublicConversationController {

    private final MessageDao messageDao;
    private final SocketClientService socketClientService;

    public PublicConversationController(MessageDao messageDao, SocketClientService socketClientService) {
        this.messageDao = messageDao;
        this.socketClientService = socketClientService;
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<?> getConversationMessages(@PathVariable("id") String conversationId) {
        List<Message> thread = messageDao.findByConversationId(conversationId);
        return ResponseEntity.ok(thread);
    }

    @PostMapping("/{id}/message")
    public ResponseEntity<?> sendFollowUpMessage(@PathVariable("id") String conversationId, @RequestBody FinderMessageRequest request) {
        List<Message> existingThread = messageDao.findByConversationId(conversationId);
        if (existingThread.isEmpty()) {
            return ResponseEntity.status(404).body(Collections.singletonMap("error", "Conversation thread not found."));
        }

        Message sample = existingThread.get(0);
        Long petId = sample.getPetId();
        String senderName = request.getSenderName() != null && !request.getSenderName().isBlank() ? request.getSenderName() : sample.getSenderName();
        String senderContact = request.getSenderContact() != null && !request.getSenderContact().isBlank() ? request.getSenderContact() : sample.getSenderContact();

        boolean sent = socketClientService.sendMessageOverSocket(
                petId,
                conversationId,
                senderName,
                senderContact,
                "FINDER",
                request.getMessageText(),
                request.getLatitude(),
                request.getLongitude()
        );

        if (sent) {
            return ResponseEntity.ok(Collections.singletonMap("message", "Message sent in conversation."));
        } else {
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Failed to send message over socket."));
        }
    }
}
