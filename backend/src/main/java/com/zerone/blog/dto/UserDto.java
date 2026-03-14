package com.zerone.blog.dto;
import com.zerone.blog.enums.Role;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String bio;
    private String avatarUrl;
    private Role role;
    private boolean banned;
    private LocalDateTime createdAt;
    private int subscriberCount;
    private int subscriptionCount;
    private boolean subscribedByCurrentUser;
}
