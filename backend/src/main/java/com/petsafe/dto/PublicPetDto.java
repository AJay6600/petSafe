package com.petsafe.dto;

public class PublicPetDto {
    private Long id;
    private String name;
    private String species;
    private String breed;
    private String photoUrl;
    private String medicalNotes;
    private String ownerName;
    private String ownerContact;
    private String fieldsVisibleToPublic;
    private String qrToken;
    private String status;
    private String lostMessage;

    public PublicPetDto() {
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getOwnerContact() {
        return ownerContact;
    }

    public void setOwnerContact(String ownerContact) {
        this.ownerContact = ownerContact;
    }

    public String getFieldsVisibleToPublic() {
        return fieldsVisibleToPublic;
    }

    public void setFieldsVisibleToPublic(String fieldsVisibleToPublic) {
        this.fieldsVisibleToPublic = fieldsVisibleToPublic;
    }

    public String getQrToken() {
        return qrToken;
    }

    public void setQrToken(String qrToken) {
        this.qrToken = qrToken;
    }
}
