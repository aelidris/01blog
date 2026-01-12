package com.z01;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:4200")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @GetMapping("/test")
    public List<Post> test() {
        // This will create a post in the DB every time you refresh!
        Post newPost = new Post();
        newPost.setTitle("First Blog Post");
        newPost.setContent("This is saved in H2 Database!");
        postRepository.save(newPost);

        // Return all posts from the DB
        return postRepository.findAll();
    }
}