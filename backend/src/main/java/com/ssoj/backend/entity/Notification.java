package com.ssoj.backend.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Notification {
    private Long id;
    private Long receiverId;
    private Long senderId;
    private String type; // REPLY, FOLLOW
    private Long targetId;
    private String content;
    private Boolean isRead;
    private LocalDateTime createdAt;

    // 辅助字段，用于前端显示
    private String senderNickname;
    private String senderAvatar;
}
