package Hrishi.example.ai_log_intelligence.ai;

public class PromptBuilder {


    // Prompt 1 — Explain a Single Anomaly

    public static String buildAnomalyPrompt(
            String rawLog,
            String anomalyType,
            String severity
    ) {
        return String.format("""
                You are a Java expert. Fill in this JSON with real values. No extra text.
                
                Log line: %s
                Issue type: %s
                Severity: %s
                
                Return only this JSON, nothing else:
                {"explanation":"write what went wrong here","rootCause":"write the cause here","suggestedFix":"write 3 steps to fix here"}
                """,
                rawLog, anomalyType, severity
        );
    }


    // Prompt 2 — Overall Health Summary

    public static String buildSummaryPrompt(
            long totalLogs,
            long totalAnomalies,
            String topAnomalyTypes
    ) {
        double rate = totalLogs > 0 ? (double) totalAnomalies / totalLogs * 100 : 0.0;

        String healthStatus = rate > 30 ? "CRITICAL" : rate > 10 ? "DEGRADED" : "HEALTHY";

        return String.format("""
                Write a health report for a developer. Use only the data below. Be direct and specific.
                Do not use placeholders like [ISSUE NAME] or [DETAILS]. Write real sentences.
                
                Data:
                - Logs analyzed: %d
                - Anomalies found: %d
                - Anomaly rate: %.1f%%
                - System status: %s
                - Top issues: %s
                
                Write exactly 4 sentences using the real data above:
                Sentence 1: State the system health status and anomaly rate.
                Sentence 2: Name the most critical issue found and explain its impact on the system.
                Sentence 3: Name the second issue and what it means for users.
                Sentence 4: State one specific action the developer must take right now.
                
                Example of good output:
                The system is in CRITICAL state with 41.7%% anomaly rate across 24 logs analyzed. DB_CONNECTION_FAILURE occurred 2 times indicating the database is unreachable which will cause all data operations to fail. SERVICE_TIMEOUT occurred 2 times meaning downstream services are responding too slowly causing request failures. Immediately check if the database container is running and verify the connection string in application.properties.
                
                Now write your 4 sentences using the actual data provided above:
                """,
                totalLogs,
                totalAnomalies,
                rate,
                healthStatus,
                topAnomalyTypes
        );
    }


    // Prompt 3 — Batch File Summary

    public static String buildBatchSummaryPrompt(
            int totalLines,
            int anomalyCount,
            String anomalyBreakdown
    ) {
        double rate = totalLines > 0 ? (double) anomalyCount / totalLines * 100 : 0.0;

        return String.format("""
                Write a 3 sentence log file analysis report. Use only real data. No placeholders.
                
                Data:
                - Lines processed: %d
                - Anomalies found: %d
                - Anomaly rate: %.1f%%
                - Issue breakdown: %s
                
                Sentence 1: How many issues were found and the overall severity.
                Sentence 2: The most critical anomaly type and what it means.
                Sentence 3: Whether immediate action is needed and what to do first.
                
                Write 3 real sentences now:
                """,
                totalLines,
                anomalyCount,
                rate,
                anomalyBreakdown
        );
    }
}