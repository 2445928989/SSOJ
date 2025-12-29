package com.ssoj.backend.entity;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 提交记录实体类
 */
@Data
public class Submission {
    private Long id;
    private Long userId;
    private Long problemId;
    private String code;
    private String language;
    private String status;
    private Integer maxTimeUsed;
    private Integer maxMemoryUsed;
    private String errorMessage;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 用于显示的额外信息（不存储在数据库）
    private String username; // 用户名
    private String nickname; // 昵称
    private String problemTitle; // 题目标题
}
