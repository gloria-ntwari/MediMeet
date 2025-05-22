package com.gloriatech.medimeet.repository;

import com.gloriatech.medimeet.model.Doctor;
import com.gloriatech.medimeet.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    List<User> findByRole(String role);

    List<Doctor> findByRoleAndSpecialisation(String role, String specialisation);

    Optional<User> findByEmailAndRole(String email, String role);

    void deleteById(Long id);

    <S extends User> List<S> save(List<S> entities);

    long countByRole(String role);

}
