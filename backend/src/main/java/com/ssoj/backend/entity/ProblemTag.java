package com.ssoj.backend.entity;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 题目标签关联表实体类
 */
@Data
public class ProblemTag {
    private Long problemId;
    private Long tagId;
    private LocalDateTime createdAt;
}
