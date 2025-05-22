package com.gloriatech.medimeet.repository;
import com.gloriatech.medimeet.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
}
