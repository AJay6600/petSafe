package com.petsafe.model;

import java.time.LocalDateTime;

/**
 * Domain model representing a Pet in the system.
 */
public class Pet {
    private Long id;
    private Long ownerId;
    private String name;
    private String species;
    private String breed;
    private String photoUrl;
    private String medicalNotes;
    private String qrToken;
    private String fieldsVisibleToPublic; // e.g. "name,phone"
    private String status; // "SAFE" or "MISSING"
    private String lostMessage; // Emergency message when MISSING
    private LocalDateTime createdAt;

    public Pet() {
        this.fieldsVisibleToPublic = "name,phone";
        this.status = "SAFE";
    }

    public Pet(Long id, Long ownerId, String name, String species, String breed, 
               String photoUrl, String medicalNotes, String qrToken, String fieldsVisibleToPublic, 
               String status, String lostMessage, LocalDateTime createdAt) {
        this.id = id;
        this.ownerId = ownerId;
        this.name = name;
        this.species = species;
        this.breed = breed;
        this.photoUrl = photoUrl;
        this.medicalNotes = medicalNotes;
        this.qrToken = qrToken;
        this.fieldsVisibleToPublic = fieldsVisibleToPublic != null ? fieldsVisibleToPublic : "name,phone";
        this.status = status != null ? status : "SAFE";
        this.lostMessage = lostMessage;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecies() {
        return species;
    }

    public void setSpecies(String species) {
        this.species = species;
    }

    public String getBreed() {
        return breed;
    }

    public void setBreed(String breed) {
        this.breed = breed;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getMedicalNotes() {
        return medicalNotes;
    }

    public void setMedicalNotes(String medicalNotes) {
        this.medicalNotes = medicalNotes;
    }

    public String getQrToken() {
        return qrToken;
    }

    public void setQrToken(String qrToken) {
        this.qrToken = qrToken;
    }

    public String getFieldsVisibleToPublic() {
        return fieldsVisibleToPublic;
    }

    public void setFieldsVisibleToPublic(String fieldsVisibleToPublic) {
        this.fieldsVisibleToPublic = fieldsVisibleToPublic;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLostMessage() {
        return lostMessage;
    }

    public void setLostMessage(String lostMessage) {
        this.lostMessage = lostMessage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
