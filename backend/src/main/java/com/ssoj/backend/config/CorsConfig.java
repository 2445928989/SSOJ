package com.ssoj.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 跨域配置
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    // TODO: 配置跨域策略

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // TODO: 实现跨域配置
        // registry.addMapping("/api/**")
        // .allowedOrigins("http://localhost:5173") // 前端地址
        // .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
        // .allowedHeaders("*")
        // .allowCredentials(true)
        // .maxAge(3600);
    }
}
