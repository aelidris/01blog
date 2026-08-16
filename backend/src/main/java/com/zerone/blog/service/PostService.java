package com.zerone.blog.service;

import com.zerone.blog.dto.*;
import com.zerone.blog.entity.*;
import com.zerone.blog.exception.*;
import com.zerone.blog.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final MapperService mapperService;
    private final FileStorageService fileStorageService;

    public PostDto createPost(User author, CreatePostRequest request, MultipartFile media) {
        // Reload author with collections to avoid LazyInitializationException
        User fullAuthor = userRepository.findWithCollectionsById(author.getId())
                .orElse(author);

        Post post = Post.builder()
                .description(request.getDescription())
                .author(fullAuthor)
                .build();

        if (media != null && !media.isEmpty()) {
            String url = fileStorageService.storeFile(media);
            post.setMediaUrl(url);
            post.setMediaType(media.getContentType());
        }

        post = postRepository.save(post);

        // Notify subscribers
        Post finalPost = post;
        fullAuthor.getSubscribers().forEach(subscriber -> {
            Notification notif = Notification.builder()
                    .user(subscriber)
                    .post(finalPost)
                    .message(fullAuthor.getUsername() + " published a new post")
                    .build();
            notificationRepository.save(notif);
        });

        return mapperService.toPostDto(post, fullAuthor);
    }

    public PostDto updatePost(User currentUser, Long postId, CreatePostRequest request, MultipartFile media) {
        Post post = findById(postId);
        assertOwner(currentUser, post);

        post.setDescription(request.getDescription());
        post.setUpdatedAt(LocalDateTime.now());

        if (media != null && !media.isEmpty()) {
            if (post.getMediaUrl() != null) fileStorageService.deleteFile(post.getMediaUrl());
            String url = fileStorageService.storeFile(media);
            post.setMediaUrl(url);
            post.setMediaType(media.getContentType());
        }

        User fullUser = userRepository.findWithCollectionsById(currentUser.getId())
                .orElse(currentUser);
        return mapperService.toPostDto(postRepository.save(post), fullUser);
    }

    public void deletePost(User currentUser, Long postId) {
        Post post = findById(postId);
        if (!currentUser.getId().equals(post.getAuthor().getId()) &&
            !currentUser.getRole().name().equals("ADMIN")) {
            throw new UnauthorizedException("Not allowed");
        }
        post.getLikes().clear();
        notificationRepository.deleteByPostId(postId);
        postRepository.saveAndFlush(post);
        if (post.getMediaUrl() != null) fileStorageService.deleteFile(post.getMediaUrl());
        postRepository.delete(post);
    }

    public PostDto getPost(Long postId, User currentUser) {
        Post post = findById(postId);
        User fullUser = currentUser != null
                ? userRepository.findWithCollectionsById(currentUser.getId()).orElse(currentUser)
                : null;
        return mapperService.toPostDto(post, fullUser);
    }

    public Page<PostDto> getFeed(User currentUser, int page, int size) {
        User fullUser = userRepository.findWithCollectionsById(currentUser.getId())
                .orElse(currentUser);
        List<User> authors = new ArrayList<>(fullUser.getSubscriptions());
        authors.add(fullUser);
        Pageable pageable = PageRequest.of(page, size);
        return postRepository.findFeedPosts(authors, pageable)
                .map(p -> mapperService.toPostDto(p, fullUser));
    }

    public Page<PostDto> getUserPosts(Long userId, User currentUser, int page, int size) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User fullCurrentUser = currentUser != null
                ? userRepository.findWithCollectionsById(currentUser.getId()).orElse(currentUser)
                : null;
        Pageable pageable = PageRequest.of(page, size);
        return postRepository.findByAuthorAndHiddenFalseOrderByCreatedAtDesc(author, pageable)
                .map(p -> mapperService.toPostDto(p, fullCurrentUser));
    }

    public PostDto toggleLike(User currentUser, Long postId) {
        Post post = findById(postId);
        if (post.getLikes().contains(currentUser)) {
            post.getLikes().remove(currentUser);
        } else {
            post.getLikes().add(currentUser);
        }
        User fullUser = userRepository.findWithCollectionsById(currentUser.getId())
                .orElse(currentUser);
        return mapperService.toPostDto(postRepository.save(post), fullUser);
    }

    public CommentDto addComment(User currentUser, Long postId, CreateCommentRequest request) {
        Post post = findById(postId);
        Comment comment = Comment.builder()
                .content(request.getContent())
                .author(currentUser)
                .post(post)
                .build();
        User fullUser = userRepository.findWithCollectionsById(currentUser.getId())
                .orElse(currentUser);
        return mapperService.toCommentDto(commentRepository.save(comment), fullUser);
    }

    public void deleteComment(User currentUser, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (!currentUser.getId().equals(comment.getAuthor().getId()) &&
            !currentUser.getRole().name().equals("ADMIN")) {
            throw new UnauthorizedException("Not allowed");
        }
        commentRepository.delete(comment);
    }

    private Post findById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
    }

    private void assertOwner(User user, Post post) {
        if (!user.getId().equals(post.getAuthor().getId()))
            throw new UnauthorizedException("Not the post owner");
    }
}
