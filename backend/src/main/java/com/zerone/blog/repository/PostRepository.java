package com.zerone.blog.repository;

import com.zerone.blog.entity.Post;
import com.zerone.blog.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByAuthorAndHiddenFalseOrderByCreatedAtDesc(User author, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.author IN :authors AND p.hidden = false ORDER BY p.createdAt DESC")
    Page<Post> findFeedPosts(@Param("authors") List<User> authors, Pageable pageable);

    Page<Post> findByHiddenFalseOrderByCreatedAtDesc(Pageable pageable);
}
