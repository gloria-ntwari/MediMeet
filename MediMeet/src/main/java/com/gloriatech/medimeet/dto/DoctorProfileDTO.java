package com.gloriatech.medimeet.dto;

public class DoctorProfileDTO {

    private String name;
    private String email;
    private String Password;
    private String about;
    private String phone;
    private String experience;
    private String specialisation;

    public DoctorProfileDTO(String name, String email, String about, String phone, String experience, String specialisation) {
        this.name = name;
        this.email = email;
        this.about = about;
        this.phone = phone;
        this.experience = experience;
        this.specialisation = specialisation;
    }

    public String getPassword() {
        return Password;
    }

    public void setPassword(String password) {
        Password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAbout() {
        return about;
    }

    public void setAbout(String about) {
        this.about = about;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public String getSpecialisation() {
        return specialisation;
    }

    public void setSpecialisation(String specialisation) {
        this.specialisation = specialisation;
    }
}
