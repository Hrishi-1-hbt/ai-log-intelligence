package Hrishi.example.ai_log_intelligence.model;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnomalyAlert {

    // ──────────────────────────────────────────
    // Anomaly Info
    // ──────────────────────────────────────────

    private String anomalyType;     // MEMORY_LEAK, NULL_POINTER etc.

    private String severity;        // LOW, MEDIUM, HIGH, CRITICAL

    // ──────────────────────────────────────────
    // Raw Log
    // ──────────────────────────────────────────

    private String rawLog;          // Original log line that triggered alert

    // ──────────────────────────────────────────
    // AI Explanation (from Ollama)
    // ──────────────────────────────────────────

    private String explanation;     // Plain English explanation

    private String rootCause;       // Most likely root cause

    private String suggestedFix;    // Steps to fix

    // ──────────────────────────────────────────
    // Timestamp
    // ──────────────────────────────────────────

    private LocalDateTime detectedAt;  // When this alert was generated

}