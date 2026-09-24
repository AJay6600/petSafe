package com.petsafe.model;

import java.time.LocalDateTime;

/**
 * VIVA RUBRIC FEATURE 4: Abstract Base Class for Inheritance demonstration.
 */
public abstract class Notification {
    private String recipient;
    private String messageContent;
    private LocalDateTime timestamp;

    public Notification(String recipient, String messageContent) {
        this.recipient = recipient;
        this.messageContent = messageContent;
        this.timestamp = LocalDateTime.now();
    }

    public String getRecipient() {
        return recipient;
    }

    public String getMessageContent() {
        return messageContent;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    /**
     * Polymorphic method to deliver notification.
     */
    public abstract void send();
}
