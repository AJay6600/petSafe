package com.petsafe.socket;

import com.petsafe.model.Message;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Raw Java TCP Socket Server Service.
 * Fulfills Networking (java.net.ServerSocket/Socket) and Collections (Queue<Message>) rubric.
 * Tracks active socket connections by conversationId for live two-way finder/owner chat.
 */
@Component
public class SocketServerRunner implements CommandLineRunner {

    @Value("${socket.server.port:9090}")
    private int socketPort;

    private final AtomicBoolean isRunning = new AtomicBoolean(false);
    
    // Collections requirement: Queue<Message> pending message buffer on socket server
    private final Queue<Message> pendingMessageQueue = new ConcurrentLinkedQueue<>();

    // Map requirement: Map<String, List<PrintWriter>> active sockets per conversationId
    private final Map<String, List<PrintWriter>> conversationWriters = new ConcurrentHashMap<>();

    public boolean isRunning() {
        return isRunning.get();
    }

    public int getSocketPort() {
        return socketPort;
    }

    public Queue<Message> getPendingMessageQueue() {
        return pendingMessageQueue;
    }

    public void broadcastToConversation(String conversationId, String messageText) {
        if (conversationId == null) return;
        List<PrintWriter> writers = conversationWriters.get(conversationId);
        if (writers != null) {
            for (PrintWriter writer : writers) {
                try {
                    writer.println("CHAT_MSG:" + messageText);
                } catch (Exception e) {
                    System.err.println("[SOCKET BROADCAST ERROR]: " + e.getMessage());
                }
            }
        }
    }

    @Override
    public void run(String... args) throws Exception {
        // Start TCP Socket Server in a background thread so it doesn't block Spring Boot startup
        Thread serverThread = new Thread(this::listenForSocketConnections);
        serverThread.setDaemon(true);
        serverThread.setName("PetSafe-TCP-SocketServer");
        serverThread.start();
    }

    private void listenForSocketConnections() {
        try (ServerSocket serverSocket = new ServerSocket(socketPort)) {
            isRunning.set(true);
            System.out.println("=================================================");
            System.out.println("[PETSAFE NETWORKING] Raw Java TCP Socket Server started on port " + socketPort);
            System.out.println("=================================================");

            while (isRunning.get()) {
                try {
                    Socket clientSocket = serverSocket.accept();
                    // Handle client in a separate thread
                    new Thread(() -> handleClientSocket(clientSocket)).start();
                } catch (Exception e) {
                    if (isRunning.get()) {
                        System.err.println("[SOCKET SERVER ERROR] Client connection error: " + e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            isRunning.set(false);
            System.err.println("[SOCKET SERVER ERROR] Failed to bind ServerSocket on port " + socketPort + ": " + e.getMessage());
        }
    }

    private void handleClientSocket(Socket socket) {
        String clientConvId = null;
        PrintWriter writer = null;

        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            writer = new PrintWriter(socket.getOutputStream(), true);

            String inputLine;
            while ((inputLine = reader.readLine()) != null) {
                System.out.println("[SOCKET RECEIVED]: " + inputLine);
                
                if (inputLine.startsWith("JOIN_CONVERSATION:")) {
                    clientConvId = inputLine.substring("JOIN_CONVERSATION:".length()).trim();
                    conversationWriters.computeIfAbsent(clientConvId, k -> new CopyOnWriteArrayList<>()).add(writer);
                    writer.println("JOINED:" + clientConvId);
                } else {
                    // Echo message back with TCP acknowledgment prefix
                    writer.println("PETSAFE_ACK: " + inputLine);

                    // Buffer message
                    Message msg = new Message();
                    msg.setMessageText(inputLine);
                    pendingMessageQueue.offer(msg);
                }
            }
        } catch (Exception e) {
            System.out.println("[SOCKET CLIENT DISCONNECTED] Client remote address: " + socket.getRemoteSocketAddress());
        } finally {
            if (clientConvId != null && writer != null) {
                List<PrintWriter> writers = conversationWriters.get(clientConvId);
                if (writers != null) {
                    writers.remove(writer);
                }
            }
        }
    }
}
