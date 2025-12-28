package com.ssoj.backend.entity;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 公告实体类
 */
@Data
public class Announcement {
    private Long id;
    private String title;
    private String content;
    private Long authorId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 显示字段
    private String authorName;
}
