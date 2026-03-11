package Hrishi.example.ai_log_intelligence.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // ──────────────────────────────────────────
    // Configure Message Broker
    // Handles routing of messages between
    // server and connected frontend clients
    // ──────────────────────────────────────────
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {

        // Frontend subscribes to topics starting with /topic
        // Example: /topic/alerts  → real-time anomaly alerts
        // Example: /topic/logs    → live log stream
        registry.enableSimpleBroker("/topic");

        // Backend sends messages with /app prefix
        // Example: /app/ingest → triggers server-side handler
        registry.setApplicationDestinationPrefixes("/app");

    }

    // ──────────────────────────────────────────
    // Register WebSocket Endpoint
    // This is the URL frontend connects to
    // ──────────────────────────────────────────
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {

        registry.addEndpoint("/ws")             // ws://localhost:8080/ws
                .setAllowedOriginPatterns("*")  // Allow all origins
                .withSockJS();                  // Fallback for older browsers

    }

}