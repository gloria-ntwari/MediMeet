package com.gloriatech.medimeet.repository;
import com.gloriatech.medimeet.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<Patient, Long> {
}
