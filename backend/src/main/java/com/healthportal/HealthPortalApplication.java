package com.healthportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HealthPortalApplication {

    public static void main(String[] args) {
        loadDotenv();
        SpringApplication.run(HealthPortalApplication.class, args);
    }

    private static void loadDotenv() {
        try {
            java.io.File envFile = new java.io.File(".env");
            if (envFile.exists()) {
                java.nio.file.Files.lines(envFile.toPath())
                        .map(String::trim)
                        .filter(line -> !line.isEmpty() && !line.startsWith("#") && line.contains("="))
                        .forEach(line -> {
                            int idx = line.indexOf('=');
                            String key = line.substring(0, idx).trim();
                            String val = line.substring(idx + 1).trim();
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, val);
                            }
                        });
            }
        } catch (Exception ignored) {
        }
    }
}
