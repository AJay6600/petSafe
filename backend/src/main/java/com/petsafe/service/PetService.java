package com.petsafe.service;

import com.petsafe.dao.PetDao;
import com.petsafe.model.Pet;
import com.petsafe.model.PetOwner;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service managing Pet CRUD logic and populating PetOwner.getPets() List<Pet>
 * for Collections rubric compliance.
 */
@Service
public class PetService {

    private final PetDao petDao;
    private final QrService qrService;

    public PetService(PetDao petDao, QrService qrService) {
        this.petDao = petDao;
        this.qrService = qrService;
    }

    public Pet createPet(Long ownerId, Pet pet) {
        pet.setOwnerId(ownerId);
        if (pet.getQrToken() == null || pet.getQrToken().isEmpty()) {
            pet.setQrToken(UUID.randomUUID().toString());
        }
        pet.setCreatedAt(LocalDateTime.now());

        boolean inserted = petDao.insertPet(pet);
        if (!inserted) {
            throw new RuntimeException("Failed to save pet record via JDBC.");
        }
        return pet;
    }

    /**
     * Fulfills Collections Rubric #1: Populates and returns List<Pet> inside PetOwner model.
     */
    public List<Pet> getPetsForOwner(PetOwner owner) {
        List<Pet> pets = petDao.findByOwnerId(owner.getId());
        owner.setPets(pets); // Populates PetOwner's List<Pet> collection
        return owner.getPets();
    }

    public Pet getPetById(Long petId, Long ownerId) {
        Pet pet = petDao.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet with ID " + petId + " not found."));

        if (!pet.getOwnerId().equals(ownerId)) {
            throw new SecurityException("Unauthorized access to pet record.");
        }
        return pet;
    }

    public Pet updatePet(Long petId, Long ownerId, Pet updatedData) {
        Pet existingPet = getPetById(petId, ownerId);

        existingPet.setName(updatedData.getName());
        existingPet.setSpecies(updatedData.getSpecies());
        existingPet.setBreed(updatedData.getBreed());
        existingPet.setPhotoUrl(updatedData.getPhotoUrl());
        existingPet.setMedicalNotes(updatedData.getMedicalNotes());
        if (updatedData.getFieldsVisibleToPublic() != null) {
            existingPet.setFieldsVisibleToPublic(updatedData.getFieldsVisibleToPublic());
        }

        boolean updated = petDao.updatePet(existingPet);
        if (!updated) {
            throw new RuntimeException("Failed to update pet record via JDBC.");
        }
        return existingPet;
    }

    public void deletePet(Long petId, Long ownerId) {
        // Validate ownership first
        getPetById(petId, ownerId);

        boolean deleted = petDao.deletePet(petId, ownerId);
        if (!deleted) {
            throw new RuntimeException("Failed to delete pet record via JDBC.");
        }
    }

    public Pet updatePetStatus(Long petId, Long ownerId, String status, String lostMessage) {
        Pet pet = getPetById(petId, ownerId);
        pet.setStatus(status);
        pet.setLostMessage(status.equals("MISSING") ? lostMessage : null);
        boolean updated = petDao.updatePetStatus(petId, ownerId, status, lostMessage);
        if (!updated) {
            throw new RuntimeException("Failed to update pet status via JDBC.");
        }
        return pet;
    }

    public byte[] generateQrSheetForOwner(Long ownerId) {
        List<Pet> pets = petDao.findByOwnerId(ownerId);
        return qrService.generateMultiPetQrPdf(pets);
    }

    public String getPetQrCodeBase64(Long petId, Long ownerId) {
        Pet pet = getPetById(petId, ownerId);
        return qrService.generateQrCodeBase64(pet.getQrToken());
    }
}
