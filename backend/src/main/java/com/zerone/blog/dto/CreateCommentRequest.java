package com.zerone.blog.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
@Data
public class CreateCommentRequest {
    @NotBlank @Size(max=1000) private String content;
}
