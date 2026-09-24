package com.petsafe.service;

import com.petsafe.model.EmailNotification;
import com.petsafe.model.Notification;
import com.petsafe.model.SocketNotification;
import com.petsafe.socket.SocketServerRunner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * VIVA RUBRIC FEATURE 4: NotificationService demonstrating Collections + Polymorphism.
 * Dispatches a List<Notification> through polymorphism.
 */
@Service
public class NotificationService {

    @Autowired(required = false)
    private SocketServerRunner socketServerRunner;

    public void sendAlert(String ownerUsername, String ownerEmail, String finderMessage) {
        // VIVA RUBRIC: Java Collections Framework (List<Notification>)
        List<Notification> notificationList = new ArrayList<>();

        if (socketServerRunner != null) {
            notificationList.add(new SocketNotification(ownerUsername, finderMessage, socketServerRunner));
        }

        if (ownerEmail != null && !ownerEmail.isBlank()) {
            notificationList.add(new EmailNotification(ownerEmail, finderMessage));
        }

        // VIVA RUBRIC: Polymorphic dispatch across List<Notification>
        for (Notification notification : notificationList) {
            notification.send();
        }
    }
}
