package com.zerone.blog.service;

import com.zerone.blog.dto.*;
import com.zerone.blog.entity.*;
import com.zerone.blog.exception.*;
import com.zerone.blog.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final MapperService mapperService;
    private final FileStorageService fileStorageService;

    public UserDto getProfile(Long userId, User currentUser) {
        User user = findWithCollections(userId);
        User fullCurrent = currentUser != null ? findWithCollections(currentUser.getId()) : null;
        return mapperService.toUserDto(user, fullCurrent);
    }

    public UserDto getProfileByUsername(String username, User currentUser) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User fullCurrent = currentUser != null ? findWithCollections(currentUser.getId()) : null;
        return mapperService.toUserDto(user, fullCurrent);
    }

    public UserDto updateProfile(User currentUser, UpdateProfileRequest request) {
        currentUser.setBio(request.getBio());
        userRepository.save(currentUser);
        return mapperService.toUserDto(findWithCollections(currentUser.getId()), null);
    }

    public UserDto updateAvatar(User currentUser, MultipartFile file) {
        if (currentUser.getAvatarUrl() != null) {
            fileStorageService.deleteFile(currentUser.getAvatarUrl());
        }
        String url = fileStorageService.storeFile(file);
        currentUser.setAvatarUrl(url);
        userRepository.save(currentUser);
        return mapperService.toUserDto(findWithCollections(currentUser.getId()), null);
    }

    public void subscribe(User subscriber, Long targetId) {
        User fullSubscriber = findWithCollections(subscriber.getId());
        User target = findWithCollections(targetId);
        if (fullSubscriber.getId().equals(targetId))
            throw new BadRequestException("Cannot subscribe to yourself");
        fullSubscriber.getSubscriptions().add(target);
        userRepository.save(fullSubscriber);
    }

    public void unsubscribe(User subscriber, Long targetId) {
        User fullSubscriber = findWithCollections(subscriber.getId());
        User target = findWithCollections(targetId);
        fullSubscriber.getSubscriptions().remove(target);
        userRepository.save(fullSubscriber);
    }

    public List<UserDto> getSubscriptions(Long userId, User currentUser) {
        User user = findWithCollections(userId);
        User fullCurrent = currentUser != null ? findWithCollections(currentUser.getId()) : null;
        return user.getSubscriptions().stream()
                .map(u -> mapperService.toUserDto(findWithCollections(u.getId()), fullCurrent))
                .collect(Collectors.toList());
    }

    public List<UserDto> getSubscribers(Long userId, User currentUser) {
        User user = findWithCollections(userId);
        User fullCurrent = currentUser != null ? findWithCollections(currentUser.getId()) : null;
        return user.getSubscribers().stream()
                .map(u -> mapperService.toUserDto(findWithCollections(u.getId()), fullCurrent))
                .collect(Collectors.toList());
    }

    public List<UserDto> searchUsers(String query, User currentUser) {
        User fullCurrent = currentUser != null ? findWithCollections(currentUser.getId()) : null;
        return userRepository.searchUsers(query).stream()
                .map(u -> mapperService.toUserDto(findWithCollections(u.getId()), fullCurrent))
                .collect(Collectors.toList());
    }

    public List<UserDto> browseUsers(User currentUser) {
        User fullCurrent = findWithCollections(currentUser.getId());
        return userRepository.findAllExcept(currentUser.getId()).stream()
                .map(u -> mapperService.toUserDto(findWithCollections(u.getId()), fullCurrent))
                .collect(Collectors.toList());
    }

    public List<NotificationDto> getNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(mapperService::toNotificationDto)
                .collect(Collectors.toList());
    }

    public long countUnreadNotifications(User user) {
        return notificationRepository.countByUserAndReadFalse(user);
    }

    public void markNotificationsRead(User user) {
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    private User findWithCollections(Long id) {
        return userRepository.findWithCollectionsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
