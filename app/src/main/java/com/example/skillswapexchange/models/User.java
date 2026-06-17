package com.example.skillswapexchange.models;

public class User {
    private String fullName;
    private String email;
    private String password;
    private String mobile;

    public User(String fullName, String email, String password, String mobile) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.mobile = mobile;
    }

    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
}
