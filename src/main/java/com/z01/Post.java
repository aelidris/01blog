package com.z01;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "POSTS")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private String mediaUrl; // For images or videos
    private LocalDateTime timestamp; // Required by the subject

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // Links the post to a specific user

    // Constructors
    public Post() {
        this.timestamp = LocalDateTime.now(); // Set time automatically
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}