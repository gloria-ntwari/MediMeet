package com.gloriatech.medimeet.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                                .requestMatchers("/api/assets/**").permitAll()
                                .requestMatchers("/api/users/image/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                                .requestMatchers("/api/users/request-password-reset").permitAll()
                                .requestMatchers("/api/users/reset-password").permitAll()
                // Allow authentication endpoints
                .requestMatchers("/api/users/login").permitAll()
                .requestMatchers("/api/users/register/**").permitAll()
                // Allow access to public doctor endpoints
                .requestMatchers("/api/users/getHomeDoctors").permitAll()
                .requestMatchers("/api/users/getAppointDoctors").permitAll()
                .requestMatchers("/api/users/getDoctors").permitAll()
                .requestMatchers("/api/users/getAllSpecializations").permitAll()
                .requestMatchers("/api/users/getDoctorsBySpecialization").permitAll()
                .requestMatchers("/api/users/doctors/**").permitAll()
                // Allow appointment endpoints
                .requestMatchers("/api/appointments/**").permitAll()
                // Swagger UI access
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // Secure all other endpoints
                .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Enable HTTP Basic Authentication
                .httpBasic(httpBasic -> httpBasic.authenticationEntryPoint((request, response, authException) -> {
            System.out.println("Authentication failed: " + authException.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Authentication failed: " + authException.getMessage() + "\"}");
        }))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Origin", "Accept", "X-Requested-With", "Content-Type", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        configuration.setExposedHeaders(Arrays.asList("x-auth-token"));
        configuration.setAllowCredentials(true);

        // Increase session timeout through CORS headers
        configuration.setMaxAge(3600L); // 1 hour in seconds

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
