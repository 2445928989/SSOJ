package com.ssoj.backend.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SampleCase {
    private Long id;
    private Long problemId;
    private String inputText;
    private String outputText;
    private Integer orderNum;
    private LocalDateTime createdAt;
}
