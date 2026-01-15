package com.z01;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    // Find all posts by a specific user for their "Profile/Block" page
    List<Post> findByUserId(Long userId);
}