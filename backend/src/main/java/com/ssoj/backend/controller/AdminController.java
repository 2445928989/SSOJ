package com.ssoj.backend.controller;

import com.ssoj.backend.entity.Problem;
import com.ssoj.backend.entity.User;
import com.ssoj.backend.service.ProblemService;
import com.ssoj.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    // TODO: 实现以下管理员 API（需要鉴权）

    /**
     * POST /api/admin/problem
     * 创建题目
     */
    @PostMapping("/problem")
    public Object createProblem(@RequestBody Problem problem) {
        // TODO: 验证管理员权限
        return null;
    }

    /**
     * PUT /api/admin/problem/{id}
     * 更新题目
     */
    @PutMapping("/problem/{id}")
    public Object updateProblem(@PathVariable Long id, @RequestBody Problem problem) {
        // TODO
        return null;
    }

    /**
     * DELETE /api/admin/problem/{id}
     * 删除题目
     */
    @DeleteMapping("/problem/{id}")
    public Object deleteProblem(@PathVariable Long id) {
        // TODO
        return null;
    }

    /**
     * GET /api/admin/users
     * 获取所有用户
     */
    @GetMapping("/users")
    public List<User> getAllUsers() {
        // TODO
        return null;
    }

    /**
     * DELETE /api/admin/user/{id}
     * 删除用户
     */
    @DeleteMapping("/user/{id}")
    public Object deleteUser(@PathVariable Long id) {
        // TODO
        return null;
    }
}
