package com.z01;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

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

    @PostMapping
public Post createPost(@RequestBody Post post) {
    User existingUser = userRepository.findByUsername(post.getUser().getUsername());
    if (existingUser != null) {
        post.setUser(existingUser);
        return postRepository.save(post); // This saved object includes the user
    }
    return null; 
}
}