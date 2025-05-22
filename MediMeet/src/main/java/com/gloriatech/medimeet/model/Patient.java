package com.gloriatech.medimeet.model;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity

public class Patient extends  User{
    private String name;
    private String phone;

    public Patient() {

    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Patient(String phone, String name) {
        this.phone = phone;
        this.name = name;
    }
}
