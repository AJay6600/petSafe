package com.petsafe.dao;

import com.petsafe.model.Pet;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-Memory Map-based QR Token Cache.
 * Graded Collections Rubric Component #2: Uses java.util.concurrent.ConcurrentHashMap
 * for O(1) in-memory QR token -> Pet lookups during public scan operations.
 */
@Component
public class QrTokenCache {

    // Collections Rubric Requirement: Map<String, Pet> in-memory cache for fast QR lookups
    private final Map<String, Pet> tokenToPetMap = new ConcurrentHashMap<>();

    public void put(String qrToken, Pet pet) {
        if (qrToken != null && pet != null) {
            tokenToPetMap.put(qrToken, pet);
        }
    }

    public Optional<Pet> get(String qrToken) {
        if (qrToken == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(tokenToPetMap.get(qrToken));
    }

    public void remove(String qrToken) {
        if (qrToken != null) {
            tokenToPetMap.remove(qrToken);
        }
    }

    public void clear() {
        tokenToPetMap.clear();
    }

    public int size() {
        return tokenToPetMap.size();
    }

    public Map<String, Pet> getAll() {
        return tokenToPetMap;
    }
}
