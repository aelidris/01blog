package com.zerone.blog.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
@Data
public class CreateReportRequest {
    @NotBlank @Size(max=1000) private String reason;
    private Long reportedUserId;
}
