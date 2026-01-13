package com.z01;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // This allows us to check if a username already exists later
    User findByUsername(String username);
}