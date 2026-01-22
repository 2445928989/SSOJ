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
    private String hint; // 样例解释或提示
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
}
