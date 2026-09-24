package com.petsafe.model;

import java.time.LocalDateTime;

/**
 * Domain model representing a message sent from finder to pet owner.
 */
public class Message {
    private Long id;
    private Long petId;
    private String conversationId;
    private String senderName;
    private String senderContact;
    private String senderType; // "FINDER" or "OWNER"
    private String messageText;
    private boolean isRead;
    private LocalDateTime sentAt;
    private LocalDateTime respondedAt;
    private Double latitude;
    private Double longitude;

    public Message() {
        this.isRead = false;
        this.senderType = "FINDER";
        this.sentAt = LocalDateTime.now();
    }

    public Message(Long id, Long petId, String conversationId, String senderName, String senderContact, 
                   String senderType, String messageText, boolean isRead, LocalDateTime sentAt, LocalDateTime respondedAt) {
        this.id = id;
        this.petId = petId;
        this.conversationId = conversationId;
        this.senderName = senderName;
        this.senderContact = senderContact;
        this.senderType = senderType != null ? senderType : "FINDER";
        this.messageText = messageText;
        this.isRead = isRead;
        this.sentAt = sentAt != null ? sentAt : LocalDateTime.now();
        this.respondedAt = respondedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPetId() {
        return petId;
    }

    public void setPetId(Long petId) {
        this.petId = petId;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getSenderContact() {
        return senderContact;
    }

    public void setSenderContact(String senderContact) {
        this.senderContact = senderContact;
    }

    public String getSenderType() {
        return senderType;
    }

    public void setSenderType(String senderType) {
        this.senderType = senderType;
    }

    public String getMessageText() {
        return messageText;
    }

    public void setMessageText(String messageText) {
        this.messageText = messageText;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public LocalDateTime getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(LocalDateTime respondedAt) {
        this.respondedAt = respondedAt;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}
