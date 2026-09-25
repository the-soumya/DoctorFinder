package com.healthportal.service;

import com.healthportal.entity.Doctor;
import com.healthportal.entity.Pharmacy;
import com.healthportal.entity.PharmacyDoctorSlot;
import com.healthportal.exception.ResourceNotFoundException;
import com.healthportal.repository.DoctorRepository;
import com.healthportal.repository.PharmacyDoctorSlotRepository;
import com.healthportal.repository.PharmacyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PharmacyService {

    @Autowired
    private PharmacyRepository pharmacyRepository;

    @Autowired
    private PharmacyDoctorSlotRepository slotRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    public List<Map<String, Object>> getAllApprovedPharmacies(String city, String locality) {
        List<Pharmacy> list;
        if (locality != null && !locality.isBlank() && !locality.equalsIgnoreCase("ALL")) {
            list = pharmacyRepository.findByLocalityIgnoreCase(locality.trim());
        } else if (city != null && !city.isBlank() && !city.equalsIgnoreCase("ALL")) {
            list = pharmacyRepository.findByCityIgnoreCase(city.trim());
        } else {
            list = pharmacyRepository.findAll();
        }

        return list.stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsApproved()))
                .map(this::mapToDetails)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getPharmacyById(Long id) {
        Pharmacy p = pharmacyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacy not found with ID: " + id));
        return mapToDetails(p);
    }

    public Map<String, Object> getPharmacyByUserId(Long userId) {
        Pharmacy p = pharmacyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacy profile not found for user ID: " + userId));
        return mapToDetails(p);
    }

    @Transactional
    public Map<String, Object> addDoctorSlot(Long pharmacyId, Long doctorId, String days, String timeSlot, String room, BigDecimal fee, Integer maxTokens) {
        Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacy not found"));
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        PharmacyDoctorSlot slot = new PharmacyDoctorSlot(pharmacy, doctor, days, timeSlot, room, fee, maxTokens);
        slotRepository.save(slot);
        return mapToDetails(pharmacy);
    }

    @Transactional
    public void removeDoctorSlot(Long slotId) {
        slotRepository.deleteById(slotId);
    }

    private Map<String, Object> mapToDetails(Pharmacy p) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", p.getId());
        res.put("name", p.getName());
        res.put("licenseNumber", p.getLicenseNumber());
        res.put("address", p.getAddress());
        res.put("city", p.getCity());
        res.put("district", p.getDistrict());
        res.put("state", p.getState());
        res.put("locality", p.getLocality());
        res.put("latitude", p.getLatitude());
        res.put("longitude", p.getLongitude());
        res.put("phone", p.getPhone());
        res.put("operatingHours", p.getOperatingHours());
        res.put("isApproved", p.getIsApproved());

        List<PharmacyDoctorSlot> slots = slotRepository.findByPharmacyId(p.getId());
        List<Map<String, Object>> visitingDoctors = slots.stream().map(slot -> {
            Map<String, Object> dMap = new LinkedHashMap<>();
            Doctor doc = slot.getDoctor();
            dMap.put("slotId", slot.getId());
            dMap.put("doctorId", doc.getId());
            dMap.put("doctorName", doc.getUser().getName());
            dMap.put("degree", doc.getDegree());
            dMap.put("specialization", doc.getSpecialization());
            dMap.put("departmentName", doc.getDepartment().getName());
            dMap.put("photoUrl", doc.getPhotoUrl());
            dMap.put("availableDays", slot.getAvailableDays());
            dMap.put("timeSlot", slot.getTimeSlot());
            dMap.put("chamberRoom", slot.getChamberRoom());
            dMap.put("consultationFee", slot.getConsultationFee());
            dMap.put("maxTokens", slot.getMaxTokens());
            return dMap;
        }).collect(Collectors.toList());

        res.put("visitingDoctors", visitingDoctors);
        return res;
    }
}
