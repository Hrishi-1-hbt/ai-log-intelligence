package Hrishi.example.ai_log_intelligence.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
public class OllamaService {

    // ──────────────────────────────────────────
    // Config from application.properties
    // ──────────────────────────────────────────
    @Value("${ollama.base-url}")
    private String ollamaBaseUrl;

    @Value("${ollama.model}")
    private String model;

    // ──────────────────────────────────────────
    // RestTemplate with 120 second timeout
    // TinyLlama needs more time to respond
    // ──────────────────────────────────────────
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OllamaService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(30000);  // 30 seconds connect
        factory.setReadTimeout(120000);    // 120 seconds read
        this.restTemplate = new RestTemplate(factory);
    }

    // ──────────────────────────────────────────
    // Response Record
    // ──────────────────────────────────────────
    public record OllamaExplanation(
            String explanation,
            String rootCause,
            String suggestedFix
    ) {}

    // ──────────────────────────────────────────
    // Method 1 — Explain a Single Anomaly
    // ──────────────────────────────────────────
    public OllamaExplanation explainAnomaly(
            String rawLog,
            String anomalyType,
            String severity
    ) {
        log.debug("🤖 Requesting Ollama explanation for: {}", anomalyType);

        try {
            String prompt = PromptBuilder.buildAnomalyPrompt(rawLog, anomalyType, severity);
            String rawResponse = callOllama(prompt);

            // Clean response — strip markdown fences if present
            String cleaned = rawResponse.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned
                        .replaceAll("```json", "")
                        .replaceAll("```", "")
                        .trim();
            }

            // Extract JSON block — TinyLlama sometimes adds text before JSON
            int jsonStart = cleaned.indexOf('{');
            int jsonEnd   = cleaned.lastIndexOf('}');
            if (jsonStart != -1 && jsonEnd != -1 && jsonEnd > jsonStart) {
                cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
            }

            Map<?, ?> parsed = objectMapper.readValue(cleaned, Map.class);
            log.debug("✅ Ollama explanation received for: {}", anomalyType);

            return new OllamaExplanation(
                    getStringOrDefault(parsed, "explanation", "Unable to generate explanation."),
                    getStringOrDefault(parsed, "rootCause",   "Root cause could not be determined."),
                    getStringOrDefault(parsed, "suggestedFix","Please review the raw log manually.")
            );

        } catch (Exception e) {
            log.error("❌ Ollama explainAnomaly failed for {}: {}", anomalyType, e.getMessage());
            return fallbackExplanation(anomalyType, severity);
        }
    }

    // ──────────────────────────────────────────
    // Method 2 — Generate Health Summary
    // ──────────────────────────────────────────
    public String generateHealthSummary(
            long totalLogs,
            long totalAnomalies,
            String topAnomalyTypes
    ) {
        log.debug("🤖 Requesting Ollama health summary...");

        try {
            String prompt = PromptBuilder.buildSummaryPrompt(
                    totalLogs, totalAnomalies, topAnomalyTypes
            );
            String response = callOllama(prompt);
            log.debug("✅ Ollama health summary received");
            return response.trim();

        } catch (Exception e) {
            log.error("❌ Ollama generateHealthSummary failed: {}", e.getMessage());
            return "AI summary unavailable. Please ensure Ollama is running at "
                    + ollamaBaseUrl + " and the model '" + model + "' is pulled.";
        }
    }

    // ──────────────────────────────────────────
    // Method 3 — Generate Batch File Summary
    // ──────────────────────────────────────────
    public String generateBatchSummary(
            int totalLines,
            int anomalyCount,
            String anomalyBreakdown
    ) {
        log.debug("🤖 Requesting Ollama batch summary...");

        try {
            String prompt = PromptBuilder.buildBatchSummaryPrompt(
                    totalLines, anomalyCount, anomalyBreakdown
            );
            String response = callOllama(prompt);
            log.debug("✅ Ollama batch summary received");
            return response.trim();

        } catch (Exception e) {
            log.error("❌ Ollama generateBatchSummary failed: {}", e.getMessage());
            return "Batch summary unavailable. Please ensure Ollama is running.";
        }
    }

    // ──────────────────────────────────────────
    // Core Method — Call Ollama REST API
    // ──────────────────────────────────────────
    private String callOllama(String prompt) throws Exception {

        Map<String, Object> requestBody = Map.of(
                "model",  model,
                "prompt", prompt,
                "stream", false
        );

        log.debug("📡 Calling Ollama at: {}/api/generate", ollamaBaseUrl);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(
                ollamaBaseUrl + "/api/generate",
                requestBody,
                Map.class
        );

        if (response == null) {
            throw new RuntimeException("Ollama returned null response");
        }
        if (!response.containsKey("response")) {
            throw new RuntimeException("Ollama response missing 'response' field");
        }

        return (String) response.get("response");
    }

    // ──────────────────────────────────────────
    // Helper — Safe map value getter
    // ──────────────────────────────────────────
    private String getStringOrDefault(Map<?, ?> map, String key, String defaultValue) {
        Object value = map.get(key);
        if (value == null || value.toString().isBlank()) return defaultValue;
        return value.toString();
    }

    // ──────────────────────────────────────────
    // Helper — Smart fallback explanation
    // Shows helpful info even when Ollama fails
    // ──────────────────────────────────────────
    private OllamaExplanation fallbackExplanation(String anomalyType, String severity) {
        return switch (anomalyType) {
            case "MEMORY_LEAK" -> new OllamaExplanation(
                    "The JVM ran out of heap memory. This happens with memory leaks or insufficient heap allocation.",
                    "Memory leak in application code or insufficient -Xmx JVM setting.",
                    "1. Increase heap with -Xmx2g\n2. Analyze heap dump with VisualVM\n3. Check for object retention in caches"
            );
            case "DB_CONNECTION_FAILURE", "DB_QUERY_FAILURE" -> new OllamaExplanation(
                    "The application failed to connect to the database causing cascading failures.",
                    "Database server is down, connection pool exhausted, or network issue.",
                    "1. Check if database server is running\n2. Verify connection string and credentials\n3. Check connection pool settings"
            );
            case "NULL_POINTER" -> new OllamaExplanation(
                    "A null reference was accessed. The application tried to use a null object.",
                    "Missing null check or unexpected null return from a method.",
                    "1. Add null checks using Optional<T>\n2. Check the stack trace for the exact line\n3. Use @NonNull annotations"
            );
            case "INFINITE_RECURSION" -> new OllamaExplanation(
                    "The call stack overflowed due to infinite recursion without a base case.",
                    "A recursive method is missing a proper termination condition.",
                    "1. Add a base case to the recursive method\n2. Convert to iterative approach\n3. Check for circular object references"
            );
            case "SERVICE_TIMEOUT" -> new OllamaExplanation(
                    "A remote service call exceeded the time limit. The downstream service is too slow.",
                    "Target service is overloaded, network congestion, or timeout is too low.",
                    "1. Increase timeout threshold\n2. Implement circuit breaker pattern\n3. Add retry with exponential backoff"
            );
            case "AUTH_FAILURE", "ACCESS_DENIED", "UNAUTHORIZED_ACCESS" -> new OllamaExplanation(
                    "Authentication or authorization failed. Access was denied to a resource.",
                    "Invalid credentials, expired token, or insufficient permissions.",
                    "1. Verify credentials are correct\n2. Check token expiry settings\n3. Review role-based access configuration"
            );
            case "DISK_FULL" -> new OllamaExplanation(
                    "The server disk is full. File writes are failing and the system may become unstable.",
                    "Log files or application data filled the available disk space.",
                    "1. Delete old log files immediately\n2. Set up log rotation policy\n3. Add disk space monitoring alerts"
            );
            case "RESOURCE_EXHAUSTION" -> new OllamaExplanation(
                    "System resources are exhausted. Too many open files or connections.",
                    "Resource limits reached due to connection or file handle leaks.",
                    "1. Check ulimit settings on the server\n2. Look for unclosed connections\n3. Restart the service if critical"
            );
            case "FATAL_ERROR" -> new OllamaExplanation(
                    "A fatal error occurred causing the application to crash or become unresponsive.",
                    "Critical unhandled exception or system-level failure in the application.",
                    "1. Check full stack trace immediately\n2. Review application logs before the crash\n3. Restart service and monitor closely"
            );
            case "GENERIC_ERROR" -> new OllamaExplanation(
                    "An application error was logged. This may indicate an unhandled exception in the code.",
                    "Check the raw log line for specific exception details and stack trace.",
                    "1. Review the full stack trace in the raw log\n2. Check recent code deployments\n3. Correlate with other logs at the same timestamp"
            );
            case "SERVER_ERROR" -> new OllamaExplanation(
                    "The server returned an HTTP 500 error indicating an internal server failure.",
                    "Unhandled exception in the request processing pipeline.",
                    "1. Check server error logs for stack trace\n2. Review recent deployments\n3. Test the failing endpoint directly"
            );
            case "SERVICE_UNAVAILABLE" -> new OllamaExplanation(
                    "A service returned HTTP 503 — it is temporarily unavailable or overloaded.",
                    "Service is down for maintenance, overloaded, or crashed.",
                    "1. Check if the service is running\n2. Review service health endpoint\n3. Implement retry logic with backoff"
            );
            case "DNS_FAILURE" -> new OllamaExplanation(
                    "DNS resolution failed. The application cannot resolve a hostname to an IP address.",
                    "DNS server is unreachable or the hostname is incorrect.",
                    "1. Verify the hostname is correct\n2. Check DNS server configuration\n3. Test with nslookup or ping"
            );
            case "SSL_ERROR" -> new OllamaExplanation(
                    "An SSL/TLS handshake failed. Secure connection could not be established.",
                    "Expired certificate, mismatched SSL versions, or certificate trust issues.",
                    "1. Check SSL certificate expiry date\n2. Verify certificate chain is valid\n3. Update SSL/TLS configuration"
            );
            case "CIRCUIT_BREAKER_OPEN" -> new OllamaExplanation(
                    "The circuit breaker is open. Calls to the downstream service are being blocked.",
                    "Too many recent failures caused the circuit breaker to trip.",
                    "1. Check the health of the downstream service\n2. Review circuit breaker threshold settings\n3. Wait for the half-open state to test recovery"
            );
            case "FILE_NOT_FOUND" -> new OllamaExplanation(
                    "A required file could not be found at the expected path.",
                    "File was deleted, moved, or the path configuration is incorrect.",
                    "1. Verify the file path in configuration\n2. Check file permissions\n3. Ensure deployment includes all required files"
            );
            case "PERMISSION_DENIED" -> new OllamaExplanation(
                    "The application was denied permission to access a resource.",
                    "Incorrect file permissions or the process is running without sufficient privileges.",
                    "1. Check file/directory permissions with ls -la\n2. Verify the application user has correct access\n3. Review OS-level security policies"
            );
            default -> new OllamaExplanation(
                    anomalyType + " detected with " + severity + " severity in the application logs.",
                    "Review the raw log line for specific error details and stack trace.",
                    "1. Check the full stack trace\n2. Review recent deployments\n3. Correlate with other logs at the same timestamp"
            );
        };
    }

}