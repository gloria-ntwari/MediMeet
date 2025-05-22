package com.gloriatech.medimeet.dto;

public class HomeDTO {

    private Long id;
    private String name;
    private String specialisation;
    private String imageUrl;

    public HomeDTO() {

    }

    public HomeDTO(Long id, String name, String specialisation, String imageUrl) {
        this.id = id;
        this.name = name;
        this.specialisation = specialisation;
        this.imageUrl = imageUrl;
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
}
