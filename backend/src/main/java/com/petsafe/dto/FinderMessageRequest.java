package com.petsafe.dto;

public class FinderMessageRequest {
    private String senderName;
    private String senderContact;
    private String messageText;
    private String conversationId;
    private Double latitude;
    private Double longitude;

    public FinderMessageRequest() {
    }

    public FinderMessageRequest(String senderName, String senderContact, String messageText, String conversationId) {
        this.senderName = senderName;
        this.senderContact = senderContact;
        this.messageText = messageText;
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

    public String getMessageText() {
        return messageText;
    }

    public void setMessageText(String messageText) {
        this.messageText = messageText;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
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
