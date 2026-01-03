package com.ssoj.backend.controller;

import com.ssoj.backend.entity.Problem;
import com.ssoj.backend.entity.User;
import com.ssoj.backend.service.ProblemService;
import com.ssoj.backend.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;

/**
 * 管理员 REST API（需要管理员权限）
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private ProblemService problemService;

    @Autowired
    private UserService userService;

    /**
     * POST /api/admin/problem
     * 创建题目
     */
    @PostMapping("/problem")
    public Object createProblem(@RequestBody Problem problem, HttpSession session) {
        checkAdmin(session);
        Problem created = problemService.createProblem(problem);
        return Map.of("success", true, "data", created);
    }

    /**
     * PUT /api/admin/problem/{id}
     * 更新题目
     */
    @PutMapping("/problem/{id}")
    public Object updateProblem(@PathVariable Long id, @RequestBody Problem problem, HttpSession session) {
        checkAdmin(session);
        problem.setId(id);
        boolean ok = problemService.updateProblem(problem);
        return Map.of("success", ok);
    }

    /**
     * DELETE /api/admin/problem/{id}
     * 删除题目
     */
    @DeleteMapping("/problem/{id}")
    public Object deleteProblem(@PathVariable Long id, HttpSession session) {
        checkAdmin(session);
        boolean ok = problemService.deleteProblem(id);
        return Map.of("success", ok);
    }

    /**
     * GET /api/admin/users
     * 获取所有用户（包含敏感信息，仅限管理员）
     */
    @GetMapping("/users")
    public List<User> getAllUsers(HttpSession session) {
        checkAdmin(session);
        List<User> users = userService.getAllUsers();
        // 管理员可以看到邮箱，但密码还是要隐藏
        users.forEach(u -> u.setPassword(null));
        return users;
    }

    /**
     * DELETE /api/admin/user/{id}
     * 删除用户
     */
    @DeleteMapping("/user/{id}")
    public Object deleteUser(@PathVariable Long id, HttpSession session) {
        checkAdmin(session);
        boolean ok = userService.deleteUser(id);
        return Map.of("success", ok);
    }

    private void checkAdmin(HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未登录");
        }
        Long userId = (Long) session.getAttribute("userId");
        User user = userService.getUserById(userId);
        if (user == null || !"ADMIN".equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "无权操作");
        }
    }
}
