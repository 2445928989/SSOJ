package com.ssoj.backend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * JWT Token 工具类
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret:ssoj_secret_key_change_in_production}")
    private String secret;

    @Value("${jwt.expiration:86400000}") // 默认 24 小时
    private Long expiration;

    // TODO: 实现 JWT 生成和验证

    /**
     * 生成 JWT Token
     * 
     * @param userId   用户ID
     * @param username 用户名
     * @return JWT token 字符串
     */
    public String generateToken(Long userId, String username) {
        // TODO: 使用 io.jsonwebtoken.Jwts 生成 token
        // return Jwts.builder()
        // .setSubject(userId.toString())
        // .claim("username", username)
        // .setIssuedAt(new Date())
        // .setExpiration(new Date(System.currentTimeMillis() + expiration))
        // .signWith(SignatureAlgorithm.HS512, secret)
        // .compact();
        return null;
    }

    /**
     * 从 token 中获取用户ID
     */
    public Long getUserIdFromToken(String token) {
        // TODO: 解析 token
        // Claims claims = Jwts.parser()
        // .setSigningKey(secret)
        // .parseClaimsJws(token)
        // .getBody();
        // return Long.parseLong(claims.getSubject());
        return null;
    }

    /**
     * 验证 token 是否有效
     */
    public boolean validateToken(String token) {
        // TODO: 验证签名和过期时间
        try {
            // Jwts.parser().setSigningKey(secret).parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 从 token 获取 Claims
     */
    public Claims getClaimsFromToken(String token) {
        // TODO
        return null;
    }
}
