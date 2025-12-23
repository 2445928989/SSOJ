package com.ssoj.backend.entity;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 测试用例实体类
 */
@Data
public class TestCase {
    private Long id;
    private Long problemId;
    private String inputPath;
    private String outputPath;
    private Boolean isSample;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
