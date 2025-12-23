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
        // 允许不需要鉴权的路径
        String path = request.getRequestURI();
        if (path.equals("/api/user/login") || path.equals("/api/user/register") || path.equals("/api/user/list")
                || path.startsWith("/api/user/") || path.startsWith("/api/problem") || path.startsWith("/api/tag")
                || path.startsWith("/api/submission")) {
            return true;
        }

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Unauthorized");
            return false;
        }
        return true;
    }
}
