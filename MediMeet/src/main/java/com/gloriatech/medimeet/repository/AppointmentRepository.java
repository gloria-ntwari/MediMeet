package com.gloriatech.medimeet.repository;

import com.gloriatech.medimeet.model.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientId(Long patientId);

    Page<Appointment> findByDoctorId(Long doctorId, Pageable pageable);

    List<Appointment> findTop3ByOrderByDateDesc();

    List<Appointment> findTop3ByPatientIdOrderByDateDesc(Long patientId);

    // Count appointments by status for a specific doctor
    Long countByDoctorIdAndStatus(Long doctorId, String status);

    // Get all appointments for a specific doctor
    List<Appointment> findByDoctorId(Long doctorId);

    // Get appointments by status for a specific doctor
    List<Appointment> findByDoctorIdAndStatus(Long doctorId, String status);
}
