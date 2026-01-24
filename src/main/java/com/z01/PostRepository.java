package com.z01;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Set;

public interface PostRepository extends JpaRepository<Post, Long> {
    // This tells Spring to find posts where the user field matches anyone in the 'users' set
    // It also sorts them by timestamp so newest posts appear first
    List<Post> findByUserInOrderByTimestampDesc(Set<User> users);
}