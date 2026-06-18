package com.example.skillswapexchange.models;

public class Skill {
    private final String title;
    private final String description;
    private final String userName;
    private final String category;

    public Skill(String title, String description, String userName, String category) {
        this.title = title;
        this.description = description;
        this.userName = userName;
        this.category = category;
    }

    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getUserName() { return userName; }
    public String getCategory() { return category; }
}
