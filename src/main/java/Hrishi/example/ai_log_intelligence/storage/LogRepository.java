package Hrishi.example.ai_log_intelligence.storage;

import Hrishi.example.ai_log_intelligence.model.LogEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LogRepository extends JpaRepository<LogEntry, Long> {

    // ──────────────────────────────────────────
    // Find Anomalies Only
    // ──────────────────────────────────────────

    // Get all anomaly logs — newest first
    List<LogEntry> findByIsAnomalyTrueOrderByTimestampDesc();

    // Get anomalies by specific type
    // Example: findByAnomalyType("MEMORY_LEAK")
    List<LogEntry> findByAnomalyTypeOrderByTimestampDesc(String anomalyType);

    // Get anomalies by severity level
    // Example: findBySeverity("CRITICAL")
    List<LogEntry> findBySeverityOrderByTimestampDesc(String severity);

    // ──────────────────────────────────────────
    // Find by Time Range
    // ──────────────────────────────────────────

    // Get all logs between two timestamps
    List<LogEntry> findByTimestampBetweenOrderByTimestampDesc(
            LocalDateTime from,
            LocalDateTime to
    );

    // Get anomaly logs between two timestamps
    List<LogEntry> findByIsAnomalyTrueAndTimestampBetweenOrderByTimestampDesc(
            LocalDateTime from,
            LocalDateTime to
    );

    // ──────────────────────────────────────────
    // Recent Logs
    // ──────────────────────────────────────────

    // Get 50 most recent log entries
    List<LogEntry> findTop50ByOrderByTimestampDesc();

    // Get 50 most recent anomalies only
    List<LogEntry> findTop50ByIsAnomalyTrueOrderByTimestampDesc();

    // ──────────────────────────────────────────
    // Statistics Queries
    // ──────────────────────────────────────────

    // Count total anomalies in database
    @Query("SELECT COUNT(l) FROM LogEntry l WHERE l.isAnomaly = true")
    long countTotalAnomalies();

    // Count anomalies since a specific time
    // Used for: "anomalies in last 1 hour"
    @Query("SELECT COUNT(l) FROM LogEntry l WHERE l.isAnomaly = true AND l.timestamp >= :since")
    long countAnomaliesSince(@Param("since") LocalDateTime since);

    // Count logs grouped by anomaly type
    // Returns: [["MEMORY_LEAK", 5], ["NULL_POINTER", 3]]
    @Query("SELECT l.anomalyType, COUNT(l) FROM LogEntry l WHERE l.isAnomaly = true GROUP BY l.anomalyType ORDER BY COUNT(l) DESC")
    List<Object[]> countGroupedByAnomalyType();

    // Count logs grouped by severity
    // Returns: [["CRITICAL", 2], ["HIGH", 4]]
    @Query("SELECT l.severity, COUNT(l) FROM LogEntry l WHERE l.isAnomaly = true GROUP BY l.severity ORDER BY COUNT(l) DESC")
    List<Object[]> countGroupedBySeverity();

    // Count logs grouped by log level
    // Returns: [["ERROR", 10], ["WARN", 5]]
    @Query("SELECT l.level, COUNT(l) FROM LogEntry l GROUP BY l.level ORDER BY COUNT(l) DESC")
    List<Object[]> countGroupedByLevel();

}
