package com.gloriatech.medimeet.controller;

import com.gloriatech.medimeet.model.*;
import com.gloriatech.medimeet.service.JwtService;
import com.gloriatech.medimeet.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/auth")
public class AuthController {

    private final JwtService jwtService;
    private final UserService userService;
    private final UserDetailsService userDetailsService;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthController(
            JwtService jwtService,
            UserService userService,
            UserDetailsService userDetailsService,
            AuthenticationManager authenticationManager
    ) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.userDetailsService = userDetailsService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@RequestBody JwtAuthRequest authRequest) {
        try {
            System.out.println("Login attempt with email: " + authRequest.getEmail());

            // Authenticate the user
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getEmail(),
                            authRequest.getPassword()
                    )
            );

            System.out.println("Authentication successful for: " + authRequest.getEmail());

            // Load user details
            UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getEmail());

            // Generate JWT token
            String jwtToken = jwtService.generateToken(userDetails);
            System.out.println("JWT token generated for: " + authRequest.getEmail());

            // Get user information
            User user = userService.getUserByEmail(authRequest.getEmail());

            // Create response
            JwtAuthResponse response = new JwtAuthResponse();
            response.setToken(jwtToken);
            response.setEmail(user.getEmail());
            response.setRole(user.getRole());
            response.setId(user.getId());

            // Set name based on user type
            if (user instanceof Doctor) {
                response.setName(((Doctor) user).getName());
            } else if (user instanceof Patient) {
                response.setName(((Patient) user).getName());
            } else if (user instanceof Admin) {
                response.setName(((Admin) user).getName());
            }

            System.out.println("Login successful for: " + user.getEmail() + " with role: " + user.getRole());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Authentication failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/register/patient")
    public ResponseEntity<JwtAuthResponse> registerPatient(@RequestBody Patient patient) {
        try {
            System.out.println("Patient registration attempt with email: " + patient.getEmail());

            // Register the patient
            Patient savedPatient = userService.registerPatient(patient);

            // Load user details
            UserDetails userDetails = userDetailsService.loadUserByUsername(savedPatient.getEmail());

            // Generate JWT token
            String jwtToken = jwtService.generateToken(userDetails);

            // Create response
            JwtAuthResponse response = new JwtAuthResponse();
            response.setToken(jwtToken);
            response.setEmail(savedPatient.getEmail());
            response.setRole(savedPatient.getRole());
            response.setId(savedPatient.getId());
            response.setName(savedPatient.getName());

            System.out.println("Patient registration successful for: " + savedPatient.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Patient registration failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}
