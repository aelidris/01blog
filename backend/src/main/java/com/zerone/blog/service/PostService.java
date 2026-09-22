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

    public PostDto updatePost(User currentUser, Long postId, CreatePostRequest request, MultipartFile media, boolean removeMedia) {
        Post post = findById(postId);
        assertPostAccessible(post, currentUser);
        assertOwner(currentUser, post);

        post.setDescription(request.getDescription());
        post.setUpdatedAt(LocalDateTime.now());

        if (removeMedia) {
            if (post.getMediaUrl() != null) {
                fileStorageService.deleteFile(post.getMediaUrl());
                post.setMediaUrl(null);
                post.setMediaType(null);
            }
        }

        if (media != null && !media.isEmpty()) {
            if (post.getMediaUrl() != null) {
                fileStorageService.deleteFile(post.getMediaUrl());
            }
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
        assertPostAccessible(post, currentUser);

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
        assertPostAccessible(post, currentUser);
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
        assertPostAccessible(post, currentUser);
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
        assertPostAccessible(post, currentUser);
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

    private void assertPostAccessible(Post post, User currentUser) {
        // Check if the post is hidden
        if (post.isHidden()) {
            boolean isAdmin = currentUser != null && "ADMIN".equals(currentUser.getRole().name());
            if (!isAdmin) {
                throw new UnauthorizedException("This post is hidden and unavailable.");
            }
        }

        // Check if subscription or ownership is required to view the post
        if (currentUser == null) {
            throw new UnauthorizedException("Authentication required");
        }

        boolean isAuthor = currentUser.getId().equals(post.getAuthor().getId());
        boolean isAdmin = "ADMIN".equals(currentUser.getRole().name());
        
        // Reload current user with collections to check subscriptions accurately
        User fullCurrent = userRepository.findWithCollectionsById(currentUser.getId())
                .orElse(currentUser);
        
        boolean isSubscribed = fullCurrent.getSubscriptions().contains(post.getAuthor());

        // If they aren't the author, admin, or a subscriber, block access (Throws 403)
        if (!isAuthor && !isAdmin && !isSubscribed) {
            throw new UnauthorizedException("You must subscribe to this user to view their posts.");
        }
    }
}