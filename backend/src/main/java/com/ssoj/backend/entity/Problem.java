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
    private String description;
    private String inputFormat;
    private String outputFormat;
    private String sampleInput;
    private String sampleOutput;
    private String sampleExplanation; // 样例说明
    private String difficulty;
    private Double timeLimit;
    private Integer memoryLimit;
    private Long authorId;
    private Integer numberOfSubmissions;
    private Integer numberOfAccepted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> categories; // 题目的标签列表
}
