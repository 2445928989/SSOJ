package com.ssoj.backend.entity;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 标签实体类
 */
@Data
public class Tag {
    private Long id;
    private String name;
    private String color;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
