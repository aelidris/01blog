package com.z01;

import java.util.HashSet; // Fixes "cannot find symbol: class HashSet"
import java.util.Set;     // Fixes "cannot find symbol: class Set"
import jakarta.persistence.*;
import java.util.List; // Add this import
import com.fasterxml.jackson.annotation.JsonIgnore; // Highly recommended
import com.fasterxml.jackson.annotation.JsonProperty; // Import this

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String email;

    // 1. Requirement: Role-based access (user vs admin)
    private String role = "USER"; 

    // 2. Requirement: Link to posts
    // JsonIgnore prevents infinite loops when the API sends data to Angular
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Post> posts;

    @ManyToMany
    @JoinTable(
      name = "user_subscriptions",
      joinColumns = @JoinColumn(name = "user_id"),
      inverseJoinColumns = @JoinColumn(name = "following_id")
    )
    private Set<User> following = new HashSet<>();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public void setFollowing(Set<User> following) { this.following = following; }
    
    // New Getters/Setters
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public List<Post> getPosts() { return posts; }
    public void setPosts(List<Post> posts) { this.posts = posts; }
    public Set<User> getFollowing() { return following; }
}