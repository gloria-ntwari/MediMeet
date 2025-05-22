package com.gloriatech.medimeet.service;

import com.gloriatech.medimeet.dto.AppointDTO;
import com.gloriatech.medimeet.dto.DoctorDTO;
import com.gloriatech.medimeet.dto.DoctorProfileDTO;
import com.gloriatech.medimeet.dto.HomeDTO;
import com.gloriatech.medimeet.model.*;
import com.gloriatech.medimeet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private static final String UPLOAD_DIR = "D:\\Documents\\developing projects\\medimeet\\medimeet\\src\\assets\\";

    // In-memory reset code store (for demo; use DB in production)
    private final ConcurrentHashMap<String, String> resetCodes = new ConcurrentHashMap<>();

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;

        // Ensure the upload directory exists
        File uploadDir = new File(UPLOAD_DIR);
        System.out.println("Upload directory path: " + uploadDir.getAbsolutePath());
        System.out.println("Upload directory exists: " + uploadDir.exists());
        if (!uploadDir.exists()) {
            boolean created = uploadDir.mkdirs();
            System.out.println("Upload directory created: " + created);
        }
    }

    @Transactional
    public Doctor addDoctor(Doctor doctor, MultipartFile imageFile) throws IOException {
        // Validate email
        if (userRepository.findByEmail(doctor.getEmail()).isPresent()) {
            throw new RuntimeException("Doctor already exists with email: " + doctor.getEmail());
        }

        // Validate doctor fields
        if (doctor.getName() == null || doctor.getName().isEmpty()) {
            throw new RuntimeException("Doctor name is required");
        }
        if (doctor.getSpecialisation() == null || doctor.getSpecialisation().isEmpty()) {
            throw new RuntimeException("Doctor specialisation is required");
        }
        if (doctor.getPhone() == null || doctor.getPhone().isEmpty()) {
            throw new RuntimeException("Doctor phone is required");
        }
        if (doctor.getAbout() == null || doctor.getAbout().isEmpty()) {
            throw new RuntimeException("Doctor about is required");
        }
        if (doctor.getExperience() == null || doctor.getExperience().isEmpty()) {
            throw new RuntimeException("Doctor experience is required");
        }

        String imagePath = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            // Validate file typ
            String originalFilename = imageFile.getOriginalFilename();
            if (originalFilename != null && !originalFilename.matches(".*\\.(jpg|jpeg|png|gif)$")) {
                throw new RuntimeException("Invalid image format. Only JPG, JPEG, PNG, GIF allowed.");
            }

            // Generate a unique file name
            String fileExtension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

            // Save the file
            Path filePath = Paths.get(UPLOAD_DIR + uniqueFileName);
            System.out.println("Saving image to absolute path: " + filePath.toAbsolutePath());
            Files.write(filePath, imageFile.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.WRITE);

            // Set the image path
            imagePath = "assets/" + uniqueFileName;
            System.out.println("Image path stored in doctor record: " + imagePath);
        } else {
            // Image is required; throw exception
            throw new RuntimeException("Image file is required");
            // If optional, uncomment: imagePath = "assets/default.jpg";
        }

        // Set doctor fields
        doctor.setRole("Doctor");
        doctor.setPassword(passwordEncoder.encode(doctor.getPassword()));
        doctor.setImageUrl(imagePath);

        // Log for debugging
        System.out.println("Saving Doctor: name=" + doctor.getName() + ", imageUrl=" + doctor.getImageUrl());

        // Save to database
        Doctor savedDoctor = (Doctor) userRepository.save(doctor);
        System.out.println("Saved Doctor: id=" + savedDoctor.getId() + ", imageUrl=" + savedDoctor.getImageUrl());

        return savedDoctor;
    }

    @Transactional
    public Patient registerPatient(Patient patient) {
        if (userRepository.findByEmail(patient.getEmail()).isPresent()) {
            throw new RuntimeException("Patient already exists with email: " + patient.getEmail());
        }
        patient.setRole("PATIENT");
        patient.setPassword(passwordEncoder.encode(patient.getPassword()));
        return (Patient) userRepository.save(patient);
    }

    @Transactional
    public Admin registerAdmin(Admin admin) {
        if (userRepository.findByEmail(admin.getEmail()).isPresent()) {
            throw new RuntimeException("Admin already exists with email: " + admin.getEmail());
        }
        admin.setRole("ADMIN");
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        return (Admin) userRepository.save(admin);
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        if (passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        throw new RuntimeException("Invalid credentials");
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Transactional
    public void deleteDoctor(Long doctorId) {
        User user = userRepository.findById(doctorId).orElseThrow(() -> new RuntimeException("Doctor not found with id: " + doctorId));
        if (!"Doctor".equals(user.getRole())) {
            throw new RuntimeException("User is not a doctor");
        }
        userRepository.deleteById(doctorId);
    }

    public List<DoctorDTO> getAllDoctors() {
        List<User> users = userRepository.findByRole("Doctor");
        return users.stream()
                .map(user -> {
                    Doctor doc = (Doctor) user;
                    DoctorDTO dto = new DoctorDTO(
                            doc.getId(),
                            doc.getName(),
                            doc.getEmail(),
                            doc.getPhone(),
                            doc.getSpecialisation()
                    );
                    return dto;
                })
                .toList();
    }

    public List<HomeDTO> getHomeDoctor() {
        List<User> users = userRepository.findByRole("Doctor");
        return users.stream()
                .map(user -> {
                    Doctor doc = (Doctor) user;
                    return new HomeDTO(
                            doc.getId(),
                            doc.getName(),
                            doc.getSpecialisation(),
                            doc.getImageUrl()
                    );
                })
                .toList();
    }

    public List<AppointDTO> getAppointDoctor() {
        List<User> users = userRepository.findByRole("Doctor");
        return users.stream()
                .map(user -> {
                    Doctor doc = (Doctor) user;
                    return new AppointDTO(
                            doc.getId(),
                            doc.getName(),
                            doc.getSpecialisation(),
                            doc.getImageUrl(),
                            doc.getAbout(),
                            doc.getExperience()
                    );
                })
                .toList();
    }

    @Transactional
    public Doctor updateDoctor(Long doctorId, Doctor updatedDoctor, MultipartFile imageFile) throws IOException {
        Doctor existingDoctor = (Doctor) userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + doctorId));

        if (updatedDoctor.getName() != null && !updatedDoctor.getName().isEmpty()) {
            existingDoctor.setName(updatedDoctor.getName());
        }
        if (updatedDoctor.getSpecialisation() != null && !updatedDoctor.getSpecialisation().isEmpty()) {
            existingDoctor.setSpecialisation(updatedDoctor.getSpecialisation());
        }
        if (updatedDoctor.getPhone() != null && !updatedDoctor.getPhone().isEmpty()) {
            existingDoctor.setPhone(updatedDoctor.getPhone());
        }
        if (updatedDoctor.getEmail() != null && !updatedDoctor.getEmail().isEmpty()) {
            existingDoctor.setEmail(updatedDoctor.getEmail());
        }
        if (updatedDoctor.getPassword() != null && !updatedDoctor.getPassword().isEmpty()) {
            existingDoctor.setPassword(passwordEncoder.encode(updatedDoctor.getPassword()));
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            String originalFilename = imageFile.getOriginalFilename();
            if (originalFilename != null && !originalFilename.matches(".*\\.(jpg|jpeg|png)$")) {
                throw new RuntimeException("Invalid Image format");
            }
            String fileExtension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

            Path filePath = Paths.get(UPLOAD_DIR + uniqueFileName);
            Files.write(filePath, imageFile.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.WRITE);

            existingDoctor.setImageUrl("assets/" + uniqueFileName);
        }

        return (Doctor) userRepository.save(existingDoctor);
    }

    @Transactional
    public DoctorProfileDTO updateLoggedInDoctorProfile(String email, DoctorProfileDTO updateDTO) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (!"Doctor".equals(user.getRole())) {
            throw new RuntimeException("User is not a doctor");
        }

        Doctor existingDoctor = (Doctor) user;

        // Update fields if provided and valid
        if (updateDTO.getName() != null && !updateDTO.getName().trim().isEmpty()) {
            existingDoctor.setName(updateDTO.getName().trim());
        }
        if (updateDTO.getEmail() != null && !updateDTO.getEmail().trim().isEmpty()) {
            if (userRepository.findByEmail(updateDTO.getEmail()).isPresent() && !updateDTO.getEmail().equals(email)) {
                throw new RuntimeException("Email already in use: " + updateDTO.getEmail());
            }
            existingDoctor.setEmail(updateDTO.getEmail().trim());
        }
        if (updateDTO.getPassword() != null && !updateDTO.getPassword().trim().isEmpty()) {
            existingDoctor.setPassword(passwordEncoder.encode(updateDTO.getPassword().trim()));
        }
        if (updateDTO.getAbout() != null && !updateDTO.getAbout().trim().isEmpty()) {
            existingDoctor.setAbout(updateDTO.getAbout().trim());
        }
        if (updateDTO.getExperience() != null && !updateDTO.getExperience().trim().isEmpty()) {
            existingDoctor.setExperience(updateDTO.getExperience().trim());
        }
        if (updateDTO.getSpecialisation() != null && !updateDTO.getSpecialisation().trim().isEmpty()) {
            existingDoctor.setSpecialisation(updateDTO.getSpecialisation().trim());
        }

        // Save the updated doctor
        Doctor updatedDoctor = (Doctor) userRepository.save(existingDoctor);

        // Return the updated profile as DTO
        return new DoctorProfileDTO(
                updatedDoctor.getName(),
                updatedDoctor.getEmail(),
                updatedDoctor.getAbout(),
                updatedDoctor.getPhone(),
                updatedDoctor.getExperience(),
                updatedDoctor.getSpecialisation()
        );
    }

    public List<DoctorDTO> getDoctorsBySpecialization(String specialization) {
        // Standardize input - trim and adjust case if needed
        String searchSpecialization = specialization.trim();

        // Get doctors with the specified specialization
        List<Doctor> doctors = userRepository.findByRoleAndSpecialisation("Doctor", searchSpecialization);

        // Log the search and results for debugging
        System.out.println("Searching for doctors with specialization: " + searchSpecialization);
        System.out.println("Found " + doctors.size() + " doctors");

        // Map to DTOs
        return doctors.stream()
                .map(doc -> {
                    DoctorDTO dto = new DoctorDTO(
                            doc.getId(),
                            doc.getName(),
                            doc.getEmail(),
                            doc.getPhone(),
                            doc.getSpecialisation(),
                            doc.getImageUrl(),
                            doc.getAbout(),
                            doc.getExperience()
                    );
                    return dto;
                })
                .toList();
    }

    // Get a doctor by ID
    public DoctorDTO getDoctorById(Long doctorId) {
        User user = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + doctorId));

        if (!"Doctor".equals(user.getRole())) {
            throw new RuntimeException("User is not a doctor");
        }

        Doctor doctor = (Doctor) user;

        return new DoctorDTO(
                doctor.getId(),
                doctor.getName(),
                doctor.getEmail(),
                doctor.getPhone(),
                doctor.getSpecialisation(),
                doctor.getImageUrl(),
                doctor.getAbout(),
                doctor.getExperience()
        );
    }

    public DoctorProfileDTO getLoggedInDoctor(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (!"Doctor".equals(user.getRole())) {
            throw new RuntimeException("User is not a doctor");
        }
        Doctor doctor = (Doctor) user;
        return new DoctorProfileDTO(
                doctor.getName(),
                doctor.getEmail(),
                doctor.getAbout(),
                doctor.getPhone(),
                doctor.getExperience(),
                doctor.getSpecialisation()
        );
    }

    public long countDoctors() {
        return userRepository.countByRole("Doctor");
    }

    public long countPatients() {
        return userRepository.countByRole("PATIENT");
    }

    public void sendPasswordResetCode(String email) {
        // Validate email format
        if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new RuntimeException("Invalid email format");
        }

        // Check if user exists
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No user found with email: " + email));

        // Generate reset code
        String code = String.valueOf((int) (Math.random() * 900000) + 100000); // 6-digit code

        // Store the code
        resetCodes.put(email, code);

        try {
            // Send the reset code via email
            emailService.sendPasswordResetEmail(email, code);
            System.out.println("Reset code sent to: " + email);
        } catch (Exception e) {
            // Remove the code if email sending fails
            resetCodes.remove(email);
            throw new RuntimeException("Failed to send reset code. Please try again later.");
        }
    }

    public void resetPassword(String email, String code, String newPassword) {
        if (!resetCodes.containsKey(email) || !resetCodes.get(email).equals(code)) {
            throw new RuntimeException("Invalid reset code");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No user with that email"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        resetCodes.remove(email);
    }

    @Transactional
    public Patient updatePatientProfile(String email, Patient updatedPatient) {
        // Find the existing patient
        Patient existingPatient = (Patient) userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found with email: " + email));

        // Update fields if provided and valid
        if (updatedPatient.getName() != null && !updatedPatient.getName().trim().isEmpty()) {
            existingPatient.setName(updatedPatient.getName().trim());
        }
        if (updatedPatient.getEmail() != null && !updatedPatient.getEmail().trim().isEmpty()) {
            if (userRepository.findByEmail(updatedPatient.getEmail()).isPresent() && !updatedPatient.getEmail().equals(email)) {
                throw new RuntimeException("Email already in use: " + updatedPatient.getEmail());
            }
            existingPatient.setEmail(updatedPatient.getEmail().trim());
        }
        if (updatedPatient.getPassword() != null && !updatedPatient.getPassword().trim().isEmpty()) {
            existingPatient.setPassword(passwordEncoder.encode(updatedPatient.getPassword().trim()));
        }
        if (updatedPatient.getPhone() != null && !updatedPatient.getPhone().trim().isEmpty()) {
            existingPatient.setPhone(updatedPatient.getPhone().trim());
        }

        // Save the updated patient
        return (Patient) userRepository.save(existingPatient);
    }

    public String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No user is currently logged in");
        }
        return authentication.getName();
    }
}
