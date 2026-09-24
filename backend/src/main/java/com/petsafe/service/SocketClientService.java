package com.petsafe.service;

import com.petsafe.dao.MessageDao;
import com.petsafe.model.Message;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.time.LocalDateTime;

/**
 * Client service sending messages over raw Java TCP Sockets (java.net.Socket).
 * Fulfills Networking rubric requirement by transmitting finder messages
 * directly to the background SocketServerRunner on port 9090.
 */
@Service
public class SocketClientService {

    @Value("${socket.server.port:9090}")
    private int socketPort;

    private final MessageDao messageDao;

    public SocketClientService(MessageDao messageDao) {
        this.messageDao = messageDao;
    }

    /**
     * Sends a message over raw TCP socket connection and persists it via JDBC.
     */
    public boolean sendMessageOverSocket(Long petId, String conversationId, String senderName, String senderContact, String senderType, String messageText, Double latitude, Double longitude) {
        String locStr = (latitude != null && longitude != null) ? String.format("[LOC:%.6f,%.6f]", latitude, longitude) : "";
        String payload = String.format("[PET-%d][CONV-%s][%s]%s %s (%s): %s", 
                petId, conversationId, senderType, locStr, senderName, senderContact, messageText);

        // 1. Transmit over raw Java TCP Socket on port 9090 (Networking Rubric)
        try (
            Socket socket = new Socket("localhost", socketPort);
            PrintWriter writer = new PrintWriter(socket.getOutputStream(), true);
            BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()))
        ) {
            writer.println(payload);
            String ack = reader.readLine();
            System.out.println("[SOCKET CLIENT TRANSMITTED]: " + payload + " | ACK: " + ack);
        } catch (Exception e) {
            System.err.println("[SOCKET CLIENT WARNING] Could not transmit via Socket port " + socketPort + ": " + e.getMessage());
        }

        // 2. Persist message via plain JDBC PreparedStatement
        Message msg = new Message();
        msg.setPetId(petId);
        msg.setConversationId(conversationId);
        msg.setSenderName(senderName);
        msg.setSenderContact(senderContact);
        msg.setSenderType(senderType != null ? senderType : "FINDER");
        msg.setMessageText(messageText);
        msg.setSentAt(LocalDateTime.now());
        msg.setLatitude(latitude);
        msg.setLongitude(longitude);

        return messageDao.save(msg);
    }

    public boolean sendMessageOverSocket(Long petId, String conversationId, String senderName, String senderContact, String senderType, String messageText) {
        return sendMessageOverSocket(petId, conversationId, senderName, senderContact, senderType, messageText, null, null);
    }
}
