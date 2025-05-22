package com.gloriatech.medimeet.service;

import com.gloriatech.medimeet.model.Appointment;
import com.gloriatech.medimeet.model.Doctor;
import com.gloriatech.medimeet.model.Patient;
import com.gloriatech.medimeet.model.User;
import com.gloriatech.medimeet.repository.AppointmentRepository;
import com.gloriatech.medimeet.repository.PatientRepository;
import com.gloriatech.medimeet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public Appointment bookAppointment(Long doctorId, LocalDate date, LocalTime time, String comment) {
        // Get the current logged-in user's email
        String currentUserEmail = userService.getCurrentUserEmail();
        if (currentUserEmail == null) {
            throw new RuntimeException("No user is currently logged in");
        }

        // Retrieve the patient associated with the current user
        Patient patient = (Patient) userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Patient not found for the logged-in user"));

        User doctorUser = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id " + doctorId));

        if (!"Doctor".equals(doctorUser.getRole())) {
            throw new RuntimeException("Selected user is not a doctor");
        }
        Doctor doctor = (Doctor) doctorUser;

        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setDate(date);
        appointment.setTime(time);
        appointment.setComment(comment);
        appointment.setStatus("pending");

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getPatientAppointments() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getRecentAppointments(Long doctorId) {
        return appointmentRepository.findTop3ByPatientIdOrderByDateDesc(doctorId);
    }

    public List<Appointment> getAllRecentAppointments() {
        return appointmentRepository.findTop3ByOrderByDateDesc();
    }

    @Transactional
    public void cancelAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointmentRepository.delete(appointment);
    }

    @Transactional
    public Appointment updateAppointmentStatus(Long appointmentId, String newStatus) {
        // Verify status is valid
        if (!List.of("pending", "accepted", "rejected").contains(newStatus)) {
            throw new IllegalArgumentException("Invalid appointment status: " + newStatus);
        }

        // Find the appointment
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + appointmentId));

        // Update the status
        appointment.setStatus(newStatus);

        // Save and return the updated appointment
        return appointmentRepository.save(appointment);
    }

    /**
     * Get appointments for a specific doctor by doctorId
     */
    public Page<Appointment> getDoctorAppointments(Long doctorId, Pageable pageable) {
        if (doctorId == null) {
            throw new IllegalArgumentException("Doctor ID is required");
        }
        // Return all appointments for the doctor, including rejected ones
        return appointmentRepository.findByDoctorId(doctorId, pageable);
    }

    // Deprecated: use the Pageable version above
    @Deprecated
    public Page<Appointment> getDoctorAppointments(Long doctorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").ascending());
        return getDoctorAppointments(doctorId, pageable);
    }

    public List<Appointment> getPatientAppointments(Long patientID) {
        if (patientID == null) {
            throw new IllegalStateException("Patient ID is required");
        }

        return appointmentRepository.findByPatientId(patientID);
    }

    public Optional<Appointment> getAllAppointment(Long appointmentId) {
        if (appointmentId == null) {
            throw new IllegalArgumentException("Appointment ID is required");
        }

        return appointmentRepository.findById(appointmentId);
    }

    /**
     * Get appointment counts by status for a specific doctor
     */
    public Map<String, Long> getDoctorAppointmentCounts(Long doctorId) {
        Map<String, Long> counts = new HashMap<>();
        counts.put("pending", appointmentRepository.countByDoctorIdAndStatus(doctorId, "pending"));
        counts.put("accepted", appointmentRepository.countByDoctorIdAndStatus(doctorId, "accepted"));
        counts.put("rejected", appointmentRepository.countByDoctorIdAndStatus(doctorId, "rejected"));
        counts.put("cancelled", appointmentRepository.countByDoctorIdAndStatus(doctorId, "cancelled"));
        return counts;
    }

    /**
     * Get all appointments for a specific doctor
     */
    public List<Appointment> getDoctorAppointmentsAll(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    /**
     * Get appointments by status for a specific doctor
     */
    public List<Appointment> getDoctorAppointmentsByStatus(Long doctorId, String status) {
        return appointmentRepository.findByDoctorIdAndStatus(doctorId, status);
    }
}
