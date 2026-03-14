package com.zerone.blog.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
@Data
public class CreatePostRequest {
    @NotBlank @Size(max=2000) private String description;
}
