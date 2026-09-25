package com.healthportal.config;

import com.healthportal.entity.*;
import com.healthportal.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AllergyMedicationHistoryRepository allergyRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private LabReportRepository labReportRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.healthportal.repository.PharmacyRepository pharmacyRepository;

    @Autowired
    private com.healthportal.repository.PharmacyDoctorSlotRepository pharmacyDoctorSlotRepository;

    @Override
    public void run(String... args) {
        logger.info("Checking and syncing hospital departments, doctors, test users, and degrees/photos...");

        // 1. Clean up existing user names that had 'Dr. ' prefix to prevent 'Dr. Dr.' display
        List<User> allUsers = userRepository.findAll();
        for (User u : allUsers) {
            if (u.getName() != null && u.getName().startsWith("Dr. ")) {
                u.setName(u.getName().replaceFirst("^Dr\\.\\s*", ""));
                userRepository.save(u);
            }
        }

        // 2. Ensure Departments exist
        Department cardiology = getOrCreateDepartment("Cardiology", "Cardiovascular health, coronary care, and heart failure management");
        Department dermatology = getOrCreateDepartment("Dermatology", "Skin disorders, cosmetic procedures, eczema, and allergy therapeutics");
        Department neurology = getOrCreateDepartment("Neurology", "Disorders of the brain, spinal cord, and peripheral nervous system");
        Department orthopedics = getOrCreateDepartment("Orthopedics", "Bones, joints, ligaments, sports injuries, and spine wellness");
        Department generalMedicine = getOrCreateDepartment("General Medicine", "Primary care, seasonal infections, lifestyle disorders, and wellness");
        Department pulmonology = getOrCreateDepartment("Pulmonology", "Respiratory tract, lung health, asthma, and chronic cough management");

        // 3. Ensure standard test accounts exist
        if (!userRepository.existsByEmail("admin@health.com")) {
            User adminUser = new User(
                    "Hospital Administrator",
                    "admin@health.com",
                    passwordEncoder.encode("admin123"),
                    Role.ROLE_ADMIN,
                    "+91 98765 43210"
            );
            adminUser.setIsApproved(true);
            userRepository.save(adminUser);
        }

        if (!userRepository.existsByEmail("admin@hospital.com")) {
            User admin2 = new User(
                    "Admin Director",
                    "admin@hospital.com",
                    passwordEncoder.encode("admin123"),
                    Role.ROLE_ADMIN,
                    "+91 98765 43210"
            );
            admin2.setIsApproved(true);
            userRepository.save(admin2);
        }

        if (!userRepository.existsByEmail("pharmacy@health.com")) {
            User pharmUser = new User(
                    "Makhla Medicare Pharmacy & Polyclinic",
                    "pharmacy@health.com",
                    passwordEncoder.encode("pharmacy123"),
                    Role.ROLE_PHARMACIST_RECEPTIONIST,
                    "+91 98311 55667"
            );
            pharmUser.setAddress("Makhla More, Uttarpara, Hooghly");
            pharmUser.setIsApproved(true);
            userRepository.save(pharmUser);
        }

        if (!userRepository.existsByEmail("staff@hospital.com")) {
            User staffUser = new User(
                    "Reception & Pharmacy Desk",
                    "staff@hospital.com",
                    passwordEncoder.encode("staff123"),
                    Role.ROLE_PHARMACIST_RECEPTIONIST,
                    "+91 98765 43211"
            );
            staffUser.setIsApproved(true);
            userRepository.save(staffUser);
        }

        // Test Doctor awaiting Admin Approval
        if (!userRepository.existsByEmail("dr.aniket.pending@hospital.com")) {
            User pendingDocUser = new User(
                    "Aniket Sen",
                    "dr.aniket.pending@hospital.com",
                    passwordEncoder.encode("doctor123"),
                    Role.ROLE_DOCTOR,
                    "+91 98322 77889"
            );
            pendingDocUser.setAddress("Kotrung, Uttarpara, Hooghly");
            pendingDocUser.setIsApproved(false); // AWAITING APPROVAL!
            pendingDocUser = userRepository.save(pendingDocUser);

            Doctor pendingDoc = new Doctor(
                    pendingDocUser,
                    orthopedics,
                    "Orthopedic & Joint Surgeon",
                    22.6810,
                    88.3470,
                    new BigDecimal("600.00"),
                    4.8,
                    9,
                    "Newly registered orthopedic surgeon awaiting hospital board verification.",
                    "MBBS, MS (Orthopedics)",
                    "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
                    "Uttarpara",
                    "Hooghly",
                    "West Bengal",
                    "Kotrung",
                    "Kotrung Hospital Road, Uttarpara"
            );
            doctorRepository.save(pendingDoc);
        }

        // Test Pharmacy awaiting Admin Approval
        if (!userRepository.existsByEmail("care.pharmacy.pending@health.com")) {
            User pendingPharmUser = new User(
                    "Care & Cure Chemists & Doctor Chamber",
                    "care.pharmacy.pending@health.com",
                    passwordEncoder.encode("pharmacy123"),
                    Role.ROLE_PHARMACIST_RECEPTIONIST,
                    "+91 98399 22110"
            );
            pendingPharmUser.setAddress("GT Road, Rishra, Hooghly");
            pendingPharmUser.setIsApproved(false); // AWAITING APPROVAL!
            pendingPharmUser = userRepository.save(pendingPharmUser);

            Pharmacy pendingPharm = new Pharmacy(
                    "Care & Cure Chemists & Doctor Chamber",
                    "WB-LIC-PENDING-994",
                    pendingPharmUser,
                    "GT Road, Rishra, Hooghly",
                    "Rishra",
                    "Hooghly",
                    "West Bengal",
                    "GT Road Rishra",
                    22.7140,
                    88.3560,
                    "+91 98399 22110",
                    "09:00 AM - 09:30 PM",
                    false
            );
            pharmacyRepository.save(pendingPharm);
        }

        User patient1 = userRepository.findByEmail("patient@health.com").orElseGet(() ->
                userRepository.save(new User(
                        "Rohan Verma",
                        "patient@health.com",
                        passwordEncoder.encode("patient123"),
                        Role.ROLE_PATIENT,
                        "+91 98111 22233"
                ))
        );
        patient1.setAddress("Makhla, Uttarpara, Hooghly, West Bengal 712245");
        userRepository.save(patient1);

        if (!userRepository.existsByEmail("meera@health.com")) {
            userRepository.save(new User(
                    "Meera Nambiar",
                    "meera@health.com",
                    passwordEncoder.encode("patient123"),
                    Role.ROLE_PATIENT,
                    "+91 98222 33344"
            ));
        }

        // Patient allergy & medication history
        if (allergyRepository.findByPatientId(patient1.getId()).isEmpty()) {
            allergyRepository.save(new AllergyMedicationHistory(
                    patient1,
                    "Penicillin",
                    "None",
                    "SEVERE",
                    "Documented history of hives, bronchospasm, and anaphylaxis to beta-lactam antibiotics"
            ));
            allergyRepository.save(new AllergyMedicationHistory(
                    patient1,
                    "None",
                    "Warfarin",
                    "HIGH",
                    "Takes 5mg Warfarin daily for atrial fibrillation. Severe bleeding risk with NSAIDs / Aspirin."
            ));
        }

        // 4. Seed / Update Doctors across West Bengal (Howrah to Bandel mainline corridor)
        // ==================== 1. UTTARPARA (Hooghly, West Bengal) ====================
        upsertDoctor(
                "Vikram Sharma",
                "dr.sharma@hospital.com",
                cardiology,
                "Senior Interventional Cardiologist",
                "MBBS, MD (Medicine), DM (Cardiology, AIIMS)",
                new BigDecimal("750.00"),
                4.9,
                14,
                22.6730,
                88.3340,
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
                "Specialist in coronary angioplasty, heart failure, and complex cardiac arrhythmias with over 14 years clinical experience.",
                "Uttarpara",
                "Hooghly",
                "West Bengal",
                "Makhla",
                "Near Makhla High School & Market, Uttarpara"
        );

        upsertDoctor(
                "Mousumi Dutta",
                "dr.mousumi@hospital.com",
                generalMedicine,
                "Consultant Physician & Metabolic Health Specialist",
                "MBBS, MD (General Medicine)",
                new BigDecimal("450.00"),
                4.8,
                14,
                22.6710,
                88.3520,
                "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=400",
                "Comprehensive internal medicine consultant focusing on hypertension, thyroid, uncontrolled diabetes, and fever diagnostics.",
                "Uttarpara",
                "Hooghly",
                "West Bengal",
                "Uttarpara GT Road",
                "GT Road near Jaykrishna Public Library, Uttarpara"
        );

        upsertDoctor(
                "Sayan Chakraborty",
                "dr.sayan@hospital.com",
                orthopedics,
                "Consultant Spine & Joint Replacement Surgeon",
                "MBBS, MS (Orthopedics), MCh",
                new BigDecimal("650.00"),
                4.8,
                11,
                22.6760,
                88.3410,
                "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=400",
                "Orthopedic surgeon specializing in slip disc, cervical spondylosis, joint replacement, ligament tears, and fracture care.",
                "Uttarpara",
                "Hooghly",
                "West Bengal",
                "Uttarpara Railway Station",
                "Uttarpara Station Road West, Near Railway Overbridge"
        );

        upsertDoctor(
                "Rupa Majumder",
                "dr.rupa@hospital.com",
                dermatology,
                "Senior Dermatologist & Aesthetic Specialist",
                "MBBS, DVD, DNB (Dermatology)",
                new BigDecimal("500.00"),
                4.9,
                10,
                22.6820,
                88.3490,
                "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400",
                "Consultant dermatologist with extensive experience in acne therapies, fungal dermatosis, allergy diagnostics, and hair loss control.",
                "Uttarpara",
                "Hooghly",
                "West Bengal",
                "Kotrung Riverfront",
                "Kotrung Ferry Ghat Road, Uttarpara"
        );

        upsertDoctor(
                "Abhijit Das",
                "dr.abhijit@hospital.com",
                pulmonology,
                "Consultant Chest Physician & Allergist",
                "MBBS, MD (Chest Diseases), DTCD",
                new BigDecimal("600.00"),
                4.7,
                12,
                22.6680,
                88.3460,
                "https://images.unsplash.com/photo-1637059824899-a441006a6875?auto=format&fit=crop&q=80&w=400",
                "Expert chest physician specialized in seasonal allergy management, bronchial asthma, COPD, and respiratory infections.",
                "Uttarpara",
                "Hooghly",
                "West Bengal",
                "Bhadrakali",
                "Near Bhadrakali Government Colony & Girls School, Uttarpara"
        );

        upsertDoctor(
                "Sharmila Bose",
                "dr.sharmila@hospital.com",
                neurology,
                "Consultant Neurologist & Cognitive Specialist",
                "MBBS, MD, DM (Neurology)",
                new BigDecimal("800.00"),
                4.9,
                13,
                22.6780,
                88.3310,
                "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=400",
                "Consultant neurologist treating nerve disorders, chronic headache, sleep disturbances, peripheral neuropathy, and cognitive care.",
                "Uttarpara",
                "Hooghly",
                "West Bengal",
                "Makhla Uttar",
                "Makhla 2 No. Government Colony, Uttarpara"
        );

        // ==================== 2. KONNAGAR (Hooghly, West Bengal) ====================
        upsertDoctor(
                "Subhashish Mukherjee",
                "dr.subhashish@hospital.com",
                generalMedicine,
                "Senior Family Physician & Diabetologist",
                "MBBS, MD (Medicine, Calcutta Medical College)",
                new BigDecimal("400.00"),
                4.9,
                16,
                22.7020,
                88.3480,
                "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
                "Senior family physician and diabetes specialist practicing near Konnagar Station Road. Expert in chronic disease and seasonal infections.",
                "Konnagar",
                "Hooghly",
                "West Bengal",
                "Station Road / Masterpara",
                "Konnagar Station Road East, Near Bus Stand"
        );

        upsertDoctor(
                "Debolina Chatterjee",
                "dr.debolina@hospital.com",
                cardiology,
                "Consultant Cardiologist & Heart Failure Specialist",
                "MBBS, MD, DM (Cardiology, IPGMER SSKM)",
                new BigDecimal("700.00"),
                4.9,
                12,
                22.6990,
                88.3560,
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
                "Consultant cardiologist focusing on coronary artery disease, heart palpitations, ECG assessment, and hypertension management.",
                "Konnagar",
                "Hooghly",
                "West Bengal",
                "Konnagar GT Road",
                "GT Road near Rajrajeshwari Mandir, Konnagar"
        );

        upsertDoctor(
                "Souvik Sen",
                "dr.souvik@hospital.com",
                dermatology,
                "Consultant Dermatologist & Dermatosurgeon",
                "MBBS, MD (Dermatology, R.G. Kar)",
                new BigDecimal("500.00"),
                4.8,
                10,
                22.7050,
                88.3380,
                "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
                "Specialist in eczema, skin allergy patch tests, psoriasis, acne scar therapeutics, and pediatric dermatology.",
                "Konnagar",
                "Hooghly",
                "West Bengal",
                "Nabagram",
                "Nabagram Hiralal Paul College Road, Konnagar"
        );

        upsertDoctor(
                "Ananya Roy",
                "dr.ananya@hospital.com",
                orthopedics,
                "Senior Orthopedic & Joint Replacement Surgeon",
                "MBBS, MS (Orthopedics), DNB",
                new BigDecimal("600.00"),
                4.9,
                13,
                22.6960,
                88.3510,
                "https://images.unsplash.com/photo-1594824813501-5264b304c45b?auto=format&fit=crop&q=80&w=400",
                "Expert in osteoarthritis, knee arthroscopy, spinal spondylosis, slip disc therapy, and sports trauma rehabilitation.",
                "Konnagar",
                "Hooghly",
                "West Bengal",
                "Criper Road",
                "Near Criper Road Health Centre, Konnagar"
        );

        upsertDoctor(
                "Tanmoy Bhattacharya",
                "dr.tanmoy@hospital.com",
                pulmonology,
                "Consultant Pulmonologist & Chest Physician",
                "MBBS, MD (Pulmonary Medicine), FCCP",
                new BigDecimal("550.00"),
                4.7,
                11,
                22.7010,
                88.3580,
                "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=400",
                "Consultant chest physician treating bronchial asthma, COPD, bronchitis, allergic rhinitis, and post-viral chronic cough.",
                "Konnagar",
                "Hooghly",
                "West Bengal",
                "Baro Mandir Ghat",
                "Near Ganga Ghat, East Konnagar"
        );

        upsertDoctor(
                "Paramita Ghosh",
                "dr.paramita@hospital.com",
                neurology,
                "Consultant Neurologist & Stroke Specialist",
                "MBBS, MD, DM (Neurology, Bangur Institute)",
                new BigDecimal("750.00"),
                4.9,
                14,
                22.7030,
                88.3430,
                "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=400",
                "Specializes in recurrent migraine, vertigo, epilepsy management, neuropathy, Parkinson's disease, and stroke prevention.",
                "Konnagar",
                "Hooghly",
                "West Bengal",
                "Indira Nagar",
                "Indira Nagar More, Konnagar"
        );

        // ==================== 3. HOWRAH (Howrah District, West Bengal) ====================
        upsertDoctor(
                "Anupam Sengupta",
                "dr.anupam@hospital.com",
                cardiology,
                "Senior Cardiologist & Interventional Fellow",
                "MBBS, MD, DM (Cardiology)",
                new BigDecimal("750.00"),
                4.9,
                15,
                22.5710,
                88.3240,
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
                "Interventional cardiologist expert in angiograms, stents, and cardiac emergencies in Shibpur area.",
                "Howrah",
                "Howrah",
                "West Bengal",
                "Shibpur Mandirtala",
                "Near Mandirtala Bus Terminus, Shibpur, Howrah"
        );

        upsertDoctor(
                "Sharmistha Sen",
                "dr.sharmistha@hospital.com",
                generalMedicine,
                "Senior Consultant Physician",
                "MBBS, MD (Internal Medicine)",
                new BigDecimal("450.00"),
                4.8,
                14,
                22.5890,
                88.3410,
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
                "Expert internal medicine specialist near Howrah station handling infectious illnesses and hypertension.",
                "Howrah",
                "Howrah",
                "West Bengal",
                "Howrah Station Road",
                "Opposite Howrah Railway Station, Golabari, Howrah"
        );

        upsertDoctor(
                "Rajat Ghosh",
                "dr.rajat@hospital.com",
                orthopedics,
                "Senior Orthopedic Surgeon",
                "MBBS, MS (Orthopedics)",
                new BigDecimal("600.00"),
                4.8,
                12,
                22.5820,
                88.3280,
                "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
                "Specialist in joint replacement, fractures, and spine rehabilitation in Kadamtala.",
                "Howrah",
                "Howrah",
                "West Bengal",
                "Kadamtala",
                "Near Bantra Police Station, Kadamtala, Howrah"
        );

        upsertDoctor(
                "Poushali Roy",
                "dr.poushali@hospital.com",
                dermatology,
                "Consultant Dermatologist",
                "MBBS, MD (DVL)",
                new BigDecimal("500.00"),
                4.8,
                9,
                22.6050,
                88.3490,
                "https://images.unsplash.com/photo-1594824813501-5264b304c45b?auto=format&fit=crop&q=80&w=400",
                "Dermatologist focused on acne, allergy patch testing, and laser therapies along Salkia GT Road.",
                "Howrah",
                "Howrah",
                "West Bengal",
                "Salkia GT Road",
                "GT Road North, Salkia Chaurasta, Howrah"
        );

        upsertDoctor(
                "Amitava Das",
                "dr.amitava@hospital.com",
                pulmonology,
                "Consultant Pulmonologist",
                "MBBS, MD (Chest)",
                new BigDecimal("550.00"),
                4.7,
                11,
                22.5780,
                88.3120,
                "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
                "Chest physician treating asthma, COPD, and respiratory allergies near Ramrajatala.",
                "Howrah",
                "Howrah",
                "West Bengal",
                "Ramrajatala",
                "Near Ramrajatala Railway Station, Howrah"
        );

        upsertDoctor(
                "Tapas Adhikari",
                "dr.tapas@hospital.com",
                neurology,
                "Consultant Neurologist",
                "MBBS, MD, DM (Neurology)",
                new BigDecimal("750.00"),
                4.9,
                14,
                22.5640,
                88.3180,
                "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
                "Consultant neurologist treating nerve problems, migraine, and neuropathy in Botanical Garden & B.Garden area.",
                "Howrah",
                "Howrah",
                "West Bengal",
                "Botanical Garden / B.Garden",
                "Andul Road near Botanical Garden Gate, Howrah"
        );

        // ==================== 4. BALLY (Howrah District, West Bengal) ====================
        upsertDoctor(
                "Debasis Chakraborty",
                "dr.debasis@hospital.com",
                generalMedicine,
                "Family Physician & Diabetologist",
                "MBBS, DNB (Medicine)",
                new BigDecimal("400.00"),
                4.8,
                13,
                22.6520,
                88.3440,
                "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=400",
                "Primary care physician managing chronic ailments and seasonal fever near Bally Bazar.",
                "Bally",
                "Howrah",
                "West Bengal",
                "Bally Bazar",
                "Near Bally Bazar Tram Depot / Market, Bally"
        );

        upsertDoctor(
                "Suparna Mitra",
                "dr.suparna@hospital.com",
                cardiology,
                "Consultant Cardiologist",
                "MBBS, MD, DM (Cardiology)",
                new BigDecimal("700.00"),
                4.9,
                12,
                22.6310,
                88.3530,
                "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=400",
                "Cardiologist focused on non-invasive heart evaluation and blood pressure control near Belur Math.",
                "Bally",
                "Howrah",
                "West Bengal",
                "Belur Math GT Road",
                "GT Road near Belur Math Gate, Belur"
        );

        upsertDoctor(
                "Arnab Mukherjee",
                "dr.arnab@hospital.com",
                orthopedics,
                "Orthopedic Specialist",
                "MBBS, MS (Ortho)",
                new BigDecimal("600.00"),
                4.7,
                10,
                22.6540,
                88.3370,
                "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=400",
                "Expert in knee pain, fracture setting, and arthritis management at Bally Halt.",
                "Bally",
                "Howrah",
                "West Bengal",
                "Bally Halt",
                "Station Road near Bally Halt Platform, Bally"
        );

        upsertDoctor(
                "Madhumita Saha",
                "dr.madhumita@hospital.com",
                dermatology,
                "Clinical Dermatologist",
                "MBBS, MD (Dermatology)",
                new BigDecimal("500.00"),
                4.8,
                8,
                22.6480,
                88.3410,
                "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400",
                "Skin, hair, and nail specialist offering comprehensive clinical care in Goswami Para.",
                "Bally",
                "Howrah",
                "West Bengal",
                "Goswami Para",
                "Near Goswami Para Park, Bally"
        );

        upsertDoctor(
                "Pranab Ghosh",
                "dr.pranab@hospital.com",
                neurology,
                "Consultant Neurologist",
                "MBBS, MD, DM (Neuro)",
                new BigDecimal("750.00"),
                4.9,
                15,
                22.6250,
                88.3420,
                "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
                "Neurologist treating epilepsy, migraine, stroke, and nerve pains near Liluah Don Bosco.",
                "Bally",
                "Howrah",
                "West Bengal",
                "Liluah / Bally South",
                "Near Don Bosco Gate, Liluah-Bally Road"
        );

        upsertDoctor(
                "Biman Halder",
                "dr.biman@hospital.com",
                pulmonology,
                "Consultant Chest Physician",
                "MBBS, MD (Pulmonology)",
                new BigDecimal("550.00"),
                4.8,
                12,
                22.6580,
                88.3510,
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
                "Chest physician treating asthma, respiratory allergy, and chronic cough near Bally Khal.",
                "Bally",
                "Howrah",
                "West Bengal",
                "Bally Khal / Dewan Gazi",
                "GT Road near Bally Khal Bridge, Bally"
        );

        // ==================== 5. RISHRA (Hooghly, West Bengal) ====================
        upsertDoctor(
                "Tapan Karmakar",
                "dr.tapan@hospital.com",
                generalMedicine,
                "Consultant Physician",
                "MBBS, MD (Medicine)",
                new BigDecimal("400.00"),
                4.7,
                14,
                22.7110,
                88.3480,
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
                "Senior physician treating metabolic conditions, diabetes, and fevers near Rishra Station.",
                "Rishra",
                "Hooghly",
                "West Bengal",
                "Rishra Station Road",
                "Near Rishra Railway Station Platform 1, Rishra"
        );

        upsertDoctor(
                "Sangeeta Dey",
                "dr.sangeeta@hospital.com",
                cardiology,
                "Cardiologist & Vascular Consultant",
                "MBBS, MD, DM (Cardiology)",
                new BigDecimal("700.00"),
                4.9,
                11,
                22.7140,
                88.3560,
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
                "Cardiovascular specialist focused on ECG, lipid management, and preventive heart care on Rishra GT Road.",
                "Rishra",
                "Hooghly",
                "West Bengal",
                "GT Road Rishra",
                "GT Road near Jayashree Textiles, Rishra"
        );

        upsertDoctor(
                "Somnath Halder",
                "dr.somnath@hospital.com",
                orthopedics,
                "Orthopedic & Trauma Surgeon",
                "MBBS, MS (Orthopedics)",
                new BigDecimal("600.00"),
                4.8,
                12,
                22.7170,
                88.3390,
                "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=400",
                "Expert in spine disorders, knee arthroscopy, and accidental trauma repair in Morepukur.",
                "Rishra",
                "Hooghly",
                "West Bengal",
                "Morepukur",
                "Morepukur Bangur Park, Rishra"
        );

        upsertDoctor(
                "Barnali Mondal",
                "dr.barnali@hospital.com",
                dermatology,
                "Consultant Dermatologist",
                "MBBS, DVD, DNB",
                new BigDecimal("500.00"),
                4.8,
                9,
                22.7080,
                88.3520,
                "https://images.unsplash.com/photo-1594824813501-5264b304c45b?auto=format&fit=crop&q=80&w=400",
                "Specialist in eczema, skin allergy patch tests, and acne therapy near Sandhya Bazar.",
                "Rishra",
                "Hooghly",
                "West Bengal",
                "Sandhya Bazar",
                "Sandhya Bazar Market Complex, Rishra"
        );

        upsertDoctor(
                "Alok Kumar Roy",
                "dr.alokroy@hospital.com",
                pulmonology,
                "Chest Physician",
                "MBBS, MD (Pulmonary Medicine)",
                new BigDecimal("550.00"),
                4.7,
                13,
                22.7150,
                88.3610,
                "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
                "Chest specialist treating asthma, persistent cough, and allergy near Hastings Mill colony.",
                "Rishra",
                "Hooghly",
                "West Bengal",
                "Hastings Ground",
                "Near Hastings Jute Mill Colony, Rishra"
        );

        upsertDoctor(
                "Goutam Mukherjee",
                "dr.goutammukherjee@hospital.com",
                neurology,
                "Consultant Neurologist",
                "MBBS, MD, DM (Neurology)",
                new BigDecimal("750.00"),
                4.9,
                15,
                22.7190,
                88.3440,
                "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=400",
                "Neurology specialist handling stroke rehabilitation, tremor, and headache near Bangur Park.",
                "Rishra",
                "Hooghly",
                "West Bengal",
                "Bangur Park",
                "Bangur Park Residential Enclave, Rishra"
        );

        // ==================== 6. SERAMPORE (Hooghly, West Bengal) ====================
        upsertDoctor(
                "Joydeep Bose",
                "dr.joydeep@hospital.com",
                cardiology,
                "Senior Cardiologist",
                "MBBS, MD, DM (Cardiology)",
                new BigDecimal("750.00"),
                4.9,
                16,
                22.7520,
                88.3370,
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
                "Eminent cardiologist at Serampore Battala, expert in coronary care and pacemaker implantation.",
                "Serampore",
                "Hooghly",
                "West Bengal",
                "Battala / Station Road",
                "Near Serampore Railway Station Platform 2, Battala"
        );

        upsertDoctor(
                "Rina Bhattacharya",
                "dr.rina@hospital.com",
                generalMedicine,
                "Senior Consultant Physician",
                "MBBS, MD (Medicine)",
                new BigDecimal("450.00"),
                4.8,
                15,
                22.7550,
                88.3450,
                "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=400",
                "Comprehensive medicine consultant near Walsh Hospital court compound area.",
                "Serampore",
                "Hooghly",
                "West Bengal",
                "Walsh Hospital Road",
                "Court Compound near Walsh Sub-divisional Hospital, Serampore"
        );

        upsertDoctor(
                "Kunal Sarkar",
                "dr.kunal@hospital.com",
                orthopedics,
                "Joint & Spine Surgeon",
                "MBBS, MS (Orthopedics)",
                new BigDecimal("650.00"),
                4.9,
                12,
                22.7480,
                88.3470,
                "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=400",
                "Orthopedic surgeon specializing in joint replacement, sports injury, and spondylitis near Tinbazar.",
                "Serampore",
                "Hooghly",
                "West Bengal",
                "Tinbazar GT Road",
                "GT Road near Tinbazar Crossing, Serampore"
        );

        upsertDoctor(
                "Monalisa Das",
                "dr.monalisa@hospital.com",
                dermatology,
                "Senior Dermatologist",
                "MBBS, MD (Dermatology)",
                new BigDecimal("500.00"),
                4.8,
                10,
                22.7360,
                88.3490,
                "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400",
                "Skin specialist near Mahesh Jagannath temple, expert in chronic skin allergy and trichology.",
                "Serampore",
                "Hooghly",
                "West Bengal",
                "Mahesh Jagannath Temple",
                "Mahesh Temple Road, Serampore"
        );

        upsertDoctor(
                "Subir Mallick",
                "dr.subir@hospital.com",
                pulmonology,
                "Pulmonologist & Sleep Specialist",
                "MBBS, MD, FCCP",
                new BigDecimal("600.00"),
                4.7,
                11,
                22.7440,
                88.3350,
                "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
                "Expert in chronic asthma, bronchitis, COPD, and sleep apnea near Manikpir.",
                "Serampore",
                "Hooghly",
                "West Bengal",
                "Manikpir",
                "Manikpir Crossing, West Serampore"
        );

        upsertDoctor(
                "Dipankar Samanta",
                "dr.dipankar@hospital.com",
                neurology,
                "Consultant Neurologist",
                "MBBS, MD, DM (Neurology)",
                new BigDecimal("800.00"),
                4.9,
                14,
                22.7580,
                88.3410,
                "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=400",
                "Neurologist dealing with epilepsy, stroke rehabilitation, and recurrent headaches in Chatra.",
                "Serampore",
                "Hooghly",
                "West Bengal",
                "Chatra",
                "Near Chatra Sitalatala, Serampore"
        );

        // ==================== 7. CHANDANNAGAR (Hooghly, West Bengal) ====================
        upsertDoctor(
                "Supratim Paul",
                "dr.supratim@hospital.com",
                cardiology,
                "Senior Cardiologist",
                "MBBS, MD, DM (Cardiology)",
                new BigDecimal("750.00"),
                4.9,
                14,
                22.8680,
                88.3710,
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
                "Cardiologist practicing near the historic Chandannagar Strand. Expert in echocardiography.",
                "Chandannagar",
                "Hooghly",
                "West Bengal",
                "Chandannagar Strand",
                "Strand Road overlooking River Hooghly, Chandannagar"
        );

        upsertDoctor(
                "Archana Ghosh",
                "dr.archana@hospital.com",
                generalMedicine,
                "Family Physician",
                "MBBS, DNB (Family Medicine)",
                new BigDecimal("400.00"),
                4.8,
                12,
                22.8690,
                88.3680,
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
                "Internal medicine practitioner focused on diabetes, geriatric care, and infection near Barabazar.",
                "Chandannagar",
                "Hooghly",
                "West Bengal",
                "Barabazar",
                "Barabazar Commercial Crossing, Chandannagar"
        );

        upsertDoctor(
                "Somen Roy",
                "dr.somen@hospital.com",
                orthopedics,
                "Consultant Orthopedist",
                "MBBS, MS (Ortho)",
                new BigDecimal("600.00"),
                4.8,
                11,
                22.8650,
                88.3610,
                "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
                "Specialist in arthritis, knee joint injections, and bone fracture on Station Road.",
                "Chandannagar",
                "Hooghly",
                "West Bengal",
                "Chandannagar Station Road",
                "Station Road near Laxmiganj, Chandannagar"
        );

        upsertDoctor(
                "Piyali Kundu",
                "dr.piyali@hospital.com",
                dermatology,
                "Dermatologist & Cosmetologist",
                "MBBS, MD (Dermatology)",
                new BigDecimal("550.00"),
                4.9,
                9,
                22.8720,
                88.3580,
                "https://images.unsplash.com/photo-1594824813501-5264b304c45b?auto=format&fit=crop&q=80&w=400",
                "Skin consultant expert in eczema, acne scar treatments, and pigmentation in Fatokgora.",
                "Chandannagar",
                "Hooghly",
                "West Bengal",
                "Fatokgora",
                "Near French Cemetery & Fatokgora, Chandannagar"
        );

        upsertDoctor(
                "Aniruddha Dutta",
                "dr.aniruddha@hospital.com",
                neurology,
                "Consultant Neurologist",
                "MBBS, MD, DM (Neuro)",
                new BigDecimal("750.00"),
                4.8,
                13,
                22.8640,
                88.3690,
                "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=400",
                "Neuro physician specialized in nerve conduction, neuropathy, and vertigo in Urdi Bazar.",
                "Chandannagar",
                "Hooghly",
                "West Bengal",
                "Urdi Bazar",
                "Urdi Bazar Road, Chandannagar"
        );

        upsertDoctor(
                "Amit Ganguly",
                "dr.amitganguly@hospital.com",
                pulmonology,
                "Consultant Pulmonologist",
                "MBBS, MD (Chest)",
                new BigDecimal("550.00"),
                4.8,
                11,
                22.8550,
                88.3550,
                "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
                "Pulmonologist treating asthma, post-COVID symptoms, and bronchitis in Mankundu.",
                "Chandannagar",
                "Hooghly",
                "West Bengal",
                "Mankundu Station Road",
                "Mankundu Station Road, Chandannagar"
        );

        // ==================== 8. CHINSURAH (Hooghly, West Bengal) ====================
        upsertDoctor(
                "Bhaswati Roy",
                "dr.bhaswati@hospital.com",
                generalMedicine,
                "Senior Consultant Physician",
                "MBBS, MD (Medicine)",
                new BigDecimal("450.00"),
                4.8,
                15,
                22.9020,
                88.3950,
                "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=400",
                "Practicing near Chinsurah Clock Tower, expert in complex metabolic illnesses.",
                "Chinsurah",
                "Hooghly",
                "West Bengal",
                "Clock Tower / GT Road",
                "Chinsurah Clock Tower Chaurasta, GT Road"
        );

        upsertDoctor(
                "Soumen Mukherjee",
                "dr.soumen@hospital.com",
                cardiology,
                "Consultant Cardiologist",
                "MBBS, MD, DM (Cardiology)",
                new BigDecimal("750.00"),
                4.9,
                13,
                22.8980,
                88.3890,
                "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=400",
                "Cardiac specialist near Hooghly Mohsin College, expert in hypertension and coronary care.",
                "Chinsurah",
                "Hooghly",
                "West Bengal",
                "Pipulpati",
                "Pipulpati More near Hooghly Mohsin College, Chinsurah"
        );

        upsertDoctor(
                "Ranjan Biswas",
                "dr.ranjan@hospital.com",
                orthopedics,
                "Senior Orthopedic Surgeon",
                "MBBS, MS (Orthopedics)",
                new BigDecimal("650.00"),
                4.8,
                14,
                22.9080,
                88.3980,
                "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400",
                "Orthopedic consultant near Imambara Sadar Hospital, expert in joint replacement.",
                "Chinsurah",
                "Hooghly",
                "West Bengal",
                "Tolafatak / Imambara Hospital",
                "Near Imambara Sadar Hospital, Tolafatak, Chinsurah"
        );

        upsertDoctor(
                "Swati Dasgupta",
                "dr.swati@hospital.com",
                dermatology,
                "Consultant Dermatologist",
                "MBBS, DVD",
                new BigDecimal("500.00"),
                4.7,
                10,
                22.9000,
                88.3840,
                "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=400",
                "Skin allergy, pediatric eczema, and dermatitis specialist near Chinsurah Station.",
                "Chinsurah",
                "Hooghly",
                "West Bengal",
                "Chinsurah Station Road",
                "Near Chinsurah Railway Station East, Chinsurah"
        );

        upsertDoctor(
                "Kalyan Nandi",
                "dr.kalyan@hospital.com",
                pulmonology,
                "Chest Physician",
                "MBBS, MD (Pulmonary)",
                new BigDecimal("550.00"),
                4.8,
                12,
                22.8950,
                88.3820,
                "https://images.unsplash.com/photo-1637059824899-a441006a6875?auto=format&fit=crop&q=80&w=400",
                "Respiratory physician treating chronic bronchitis, asthma, and pneumonia in Khadina More.",
                "Chinsurah",
                "Hooghly",
                "West Bengal",
                "Khadina More",
                "Khadina More Commercial Arcade, Chinsurah"
        );

        upsertDoctor(
                "Sandip Majumdar",
                "dr.sandip@hospital.com",
                neurology,
                "Consultant Neurologist",
                "MBBS, MD, DM (Neurology)",
                new BigDecimal("800.00"),
                4.9,
                13,
                22.9050,
                88.3910,
                "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=400",
                "Neurology specialist treating headache, epilepsy, and cervical nerve issues in Dharampur.",
                "Chinsurah",
                "Hooghly",
                "West Bengal",
                "Dharampur / Court",
                "Near Hooghly District Court, Dharampur, Chinsurah"
        );

        // ==================== 9. BANDEL (Hooghly, West Bengal) ====================
        upsertDoctor(
                "Pradipta Sarkar",
                "dr.pradipta@hospital.com",
                generalMedicine,
                "Senior Family Physician",
                "MBBS, MD (Medicine)",
                new BigDecimal("400.00"),
                4.8,
                14,
                22.9240,
                88.3760,
                "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
                "Senior physician practicing near Bandel Junction station, treating all common and complex ailments.",
                "Bandel",
                "Hooghly",
                "West Bengal",
                "Bandel Junction Station Road",
                "Station Road near Bandel Railway Junction"
        );

        upsertDoctor(
                "Anuradha Das",
                "dr.anuradha@hospital.com",
                cardiology,
                "Consultant Cardiologist",
                "MBBS, MD, DM (Cardiology)",
                new BigDecimal("700.00"),
                4.9,
                12,
                22.9200,
                88.3880,
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
                "Cardiologist practicing near the historic Bandel Church road. Expert in ECG & heart care.",
                "Bandel",
                "Hooghly",
                "West Bengal",
                "Bandel Church Road",
                "Near Historic Basilica of the Holy Rosary (Bandel Church)"
        );

        upsertDoctor(
                "Subhasis Pal",
                "dr.subhasis@hospital.com",
                orthopedics,
                "Joint & Trauma Specialist",
                "MBBS, MS (Ortho)",
                new BigDecimal("600.00"),
                4.7,
                11,
                22.9320,
                88.3650,
                "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
                "Orthopedic surgeon handling back pain, arthritis, and slip disc in Debanandapur.",
                "Bandel",
                "Hooghly",
                "West Bengal",
                "Debanandapur GT Road",
                "GT Road near Sarat Chandra Memorial, Debanandapur, Bandel"
        );

        upsertDoctor(
                "Rituja Banik",
                "dr.rituja@hospital.com",
                dermatology,
                "Consultant Dermatologist",
                "MBBS, MD (DVL)",
                new BigDecimal("500.00"),
                4.8,
                9,
                22.9180,
                88.3720,
                "https://images.unsplash.com/photo-1594824813501-5264b304c45b?auto=format&fit=crop&q=80&w=400",
                "Dermatologist specialized in skin infections, psoriasis, acne, and cosmetic advice at Kodalia.",
                "Bandel",
                "Hooghly",
                "West Bengal",
                "Kodalia",
                "Kodalia More, Bandel"
        );

        upsertDoctor(
                "Bikash Chandra Roy",
                "dr.bikash@hospital.com",
                neurology,
                "Consultant Neurologist",
                "MBBS, MD, DM (Neuro)",
                new BigDecimal("750.00"),
                4.9,
                13,
                22.9280,
                88.3790,
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
                "Neurologist expert in migraine, vertigo, nerve numbness, and neurological tests at Keota Laldighi.",
                "Bandel",
                "Hooghly",
                "West Bengal",
                "Keota Laldighi",
                "Keota Laldighi Housing Complex, Bandel"
        );

        upsertDoctor(
                "Kakoli Chatterjee",
                "dr.kakoli@hospital.com",
                pulmonology,
                "Consultant Pulmonologist",
                "MBBS, MD (Chest Diseases)",
                new BigDecimal("550.00"),
                4.7,
                10,
                22.9210,
                88.3820,
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
                "Respiratory medicine specialist treating COPD, lung infections, and allergies in Sahaganj.",
                "Bandel",
                "Hooghly",
                "West Bengal",
                "Sahaganj",
                "Near Dunlop Estate Road, Sahaganj, Bandel"
        );

        // 5. Seed sample appointments and lab report if none exist
        if (appointmentRepository.count() == 0) {
            Doctor doc1 = doctorRepository.findAll().get(0);
            Appointment appt1 = new Appointment(
                    patient1,
                    doc1,
                    LocalDateTime.now().plusDays(2).withHour(10).withMinute(0),
                    AppointmentStatus.CONFIRMED,
                    null
            );
            appointmentRepository.save(appt1);
        }

        if (labReportRepository.count() == 0) {
            LabReport sampleReport = new LabReport(
                    patient1,
                    "Comprehensive_Metabolic_Profile.pdf",
                    null,
                    "application/pdf",
                    "Fast Blood Glucose: 118 mg/dL\nHbA1c: 6.2 %\nTotal Cholesterol: 215 mg/dL\nSerum Creatinine: 0.9 mg/dL\nHemoglobin: 14.2 g/dL",
                    "Lab Report Summary for Rohan Verma:\nAttention needed for 3 flagged value(s):\n• Fasting Blood Sugar is HIGH (118.0 mg/dL, normal: 70.0 - 99.0 mg/dL)\n• HbA1c is HIGH (6.2 %, normal: 4.0 - 5.6 %)\n• Total Cholesterol is HIGH (215.0 mg/dL, normal: 125.0 - 200.0 mg/dL)\nAdvice: Schedule a consultation with a General Physician or Cardiologist for diet and lifestyle advice."
            );
            labReportRepository.save(sampleReport);
        }

        // 6. Seed Pharmacies and Visiting Doctor Chamber Time Slots
        if (pharmacyRepository.count() <= 1) { // 1 may be the pending test pharmacy
            User pharmUser = userRepository.findByEmail("pharmacy@health.com").orElse(null);
            if (pharmUser != null && pharmacyRepository.findByUserId(pharmUser.getId()).isEmpty()) {
                Pharmacy p1 = new Pharmacy(
                        "Makhla Medicare Chemists & Polyclinic",
                        "WB-PHA-2024-8841",
                        pharmUser,
                        "Near Makhla High School More, Uttarpara, Hooghly",
                        "Uttarpara",
                        "Hooghly",
                        "West Bengal",
                        "Makhla",
                        22.6735,
                        88.3345,
                        "+91 98311 55667",
                        "08:00 AM - 10:00 PM",
                        true
                );
                p1 = pharmacyRepository.save(p1);

                // Attach multiple visiting doctors at different time slots
                Optional<Doctor> docSharma = doctorRepository.findAll().stream().filter(d -> d.getUser().getEmail().equals("dr.sharma@hospital.com")).findFirst();
                Optional<Doctor> docMousumi = doctorRepository.findAll().stream().filter(d -> d.getUser().getEmail().equals("dr.mousumi@hospital.com")).findFirst();
                Optional<Doctor> docSayan = doctorRepository.findAll().stream().filter(d -> d.getUser().getEmail().equals("dr.sayan@hospital.com")).findFirst();

                if (docSharma.isPresent()) {
                    pharmacyDoctorSlotRepository.save(new PharmacyDoctorSlot(p1, docSharma.get(), "Mon, Wed, Fri", "05:00 PM - 07:30 PM", "Chamber 1", new BigDecimal("750.00"), 20));
                }
                if (docMousumi.isPresent()) {
                    pharmacyDoctorSlotRepository.save(new PharmacyDoctorSlot(p1, docMousumi.get(), "Tue, Thu, Sat", "10:00 AM - 12:30 PM", "Chamber 2", new BigDecimal("450.00"), 25));
                }
                if (docSayan.isPresent()) {
                    pharmacyDoctorSlotRepository.save(new PharmacyDoctorSlot(p1, docSayan.get(), "Sunday", "09:30 AM - 12:00 PM", "Chamber 1", new BigDecimal("650.00"), 15));
                }
            }

            // Pharmacy 2: Konnagar
            User staffUser = userRepository.findByEmail("staff@hospital.com").orElse(null);
            if (staffUser != null && pharmacyRepository.findByUserId(staffUser.getId()).isEmpty()) {
                Pharmacy p2 = new Pharmacy(
                        "Bengal Swasthya Chemists & Doctor Chamber",
                        "WB-PHA-2024-9102",
                        staffUser,
                        "Konnagar Station Road East, Near Bus Stand",
                        "Konnagar",
                        "Hooghly",
                        "West Bengal",
                        "Station Road / Masterpara",
                        22.7022,
                        88.3482,
                        "+91 98765 43211",
                        "07:30 AM - 10:30 PM",
                        true
                );
                p2 = pharmacyRepository.save(p2);

                Optional<Doctor> docSubhashish = doctorRepository.findAll().stream().filter(d -> d.getUser().getEmail().equals("dr.subhashish@hospital.com")).findFirst();
                Optional<Doctor> docDebolina = doctorRepository.findAll().stream().filter(d -> d.getUser().getEmail().equals("dr.debolina@hospital.com")).findFirst();
                Optional<Doctor> docAnanya = doctorRepository.findAll().stream().filter(d -> d.getUser().getEmail().equals("dr.ananya@hospital.com")).findFirst();

                if (docSubhashish.isPresent()) {
                    pharmacyDoctorSlotRepository.save(new PharmacyDoctorSlot(p2, docSubhashish.get(), "Mon, Wed, Fri, Sat", "06:00 PM - 08:30 PM", "Chamber A", new BigDecimal("400.00"), 30));
                }
                if (docDebolina.isPresent()) {
                    pharmacyDoctorSlotRepository.save(new PharmacyDoctorSlot(p2, docDebolina.get(), "Tue, Thu", "05:30 PM - 07:30 PM", "Chamber B", new BigDecimal("700.00"), 20));
                }
                if (docAnanya.isPresent()) {
                    pharmacyDoctorSlotRepository.save(new PharmacyDoctorSlot(p2, docAnanya.get(), "Wednesday & Sunday", "11:00 AM - 01:00 PM", "Chamber A", new BigDecimal("600.00"), 15));
                }
            }
        }

        logger.info("Hospital database synchronization, pharmacy chambers, and doctor credentials setup completed!");
    }

    private Department getOrCreateDepartment(String name, String description) {
        return departmentRepository.findByName(name).orElseGet(() ->
                departmentRepository.save(new Department(name, description))
        );
    }

    private void upsertDoctor(String name, String email, Department department, String specialization,
                              String degree, BigDecimal fee, Double rating, Integer exp,
                              Double lat, Double lon, String photoUrl, String bio) {
        upsertDoctor(name, email, department, specialization, degree, fee, rating, exp, lat, lon, photoUrl, bio, "Konnagar", "Hooghly", "West Bengal", "Station Road", "Near Konnagar Station");
    }

    private void upsertDoctor(String name, String email, Department department, String specialization,
                              String degree, BigDecimal fee, Double rating, Integer exp,
                              Double lat, Double lon, String photoUrl, String bio,
                              String city, String district, String state) {
        upsertDoctor(name, email, department, specialization, degree, fee, rating, exp, lat, lon, photoUrl, bio, city, district, state, city + " Central", "Main Road, " + city);
    }

    private void upsertDoctor(String name, String email, Department department, String specialization,
                              String degree, BigDecimal fee, Double rating, Integer exp,
                              Double lat, Double lon, String photoUrl, String bio,
                              String city, String district, String state,
                              String locality, String clinicAddress) {
        Optional<User> existingUserOpt = userRepository.findByEmail(email);
        User user;
        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            user.setName(name); // clean name without Dr.
            user.setIsApproved(true);
            userRepository.save(user);
        } else {
            User newUser = new User(
                    name,
                    email,
                    passwordEncoder.encode("doctor123"),
                    Role.ROLE_DOCTOR,
                    "+91 98" + (int)(Math.random() * 89999 + 10000) + " " + (int)(Math.random() * 89999 + 10000)
            );
            newUser.setIsApproved(true);
            user = userRepository.save(newUser);
        }

        Optional<Doctor> existingDocOpt = doctorRepository.findByUserId(user.getId());
        if (existingDocOpt.isPresent()) {
            Doctor doc = existingDocOpt.get();
            doc.setDepartment(department);
            doc.setSpecialization(specialization);
            doc.setDegree(degree);
            doc.setConsultationFee(fee);
            doc.setRating(rating);
            doc.setExperienceYears(exp);
            doc.setLatitude(lat);
            doc.setLongitude(lon);
            doc.setPhotoUrl(photoUrl);
            doc.setBio(bio);
            doc.setCity(city);
            doc.setDistrict(district);
            doc.setState(state);
            doc.setLocality(locality);
            doc.setClinicAddress(clinicAddress);
            doctorRepository.save(doc);
        } else {
            Doctor doc = new Doctor(
                    user,
                    department,
                    specialization,
                    lat,
                    lon,
                    fee,
                    rating,
                    exp,
                    bio,
                    degree,
                    photoUrl,
                    city,
                    district,
                    state,
                    locality,
                    clinicAddress
            );
            doctorRepository.save(doc);
        }
    }
}
