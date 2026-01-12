package com.z01;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // JpaRepository already has methods like .save(), .findAll(), and .delete()
}