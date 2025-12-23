package com.ssoj.backend.controller;

import com.ssoj.backend.entity.User;
import com.ssoj.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 用户相关 REST API
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    // TODO: 实现以下 API

    /**
     * POST /api/user/register
     * 用户注册
     * Request Body: {username, password, email}
     * Response: {success, message, data}
     */
    @PostMapping("/register")
    public Object register(@RequestBody java.util.Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String email = request.get("email");
        User user = userService.register(username, password, email);
        user.setPassword(null);
        return java.util.Map.of("success", true, "user", user);
    }

    /**
     * POST /api/user/login
     * 用户登录
     * Request Body: {username, password}
     * Response: {success, user}
     */
    @PostMapping("/login")
    public Object login(@RequestBody java.util.Map<String, String> request,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        String username = request.get("username");
        String password = request.get("password");
        User user = userService.login(username, password);
        // 在 session 中存 userId
        jakarta.servlet.http.HttpSession session = httpRequest.getSession(true);
        session.setAttribute("userId", user.getId());
        user.setPassword(null);
        return java.util.Map.of("success", true, "user", user);
    }

    /**
     * GET /api/user/profile
     * 获取当前用户信息（需要登录）
     */
    @GetMapping("/profile")
    public User getProfile(jakarta.servlet.http.HttpServletRequest httpRequest) {
        jakarta.servlet.http.HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            throw new RuntimeException("未登录");
        }
        Long userId = (Long) session.getAttribute("userId");
        User user = userService.getUserById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        user.setPassword(null);
        return user;
    }

    /**
     * PUT /api/user/profile
     * 更新用户个人资料
     */
    @PutMapping("/profile")
    public Object updateProfile(@RequestBody java.util.Map<String, String> request,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        jakarta.servlet.http.HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            throw new RuntimeException("未登录");
        }
        Long userId = (Long) session.getAttribute("userId");

        String nickname = request.get("nickname");
        String phone = request.get("phone");
        String profile = request.get("profile");

        boolean ok = userService.updateProfile(userId, nickname, phone, profile);
        return java.util.Map.of("success", ok);
    }

    @PostMapping("/logout")
    public Object logout(jakarta.servlet.http.HttpServletRequest httpRequest) {
        jakarta.servlet.http.HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return java.util.Map.of("success", true);
    }

    /**
     * GET /api/user/list
     * 获取所有用户列表（公开，用于排行榜）
     * 返回 {data: [user1, user2, ...], total: count}
     */
    @GetMapping("/list")
    public Object listUsers(@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int size) {
        java.util.List<User> users = userService.getAllUsers();
        users.forEach(u -> u.setPassword(null));

        int total = users.size();
        int start = (page - 1) * size;
        int end = Math.min(start + size, users.size());
        java.util.List<User> paged = users.subList(start, end);

        return java.util.Map.of("data", paged, "total", total);
    }

    /**
     * GET /api/user/{userId}
     * 获取指定用户信息（公开，无需登录）
     */
    @GetMapping("/{userId}")
    public User getUserById(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        user.setPassword(null);
        return user;
    }

    /**
     * GET /api/user/{userId}/submission-heatmap
     * 获取指定用户的做题热力图数据（公开，无需登录）
     * 返回 {yyyy-MM-dd: count, ...}
     */
    @GetMapping("/{userId}/submission-heatmap")
    public Object getUserSubmissionHeatmap(@PathVariable Long userId) {
        java.util.Map<String, Integer> heatmap = userService.getSubmissionHeatmap(userId);
        return java.util.Map.of("data", heatmap);
    }

    /**
     * GET /api/user/solved-problems
     * 获取当前用户已通过的题目ID列表（需要登录）
     */
    @GetMapping("/solved-problems")
    public Object getSolvedProblems(jakarta.servlet.http.HttpServletRequest httpRequest) {
        jakarta.servlet.http.HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            // 未登录返回空列表
            return java.util.Map.of("data", java.util.Collections.emptyList());
        }
        Long userId = (Long) session.getAttribute("userId");
        java.util.List<Long> solvedProblemIds = userService.getSolvedProblems(userId);
        return java.util.Map.of("data", solvedProblemIds);
    }

    /**
     * GET /api/user/submission-heatmap
     * 获取用户最近365天的做题热力图数据（需要登录）
     * 返回 {yyyy-MM-dd: count, ...}
     */
    @GetMapping("/submission-heatmap")
    public Object getSubmissionHeatmap(jakarta.servlet.http.HttpServletRequest httpRequest) {
        jakarta.servlet.http.HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            throw new RuntimeException("未登录");
        }
        Long userId = (Long) session.getAttribute("userId");
        java.util.Map<String, Integer> heatmap = userService.getSubmissionHeatmap(userId);
        return java.util.Map.of("data", heatmap);
    }
}
