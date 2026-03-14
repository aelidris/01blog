package com.zerone.blog.service;

import com.zerone.blog.dto.*;
import com.zerone.blog.entity.*;
import com.zerone.blog.enums.ReportStatus;
import com.zerone.blog.exception.ResourceNotFoundException;
import com.zerone.blog.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final MapperService mapperService;

    public ReportDto createReport(User reporter, CreateReportRequest request) {
        User reported = userRepository.findById(request.getReportedUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Reported user not found"));

        Report report = Report.builder()
                .reason(request.getReason())
                .reporter(reporter)
                .reportedUser(reported)
                .build();

        return mapperService.toReportDto(reportRepository.save(report));
    }

    public List<ReportDto> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(mapperService::toReportDto)
                .collect(Collectors.toList());
    }

    public ReportDto resolveReport(Long reportId, String action) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        report.setStatus("dismiss".equalsIgnoreCase(action)
                ? ReportStatus.DISMISSED : ReportStatus.RESOLVED);
        return mapperService.toReportDto(reportRepository.save(report));
    }
}
