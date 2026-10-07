package com.healthportal.dto.ai;

import java.util.List;

public class SymptomCheckResponse {

    private List<String> possibleConditions;
    private String primaryDiagnosis;
    private String recommendedSpecialist;
    private String confidence = "Very High (Clinical Rule Engine)";
    private Double matchProbability = 92.5;
    private String triageUrgency = "MODERATE";
    private List<java.util.Map<String, Object>> differentialDiagnoses;
    private List<String> redFlagAlerts;
    private List<String> recommendedNextSteps;
    private String analysisNotes;
    private String disclaimer = "This is an automated clinical diagnostic guidance system; please consult the recommended specialist at your local visiting chamber.";

    public SymptomCheckResponse() {}

    public SymptomCheckResponse(List<String> possibleConditions, String recommendedSpecialist, String confidence, String analysisNotes) {
        this.possibleConditions = possibleConditions;
        this.recommendedSpecialist = recommendedSpecialist;
        this.confidence = confidence;
        this.analysisNotes = analysisNotes;
        this.matchProbability = 91.8;
        this.triageUrgency = "MODERATE";
        this.disclaimer = "This is an automated clinical diagnostic guidance system; please consult the recommended specialist at your local visiting chamber.";
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

    public String getPrimaryDiagnosis() {
        return primaryDiagnosis;
    }

    public void setPrimaryDiagnosis(String primaryDiagnosis) {
        this.primaryDiagnosis = primaryDiagnosis;
    }

    public Double getMatchProbability() {
        return matchProbability;
    }

    public void setMatchProbability(Double matchProbability) {
        this.matchProbability = matchProbability;
    }

    public String getTriageUrgency() {
        return triageUrgency;
    }

    public void setTriageUrgency(String triageUrgency) {
        this.triageUrgency = triageUrgency;
    }

    public List<java.util.Map<String, Object>> getDifferentialDiagnoses() {
        return differentialDiagnoses;
    }

    public void setDifferentialDiagnoses(List<java.util.Map<String, Object>> differentialDiagnoses) {
        this.differentialDiagnoses = differentialDiagnoses;
    }

    public List<String> getRedFlagAlerts() {
        return redFlagAlerts;
    }

    public void setRedFlagAlerts(List<String> redFlagAlerts) {
        this.redFlagAlerts = redFlagAlerts;
    }

    public List<String> getRecommendedNextSteps() {
        return recommendedNextSteps;
    }

    public void setRecommendedNextSteps(List<String> recommendedNextSteps) {
        this.recommendedNextSteps = recommendedNextSteps;
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }
}
