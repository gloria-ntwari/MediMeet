package com.gloriatech.medimeet.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String to, String resetCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset Code - MediMeet");
        message.setText("Your password reset code is: " + resetCode + "\n\n" +
                "This code will expire in 10 minutes.\n\n" +
                "If you didn't request this reset, please ignore this email.");
        
        mailSender.send(message);
        System.out.println("Password reset email sent to: " + to);
    }
} 