package com.zerone.blog.dto;
import com.zerone.blog.enums.ReportStatus;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class ReportDto {
    private Long id;
    private String reason;
    private ReportStatus status;
    private LocalDateTime createdAt;
    private UserDto reporter;
    private UserDto reportedUser;
}
