package com.gloriatech.medimeet.controller;

public class LoginRequest {
    private String email;
    private String password;

    public String getEmail() {
        return email;
    }

    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
