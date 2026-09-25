package com.healthportal.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI patientPortalOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("Patient Health Portal & AI Symptom Pre-Screener API")
                        .description("REST API documentation for the Patient Health Portal with RBAC, Geolocation Doctor Discovery, Concurrency-Safe Slot Booking, Razorpay Integration, and AI Pre-screening.")
                        .version("1.0.0")
                        .contact(new Contact().name("Health Portal Team").email("support@healthportal.local"))
                        .license(new License().name("Apache 2.0").url("https://springdoc.org")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token (without Bearer prefix)")));
    }
}
