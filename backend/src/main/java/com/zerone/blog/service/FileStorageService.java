package com.zerone.blog.service;

import com.zerone.blog.exception.BadRequestException;
import org.apache.tika.Tika; // <--- Zyd Had l-import
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final long MAX_SIZE = 50 * 1024 * 1024L;
    
    private final Tika tika = new Tika();

    public Resource loadFileAsResource(String filename) {
        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath().resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found or not readable: " + filename);
            }
        } catch (Exception e) {
            throw new RuntimeException("File not found: " + filename, e);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) throw new BadRequestException("File is empty");
        if (file.getSize() > MAX_SIZE) throw new BadRequestException("File exceeds 50MB limit");

        String original = file.getOriginalFilename();
        if (original == null || original.isEmpty()) {
            throw new BadRequestException("Invalid file name");
        }

        String lower = original.toLowerCase();
        boolean isJpgOrPng = lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png");
        boolean isMp4 = lower.endsWith(".mp4");

        if (!isJpgOrPng && !isMp4) {
            throw new BadRequestException("Only JPEG, PNG images and MP4 videos are allowed");
        }

        // --- APACHE TIKA CONTENT TYPE VALIDATION ---
        try {
            String detectedType = tika.detect(file.getInputStream());
            
            boolean isValidImage = isJpgOrPng && (detectedType.equals("image/jpeg") || detectedType.equals("image/png"));
            boolean isValidVideo = isMp4 && detectedType.equals("video/mp4");

            if (!isValidImage && !isValidVideo) {
                throw new BadRequestException("File content does not match its extension or format is not supported");
            }
        } catch (IOException e) {
            throw new BadRequestException("Failed to analyze file content");
        }
        // -------------------------------------------

        String ext = lower.substring(lower.lastIndexOf('.'));
        String filename = UUID.randomUUID() + ext;

        try {
            Path dir = Paths.get(uploadDir).toAbsolutePath();
            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }

        return "/uploads/" + filename;
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) return;
        try {
            String filename = fileUrl.replace("/uploads/", "");
            Path path = Paths.get(uploadDir).toAbsolutePath().resolve(filename);
            Files.deleteIfExists(path);
        } catch (IOException ignored) {}
    }
}
