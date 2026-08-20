package com.fintrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the FinTrack Personal Finance & Expense Tracker backend application.
 *
 * <p>The {@link SpringBootApplication} annotation enables:
 * <ul>
 *   <li>{@code @Configuration}: Declares this class as a source of bean definitions.</li>
 *   <li>{@code @EnableAutoConfiguration}: Enables Spring Boot's opinionated auto-configuration
 *       based on classpath dependencies (Tomcat, Hibernate/JPA, Jackson, Security).</li>
 *   <li>{@code @ComponentScan}: Scans for components, services, repositories, and controllers
 *       in the {@code com.fintrack} package and all its subpackages.</li>
 * </ul>
 */
@SpringBootApplication
public class FinTrackApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinTrackApplication.class, args);
    }
}
