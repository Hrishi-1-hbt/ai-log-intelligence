package Hrishi.example.ai_log_intelligence.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "log_entries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogEntry {

    // ──────────────────────────────────────────
    // Primary Key
    // ──────────────────────────────────────────
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ──────────────────────────────────────────
    // Raw Log Data
    // ──────────────────────────────────────────

    @Column(columnDefinition = "TEXT", nullable = false)
    private String rawLog;

    @Column(nullable = false)
    private String level;          // INFO, WARN, ERROR, FATAL

    @Column
    private String source;         // service or class name

    // ──────────────────────────────────────────
    // Anomaly Detection Result
    // ──────────────────────────────────────────

    @Column(nullable = false)
    private boolean isAnomaly;

    @Column
    private String anomalyType;    // MEMORY_LEAK, DB_FAILURE, NULL_POINTER etc.

    @Column
    private String severity;       // NONE, LOW, MEDIUM, HIGH, CRITICAL

    // ──────────────────────────────────────────
    // AI Explanation (from Ollama)
    // ──────────────────────────────────────────

    @Column(columnDefinition = "TEXT")
    private String explanation;    // Plain English explanation

    @Column(columnDefinition = "TEXT")
    private String rootCause;      // Most likely root cause

    @Column(columnDefinition = "TEXT")
    private String suggestedFix;   // Steps to fix

    // ──────────────────────────────────────────
    // Timestamp
    // ──────────────────────────────────────────

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

}