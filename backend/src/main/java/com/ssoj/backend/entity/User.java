package com.ssoj.backend.entity;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 用户实体类
 */
@Data
public class User {
    private Long id;
    private String username;
    private String nickname;
    private String password;
    private String email;
    private String profile;
    private String avatar;
    private String phone;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 计算字段 - 通过的题目数
    private Integer solved;
    // 计算字段 - 总提交数
    private Integer submissions;
}
