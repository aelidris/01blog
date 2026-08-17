package com.zerone.blog.service;

import com.zerone.blog.dto.*;
import com.zerone.blog.entity.*;
import com.zerone.blog.exception.ResourceNotFoundException;
import com.zerone.blog.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final ReportRepository reportRepository;
    private final MapperService mapperService;
    private final FileStorageService fileStorageService;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> mapperService.toUserDto(u, null))
                .collect(Collectors.toList());
    }

    public UserDto banUser(Long userId) {
        User user = findUser(userId);
        user.setBanned(true);
        return mapperService.toUserDto(userRepository.save(user), null);
    }

    public UserDto unbanUser(Long userId) {
        User user = findUser(userId);
        user.setBanned(false);
        return mapperService.toUserDto(userRepository.save(user), null);
    }

    public void deleteUser(Long userId) {
        User user = findUser(userId);
        if (user.getSubscriptions() != null) user.getSubscriptions().clear();
        if (user.getSubscribers() != null) user.getSubscribers().clear();
        commentRepository.deleteByAuthor(user);
        reportRepository.deleteByReporter(user);
        reportRepository.deleteByReportedUser(user);
        List<Post> allPosts = postRepository.findAll();
        for (Post post : allPosts) {
            if (post.getLikes() != null && post.getLikes().remove(user)) {
                postRepository.save(post);
            }
        }
        userRepository.save(user);
        userRepository.delete(user);
    }

    public Page<PostDto> getAllPosts(int page, int size) {
        return postRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(p -> mapperService.toPostDto(p, null));
    }

    public PostDto hidePost(Long postId) {
        Post post = findPost(postId);
        post.setHidden(true);
        return mapperService.toPostDto(postRepository.save(post), null);
    }

    public PostDto unhidePost(Long postId) {
        Post post = findPost(postId);
        post.setHidden(false);
        return mapperService.toPostDto(postRepository.save(post), null);
    }

    public void deletePost(Long postId) {
        Post post = findPost(postId);
        if (post.getMediaUrl() != null) fileStorageService.deleteFile(post.getMediaUrl());
        postRepository.delete(post);
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Post findPost(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
    }
}
