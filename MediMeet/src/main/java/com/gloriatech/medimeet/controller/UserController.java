package com.gloriatech.medimeet.controller;

import com.gloriatech.medimeet.dto.AppointDTO;
import com.gloriatech.medimeet.dto.DoctorDTO;
import com.gloriatech.medimeet.dto.DoctorProfileDTO;
import com.gloriatech.medimeet.dto.HomeDTO;
import com.gloriatech.medimeet.model.*;
import com.gloriatech.medimeet.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.cache.SpringCacheBasedUserCache;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private static final String UPLOAD_DIR = "D:\\Documents\\developing projects\\medimeet\\medimeet\\src\\assets\\";

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Register a new patient
    @PostMapping("/register/patient")
    public ResponseEntity<Patient> registerPatient(@RequestBody Patient patient) {
        try {
            Patient savedPatient = userService.registerPatient(patient);
            return ResponseEntity.ok(savedPatient);
        } catch (Exception e) {
            System.err.println("Error registering patient: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Register a new admin
    @PostMapping("/register/admin")
    public ResponseEntity<Admin> registerAdmin(@RequestBody Admin admin) {
        try {
            Admin savedAdmin = userService.registerAdmin(admin);
            return ResponseEntity.ok(savedAdmin);
        } catch (Exception e) {
            System.err.println("Error registering admin: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Add a new doctor with image upload
    @PostMapping(value = "/doctors", consumes = {"multipart/form-data"})
    public ResponseEntity<Doctor> addDoctor(
            @RequestParam("doctor") String doctorJson,
            @RequestParam("image") MultipartFile imageFile) {
        try {
            // Convert the JSON string to Doctor object using Jackson
            ObjectMapper objectMapper = new ObjectMapper();
            Doctor doctor;
            try {
                doctor = objectMapper.readValue(doctorJson, Doctor.class);
            } catch (Exception e) {
                System.err.println("Error parsing doctor JSON: " + e.getMessage());
                System.err.println("Received JSON: " + doctorJson);
                return ResponseEntity.badRequest().body(null);
            }

            System.out.println("Received doctor: " + doctor);
            System.out.println("Received image: " + (imageFile != null ? imageFile.getOriginalFilename() : "null"));

            Doctor savedDoctor = userService.addDoctor(doctor, imageFile);
            return ResponseEntity.ok(savedDoctor);
        } catch (Exception e) {
            System.err.println("Error adding doctor: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Login user
    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody LoginRequest loginRequest) {
        try {
            User user = userService.login(loginRequest.getEmail(), loginRequest.getPassword());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            System.err.println("Error logging in: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Get all doctors
    @GetMapping("/getDoctors")
    public ResponseEntity<List<DoctorDTO>> getDoctors() {
        try {
            List<DoctorDTO> doctors = userService.getAllDoctors();
            return ResponseEntity.ok(doctors);
        } catch (Exception e) {
            System.err.println("Error fetching doctors: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/getHomeDoctors")
    public ResponseEntity<List<HomeDTO>> getHomeDoctors() {
        try {
            List<HomeDTO> doctors = userService.getHomeDoctor();
            return ResponseEntity.ok(doctors);
        } catch (Exception e) {
            System.err.println("Error fetching doctors: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/getAppointDoctors")
    public ResponseEntity<List<AppointDTO>> getAppointDoctors() {
        try {
            List<AppointDTO> doctors = userService.getAppointDoctor();
            return ResponseEntity.ok(doctors);
        } catch (Exception e) {
            System.err.println("Error fetching doctors: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Delete a doctor
    @DeleteMapping("/deleteDoctor/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        try {
            userService.deleteDoctor(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error deleting doctor: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/doctorProfile")
    public ResponseEntity<DoctorProfileDTO> getLoggedInDoctor() {
        String email = getAuthenticatedUserEmail();
        DoctorProfileDTO doctorProfileDTO = userService.getLoggedInDoctor(email);
        return ResponseEntity.ok(doctorProfileDTO);
    }

    @PutMapping("/updateDoctorProfile")
    public ResponseEntity<DoctorProfileDTO> updateLoggedInDoctorProfile(
            @RequestPart("data") DoctorProfileDTO updateDTO) throws Exception {
        String email = getAuthenticatedUserEmail();
        DoctorProfileDTO updatedProfile = userService.updateLoggedInDoctorProfile(email, updateDTO);
        return ResponseEntity.ok(updatedProfile);
    }

    private String getAuthenticatedUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername(); // Assuming email is used as the username
        } else {
            throw new RuntimeException("No authenticated user found");
        }
    }

    @PutMapping(value = "/updateDoctor/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateDoctor(
            @PathVariable Long id,
            @RequestParam("doctor") String doctorJson,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {

        try {
            // Convert the JSON string to Doctor object
            ObjectMapper objectMapper = new ObjectMapper();
            Doctor doctor;
            try {
                doctor = objectMapper.readValue(doctorJson, Doctor.class);
            } catch (Exception e) {
                System.err.println("Error parsing doctor JSON for update: " + e.getMessage());
                System.err.println("Received JSON: " + doctorJson);
                return ResponseEntity.badRequest().body("Invalid doctor data format");
            }

            Doctor updated = userService.updateDoctor(id, doctor, imageFile);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException | IOException e) {
            System.err.println("Error updating doctor: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/getDoctorsBySpecialization")
    public ResponseEntity<List<DoctorDTO>> getDoctorsBySpecialization(@RequestParam String specialization) {
        try {
            List<DoctorDTO> doctors = userService.getDoctorsBySpecialization(specialization);
            return ResponseEntity.ok(doctors);
        } catch (Exception e) {
            System.err.println("Error fetching doctors by specialization: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/getAllSpecializations")
    public ResponseEntity<List<String>> getAllSpecializations() {
        try {
            // Use a predefined list of specializations
            List<String> specializations = List.of(
                    "General physician",
                    "Gynecologist",
                    "Dermatologist",
                    "Pediatrician",
                    "Neurologist",
                    "Gastroenterologist"
            );

            return ResponseEntity.ok(specializations);
        } catch (Exception e) {
            System.err.println("Error fetching specializations: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * Serves images stored in the asset directory. The frontend sends requests
     * with the filename only, and we need to find the file in the actual
     * filesystem.
     */
    @GetMapping("/image/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            System.out.println("Received request for image: " + filename);

            // Create the full path to the image
            Path imagePath = Paths.get(UPLOAD_DIR, filename);
            System.out.println("Looking for image at: " + imagePath.toAbsolutePath());

            File imageFile = imagePath.toFile();
            if (!imageFile.exists() || !imageFile.isFile()) {
                System.err.println("Image file not found at: " + imagePath.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }

            // Create a resource from the file
            FileSystemResource resource = new FileSystemResource(imageFile);

            // Determine content type based on file extension
            String contentType = determineContentType(filename);

            // Log successful image serving
            System.out.println("Successfully serving image: " + filename + " with content type: " + contentType);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (Exception e) {
            System.err.println("Error serving image: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * This endpoint matches exactly what the browser is requesting based on the
     * logs
     */
    @GetMapping("/assets/{filename:.+}")
    public ResponseEntity<Resource> serveAssetImage(@PathVariable String filename) {
        System.out.println("Received request for asset: " + filename);

        // Create the full path to the image
        Path imagePath = Paths.get(UPLOAD_DIR, filename);
        System.out.println("Looking for image at: " + imagePath.toAbsolutePath());

        File imageFile = imagePath.toFile();
        if (!imageFile.exists() || !imageFile.isFile()) {
            System.err.println("Image file not found at: " + imagePath.toAbsolutePath());
            return ResponseEntity.notFound().build();
        }

        // Create a resource from the file
        FileSystemResource resource = new FileSystemResource(imageFile);

        // Determine content type based on file extension
        String contentType = determineContentType(filename);

        // Log successful image serving
        System.out.println("Successfully serving asset image: " + filename + " with content type: " + contentType);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    private String determineContentType(String filename) {
        if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (filename.toLowerCase().endsWith(".png")) {
            return "image/png";
        } else if (filename.toLowerCase().endsWith(".gif")) {
            return "image/gif";
        } else {
            return "application/octet-stream";
        }
    }

    /**
     * Test endpoint to debug image paths and directory contents
     */
    @GetMapping("/debug-images")
    public ResponseEntity<String> debugImages() {
        StringBuilder debug = new StringBuilder();
        debug.append("Image debug information:\n\n");

        // Check the upload directory
        File uploadDir = new File(UPLOAD_DIR);
        debug.append("Upload directory: ").append(UPLOAD_DIR).append("\n");
        debug.append("Absolute path: ").append(uploadDir.getAbsolutePath()).append("\n");
        debug.append("Directory exists: ").append(uploadDir.exists()).append("\n");
        debug.append("Is directory: ").append(uploadDir.isDirectory()).append("\n\n");

        // List files in the directory
        if (uploadDir.exists() && uploadDir.isDirectory()) {
            debug.append("Files in directory:\n");
            File[] files = uploadDir.listFiles();
            if (files != null) {
                for (File file : files) {
                    debug.append(" - ").append(file.getName())
                            .append(" (").append(file.length()).append(" bytes)\n");
                }
            } else {
                debug.append("No files or unable to list files.\n");
            }
        }

        return ResponseEntity.ok(debug.toString());
    }

    @GetMapping("/test-image")
    public ResponseEntity<String> testImageAccess() {
        try {
            // This will generate HTML that attempts to load images from various paths
            StringBuilder html = new StringBuilder();
            html.append("<html><body>");
            html.append("<h1>Image Loading Test</h1>");

            // List files in upload directory
            File uploadDir = new File(UPLOAD_DIR);
            if (uploadDir.exists() && uploadDir.isDirectory()) {
                File[] files = uploadDir.listFiles();
                if (files != null) {
                    html.append("<h2>Available Images:</h2>");
                    for (File file : files) {
                        if (file.isFile() && isImageFile(file.getName())) {
                            String filename = file.getName();

                            html.append("<div style='margin: 20px; border: 1px solid #ccc; padding: 10px;'>");
                            html.append("<h3>").append(filename).append("</h3>");

                            // Test with different paths
                            String directPath = "/api/assets/" + filename;
                            String usersImagePath = "/api/users/image/" + filename;

                            html.append("<p>Direct path: ").append(directPath).append("</p>");
                            html.append("<img src='").append(directPath).append("' style='max-width: 200px; border: 2px solid blue;'>");

                            html.append("<p>Users image path: ").append(usersImagePath).append("</p>");
                            html.append("<img src='").append(usersImagePath).append("' style='max-width: 200px; border: 2px solid green;'>");

                            html.append("</div>");
                        }
                    }
                }
            }

            html.append("</body></html>");

            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(html.toString());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    private boolean isImageFile(String filename) {
        String lowerCaseFilename = filename.toLowerCase();
        return lowerCaseFilename.endsWith(".jpg")
                || lowerCaseFilename.endsWith(".jpeg")
                || lowerCaseFilename.endsWith(".png")
                || lowerCaseFilename.endsWith(".gif");
    }

    @GetMapping("/doctors/{id}")
    public ResponseEntity<DoctorDTO> getDoctorById(@PathVariable Long id) {
        try {
            DoctorDTO doctor = userService.getDoctorById(id);
            return ResponseEntity.ok(doctor);
        } catch (Exception e) {
            System.err.println("Error fetching doctor: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/doctors/count")
    public ResponseEntity<Long> getDoctorCount() {
        Long count = userService.countDoctors();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/patients/count")
    public ResponseEntity<Long> getPatientsCount() {
        Long count = userService.countPatients();
        return ResponseEntity.ok(count);
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@RequestParam String email) {
        userService.sendPasswordResetCode(email);
        return ResponseEntity.ok("Reset code sent if email exists.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String email, @RequestParam String code, @RequestParam String newPassword) {
        userService.resetPassword(email, code, newPassword);
        return ResponseEntity.ok("Password reset successful.");
    }

    @PutMapping("/updatePatientProfile")
    public ResponseEntity<Patient> updatePatientProfile(@RequestBody Patient updatedPatient) {
        try {
            String email = getAuthenticatedUserEmail();
            Patient updated = userService.updatePatientProfile(email, updatedPatient);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            System.err.println("Error updating patient profile: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

}
