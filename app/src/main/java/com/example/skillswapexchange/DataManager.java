package com.example.skillswapexchange;

import com.example.skillswapexchange.models.User;
import java.util.ArrayList;
import java.util.List;

public class DataManager {
    private static DataManager instance;
    private List<User> users = new ArrayList<>();

    private DataManager() {
        // Initial mock user
        users.add(new User("Admin", "admin@skillswap.com", "admin123", "1234567890"));
    }

    public static synchronized DataManager getInstance() {
        if (instance == null) {
            instance = new DataManager();
        }
        return instance;
    }

    public boolean registerUser(User user) {
        for (User u : users) {
            if (u.getEmail().equals(user.getEmail())) return false;
        }
        users.add(user);
        return true;
    }

    public boolean loginUser(String email, String password) {
        for (User u : users) {
            if (u.getEmail().equals(email) && u.getPassword().equals(password)) {
                return true;
            }
        }
        return false;
    }
}
