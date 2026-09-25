package com.healthportal.service;

import com.healthportal.dto.doctor.DoctorDto;
import com.healthportal.entity.Department;
import com.healthportal.entity.Doctor;
import com.healthportal.entity.Role;
import com.healthportal.entity.User;
import com.healthportal.exception.ResourceNotFoundException;
import com.healthportal.repository.DepartmentRepository;
import com.healthportal.repository.DoctorRepository;
import com.healthportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private AuditService auditService;

    // Haversine formula calculation in Java (ensures 100% precision across all DB dialects)
    public static double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    public List<DoctorDto> getDoctorsNearMe(Double patientLat, Double patientLon, String specialization,
                                           Long departmentId, Double minRating,
                                           String state, String district, String city, String locality) {
        List<Doctor> doctors = doctorRepository.findAll();

        return doctors.stream()
                .filter(d -> {
                    if (state != null && !state.isBlank() && !state.equalsIgnoreCase("ALL")) {
                        if (d.getState() == null || !d.getState().trim().equalsIgnoreCase(state.trim())) {
                            return false;
                        }
                    }
                    if (district != null && !district.isBlank() && !district.equalsIgnoreCase("ALL")) {
                        if (d.getDistrict() == null || !d.getDistrict().trim().equalsIgnoreCase(district.trim())) {
                            return false;
                        }
                    }
                    if (city != null && !city.isBlank() && !city.equalsIgnoreCase("ALL")) {
                        if (d.getCity() == null || !d.getCity().trim().equalsIgnoreCase(city.trim())) {
                            return false;
                        }
                    }
                    if (locality != null && !locality.isBlank() && !locality.equalsIgnoreCase("ALL")) {
                        if (d.getLocality() == null || !d.getLocality().trim().equalsIgnoreCase(locality.trim())) {
                            return false;
                        }
                    }
                    if (specialization != null && !specialization.isBlank()) {
                        String spec = d.getSpecialization().toLowerCase();
                        String dept = d.getDepartment().getName().toLowerCase();
                        String name = d.getUser().getName().toLowerCase();
                        String filterSpec = specialization.toLowerCase().trim();
                        String root = filterSpec.length() >= 4 ? filterSpec.substring(0, 4) : filterSpec;

                        boolean match = spec.contains(filterSpec) || dept.contains(filterSpec) || name.contains(filterSpec) ||
                                        spec.contains(root) || dept.contains(root);
                        if (!match) {
                            return false;
                        }
                    }
                    if (departmentId != null && !d.getDepartment().getId().equals(departmentId)) {
                        return false;
                    }
                    if (minRating != null && d.getRating() < minRating) {
                        return false;
                    }
                    return true;
                })
                .map(d -> {
                    DoctorDto dto = mapToDto(d);
                    if (patientLat != null && patientLon != null) {
                        double dist = calculateHaversineDistance(patientLat, patientLon, d.getLatitude(), d.getLongitude());
                        BigDecimal roundedDist = BigDecimal.valueOf(dist).setScale(2, RoundingMode.HALF_UP);
                        dto.setDistanceKm(roundedDist.doubleValue());
                    }
                    return dto;
                })
                .sorted((d1, d2) -> {
                    if (d1.getDistanceKm() != null && d2.getDistanceKm() != null) {
                        return Double.compare(d1.getDistanceKm(), d2.getDistanceKm());
                    }
                    return Double.compare(d2.getRating(), d1.getRating());
                })
                .collect(Collectors.toList());
    }

    public List<DoctorDto> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DoctorDto getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + id));
        return mapToDto(doctor);
    }

    public DoctorDto getDoctorByUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user ID: " + userId));
        return mapToDto(doctor);
    }

    @Transactional
    public DoctorDto updateDoctorProfile(Long doctorId, DoctorDto dto, Long adminOrDoctorUserId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));

        if (dto.getSpecialization() != null) doctor.setSpecialization(dto.getSpecialization());
        if (dto.getConsultationFee() != null) doctor.setConsultationFee(dto.getConsultationFee());
        if (dto.getLatitude() != null) doctor.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) doctor.setLongitude(dto.getLongitude());
        if (dto.getRating() != null) doctor.setRating(dto.getRating());
        if (dto.getExperienceYears() != null) doctor.setExperienceYears(dto.getExperienceYears());
        if (dto.getBio() != null) doctor.setBio(dto.getBio());
        if (dto.getDegree() != null) doctor.setDegree(dto.getDegree());
        if (dto.getPhotoUrl() != null) doctor.setPhotoUrl(dto.getPhotoUrl());
        if (dto.getCity() != null) doctor.setCity(dto.getCity());
        if (dto.getDistrict() != null) doctor.setDistrict(dto.getDistrict());
        if (dto.getState() != null) doctor.setState(dto.getState());
        if (dto.getLocality() != null) doctor.setLocality(dto.getLocality());
        if (dto.getClinicAddress() != null) doctor.setClinicAddress(dto.getClinicAddress());

        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + dto.getDepartmentId()));
            doctor.setDepartment(department);
        }

        if (dto.getName() != null || dto.getPhone() != null) {
            User user = doctor.getUser();
            if (dto.getName() != null) user.setName(dto.getName());
            if (dto.getPhone() != null) user.setPhone(dto.getPhone());
            userRepository.save(user);
        }

        doctor = doctorRepository.save(doctor);
        auditService.log(adminOrDoctorUserId, "DOCTOR_PROFILE_UPDATE", "doctors", doctor.getId(), "Updated profile for Dr. " + doctor.getUser().getName());

        return mapToDto(doctor);
    }

    public Map<String, Object> getAvailableLocations() {
        List<Doctor> doctors = doctorRepository.findAll();
        Set<String> states = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        Set<String> districts = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        Set<String> cities = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        Set<String> localities = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);

        // State -> District -> City -> Localities hierarchy
        Map<String, Map<String, Map<String, Set<String>>>> hierarchy = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        Map<String, Set<String>> cityToLocalities = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);

        for (Doctor d : doctors) {
            String s = d.getState() != null ? d.getState().trim() : "";
            String dist = d.getDistrict() != null ? d.getDistrict().trim() : "";
            String c = d.getCity() != null ? d.getCity().trim() : "";
            String loc = d.getLocality() != null ? d.getLocality().trim() : "";

            if (!s.isEmpty()) states.add(s);
            if (!dist.isEmpty()) districts.add(dist);
            if (!c.isEmpty()) {
                cities.add(c);
                cityToLocalities.putIfAbsent(c, new TreeSet<>(String.CASE_INSENSITIVE_ORDER));
                if (!loc.isEmpty()) {
                    cityToLocalities.get(c).add(loc);
                }
            }
            if (!loc.isEmpty()) localities.add(loc);

            if (!s.isEmpty()) {
                hierarchy.putIfAbsent(s, new TreeMap<>(String.CASE_INSENSITIVE_ORDER));
                if (!dist.isEmpty()) {
                    hierarchy.get(s).putIfAbsent(dist, new TreeMap<>(String.CASE_INSENSITIVE_ORDER));
                    if (!c.isEmpty()) {
                        hierarchy.get(s).get(dist).putIfAbsent(c, new TreeSet<>(String.CASE_INSENSITIVE_ORDER));
                        if (!loc.isEmpty()) {
                            hierarchy.get(s).get(dist).get(c).add(loc);
                        }
                    }
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("states", states);
        result.put("districts", districts);
        result.put("cities", cities);
        result.put("localities", localities);
        result.put("cityToLocalities", cityToLocalities);
        result.put("hierarchy", hierarchy);
        return result;
    }

    public DoctorDto mapToDto(Doctor d) {
        DoctorDto dto = new DoctorDto();
        dto.setId(d.getId());
        dto.setUserId(d.getUser().getId());
        dto.setName(d.getUser().getName());
        dto.setEmail(d.getUser().getEmail());
        dto.setPhone(d.getUser().getPhone());
        dto.setSpecialization(d.getSpecialization());
        dto.setDepartmentId(d.getDepartment().getId());
        dto.setDepartmentName(d.getDepartment().getName());
        dto.setLatitude(d.getLatitude());
        dto.setLongitude(d.getLongitude());
        dto.setConsultationFee(d.getConsultationFee());
        dto.setRating(d.getRating());
        dto.setExperienceYears(d.getExperienceYears());
        dto.setBio(d.getBio());
        dto.setDegree(d.getDegree());
        dto.setPhotoUrl(d.getPhotoUrl());
        dto.setCity(d.getCity());
        dto.setDistrict(d.getDistrict());
        dto.setState(d.getState());
        dto.setLocality(d.getLocality());
        dto.setClinicAddress(d.getClinicAddress());
        return dto;
    }
}
