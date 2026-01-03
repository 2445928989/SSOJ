package com.ssoj.backend.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Vote {
    private Long id;
    private Long userId;
    private String type; // PROBLEM or DISCUSSION
    private Long targetId;
    private Integer voteType; // 1 for up, -1 for down
    private LocalDateTime createdAt;
}
