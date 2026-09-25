package com.healthportal.dto.ai;

import java.util.List;

public class SymptomCheckResponse {

    private List<String> possibleConditions;
    private String recommendedSpecialist;
    private String confidence;
    private String analysisNotes;
    private String disclaimer = "This is not a medical diagnosis; please consult the recommended specialist.";

    public SymptomCheckResponse() {}

    public SymptomCheckResponse(List<String> possibleConditions, String recommendedSpecialist, String confidence, String analysisNotes) {
        this.possibleConditions = possibleConditions;
        this.recommendedSpecialist = recommendedSpecialist;
        this.confidence = confidence;
        this.analysisNotes = analysisNotes;
        this.disclaimer = "This is not a medical diagnosis; please consult the recommended specialist.";
    }

    public List<String> getPossibleConditions() {
        return possibleConditions;
    }

    public void setPossibleConditions(List<String> possibleConditions) {
        this.possibleConditions = possibleConditions;
    }

    public String getRecommendedSpecialist() {
        return recommendedSpecialist;
    }

    public void setRecommendedSpecialist(String recommendedSpecialist) {
        this.recommendedSpecialist = recommendedSpecialist;
    }

    public String getConfidence() {
        return confidence;
    }

    public void setConfidence(String confidence) {
        this.confidence = confidence;
    }

    public String getAnalysisNotes() {
        return analysisNotes;
    }

    public void setAnalysisNotes(String analysisNotes) {
        this.analysisNotes = analysisNotes;
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }
}
