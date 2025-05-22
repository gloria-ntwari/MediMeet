package com.gloriatech.medimeet.controller;

import com.gloriatech.medimeet.model.Appointment;
import com.gloriatech.medimeet.model.User;
import com.gloriatech.medimeet.repository.UserRepository;
import com.gloriatech.medimeet.service.AppointmentService;
import com.gloriatech.medimeet.dto.AppointmentDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;
import java.util.HashMap;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"},
        allowCredentials = "true",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class AppointmentController {

    private static final Logger logger = Logger.getLogger(AppointmentController.class.getName());

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/bookAppointment")
    public ResponseEntity<Appointment> bookAppointment(
            @RequestParam Long doctorId,
            @RequestParam String date,
            @RequestParam String time,
            @RequestParam String comment
    ) {
        LocalDate appointmentDate = LocalDate.parse(date);
        LocalTime appointmentTime = LocalTime.parse(time);
        Appointment appointment = appointmentService.bookAppointment(doctorId, appointmentDate, appointmentTime, comment);
        return ResponseEntity.ok(appointment);
    }

    @GetMapping("")
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @DeleteMapping("/{appointmentId}")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long appointmentId) {
        appointmentService.cancelAppointment(appointmentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/allRecentAppointments")
    public ResponseEntity<List<Appointment>> getAllRecentAppointments() {
        List<Appointment> appointments = appointmentService.getAllRecentAppointments();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/doctor")
    public ResponseEntity<?> getDoctorAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        try {
            // Force size to be exactly 5
            size = 5;
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty() || !"Doctor".equals(userOpt.get().getRole())) {
                return ResponseEntity.status(403).body("Unauthorized");
            }
            Long doctorId = userOpt.get().getId();
            // Sort by date DESC, then id DESC for stable deterministic order
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.asc("date"), Sort.Order.asc("id")));
            Page<Appointment> appointmentsPage = appointmentService.getDoctorAppointments(doctorId, pageable);
            // Convert Page to a map containing both content and pagination info
            Map<String, Object> response = new HashMap<>();
            response.put("content", appointmentsPage.getContent());
            response.put("totalPages", appointmentsPage.getTotalPages());
            response.put("totalElements", appointmentsPage.getTotalElements());
            response.put("currentPage", appointmentsPage.getNumber());
            response.put("pageSize", size);
            response.put("isLastPage", appointmentsPage.isLast());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/patient")
    public ResponseEntity<?> getPatientAppointments() {
        try {
            // Get the currently logged-in user from security context
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            String authType = SecurityContextHolder.getContext().getAuthentication().getClass().getSimpleName();
            boolean isAuthenticated = SecurityContextHolder.getContext().getAuthentication().isAuthenticated();

            logger.info("Attempting to fetch appointments for: " + email);
            logger.info("Authentication type: " + authType);
            logger.info("Is authenticated: " + isAuthenticated);
            logger.info("Credentials: " + (SecurityContextHolder.getContext().getAuthentication().getCredentials() != null ? "present" : "null"));
            logger.info("Details: " + (SecurityContextHolder.getContext().getAuthentication().getDetails() != null
                    ? SecurityContextHolder.getContext().getAuthentication().getDetails().toString() : "null"));

            if (email == null || email.equals("anonymousUser")) {
                logger.warning("Unauthorized access attempt - user not authenticated (anonymous user)");
                Map<String, Object> response = new HashMap<>();
                response.put("error", "User not authenticated. Please log in.");
                response.put("authenticated", false);
                response.put("email", email);
                response.put("authType", authType);
                return ResponseEntity.status(403).body(response);
            }

            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                logger.warning("User with email " + email + " not found in database");
                Map<String, Object> response = new HashMap<>();
                response.put("error", "User not found: " + email);
                response.put("authenticated", true);
                response.put("email", email);
                response.put("authType", authType);
                return ResponseEntity.status(403).body(response);
            }

            User user = userOpt.get();
            if (!"PATIENT".equals(user.getRole())) {
                logger.warning("Unauthorized access attempt by: " + email + " with role: " + user.getRole());
                Map<String, Object> response = new HashMap<>();
                response.put("error", "Unauthorized: Only doctors can view their appointments. Current role: " + user.getRole());
                response.put("authenticated", true);
                response.put("email", email);
                response.put("authType", authType);
                response.put("role", user.getRole());
                return ResponseEntity.status(403).body(response);
            }

            // Get the logged-in doctor's ID and fetch only their appointments
            Long patientId = user.getId();
            logger.info("Fetching appointments for doctor ID: " + patientId);

            List<Appointment> appointments = appointmentService.getPatientAppointments(patientId);

            // Return the appointments even if the list is empty
            return ResponseEntity.ok(appointments);

        } catch (Exception e) {
            logger.severe("Error fetching doctor appointments: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Error fetching appointments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{appointmentId}/status")
    public ResponseEntity<Appointment> updateAppointmentStatus(
            @PathVariable Long appointmentId,
            @RequestBody Map<String, String> statusUpdate) {

        String newStatus = statusUpdate.get("status");
        if (newStatus == null || newStatus.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            Appointment updatedAppointment = appointmentService.updateAppointmentStatus(appointmentId, newStatus);
            return ResponseEntity.ok(updatedAppointment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Add a debugging endpoint to check authentication status
    @GetMapping("/auth-check")
    public ResponseEntity<?> checkAuthentication() {
        try {
            // Get authentication info
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            boolean isAuthenticated = SecurityContextHolder.getContext().getAuthentication().isAuthenticated();
            String authType = SecurityContextHolder.getContext().getAuthentication().getClass().getSimpleName();
            boolean isAnonymous = "anonymousUser".equals(email);

            // Get user info if available
            Optional<User> userOpt = userRepository.findByEmail(email);
            Map<String, Object> response = new HashMap<>();

            response.put("authenticated", isAuthenticated);
            response.put("email", email);
            response.put("authType", authType);
            response.put("isAnonymous", isAnonymous);
            response.put("authDetails", SecurityContextHolder.getContext().getAuthentication().getDetails() != null
                    ? SecurityContextHolder.getContext().getAuthentication().getDetails().toString() : "null");
            response.put("credentials", SecurityContextHolder.getContext().getAuthentication().getCredentials() != null
                    ? "present" : "null");

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                response.put("userFound", true);
                response.put("userId", user.getId());
                response.put("role", user.getRole());
                response.put("email", user.getEmail());
            } else {
                response.put("userFound", false);
                response.put("message", isAnonymous
                        ? "Anonymous user - please log in"
                        : "No user found with email: " + email);
            }

            logger.info("Auth check: " + response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("Error in auth check: " + e.getMessage());
            return ResponseEntity.status(500).body("Error in auth check: " + e.getMessage());
        }
    }

    @GetMapping("/recentAppointment")
    public ResponseEntity<?> getRecentAppointment() {
        try {
            // Get the currently logged-in user from security context
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            String authType = SecurityContextHolder.getContext().getAuthentication().getClass().getSimpleName();
            boolean isAuthenticated = SecurityContextHolder.getContext().getAuthentication().isAuthenticated();

            logger.info("Attempting to fetch appointments for: " + email);
            logger.info("Authentication type: " + authType);
            logger.info("Is authenticated: " + isAuthenticated);
            logger.info("Credentials: " + (SecurityContextHolder.getContext().getAuthentication().getCredentials() != null ? "present" : "null"));
            logger.info("Details: " + (SecurityContextHolder.getContext().getAuthentication().getDetails() != null
                    ? SecurityContextHolder.getContext().getAuthentication().getDetails().toString() : "null"));

            if (email == null || email.equals("anonymousUser")) {
                logger.warning("Unauthorized access attempt - user not authenticated (anonymous user)");
                Map<String, Object> response = new HashMap<>();
                response.put("error", "User not authenticated. Please log in.");
                response.put("authenticated", false);
                response.put("email", email);
                response.put("authType", authType);
                return ResponseEntity.status(403).body(response);
            }

            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                logger.warning("User with email " + email + " not found in database");
                Map<String, Object> response = new HashMap<>();
                response.put("error", "User not found: " + email);
                response.put("authenticated", true);
                response.put("email", email);
                response.put("authType", authType);
                return ResponseEntity.status(403).body(response);
            }

            User user = userOpt.get();
            if (!"Doctor".equals(user.getRole())) {
                logger.warning("Unauthorized access attempt by: " + email + " with role: " + user.getRole());
                Map<String, Object> response = new HashMap<>();
                response.put("error", "Unauthorized: Only doctors can view their appointments. Current role: " + user.getRole());
                response.put("authenticated", true);
                response.put("email", email);
                response.put("authType", authType);
                response.put("role", user.getRole());
                return ResponseEntity.status(403).body(response);
            }

            // Get the logged-in doctor's ID and fetch only their appointments
            Long doctorId = user.getId();
            logger.info("Fetching appointments for doctor ID: " + doctorId);

            List<Appointment> appointments = appointmentService.getRecentAppointments(doctorId);

            // Return the appointments even if the list is empty
            return ResponseEntity.ok(appointments);

        } catch (Exception e) {
            logger.severe("Error fetching doctor appointments: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Error fetching appointments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getAdminDashboardStats() {
        long doctorCount = userRepository.countByRole("Doctor");
        long patientCount = userRepository.countByRole("PATIENT");
        long adminCount = userRepository.countByRole("ADMIN");
        long appointmentCount = appointmentService.getAllAppointments().size();
        return ResponseEntity.ok(new java.util.HashMap<String, Long>() {
            {
                put("doctors", doctorCount);
                put("patients", patientCount);
                put("admins", adminCount);
                put("appointments", appointmentCount);
            }
        });
    }

    /**
     * Get appointment counts by status for the logged-in doctor
     */
    @GetMapping("/doctor/counts")
    public ResponseEntity<?> getLoggedInDoctorAppointmentCounts() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty() || !"Doctor".equals(userOpt.get().getRole())) {
                return ResponseEntity.status(403).body("Unauthorized: Only doctors can access this endpoint");
            }
            Long doctorId = userOpt.get().getId();
            Map<String, Long> counts = appointmentService.getDoctorAppointmentCounts(doctorId);
            return ResponseEntity.ok(counts);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    /**
     * Get appointments by status for the logged-in doctor
     */
    @GetMapping("/doctor/appointments/status/{status}")
    public ResponseEntity<?> getLoggedInDoctorAppointmentsByStatus(@PathVariable String status) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty() || !"Doctor".equals(userOpt.get().getRole())) {
                return ResponseEntity.status(403).body("Unauthorized: Only doctors can access this endpoint");
            }
            Long doctorId = userOpt.get().getId();
            List<Appointment> appointments = appointmentService.getDoctorAppointmentsByStatus(doctorId, status);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/doctor/rejected")
    public ResponseEntity<?> getLoggedInDoctorRejectedAppointments() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty() || !"Doctor".equals(userOpt.get().getRole())) {
                return ResponseEntity.status(403).body("Unauthorized: Only doctors can access this endpoint");
            }
            Long doctorId = userOpt.get().getId();
            List<Appointment> appointments = appointmentService.getDoctorAppointmentsByStatus(doctorId, "rejected");
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/admin/status-counts")
    public ResponseEntity<?> getAdminAppointmentStatusCounts() {
        // Only allow admin
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !"ADMIN".equalsIgnoreCase(userOpt.get().getRole())) {
            return ResponseEntity.status(403).body("Unauthorized: Only admins can access this endpoint");
        }
        // Query status counts
        List<Appointment> all = appointmentService.getAllAppointments();
        Map<String, Long> counts = all.stream().collect(
                java.util.stream.Collectors.groupingBy(Appointment::getStatus, java.util.stream.Collectors.counting())
        );
        return ResponseEntity.ok(counts);
    }

    @GetMapping("/admin/appointments-over-time")
    public ResponseEntity<?> getAdminAppointmentsOverTime() {
        // Only allow admin
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !"ADMIN".equalsIgnoreCase(userOpt.get().getRole())) {
            return ResponseEntity.status(403).body("Unauthorized: Only admins can access this endpoint");
        }
        // Query appointments grouped by date
        List<Appointment> all = appointmentService.getAllAppointments();
        Map<String, Long> dateCounts = all.stream().collect(
                java.util.stream.Collectors.groupingBy(
                        a -> a.getDate().toString(),
                        java.util.stream.Collectors.counting()
                )
        );
        // Convert to list of {date, count}
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (Map.Entry<String, Long> entry : dateCounts.entrySet()) {
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("date", entry.getKey());
            item.put("count", entry.getValue());
            result.add(item);
        }
        // Sort by date ascending
        result.sort(java.util.Comparator.comparing(m -> (String) m.get("date")));
        return ResponseEntity.ok(result);
    }

}
