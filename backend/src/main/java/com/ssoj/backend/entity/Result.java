package com.ssoj.backend.entity;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 测试结果实体类（单个提交对应单个测试点的运行结果）
 */
@Data
public class Result {
    private Long id;
    private Long submissionId;
    private Long testCaseId;
    private String status; // AC/WA/TLE/MLE/RE/CE等
    private String errorMessage; // 编译/运行错误信息
    private Integer timeUsed; // 运行时间(ms)
    private Integer memoryUsed; // 内存使用(KB)
    private LocalDateTime createdAt;

    // 显示字段（不持久化，从 TestCase 表 JOIN 获取）
    private String input; // 测试用例输入路径
    private String expectedOutput; // 期望输出路径
    private String output; // 实际输出路径

    private String inputContent;
    private String expectedOutputContent;
    private String actualOutputContent;
}
