package Hrishi.example.ai_log_intelligence.parser;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class LogNormalizer {

    // ──────────────────────────────────────────
    // Common Log Format Patterns
    // ──────────────────────────────────────────

    // Spring Boot log format
    // Example: 2024-01-15 10:32:15.123 ERROR com.app.Service - Message here
    private static final Pattern SPRING_LOG = Pattern.compile(
            "\\d{4}-\\d{2}-\\d{2}\\s+\\d{2}:\\d{2}:\\d{2}\\.\\d+\\s+" +
                    "(TRACE|DEBUG|INFO|WARN|ERROR|FATAL)\\s+(\\S+)\\s+-\\s+(.*)"
    );

    // Simple log format
    // Example: ERROR Some message here
    private static final Pattern SIMPLE_LOG = Pattern.compile(
            "(TRACE|DEBUG|INFO|WARN|ERROR|FATAL)\\s+(.*)"
    );

    // Apache/Nginx log format
    // Example: [error] some message here
    private static final Pattern APACHE_LOG = Pattern.compile(
            "\\[(.+?)\\]\\s+\\[(error|warn|info|notice|debug)\\]\\s+(.*)",
            Pattern.CASE_INSENSITIVE
    );

    // Timestamp prefix format
    // Example: 2024-01-15 10:32:15 ERROR Message here
    private static final Pattern TIMESTAMP_LOG = Pattern.compile(
            "\\d{4}-\\d{2}-\\d{2}\\s+\\d{2}:\\d{2}:\\d{2}\\s+" +
                    "(TRACE|DEBUG|INFO|WARN|ERROR|FATAL)\\s+(.*)"
    );

    // ──────────────────────────────────────────
    // Main Method — Normalize any log line
    // Returns a clean map of extracted fields
    // ──────────────────────────────────────────
    public Map<String, String> normalize(String rawLog) {

        Map<String, String> result = new HashMap<>();

        result.put("raw",     rawLog);
        result.put("level",   extractLevel(rawLog));
        result.put("message", extractMessage(rawLog));
        result.put("source",  extractSource(rawLog));

        return result;
    }

    // ──────────────────────────────────────────
    // Extract Log Level
    // Tries each pattern — falls back to INFO
    // ──────────────────────────────────────────
    private String extractLevel(String log) {

        // Check for explicit level keywords (highest priority first)
        for (String level : List.of("FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE")) {
            if (log.toUpperCase().contains(level)) {
                return level;
            }
        }

        // Apache-style level tags
        if (log.toLowerCase().contains("[error]"))   return "ERROR";
        if (log.toLowerCase().contains("[warn]"))    return "WARN";
        if (log.toLowerCase().contains("[notice]"))  return "INFO";
        if (log.toLowerCase().contains("[debug]"))   return "DEBUG";

        // Default fallback
        return "INFO";
    }

    // ──────────────────────────────────────────
    // Extract Core Message
    // Strips timestamps, levels, class names
    // ──────────────────────────────────────────
    private String extractMessage(String log) {

        // Try Spring Boot format first
        Matcher m = SPRING_LOG.matcher(log);
        if (m.find()) return m.group(3);

        // Try timestamp format
        m = TIMESTAMP_LOG.matcher(log);
        if (m.find()) return m.group(2);

        // Try simple format
        m = SIMPLE_LOG.matcher(log);
        if (m.find()) return m.group(2);

        // Try Apache format
        m = APACHE_LOG.matcher(log);
        if (m.find()) return m.group(3);

        // Return raw if no pattern matches
        return log;
    }

    // ──────────────────────────────────────────
    // Extract Source / Class Name
    // Example: com.app.OrderService → OrderService
    // ──────────────────────────────────────────
    private String extractSource(String log) {

        // Try to find fully qualified class name
        // Example: com.example.service.OrderService
        Pattern classPattern = Pattern.compile(
                "([a-z]+\\.)+([A-Z][a-zA-Z]+)"
        );
        Matcher m = classPattern.matcher(log);
        if (m.find()) return m.group(2);

        // Try short class name with method
        // Example: OrderService.processOrder
        Pattern shortPattern = Pattern.compile(
                "([A-Z][a-zA-Z]+)\\.(\\w+)\\("
        );
        m = shortPattern.matcher(log);
        if (m.find()) return m.group(1);

        return "unknown";
    }

}
