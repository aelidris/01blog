package com.z01;

import jakarta.persistence.*;
import java.util.List; // Add this import
import com.fasterxml.jackson.annotation.JsonIgnore; // Highly recommended

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    private String email;

    // 1. Requirement: Role-based access (user vs admin)
    private String role = "USER"; 

    // 2. Requirement: Link to posts
    // JsonIgnore prevents infinite loops when the API sends data to Angular
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Post> posts;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    // New Getters/Setters
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public List<Post> getPosts() { return posts; }
    public void setPosts(List<Post> posts) { this.posts = posts; }
}