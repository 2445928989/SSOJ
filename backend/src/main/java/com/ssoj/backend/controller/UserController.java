package com.ssoj.backend.controller;

import com.ssoj.backend.entity.User;
import com.ssoj.backend.service.UserService;
import com.ssoj.backend.service.EmailService;
import com.ssoj.backend.service.VerificationCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.io.File;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * 用户相关 REST API
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private VerificationCodeService verificationCodeService;

    @org.springframework.beans.factory.annotation.Value("${upload.path}")
    private String uploadPath;

    /**
     * POST /api/user/upload-avatar
     * 上传头像
     */
    @PostMapping("/upload-avatar")
    public Object uploadAvatar(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return Map.of("success", false, "message", "未登录");
        }
        Long userId = (Long) session.getAttribute("userId");

        if (file.isEmpty()) {
            return Map.of("success", false, "message", "文件不能为空");
        }

        try {
            // 确保目录存在
            File dir = new File(uploadPath);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // 生成文件名: userId_timestamp.ext
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = userId + "_" + System.currentTimeMillis() + extension;
            File dest = new File(uploadPath + filename);
            file.transferTo(dest);

            // 更新数据库
            String avatarUrl = "/api/user/avatar/" + filename;
            userService.updateAvatar(userId, avatarUrl);

            return Map.of("success", true, "url", avatarUrl);
        } catch (Exception e) {
            return Map.of("success", false, "message", "上传失败: " + e.getMessage());
        }
    }

    /**
     * POST /api/user/upload-background
     * 上传背景图
     */
    @PostMapping("/upload-background")
    public Object uploadBackground(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return Map.of("success", false, "message", "未登录");
        }
        Long userId = (Long) session.getAttribute("userId");

        if (file.isEmpty()) {
            return Map.of("success", false, "message", "文件不能为空");
        }

        try {
            // 确保目录存在
            File dir = new File(uploadPath);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // 生成文件名: bg_userId_timestamp.ext
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = "bg_" + userId + "_" + System.currentTimeMillis() + extension;
            File dest = new File(uploadPath + filename);
            file.transferTo(dest);

            // 更新数据库
            String backgroundUrl = "/api/user/avatar/" + filename; // 复用 avatar 的路径映射
            userService.updateBackgroundImage(userId, backgroundUrl);

            return Map.of("success", true, "url", backgroundUrl);
        } catch (Exception e) {
            return Map.of("success", false, "message", "上传失败: " + e.getMessage());
        }
    }

    /**
     * POST /api/user/send-code
     * 发送注册验证码
     */
    @PostMapping("/send-code")
    public Object sendCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || !email.contains("@")) {
            return Map.of("success", false, "message", "无效的邮箱地址");
        }
        String code = verificationCodeService.generateCode(email);
        try {
            emailService.sendVerificationCode(email, code);
            return Map.of("success", true, "message", "验证码已发送");
        } catch (Exception e) {
            return Map.of("success", false, "message", "发送失败: " + e.getMessage());
        }
    }

    /**
     * POST /api/user/send-reset-code
     * 发送重置密码验证码
     */
    @PostMapping("/send-reset-code")
    public Object sendResetCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || !email.contains("@")) {
            return Map.of("success", false, "message", "无效的邮箱地址");
        }
        String code = verificationCodeService.generateCode(email);
        try {
            emailService.sendVerificationCode(email, code);
            return Map.of("success", true, "message", "验证码已发送");
        } catch (Exception e) {
            return Map.of("success", false, "message", "发送失败: " + e.getMessage());
        }
    }

    /**
     * POST /api/user/reset-password
     * 重置密码
     */
    @PostMapping("/reset-password")
    public Object resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        String newPassword = request.get("newPassword");

        if (!verificationCodeService.verifyCode(email, code)) {
            return Map.of("success", false, "message", "验证码错误或已过期");
        }

        try {
            userService.resetPassword(email, newPassword);
            return Map.of("success", true, "message", "密码重置成功");
        } catch (Exception e) {
            return Map.of("success", false, "message", e.getMessage());
        }
    }

    /**
     * POST /api/user/register
     * 用户注册
     * Request Body: {username, password, email, code}
     * Response: {success, message, data}
     */
    @PostMapping("/register")
    public Object register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String email = request.get("email");
        String code = request.get("code");

        if (!verificationCodeService.verifyCode(email, code)) {
            return Map.of("success", false, "message", "验证码错误或已过期");
        }

        User user = userService.register(username, password, email);
        user.setPassword(null);
        return Map.of("success", true, "user", user);
    }

    /**
     * POST /api/user/login
     * 用户登录
     * Request Body: {username, password}
     * Response: {success, user}
     */
    @PostMapping("/login")
    public Object login(@RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        String identifier = request.get("username"); // 保持 key 为 username 以兼容前端，但逻辑上是 identifier
        String password = request.get("password");
        User user = userService.login(identifier, password);
        // 在 session 中存 userId
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute("userId", user.getId());
        user.setPassword(null);
        return Map.of("success", true, "user", user);
    }

    /**
     * GET /api/user/profile
     * 获取当前用户信息（需要登录）
     */
    @GetMapping("/profile")
    public Object getProfile(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return org.springframework.http.ResponseEntity.status(401).body(Map.of("error", "未登录"));
        }
        Long userId = (Long) session.getAttribute("userId");
        User user = userService.getUserById(userId);
        if (user == null) {
            return org.springframework.http.ResponseEntity.status(404).body(Map.of("error", "用户不存在"));
        }
        user.setPassword(null);
        return user;
    }

    /**
     * PUT /api/user/profile
     * 更新用户个人资料
     */
    @PutMapping("/profile")
    public Object updateProfile(@RequestBody Map<String, String> request,
            HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "未登录");
        }
        Long userId = (Long) session.getAttribute("userId");

        String nickname = request.get("nickname");
        String phone = request.get("phone");
        String profile = request.get("profile");

        boolean ok = userService.updateProfile(userId, nickname, phone, profile);
        return Map.of("success", ok);
    }

    /**
     * PUT /api/user/change-password
     * 修改密码
     */
    @PutMapping("/change-password")
    public Object changePassword(@RequestBody Map<String, String> request,
            HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "未登录");
        }
        Long userId = (Long) session.getAttribute("userId");

        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        try {
            boolean ok = userService.changePassword(userId, oldPassword, newPassword);
            return Map.of("success", ok);
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public Object logout(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return Map.of("success", true);
    }

    /**
     * GET /api/user/list
     * 获取所有用户列表（公开，用于排行榜）
     * 返回 {data: [user1, user2, ...], total: count}
     */
    @GetMapping("/list")
    public Object listUsers(@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int size) {
        List<User> users = userService.getAllUsers();
        users.forEach(u -> {
            u.setPassword(null);
            u.setEmail(null);
            u.setPhone(null);
        });

        int total = users.size();
        int start = (page - 1) * size;
        int end = Math.min(start + size, users.size());
        List<User> paged = users.subList(start, end);

        return Map.of("data", paged, "total", total);
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
        user.setEmail(null);
        user.setPhone(null);
        return user;
    }

    /**
     * GET /api/user/{userId}/submission-heatmap
     * 获取指定用户的做题热力图数据（公开，无需登录）
     * 返回 {yyyy-MM-dd: count, ...}
     */
    @GetMapping("/{userId}/submission-heatmap")
    public Object getUserSubmissionHeatmap(@PathVariable Long userId) {
        Map<String, Integer> heatmap = userService.getSubmissionHeatmap(userId);
        return Map.of("data", heatmap);
    }

    /**
     * GET /api/user/solved-problems
     * 获取当前用户已通过的题目ID列表（需要登录）
     */
    @GetMapping("/solved-problems")
    public Object getSolvedProblems(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            // 未登录返回空列表
            return Map.of("data", Collections.emptyList());
        }
        Long userId = (Long) session.getAttribute("userId");
        List<Long> solvedProblemIds = userService.getSolvedProblems(userId);
        return Map.of("data", solvedProblemIds);
    }

    /**
     * GET /api/user/submission-heatmap
     * 获取用户最近365天的做题热力图数据（需要登录）
     * 返回 {yyyy-MM-dd: count, ...}
     */
    @GetMapping("/submission-heatmap")
    public Object getSubmissionHeatmap(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            throw new RuntimeException("未登录");
        }
        Long userId = (Long) session.getAttribute("userId");
        Map<String, Integer> heatmap = userService.getSubmissionHeatmap(userId);
        return Map.of("data", heatmap);
    }
}
