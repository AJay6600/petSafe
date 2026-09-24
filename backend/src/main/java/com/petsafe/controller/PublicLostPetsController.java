package com.petsafe.controller;

import com.petsafe.dao.PetDao;
import com.petsafe.dto.PublicPetDto;
import com.petsafe.model.Pet;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/lost-pets")
public class PublicLostPetsController {

    private final PetDao petDao;

    public PublicLostPetsController(PetDao petDao) {
        this.petDao = petDao;
    }

    @GetMapping
    public ResponseEntity<?> getPublicLostPets() {
        List<Pet> missingPets = petDao.findByStatus("MISSING");
        List<PublicPetDto> dtoList = missingPets.stream().map(pet -> {
            PublicPetDto dto = new PublicPetDto();
            dto.setId(pet.getId());
            dto.setName(pet.getName());
            dto.setSpecies(pet.getSpecies());
            dto.setBreed(pet.getBreed());
            dto.setPhotoUrl(pet.getPhotoUrl());
            dto.setQrToken(pet.getQrToken());
            dto.setStatus(pet.getStatus());
            dto.setLostMessage(pet.getLostMessage());
            return dto;
        }).toList();
        return ResponseEntity.ok(dtoList);
    }
}
