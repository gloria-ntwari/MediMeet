package com.gloriatech.medimeet.dto;

public class AppointDTO {
    private Long id;
    private String name;
    private String specialisation;
    private String imageUrl;
    private String about;
    private String experience;

    public AppointDTO() {}
    
    public AppointDTO(Long id, String name, String specialisation, String imageUrl, String about, String experience) {
        this.id = id;
        this.name = name;
        this.specialisation = specialisation;
        this.imageUrl = imageUrl;
        this.about = about;
        this.experience = experience;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
