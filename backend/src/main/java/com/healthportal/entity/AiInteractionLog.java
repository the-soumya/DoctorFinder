package com.healthportal.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ai_interaction_logs", indexes = {
    @Index(name = "idx_ai_user", columnList = "user_id"),
    @Index(name = "idx_ai_feature", columnList = "feature"),
    @Index(name = "idx_ai_timestamp", columnList = "timestamp")
})
public class AiInteractionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, length = 50)
    private String feature;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String prompt;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String response;

    @Column(name = "disclaimer_shown")
    private Boolean disclaimerShown = true;

    @Column(nullable = false, updatable = false)
    private Instant timestamp = Instant.now();

    public AiInteractionLog() {}

    public AiInteractionLog(Long userId, String feature, String prompt, String response, Boolean disclaimerShown) {
        this.userId = userId;
        this.feature = feature;
        this.prompt = prompt;
        this.response = response;
        this.disclaimerShown = disclaimerShown;
        this.timestamp = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFeature() {
        return feature;
    }

    public void setFeature(String feature) {
        this.feature = feature;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public Boolean getDisclaimerShown() {
        return disclaimerShown;
    }

    public void setDisclaimerShown(Boolean disclaimerShown) {
        this.disclaimerShown = disclaimerShown;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
