package com.fintrack.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Cross-Origin Resource Sharing (CORS) Configuration.
 *
 * <p>Allowed origins are configured via the {@code ALLOWED_ORIGINS} environment variable,
 * making it easy to add Vercel, Netlify, or any custom domain without code changes.
 * Multiple origins can be comma-separated (e.g., "https://app.vercel.app,http://localhost:4200").
 *
 * <p>For local development, the default covers the Angular dev server on port 4200.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Comma-separated list of allowed CORS origins.
     * Set ALLOWED_ORIGINS env var in Railway / Docker to include your Vercel URL.
     */
    @Value("${ALLOWED_ORIGINS:http://localhost:4200,http://localhost:80,http://127.0.0.1:4200}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Split comma-separated origins from environment variable
        String[] origins = allowedOrigins.split(",");

        registry.addMapping("/**")
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
