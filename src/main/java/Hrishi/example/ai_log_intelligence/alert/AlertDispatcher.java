package Hrishi.example.ai_log_intelligence.alert;

import Hrishi.example.ai_log_intelligence.model.AnomalyAlert;
import Hrishi.example.ai_log_intelligence.model.LogEntry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertDispatcher {

    // ──────────────────────────────────────────
    // SimpMessagingTemplate
    // Spring's built-in WebSocket message sender
    // Injected automatically by @RequiredArgsConstructor
    // ──────────────────────────────────────────
    private final SimpMessagingTemplate messagingTemplate;

    // ──────────────────────────────────────────
    // Method 1 — Send Anomaly Alert
    // Broadcasts to /topic/alerts
    // Frontend receives this instantly
    // Only called when anomaly is detected
    // ──────────────────────────────────────────
    public void sendAnomalyAlert(AnomalyAlert alert) {

        log.info("🚨 Sending anomaly alert → Type: {} | Severity: {}",
                alert.getAnomalyType(),
                alert.getSeverity()
        );

        messagingTemplate.convertAndSend("/topic/alerts", alert);

        log.debug("✅ Anomaly alert dispatched to /topic/alerts");
    }

    // ──────────────────────────────────────────
    // Method 2 — Send Log Entry Update
    // Broadcasts to /topic/logs
    // Frontend receives every processed log line
    // Called for ALL logs — normal and anomalies
    // ──────────────────────────────────────────
    public void sendLogUpdate(LogEntry logEntry) {

        log.debug("📋 Sending log update → Level: {} | Anomaly: {}",
                logEntry.getLevel(),
                logEntry.isAnomaly()
        );

        messagingTemplate.convertAndSend("/topic/logs", logEntry);
    }

    // ──────────────────────────────────────────
    // Method 3 — Send Critical System Alert
    // Broadcasts to /topic/critical
    // Only for CRITICAL severity anomalies
    // Frontend can show special popup for this
    // ──────────────────────────────────────────
    public void sendCriticalAlert(AnomalyAlert alert) {

        if (!alert.getSeverity().equals("CRITICAL")) {
            log.warn("⚠️ sendCriticalAlert called with non-critical severity: {}",
                    alert.getSeverity());
            return;
        }

        log.warn("🔴 CRITICAL alert dispatched → Type: {}",
                alert.getAnomalyType()
        );

        messagingTemplate.convertAndSend("/topic/critical", alert);
    }

    // ──────────────────────────────────────────
    // Method 4 — Send Stats Update
    // Broadcasts to /topic/stats
    // Sends updated counts after each ingestion
    // Frontend uses this to update dashboard numbers
    // ──────────────────────────────────────────
    public void sendStatsUpdate(long totalLogs, long totalAnomalies) {

        var statsPayload = new StatsPayload(totalLogs, totalAnomalies);

        log.debug("📊 Sending stats update → Total: {} | Anomalies: {}",
                totalLogs,
                totalAnomalies
        );

        messagingTemplate.convertAndSend("/topic/stats", statsPayload);
    }

    // ──────────────────────────────────────────
    // Stats Payload Record
    // Simple object sent to frontend
    // with updated dashboard numbers
    // ──────────────────────────────────────────
    public record StatsPayload(
            long totalLogs,
            long totalAnomalies
    ) {}

}
