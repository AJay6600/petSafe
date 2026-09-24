package com.petsafe.service;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate Limiting Service for public pet finder message submissions.
 * Reuses the Map-based Collections Rubric pattern: ConcurrentHashMap<String, Instant>
 * tracking the last submission timestamp per pet token to throttle spam submissions.
 */
@Component
public class RateLimitService {

    private static final long COOLDOWN_SECONDS = 60;

    // Collections Rubric Requirement: Map<String, Instant> in-memory timestamp tracker
    private final Map<String, Instant> lastSubmissionMap = new ConcurrentHashMap<>();

    /**
     * Returns true if the token submitted a message less than 60 seconds ago.
     */
    public boolean isRateLimited(String qrToken) {
        if (qrToken == null) return false;
        Instant lastTime = lastSubmissionMap.get(qrToken);
        if (lastTime == null) return false;

        long secondsElapsed = Duration.between(lastTime, Instant.now()).getSeconds();
        return secondsElapsed < COOLDOWN_SECONDS;
    }

    /**
     * Records successful message submission timestamp for the QR token.
     */
    public void recordSubmission(String qrToken) {
        if (qrToken != null) {
            lastSubmissionMap.put(qrToken, Instant.now());
        }
    }

    public long getRemainingCooldownSeconds(String qrToken) {
        Instant lastTime = lastSubmissionMap.get(qrToken);
        if (lastTime == null) return 0;
        long secondsElapsed = Duration.between(lastTime, Instant.now()).getSeconds();
        return Math.max(0, COOLDOWN_SECONDS - secondsElapsed);
    }
}
