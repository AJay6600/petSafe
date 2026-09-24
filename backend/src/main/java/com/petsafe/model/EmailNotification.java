package com.petsafe.model;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * VIVA RUBRIC FEATURE 4: EmailNotification subclass extending Notification.
 */
public class EmailNotification extends Notification {
    private static final Logger logger = LoggerFactory.getLogger(EmailNotification.class);

    public EmailNotification(String recipientEmail, String messageContent) {
        super(recipientEmail, messageContent);
    }

    @Override
    public void send() {
        // Simulated email dispatch log for demonstration / viva rubric
        logger.info("[EMAIL NOTIFICATION] Sending email to {}: '{}'", getRecipient(), getMessageContent());
    }
}
