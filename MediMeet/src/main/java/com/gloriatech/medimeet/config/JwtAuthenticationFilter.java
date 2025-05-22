package com.gloriatech.medimeet.config;

import com.gloriatech.medimeet.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Autowired
    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");

        // If no Authorization header, proceed to the next filter
        if (authHeader == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // Handle JWT Authentication
        if (authHeader.startsWith("Bearer ")) {
            handleJwtAuthentication(authHeader, request);
        } // Handle Basic Authentication
        else if (authHeader.startsWith("Basic ")) {
            // Let Spring Security's default mechanisms handle Basic Auth
            // We don't need to do anything here as Spring will process it
            logger.debug("Basic authentication detected - delegating to Spring Security");
        }

        // Continue to the next filter
        filterChain.doFilter(request, response);
    }


    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        return path.equals("/api/users/request-password-reset") ||
                path.equals("/api/users/reset-password");
    }

    private void handleJwtAuthentication(String authHeader, HttpServletRequest request) {
        try {
            // Check if token is long enough to be a valid JWT
            if (authHeader.length() < 10) {
                logger.debug("JWT token too short, skipping authentication");
                return;
            }

            // Extract the JWT token from the Authorization header
            final String jwt = authHeader.substring(7);

            // Basic validation check before trying to parse
            if (!jwt.contains(".")) {
                logger.debug("JWT token doesn't contain required period characters, skipping authentication");
                return;
            }

            // Extract the username (email) from the token
            final String userEmail = jwtService.extractUsername(jwt);

            // If we have a username and no authentication exists yet
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Load user details from the database
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                // Validate the token
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // Create authentication token
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    // Set details from the current request
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Set the authentication in the security context
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Log exception but don't fail the request
            logger.debug("JWT authentication failed - " + e.getMessage());
            // Continue to the next filter even if token validation fails
        }
    }
}
