package com.zerone.blog.controller;

import com.zerone.blog.dto.*;
import com.zerone.blog.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ReportService reportService;

    // Users
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/users/{id}/ban")
    public ResponseEntity<UserDto> banUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.banUser(id));
    }

    @PostMapping("/users/{id}/unban")
    public ResponseEntity<UserDto> unbanUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.unbanUser(id));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // Posts
    @GetMapping("/posts")
    public ResponseEntity<Page<PostDto>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getAllPosts(page, size));
    }

    @PostMapping("/posts/{id}/hide")
    public ResponseEntity<PostDto> hidePost(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.hidePost(id));
    }

    @PostMapping("/posts/{id}/unhide")
    public ResponseEntity<PostDto> unhidePost(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.unhidePost(id));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        adminService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    // Reports
    @GetMapping("/reports")
    public ResponseEntity<List<ReportDto>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @PostMapping("/reports/{id}/resolve")
    public ResponseEntity<ReportDto> resolveReport(@PathVariable Long id,
                                                    @RequestParam(defaultValue = "resolve") String action) {
        return ResponseEntity.ok(reportService.resolveReport(id, action));
    }
}
