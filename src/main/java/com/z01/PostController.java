package com.z01;

import org.springframework.http.ResponseEntity; // Fixes "cannot find symbol: class ResponseEntity"
import java.util.Set;     // Fixes "cannot find symbol: class Set"
import java.util.HashSet; // Fixes "cannot find symbol: class HashSet"
import java.util.ArrayList; // Good to have for empty list returns
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
    @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {

    Post post = new Post();
    post.setTitle(title);
    post.setDescription(description);
    
    if (file != null && !file.isEmpty()) {
        // Use the project's root directory
        String uploadDir = System.getProperty("user.dir") + "/uploads/";
        File directory = new File(uploadDir);
        
        // Create the folder if it doesn't exist to prevent the 500 error
        if (!directory.exists()) {
            directory.mkdirs();
        }
        
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir + fileName);
        Files.copy(file.getInputStream(), filePath);
        
        post.setMediaUrl("http://localhost:8080/uploads/" + fileName);
    }

    User user = userRepository.findByUsername(username);
    post.setUser(user);

    return postRepository.save(post);
}

@PostMapping("/{username}/follow")
public ResponseEntity<?> followUser(@PathVariable String username, @RequestParam String currentUsername) {
    User userToFollow = userRepository.findByUsername(username);
    User currentUser = userRepository.findByUsername(currentUsername);

    if (userToFollow != null && currentUser != null) {
        currentUser.getFollowing().add(userToFollow);
        userRepository.save(currentUser);
        return ResponseEntity.ok("Followed successfully");
    }
    return ResponseEntity.badRequest().body("User not found");
}

@GetMapping("/following/{username}")
public ResponseEntity<Set<User>> getFollowing(@PathVariable String username) {
    User user = userRepository.findByUsername(username);
    if (user != null) {
        // This returns the set of users that 'username' follows
        return ResponseEntity.ok(user.getFollowing());
    }
    return ResponseEntity.notFound().build();
}

@PostMapping("/{username}/unfollow")
public ResponseEntity<?> unfollowUser(@PathVariable String username, @RequestParam String currentUsername) {
    User userToUnfollow = userRepository.findByUsername(username);
    User currentUser = userRepository.findByUsername(currentUsername);

    if (userToUnfollow != null && currentUser != null) {
        currentUser.getFollowing().remove(userToUnfollow); // Remove the user from the set
        userRepository.save(currentUser);
        return ResponseEntity.ok("Unfollowed successfully");
    }
    return ResponseEntity.badRequest().body("User not found");
}

@GetMapping("/feed/{username}")
public List<Post> getSubscribedFeed(@PathVariable String username) {
    User currentUser = userRepository.findByUsername(username);
    if (currentUser == null) return new ArrayList<>();

    Set<User> following = currentUser.getFollowing();
    
    // If the user isn't following anyone yet, show an empty list or their own posts
    if (following.isEmpty()) {
        // Option: return postRepository.findByUser(currentUser); 
        return new ArrayList<>();
    }

    return postRepository.findByUserInOrderByTimestampDesc(following);
}
}