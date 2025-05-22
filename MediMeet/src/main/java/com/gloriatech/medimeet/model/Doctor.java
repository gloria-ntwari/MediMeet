package com.gloriatech.medimeet.model;

import jakarta.persistence.*;

@Entity
public class Doctor extends User {

    private String name;
    private String specialisation;
    private String phone;
    private String imageUrl;
    private String about;
    private String experience;

    public Doctor(String name, String specialisation, String phone, String imageUrl,String about, String experience) {
        this.name = name;
        this.specialisation = specialisation;
        this.phone = phone;
        this.imageUrl = imageUrl;
        this.about = about;
        this.experience = experience;
    }

    public Doctor() {

    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialisation() {
        return specialisation;
    }

    public void setSpecialisation(String specialisation) {
        this.specialisation = specialisation;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAbout() {
        return about;
    }

    public void setAbout(String about) {
        this.about = about;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }
}
