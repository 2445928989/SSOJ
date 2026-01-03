package com.ssoj.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 简单的 Session 鉴权拦截器（教学用）
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        // 允许 OPTIONS 请求（跨域预检）
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();
        // 允许不需要鉴权的路径 (这些路径通常已经在 WebConfig 中排除，这里作为双重保险)
        if (path.equals("/api/user/login") || path.equals("/api/user/register") || path.equals("/api/user/list")
                || path.startsWith("/api/user/avatar/") || path.startsWith("/api/problem/")
                || path.startsWith("/api/tag")
                || path.startsWith("/api/submission") || path.equals("/api/announcement/list")) {
            return true;
        }

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"success\":false,\"message\":\"请先登录\",\"error\":\"Unauthorized\"}");
            return false;
        }
        return true;
    }
}
