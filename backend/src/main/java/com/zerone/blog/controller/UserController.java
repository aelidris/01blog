package com.zerone.blog.controller;

import com.zerone.blog.dto.*;
import com.zerone.blog.entity.User;
import com.zerone.blog.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getProfile(user.getId(), user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateProfile(@AuthenticationPrincipal User user,
                                                  @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(user, request));
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<UserDto> updateAvatar(@AuthenticationPrincipal User user,
                                                 @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.updateAvatar(user, file));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id,
                                            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.getProfile(id, currentUser));
    }

    @GetMapping("/username/{username}/block")
    public ResponseEntity<UserDto> getBlock(@PathVariable String username,
                                             @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.getProfileByUsername(username, currentUser));
    }

    // Discover/search users
    @GetMapping("/explore")
    public ResponseEntity<List<UserDto>> browseUsers(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.browseUsers(user));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUsers(@RequestParam("q") String query,
                                                      @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.searchUsers(query, currentUser));
    }

    @PostMapping("/{id}/subscribe")
    public ResponseEntity<Void> subscribe(@AuthenticationPrincipal User user, @PathVariable Long id) {
        userService.subscribe(user, id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/subscribe")
    public ResponseEntity<Void> unsubscribe(@AuthenticationPrincipal User user, @PathVariable Long id) {
        userService.unsubscribe(user, id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/subscriptions")
    public ResponseEntity<List<UserDto>> getSubscriptions(@PathVariable Long id,
                                                           @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.getSubscriptions(id, currentUser));
    }

    @GetMapping("/{id}/subscribers")
    public ResponseEntity<List<UserDto>> getSubscribers(@PathVariable Long id,
                                                         @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.getSubscribers(id, currentUser));
    }

    @GetMapping("/me/notifications")
    public ResponseEntity<List<NotificationDto>> getNotifications(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getNotifications(user));
    }

    @GetMapping("/me/notifications/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("count", userService.countUnreadNotifications(user)));
    }

    @PostMapping("/me/notifications/read")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal User user) {
        userService.markNotificationsRead(user);
        return ResponseEntity.ok().build();
    }
}
