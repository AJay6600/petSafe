package com.petsafe.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * PetOwner subclass inheriting from abstract User.
 * Returns "PET_OWNER" from getRole() and holds a Collection List<Pet>.
 */
public class PetOwner extends User {
    private List<Pet> pets;

    public PetOwner() {
        super();
        this.pets = new ArrayList<>();
    }

    public PetOwner(Long id, String name, String email, String passwordHash, LocalDateTime createdAt) {
        super(id, name, email, passwordHash, createdAt);
        this.pets = new ArrayList<>();
    }

    @Override
    public String getRole() {
        return "PET_OWNER";
    }

    public List<Pet> getPets() {
        return pets;
    }

    public void setPets(List<Pet> pets) {
        this.pets = pets;
    }

    public void addPet(Pet pet) {
        this.pets.add(pet);
    }
}
