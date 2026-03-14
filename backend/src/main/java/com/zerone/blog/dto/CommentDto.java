package com.zerone.blog.dto;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class CommentDto {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private UserDto author;
}
