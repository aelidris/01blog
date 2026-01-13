package com.z01;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200") // Allow Angular to talk to this
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public String registerUser(@RequestBody User user) {
        // Basic check to see if user exists
        if (userRepository.findByUsername(user.getUsername()) != null) {
            return "Error: Username already exists!";
        }
        
        userRepository.save(user);
        return "User registered successfully!";
    }

    @PostMapping("/login")
    public String loginUser(@RequestBody User user) {
        User existingUser = userRepository.findByUsername(user.getUsername());
        
        if (existingUser != null && existingUser.getPassword().equals(user.getPassword())) {
            return "Login successful!";
        }
        return "Error: Invalid username or password.";
    }
}