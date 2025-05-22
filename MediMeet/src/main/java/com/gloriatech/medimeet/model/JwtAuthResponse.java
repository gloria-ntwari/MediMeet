package com.gloriatech.medimeet.model;

public class JwtAuthResponse {
    private String token;
    private String email;
    private String role;
    private long id;
    private String name;
    
    public JwtAuthResponse() {
    }
    
    public JwtAuthResponse(String token, String email, String role, long id, String name) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.id = id;
        this.name = name;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public long getId() {
        return id;
    }
    
    public void setId(long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
}
