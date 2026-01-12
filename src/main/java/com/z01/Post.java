package com.z01;

import jakarta.persistence.*;

@Entity // This tells Spring: "Create a table for this class"
@Table(name = "posts") // This specifies the table name
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String content;

    // Standard Getters and Setters (Important!)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}