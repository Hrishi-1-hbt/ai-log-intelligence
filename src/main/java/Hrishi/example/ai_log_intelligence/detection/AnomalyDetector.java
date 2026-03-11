package Hrishi.example.ai_log_intelligence.detection;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AnomalyDetector {

    // ──────────────────────────────────────────
    // Result Record
    // Returned after every log line is checked
    // ──────────────────────────────────────────
    public record AnomalyResult(
            String type,        // MEMORY_LEAK, NULL_POINTER etc.
            String severity,    // NONE, LOW, MEDIUM, HIGH, CRITICAL
            boolean isAnomaly   // true or false
    ) {}

    // ──────────────────────────────────────────
    // Anomaly Rules
    // Format: { "keyword to match", "anomaly type", "severity" }
    // Checked top to bottom — first match wins
    // ──────────────────────────────────────────
    private static final List<String[]> ANOMALY_RULES = List.of(

            // ── Memory Issues ──────────────────
            new String[]{ "OutOfMemoryError",           "MEMORY_LEAK",            "CRITICAL" },
            new String[]{ "GC overhead limit exceeded", "MEMORY_LEAK",            "CRITICAL" },
            new String[]{ "Java heap space",            "MEMORY_LEAK",            "CRITICAL" },
            new String[]{ "heap space",                 "MEMORY_LEAK",            "HIGH"     },

            // ── Database Issues ────────────────
            new String[]{ "Connection refused",         "DB_CONNECTION_FAILURE",  "CRITICAL" },
            new String[]{ "Unable to acquire JDBC",     "DB_CONNECTION_FAILURE",  "CRITICAL" },
            new String[]{ "connection timeout",         "DB_CONNECTION_FAILURE",  "HIGH"     },
            new String[]{ "could not execute statement","DB_QUERY_FAILURE",        "HIGH"     },
            new String[]{ "DataIntegrityViolation",     "DB_INTEGRITY_ERROR",     "HIGH"     },

            // ── Null & Code Errors ─────────────
            new String[]{ "NullPointerException",       "NULL_POINTER",           "HIGH"     },
            new String[]{ "StackOverflowError",         "INFINITE_RECURSION",     "HIGH"     },
            new String[]{ "ClassNotFoundException",     "CLASS_NOT_FOUND",        "MEDIUM"   },
            new String[]{ "ClassCastException",         "CLASS_CAST_ERROR",       "MEDIUM"   },
            new String[]{ "ArrayIndexOutOfBounds",      "ARRAY_INDEX_ERROR",      "MEDIUM"   },

            // ── Timeout Issues ─────────────────
            new String[]{ "Read timed out",             "SERVICE_TIMEOUT",        "MEDIUM"   },
            new String[]{ "Connection timed out",       "SERVICE_TIMEOUT",        "MEDIUM"   },
            new String[]{ "SocketTimeoutException",     "SERVICE_TIMEOUT",        "MEDIUM"   },
            new String[]{ "TimeoutException",           "SERVICE_TIMEOUT",        "MEDIUM"   },

            // ── HTTP / API Errors ──────────────
            new String[]{ "HTTP 500",                   "SERVER_ERROR",           "HIGH"     },
            new String[]{ "HTTP 503",                   "SERVICE_UNAVAILABLE",    "CRITICAL" },
            new String[]{ "HTTP 404",                   "ENDPOINT_NOT_FOUND",     "LOW"      },
            new String[]{ "HTTP 401",                   "UNAUTHORIZED_ACCESS",    "MEDIUM"   },
            new String[]{ "HTTP 403",                   "FORBIDDEN_ACCESS",       "MEDIUM"   },

            // ── Resource Issues ────────────────
            new String[]{ "Disk quota exceeded",        "DISK_FULL",              "CRITICAL" },
            new String[]{ "No space left on device",    "DISK_FULL",              "CRITICAL" },
            new String[]{ "Too many open files",        "RESOURCE_EXHAUSTION",    "HIGH"     },
            new String[]{ "FileNotFoundException",      "FILE_NOT_FOUND",         "MEDIUM"   },
            new String[]{ "Permission denied",          "PERMISSION_DENIED",      "MEDIUM"   },

            // ── Security Issues ────────────────
            new String[]{ "Access denied",              "ACCESS_DENIED",          "HIGH"     },
            new String[]{ "Authentication failed",      "AUTH_FAILURE",           "HIGH"     },
            new String[]{ "Invalid token",              "INVALID_TOKEN",          "HIGH"     },
            new String[]{ "SSL handshake",              "SSL_ERROR",              "MEDIUM"   },

            // ── Service / Network Issues ───────
            new String[]{ "Circuit breaker",            "CIRCUIT_BREAKER_OPEN",   "HIGH"     },
            new String[]{ "Service unavailable",        "SERVICE_UNAVAILABLE",    "CRITICAL" },
            new String[]{ "Connection reset",           "CONNECTION_RESET",       "MEDIUM"   },
            new String[]{ "UnknownHostException",       "DNS_FAILURE",            "HIGH"     },

            // ── Process Issues ─────────────────
            new String[]{ "killed",                     "PROCESS_KILLED",         "CRITICAL" },
            new String[]{ "Segmentation fault",         "SEGFAULT",               "CRITICAL" },

            // ── Generic Fallback ───────────────
            new String[]{ "FATAL",                      "FATAL_ERROR",            "CRITICAL" },
            new String[]{ "ERROR",                      "GENERIC_ERROR",          "LOW"      }

    );

    // ──────────────────────────────────────────
    // Main Method — Detect anomaly in a log line
    // ──────────────────────────────────────────
    public AnomalyResult detect(String logLine) {

        if (logLine == null || logLine.isBlank()) {
            return new AnomalyResult("NORMAL", "NONE", false);
        }

        String upperLog = logLine.toUpperCase();

        // Check each rule — return first match
        for (String[] rule : ANOMALY_RULES) {
            String keyword  = rule[0].toUpperCase();
            String type     = rule[1];
            String severity = rule[2];

            if (upperLog.contains(keyword)) {
                return new AnomalyResult(type, severity, true);
            }
        }

        // No match found — log is normal
        return new AnomalyResult("NORMAL", "NONE", false);
    }

    // ──────────────────────────────────────────
    // Helper — Check if a log is critical
    // Used for priority alerting
    // ──────────────────────────────────────────
    public boolean isCritical(AnomalyResult result) {
        return result.isAnomaly() &&
                result.severity().equals("CRITICAL");
    }

    // ──────────────────────────────────────────
    // Helper — Get severity as priority number
    // Used for sorting alerts by importance
    // ──────────────────────────────────────────
    public int getSeverityPriority(String severity) {
        return switch (severity) {
            case "CRITICAL" -> 4;
            case "HIGH"     -> 3;
            case "MEDIUM"   -> 2;
            case "LOW"      -> 1;
            default         -> 0;
        };
    }

}