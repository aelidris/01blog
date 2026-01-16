package com.z01;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:4200")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository; // 1. Inject UserRepository

    @GetMapping
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    @PostMapping(consumes = {"multipart/form-data"})
public Post createPost(
    @RequestPart("post") String postJson, 
    @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
    
    // 1. Convert the JSON string back to a Post object
    ObjectMapper objectMapper = new ObjectMapper();
    Post post = objectMapper.readValue(postJson, Post.class);

    // 2. Handle the file (Save it to a folder or as a Byte Array)
    if (file != null && !file.isEmpty()) {
        // For simplicity in a school project, you can save the bytes to the DB
        // or save to a local folder and store the path in mediaUrl
        String fileName = file.getOriginalFilename();
        file.transferTo(new File("/path/to/uploads/" + fileName));
        post.setMediaUrl("/uploads/" + fileName);
    }

    return postRepository.save(post);
}

@PostMapping("/upload")
public Post uploadPost(
    @RequestParam("title") String title,
    @RequestParam("description") String description,
    @RequestParam("username") String username,
    @RequestParam(value = "file", required = false) MultipartFile file) throws IOException { // Add required = false

    Post post = new Post();
    post.setTitle(title);
    post.setDescription(description);
    
    // Only process the file if it exists
    if (file != null && !file.isEmpty()) {
        String uploadDir = System.getProperty("user.dir") + "/uploads/";
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir + fileName);
        Files.copy(file.getInputStream(), filePath);
        
        post.setMediaUrl("http://localhost:8080/uploads/" + fileName);
    } else {
        post.setMediaUrl(null); // No image for this post
    }

    User user = userRepository.findByUsername(username);
    post.setUser(user);

    return postRepository.save(post);
}
}