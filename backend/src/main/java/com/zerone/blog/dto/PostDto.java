package com.zerone.blog.dto;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
@Data
public class PostDto {
    private Long id;
    private String description;
    private String mediaUrl;
    private String mediaType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserDto author;
    private int likeCount;
    private boolean likedByCurrentUser;
    private List<CommentDto> comments;
    private boolean hidden;
}
