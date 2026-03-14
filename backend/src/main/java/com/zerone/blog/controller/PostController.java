package com.zerone.blog.controller;

import com.zerone.blog.dto.*;
import com.zerone.blog.entity.User;
import com.zerone.blog.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping("/feed")
    public ResponseEntity<Page<PostDto>> getFeed(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getFeed(user, page, size));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<PostDto>> getUserPosts(
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getUserPosts(userId, currentUser, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDto> getPost(@PathVariable Long id,
                                            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(postService.getPost(id, currentUser));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostDto> createPost(
            @AuthenticationPrincipal User user,
            @RequestParam("description") String description,
            @RequestPart(value = "media", required = false) MultipartFile media) {
        CreatePostRequest request = new CreatePostRequest();
        request.setDescription(description);
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.createPost(user, request, media));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostDto> updatePost(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestParam("description") String description,
            @RequestPart(value = "media", required = false) MultipartFile media) {
        CreatePostRequest request = new CreatePostRequest();
        request.setDescription(description);
        return ResponseEntity.ok(postService.updatePost(user, id, request, media));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@AuthenticationPrincipal User user, @PathVariable Long id) {
        postService.deletePost(user, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<PostDto> toggleLike(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.ok(postService.toggleLike(user, id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDto> addComment(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.addComment(user, id, request));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@AuthenticationPrincipal User user,
                                               @PathVariable Long commentId) {
        postService.deleteComment(user, commentId);
        return ResponseEntity.noContent().build();
    }
}
