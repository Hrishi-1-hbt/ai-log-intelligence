package Hrishi.example.ai_log_intelligence.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    // ──────────────────────────────────────────
    // Read allowed origins from application.properties
    // cors.allowed-origins=http://localhost:3000
    // ──────────────────────────────────────────
    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public CorsFilter corsFilter() {

        CorsConfiguration config = new CorsConfiguration();

        // ──────────────────────────────────────────
        // Allow frontend origin
        // ──────────────────────────────────────────
        config.addAllowedOrigin(allowedOrigins);

        // ──────────────────────────────────────────
        // Allow all headers
        // (Content-Type, Authorization, etc.)
        // ──────────────────────────────────────────
        config.addAllowedHeader("*");

        // ──────────────────────────────────────────
        // Allow all HTTP methods
        // (GET, POST, PUT, DELETE, OPTIONS)
        // ──────────────────────────────────────────
        config.addAllowedMethod("*");

        // ──────────────────────────────────────────
        // Allow cookies and credentials
        // ──────────────────────────────────────────
        config.setAllowCredentials(true);

        // ──────────────────────────────────────────
        // Apply to all endpoints
        // ──────────────────────────────────────────
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }

}