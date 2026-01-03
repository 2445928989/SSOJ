package com.ssoj.backend.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Discussion {
    private Long id;
    private Long problemId;
    private Long userId;
    private Long parentId;
    private String title;
    private String content;
    private Integer likes;
    private Integer dislikes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 额外字段，用于前端显示
    private String username;
    private String nickname;
    private String avatar;
    private String problemTitle;

    // 子回复列表
    private Integer repliesCount;
    private List<Discussion> replies;
}
