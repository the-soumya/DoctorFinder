package com.healthportal.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthportal.dto.prescription.DrugConflictResult;
import com.healthportal.dto.prescription.MedicineDto;
import com.healthportal.dto.prescription.PrescriptionDto;
import com.healthportal.dto.prescription.PrescriptionRequest;
import com.healthportal.entity.*;
import com.healthportal.exception.BadRequestException;
import com.healthportal.exception.ConflictException;
import com.healthportal.exception.ResourceNotFoundException;
import com.healthportal.repository.AllergyMedicationHistoryRepository;
import com.healthportal.repository.AppointmentRepository;
import com.healthportal.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private AllergyMedicationHistoryRepository allergyRepository;

    @Autowired
    private AuditService auditService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Known drug-drug interaction knowledge base matrix
    private static final List<DrugInteractionRule> DRUG_INTERACTION_RULES = Arrays.asList(
            new DrugInteractionRule("warfarin", "aspirin", "CRITICAL", "Severe internal gastrointestinal bleeding and hemorrhage risk."),
            new DrugInteractionRule("warfarin", "ibuprofen", "CRITICAL", "High risk of gastric bleeding and prolonged prothrombin time."),
            new DrugInteractionRule("lisinopril", "spironolactone", "CRITICAL", "Severe risk of hyperkalemia and potential cardiac arrest."),
            new DrugInteractionRule("lisinopril", "potassium", "CRITICAL", "Risk of lethal hyperkalemia."),
            new DrugInteractionRule("sildenafil", "nitroglycerin", "CRITICAL", "Fatal drop in systemic blood pressure (severe hypotension)."),
            new DrugInteractionRule("tramadol", "fluoxetine", "CRITICAL", "High risk of serotonin syndrome, seizures, and neurotoxicity."),
            new DrugInteractionRule("tramadol", "sertraline", "CRITICAL", "High risk of serotonin syndrome and altered mental status."),
            new DrugInteractionRule("ciprofloxacin", "theophylline", "HIGH", "Inhibition of theophylline metabolism causing toxicity and cardiac arrhythmias."),
            new DrugInteractionRule("methotrexate", "ibuprofen", "CRITICAL", "NSAIDs reduce methotrexate excretion leading to severe bone marrow suppression."),
            new DrugInteractionRule("simvastatin", "clarithromycin", "HIGH", "CYP3A4 inhibition increases statin levels causing severe rhabdomyolysis."),
            new DrugInteractionRule("clopidogrel", "omeprazole", "MODERATE", "Omeprazole decreases antiplatelet activation of clopidogrel.")
    );

    private static class DrugInteractionRule {
        String drug1;
        String drug2;
        String severity;
        String warning;

        DrugInteractionRule(String drug1, String drug2, String severity, String warning) {
            this.drug1 = drug1;
            this.drug2 = drug2;
            this.severity = severity;
            this.warning = warning;
        }

        boolean matches(String d1, String d2) {
            return (d1.contains(drug1) && d2.contains(drug2)) || (d1.contains(drug2) && d2.contains(drug1));
        }
    }

    public List<DrugConflictResult> checkConflicts(Long patientId, List<MedicineDto> medicines) {
        List<DrugConflictResult> conflicts = new ArrayList<>();
        List<AllergyMedicationHistory> patientHistories = allergyRepository.findByPatientId(patientId);

        for (MedicineDto med : medicines) {
            String medNameLower = med.getName().toLowerCase().trim();

            // 1. Check against patient allergies
            for (AllergyMedicationHistory history : patientHistories) {
                if (history.getAllergyName() != null && !history.getAllergyName().isBlank()) {
                    String allergyLower = history.getAllergyName().toLowerCase().trim();
                    if (medNameLower.contains(allergyLower) || allergyLower.contains(medNameLower) ||
                        (allergyLower.contains("penicillin") && (medNameLower.contains("amoxicillin") || medNameLower.contains("ampicillin") || medNameLower.contains("augmentin"))) ||
                        (allergyLower.contains("sulfa") && (medNameLower.contains("bactrim") || medNameLower.contains("sulfamethoxazole") || medNameLower.contains("cotrimoxazole"))) ||
                        (allergyLower.contains("nsaid") && (medNameLower.contains("aspirin") || medNameLower.contains("ibuprofen") || medNameLower.contains("naproxen") || medNameLower.contains("diclofenac")))) {
                        conflicts.add(new DrugConflictResult(
                                true,
                                "PATIENT_ALLERGY_CONFLICT",
                                med.getName(),
                                history.getAllergyName() + " (Severity: " + history.getSeverity() + ")",
                                "CRITICAL",
                                "Patient has a documented allergy to " + history.getAllergyName() + ". Prescribing " + med.getName() + " may induce severe allergic reaction or anaphylaxis."
                        ));
                    }
                }

                // 2. Check against patient's current medications
                if (history.getMedicationName() != null && !history.getMedicationName().isBlank()) {
                    String existingMed = history.getMedicationName().toLowerCase().trim();
                    for (DrugInteractionRule rule : DRUG_INTERACTION_RULES) {
                        if (rule.matches(medNameLower, existingMed)) {
                            conflicts.add(new DrugConflictResult(
                                    true,
                                    "DRUG_INTERACTION_CONFLICT",
                                    med.getName(),
                                    "Current Medication: " + history.getMedicationName(),
                                    rule.severity,
                                    rule.warning
                            ));
                        }
                    }
                }
            }

            // 3. Check for co-prescribed conflicts among the new list of medicines
            for (MedicineDto otherMed : medicines) {
                if (!med.equals(otherMed)) {
                    String otherLower = otherMed.getName().toLowerCase().trim();
                    for (DrugInteractionRule rule : DRUG_INTERACTION_RULES) {
                        if (rule.matches(medNameLower, otherLower)) {
                            // Avoid duplicate reverse pair
                            boolean alreadyAdded = conflicts.stream().anyMatch(c ->
                                    c.getConflictingMedicine().equalsIgnoreCase(med.getName()) &&
                                    c.getMatchedEntity().contains(otherMed.getName()));
                            if (!alreadyAdded) {
                                conflicts.add(new DrugConflictResult(
                                        true,
                                        "CO_PRESCRIBED_INTERACTION_CONFLICT",
                                        med.getName(),
                                        "Co-prescribed with: " + otherMed.getName(),
                                        rule.severity,
                                        rule.warning
                                ));
                            }
                        }
                    }
                }
            }
        }

        return conflicts;
    }

    @Transactional
    public PrescriptionDto savePrescription(PrescriptionRequest request, Long doctorUserId) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + request.getAppointmentId()));

        if (!appointment.getDoctor().getUser().getId().equals(doctorUserId)) {
            throw new BadRequestException("Only the assigned doctor can add a prescription for this appointment");
        }

        // Run Rule-Based Conflict Check
        List<DrugConflictResult> conflicts = checkConflicts(appointment.getPatient().getId(), request.getMedicines());

        if (!conflicts.isEmpty() && (request.getOverrideConflict() == null || !request.getOverrideConflict())) {
            throw new ConflictException("Drug or Allergy Conflict detected! You must review and provide an explicit override flag and clinical rationale to proceed.", conflicts);
        }

        Prescription prescription = prescriptionRepository.findByAppointmentId(appointment.getId())
                .orElseGet(Prescription::new);

        prescription.setAppointment(appointment);

        try {
            prescription.setMedicines(objectMapper.writeValueAsString(request.getMedicines()));
        } catch (Exception e) {
            throw new BadRequestException("Failed to serialize medicines payload: " + e.getMessage());
        }

        prescription.setDosageNotes(request.getDosageNotes());
        // Diagnosis notes are encrypted at column level via JPA converter
        prescription.setDiagnosisNotes(request.getDiagnosisNotes());

        if (!conflicts.isEmpty()) {
            prescription.setConflictFlag(true);
            prescription.setConflictOverrideReason(request.getOverrideReason() != null ?
                    request.getOverrideReason() : "Clinical benefit overrides detected warning");

            auditService.log(doctorUserId, "PRESCRIPTION_CONFLICT_OVERRIDE", "prescriptions", appointment.getId(),
                    "Doctor overridden conflicts: " + prescription.getConflictOverrideReason());
        } else {
            prescription.setConflictFlag(false);
            prescription.setConflictOverrideReason(null);
        }

        prescription = prescriptionRepository.save(prescription);

        // Mark appointment as COMPLETED
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        auditService.log(doctorUserId, "PRESCRIPTION_SAVED", "prescriptions", prescription.getId(),
                "Saved prescription for appointment " + appointment.getId());

        return mapToDto(prescription, false);
    }

    @Transactional
    public PrescriptionDto markDispensed(Long prescriptionId, Long pharmacistUserId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID: " + prescriptionId));

        prescription.setDispensed(true);
        prescription.setDispensedAt(Instant.now());
        prescription = prescriptionRepository.save(prescription);

        auditService.log(pharmacistUserId, "PRESCRIPTION_DISPENSED", "prescriptions", prescription.getId(),
                "Pharmacist dispensed prescription items");

        return mapToDto(prescription, true);
    }

    public PrescriptionDto getPrescriptionByAppointmentId(Long appointmentId, Role viewerRole) {
        Prescription prescription = prescriptionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("No prescription found for appointment ID: " + appointmentId));

        // Read-only on medical notes for Pharmacist/Receptionist: mask diagnosisNotes
        boolean maskMedicalNotes = (viewerRole == Role.ROLE_PHARMACIST_RECEPTIONIST);
        return mapToDto(prescription, maskMedicalNotes);
    }

    public List<PrescriptionDto> getPatientPrescriptions(Long patientId) {
        return prescriptionRepository.findByAppointmentPatientId(patientId).stream()
                .map(p -> mapToDto(p, false))
                .collect(Collectors.toList());
    }

    public List<PrescriptionDto> getUndispensedPrescriptions() {
        return prescriptionRepository.findByDispensed(false).stream()
                .map(p -> mapToDto(p, true)) // Pharmacist view
                .collect(Collectors.toList());
    }

    public List<PrescriptionDto> getAllPrescriptions(Role viewerRole) {
        boolean maskMedicalNotes = (viewerRole == Role.ROLE_PHARMACIST_RECEPTIONIST);
        return prescriptionRepository.findAll().stream()
                .map(p -> mapToDto(p, maskMedicalNotes))
                .collect(Collectors.toList());
    }

    private PrescriptionDto mapToDto(Prescription p, boolean maskDiagnosisNotes) {
        PrescriptionDto dto = new PrescriptionDto();
        dto.setId(p.getId());
        dto.setAppointmentId(p.getAppointment().getId());
        dto.setPatientId(p.getAppointment().getPatient().getId());
        dto.setPatientName(p.getAppointment().getPatient().getName());
        dto.setDoctorId(p.getAppointment().getDoctor().getId());
        dto.setDoctorName(p.getAppointment().getDoctor().getUser().getName());
        dto.setDoctorSpecialization(p.getAppointment().getDoctor().getSpecialization());

        try {
            List<MedicineDto> meds = objectMapper.readValue(p.getMedicines(), new TypeReference<List<MedicineDto>>() {});
            dto.setMedicines(meds);
        } catch (Exception e) {
            dto.setMedicines(Collections.emptyList());
        }

        dto.setDosageNotes(p.getDosageNotes());

        if (maskDiagnosisNotes) {
            dto.setDiagnosisNotes("[PROTECTED - MEDICAL CLINICAL PRIVILEGE: Hidden for Pharmacy/Reception role]");
        } else {
            dto.setDiagnosisNotes(p.getDiagnosisNotes());
        }

        dto.setConflictFlag(p.getConflictFlag());
        dto.setConflictOverrideReason(p.getConflictOverrideReason());
        dto.setDispensed(p.getDispensed());
        dto.setDispensedAt(p.getDispensedAt());
        dto.setCreatedAt(p.getCreatedAt());

        return dto;
    }
}
