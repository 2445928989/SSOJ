package com.ssoj.backend.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 题目实体类
 */
@Data
public class Problem {
    private Long id;
    private String title;
    private String descriptionId; // MD 文件的 ID 映射
    private String description; // 仅用于 API 传输，不直接存储在 problem 表中
    private String difficulty;
    private Double timeLimit;
    private Integer memoryLimit;
    private Long authorId;
    private Integer numberOfSubmissions;
    private Integer numberOfAccepted;
    private Integer likes;
    private Integer dislikes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> categories; // 题目的标签列表
    private List<SampleCase> samples; // 题目的样例列表

    // 废弃字段（仅用于迁移兼容性，不再存储在数据库中）
    private String inputFormat;
    private String outputFormat;
    private String sampleInput;
    private String sampleOutput;
    private String sampleExplanation;
}
