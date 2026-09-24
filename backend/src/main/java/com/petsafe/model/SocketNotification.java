package com.petsafe.model;

import com.petsafe.socket.SocketServerRunner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * VIVA RUBRIC FEATURE 4: SocketNotification subclass extending Notification.
 */
public class SocketNotification extends Notification {
    private static final Logger logger = LoggerFactory.getLogger(SocketNotification.class);
    private final SocketServerRunner socketServerRunner;

    public SocketNotification(String recipientUsername, String messageContent, SocketServerRunner socketServerRunner) {
        super(recipientUsername, messageContent);
        this.socketServerRunner = socketServerRunner;
    }

    @Override
    public void send() {
        logger.info("[SOCKET NOTIFICATION] Transmitting alert to {}: '{}'", getRecipient(), getMessageContent());
        if (socketServerRunner != null) {
            Message msg = new Message();
            msg.setSenderName(getRecipient());
            msg.setMessageText(getMessageContent());
            socketServerRunner.getPendingMessageQueue().offer(msg);
        }
    }
}
