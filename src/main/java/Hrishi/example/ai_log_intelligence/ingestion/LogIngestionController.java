package Hrishi.example.ai_log_intelligence.ingestion;

import Hrishi.example.ai_log_intelligence.ai.OllamaService;
import Hrishi.example.ai_log_intelligence.alert.AlertDispatcher;
import Hrishi.example.ai_log_intelligence.detection.AnomalyDetector;
import Hrishi.example.ai_log_intelligence.model.AnomalyAlert;
import Hrishi.example.ai_log_intelligence.model.LogEntry;
import Hrishi.example.ai_log_intelligence.parser.LogNormalizer;
import Hrishi.example.ai_log_intelligence.storage.LogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class LogIngestionController {

    // ──────────────────────────────────────────
    // Dependencies — Auto injected by Spring
    // ──────────────────────────────────────────
    private final AnomalyDetector  anomalyDetector;
    private final OllamaService    ollamaService;
    private final LogRepository    logRepository;
    private final LogNormalizer    logNormalizer;
    private final AlertDispatcher  alertDispatcher;

    // ══════════════════════════════════════════
    // ENDPOINT 1 — Ingest List of Log Lines
    // POST /api/logs/ingest
    // Body: ["log line 1", "log line 2", ...]
    // ══════════════════════════════════════════
    @PostMapping("/ingest")
    public ResponseEntity<Map<String, Object>> ingestLogLines(
            @RequestBody List<String> logLines
    ) {
        log.info("📥 Ingest request received → {} lines", logLines.size());

        List<LogEntry> anomalies = new ArrayList<>();
        List<LogEntry> allEntries = new ArrayList<>();

        for (String line : logLines) {

            if (line == null || line.isBlank()) continue;

            LogEntry entry = processLogLine(line);
            allEntries.add(entry);

            if (entry.isAnomaly()) {
                anomalies.add(entry);
            }
        }

        // Send stats update to frontend via WebSocket
        alertDispatcher.sendStatsUpdate(
                logRepository.count(),
                logRepository.countTotalAnomalies()
        );

        log.info("✅ Ingest complete → {} total | {} anomalies",
                allEntries.size(), anomalies.size());

        return ResponseEntity.ok(Map.of(
                "totalProcessed",  allEntries.size(),
                "anomaliesFound",  anomalies.size(),
                "anomalies",       anomalies
        ));
    }

    // ══════════════════════════════════════════
    // ENDPOINT 2 — Upload Log File
    // POST /api/logs/upload
    // Body: multipart/form-data (file)
    // ══════════════════════════════════════════
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadLogFile(
            @RequestParam("file") MultipartFile file
    ) {
        log.info("📂 File upload received → {}", file.getOriginalFilename());

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Uploaded file is empty")
            );
        }

        List<LogEntry> anomalies  = new ArrayList<>();
        List<LogEntry> allEntries = new ArrayList<>();
        int totalLines = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream()))) {

            String line;
            while ((line = reader.readLine()) != null) {

                if (line.isBlank()) continue;
                totalLines++;

                LogEntry entry = processLogLine(line);
                allEntries.add(entry);

                if (entry.isAnomaly()) {
                    anomalies.add(entry);
                }
            }

        } catch (Exception e) {
            log.error("❌ File processing failed: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Failed to process file: " + e.getMessage())
            );
        }

        // Build anomaly breakdown string for batch summary
        // Example: "MEMORY_LEAK(3), NULL_POINTER(2)"
        String breakdown = buildAnomalyBreakdown(anomalies);

        // Generate AI batch summary via Ollama
        String batchSummary = ollamaService.generateBatchSummary(
                totalLines,
                anomalies.size(),
                breakdown
        );

        // Send stats update to frontend via WebSocket
        alertDispatcher.sendStatsUpdate(
                logRepository.count(),
                logRepository.countTotalAnomalies()
        );

        log.info("✅ File processed → {} lines | {} anomalies", totalLines, anomalies.size());

        return ResponseEntity.ok(Map.of(
                "filename",       file.getOriginalFilename(),
                "totalLines",     totalLines,
                "anomaliesFound", anomalies.size(),
                "anomalies",      anomalies,
                "batchSummary",   batchSummary
        ));
    }

    // ══════════════════════════════════════════
    // ENDPOINT 3 — Analyze Single Log Line
    // POST /api/logs/analyze
    // Body: { "log": "ERROR Something..." }
    // ══════════════════════════════════════════
    @PostMapping("/analyze")
    public ResponseEntity<LogEntry> analyzeSingleLine(
            @RequestBody Map<String, String> body
    ) {
        String line = body.get("log");

        if (line == null || line.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        log.info("🔍 Single line analysis → {}", line);

        LogEntry entry = processLogLine(line);
        return ResponseEntity.ok(entry);
    }

    // ══════════════════════════════════════════
    // ENDPOINT 4 — Get All Anomalies
    // GET /api/logs/anomalies
    // Returns all anomalies from database
    // ══════════════════════════════════════════
    @GetMapping("/anomalies")
    public ResponseEntity<List<LogEntry>> getAllAnomalies() {
        log.debug("📋 Fetching all anomalies");
        return ResponseEntity.ok(
                logRepository.findByIsAnomalyTrueOrderByTimestampDesc()
        );
    }

    // ══════════════════════════════════════════
    // ENDPOINT 5 — Get Recent Logs
    // GET /api/logs/recent
    // Returns last 50 log entries
    // ══════════════════════════════════════════
    @GetMapping("/recent")
    public ResponseEntity<List<LogEntry>> getRecentLogs() {
        log.debug("📋 Fetching recent logs");
        return ResponseEntity.ok(
                logRepository.findTop50ByOrderByTimestampDesc()
        );
    }

    // ══════════════════════════════════════════
    // ENDPOINT 6 — Get Statistics
    // GET /api/logs/stats
    // Returns counts and breakdowns
    // ══════════════════════════════════════════
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        log.debug("📊 Fetching stats");

        long totalLogs      = logRepository.count();
        long totalAnomalies = logRepository.countTotalAnomalies();
        double anomalyRate  = totalLogs > 0
                ? (double) totalAnomalies / totalLogs * 100
                : 0.0;

        // Anomaly type breakdown
        Map<String, Long> byType = new LinkedHashMap<>();
        logRepository.countGroupedByAnomalyType()
                .forEach(row -> byType.put(
                        (String) row[0],
                        (Long)   row[1]
                ));

        // Severity breakdown
        Map<String, Long> bySeverity = new LinkedHashMap<>();
        logRepository.countGroupedBySeverity()
                .forEach(row -> bySeverity.put(
                        (String) row[0],
                        (Long)   row[1]
                ));

        // Log level breakdown
        Map<String, Long> byLevel = new LinkedHashMap<>();
        logRepository.countGroupedByLevel()
                .forEach(row -> byLevel.put(
                        (String) row[0],
                        (Long)   row[1]
                ));

        return ResponseEntity.ok(Map.of(
                "totalLogs",      totalLogs,
                "totalAnomalies", totalAnomalies,
                "anomalyRate",    String.format("%.1f%%", anomalyRate),
                "byType",         byType,
                "bySeverity",     bySeverity,
                "byLevel",        byLevel
        ));
    }

    // ══════════════════════════════════════════
    // ENDPOINT 7 — Get AI Health Summary
    // GET /api/logs/summary
    // Calls Ollama to generate plain text summary
    // ══════════════════════════════════════════
    @GetMapping("/summary")
    public ResponseEntity<Map<String, String>> getHealthSummary() {
        log.info("✨ Generating AI health summary...");

        long totalLogs      = logRepository.count();
        long totalAnomalies = logRepository.countTotalAnomalies();

        // Build top anomaly types string
        // Example: "MEMORY_LEAK(5), NULL_POINTER(3), DB_FAILURE(2)"
        StringBuilder topTypes = new StringBuilder();
        logRepository.countGroupedByAnomalyType()
                .stream()
                .limit(3)
                .forEach(row -> topTypes
                        .append(row[0])
                        .append("(")
                        .append(row[1])
                        .append("), ")
                );

        String summary = ollamaService.generateHealthSummary(
                totalLogs,
                totalAnomalies,
                topTypes.toString()
        );

        return ResponseEntity.ok(Map.of("summary", summary));
    }

    // ══════════════════════════════════════════
    // ENDPOINT 8 — Get Anomalies by Type
    // GET /api/logs/anomalies/{type}
    // Example: GET /api/logs/anomalies/MEMORY_LEAK
    // ══════════════════════════════════════════
    @GetMapping("/anomalies/{type}")
    public ResponseEntity<List<LogEntry>> getAnomaliesByType(
            @PathVariable String type
    ) {
        log.debug("📋 Fetching anomalies by type: {}", type);
        return ResponseEntity.ok(
                logRepository.findByAnomalyTypeOrderByTimestampDesc(
                        type.toUpperCase()
                )
        );
    }

    // ══════════════════════════════════════════
    // CORE — Process a Single Log Line
    // Used by all ingestion endpoints above
    // ══════════════════════════════════════════
    private LogEntry processLogLine(String rawLog) {

        // Step 1 — Normalize the raw log
        Map<String, String> normalized = logNormalizer.normalize(rawLog);

        // Step 2 — Detect anomaly
        AnomalyDetector.AnomalyResult result = anomalyDetector.detect(rawLog);

        // Step 3 — Build LogEntry
        LogEntry.LogEntryBuilder builder = LogEntry.builder()
                .rawLog(rawLog)
                .level(normalized.get("level"))
                .source(normalized.get("source"))
                .anomalyType(result.type())
                .severity(result.severity())
                .isAnomaly(result.isAnomaly())
                .timestamp(LocalDateTime.now());

        // Step 4 — If anomaly, get AI explanation from Ollama
        if (result.isAnomaly()) {

            OllamaService.OllamaExplanation explanation =
                    ollamaService.explainAnomaly(
                            rawLog,
                            result.type(),
                            result.severity()
                    );

            builder.explanation(explanation.explanation())
                    .rootCause(explanation.rootCause())
                    .suggestedFix(explanation.suggestedFix());
        }

        // Step 5 — Save to PostgreSQL
        LogEntry savedEntry = logRepository.save(builder.build());

        // Step 6 — Broadcast via WebSocket
        alertDispatcher.sendLogUpdate(savedEntry);

        if (result.isAnomaly()) {

            // Build and send anomaly alert
            AnomalyAlert alert = AnomalyAlert.builder()
                    .anomalyType(result.type())
                    .severity(result.severity())
                    .rawLog(rawLog)
                    .explanation(savedEntry.getExplanation())
                    .rootCause(savedEntry.getRootCause())
                    .suggestedFix(savedEntry.getSuggestedFix())
                    .detectedAt(LocalDateTime.now())
                    .build();

            alertDispatcher.sendAnomalyAlert(alert);

            // Send to critical channel if severity is CRITICAL
            if (anomalyDetector.isCritical(result)) {
                alertDispatcher.sendCriticalAlert(alert);
            }
        }

        return savedEntry;
    }

    // ──────────────────────────────────────────
    // Helper — Build Anomaly Breakdown String
    // Example: "MEMORY_LEAK(3), NULL_POINTER(2)"
    // Used for batch file summary prompt
    // ──────────────────────────────────────────
    private String buildAnomalyBreakdown(List<LogEntry> anomalies) {

        Map<String, Long> counts = new LinkedHashMap<>();

        for (LogEntry entry : anomalies) {
            counts.merge(entry.getAnomalyType(), 1L, Long::sum);
        }

        StringBuilder sb = new StringBuilder();
        counts.forEach((type, count) ->
                sb.append(type)
                        .append("(")
                        .append(count)
                        .append("), ")
        );

        return sb.toString();
    }

}
