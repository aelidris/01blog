package com.zerone.blog.service;

import com.zerone.blog.dto.*;
import com.zerone.blog.entity.*;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class MapperService {

    public UserDto toUserDto(User user, User currentUser) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setBio(user.getBio());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setRole(user.getRole());
        dto.setBanned(user.isBanned());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setSubscriberCount(user.getSubscribers().size());
        dto.setSubscriptionCount(user.getSubscriptions().size());
        if (currentUser != null) {
            dto.setSubscribedByCurrentUser(
                currentUser.getSubscriptions().stream().anyMatch(u -> u.getId().equals(user.getId()))
            );
        }
        return dto;
    }

    public PostDto toPostDto(Post post, User currentUser) {
        PostDto dto = new PostDto();
        dto.setId(post.getId());
        dto.setDescription(post.getDescription());
        dto.setMediaUrl(post.getMediaUrl());
        dto.setMediaType(post.getMediaType());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        dto.setAuthor(toUserDto(post.getAuthor(), currentUser));
        dto.setLikeCount(post.getLikeCount());
        dto.setHidden(post.isHidden());
        if (currentUser != null) {
            dto.setLikedByCurrentUser(
                post.getLikes().stream().anyMatch(u -> u.getId().equals(currentUser.getId()))
            );
        }
        dto.setComments(post.getComments().stream()
            .map(c -> toCommentDto(c, currentUser))
            .collect(Collectors.toList()));
        return dto;
    }

    public CommentDto toCommentDto(Comment comment, User currentUser) {
        CommentDto dto = new CommentDto();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setAuthor(toUserDto(comment.getAuthor(), currentUser));
        return dto;
    }

    public ReportDto toReportDto(Report report) {
        ReportDto dto = new ReportDto();
        dto.setId(report.getId());
        dto.setReason(report.getReason());
        dto.setStatus(report.getStatus());
        dto.setCreatedAt(report.getCreatedAt());
        dto.setReporter(toUserDto(report.getReporter(), null));
        if (report.getReportedUser() != null) {
            dto.setReportedUser(toUserDto(report.getReportedUser(), null));
        }
        return dto;
    }

    public NotificationDto toNotificationDto(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setMessage(notification.getMessage());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        if (notification.getPost() != null) {
            dto.setPostId(notification.getPost().getId());
        }
        return dto;
    }
}
