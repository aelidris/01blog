package com.zerone.blog.repository;

import com.zerone.blog.entity.Report;
import com.zerone.blog.entity.User;
import com.zerone.blog.enums.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status);
    List<Report> findAllByOrderByCreatedAtDesc();
    void deleteByReporter(User reporter);
    void deleteByReportedUser(User reportedUser);
}
