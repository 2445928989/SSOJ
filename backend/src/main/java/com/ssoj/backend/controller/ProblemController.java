package com.ssoj.backend.controller;

import com.ssoj.backend.entity.Problem;
import com.ssoj.backend.service.ProblemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 题目相关 REST API
 */
@RestController
public class ProblemController {

    @Autowired
    private ProblemService problemService;

    @Autowired
    private com.ssoj.backend.service.UserService userService;

    /**
     * POST /api/problem/{id}/testcases
     * 上传测试用例
     */
    @PostMapping("/api/problem/{id}/testcases")
    public Object uploadTestCases(@PathVariable("id") Long id,
            @RequestParam("file") MultipartFile file,
            jakarta.servlet.http.HttpSession session) {
        checkAdmin(session);
        System.out.println("DEBUG: Received upload request for problem: " + id);
        try {
            problemService.uploadTestCases(id, file);
            return Map.of("success", true);
        } catch (Exception e) {
            e.printStackTrace();
            String msg = e.getMessage();
            if (msg == null)
                msg = e.toString();
            return Map.of("success", false, "error", msg);
        }
    }

    /**
     * GET /api/problem/list
     * 获取题目列表
     */
    @GetMapping("/api/problem/list")
    public Object getProblems(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String tag) {
        List<Problem> problems;
        int total;
        if (difficulty != null && !difficulty.isEmpty()) {
            problems = problemService.getProblemsByDifficulty(difficulty);
            total = problems.size(); // 简单处理，难度筛选暂不支持分页
        } else if (tag != null && !tag.isEmpty()) {
            problems = problemService.getProblemsByTag(tag, page, size);
            total = problemService.getCountByTag(tag);
        } else {
            problems = problemService.getProblems(page, size);
            total = problemService.getTotalCount();
        }
        return Map.of("success", true, "data", problems, "total", total);
    }

    /**
     * GET /api/problem/{id}
     * 获取题目详情
     */
    @GetMapping("/api/problem/{id}")
    public Problem getProblemById(@PathVariable("id") Long id) {
        return problemService.getProblemById(id);
    }

    /**
     * GET /api/problem/count
     * 获取题目总数
     */
    @GetMapping("/api/problem/count")
    public Object getCount() {
        return Map.of("success", true, "count", problemService.getTotalCount());
    }

    /**
     * GET /api/problem/search
     * 搜索题目
     */
    @GetMapping("/api/problem/search")
    public Object searchProblems(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<Problem> problems = problemService.searchProblems(keyword, page, size);
        int total = problemService.getSearchCount(keyword);
        return Map.of(
                "success", true,
                "data", problems,
                "total", total,
                "page", page,
                "size", size);
    }

    /**
     * POST /api/problem
     * 创建题目
     */
    @PostMapping("/api/problem")
    public Object createProblem(@RequestBody Problem problem, jakarta.servlet.http.HttpSession session) {
        checkAdmin(session);
        Problem created = problemService.createProblem(problem);
        return Map.of("success", true, "data", created);
    }

    /**
     * PUT /api/problem/{id}
     * 更新题目
     */
    @PutMapping("/api/problem/{id}")
    public Object updateProblem(@PathVariable("id") Long id, @RequestBody Problem problem,
            jakarta.servlet.http.HttpSession session) {
        checkAdmin(session);
        problem.setId(id);
        boolean ok = problemService.updateProblem(problem);
        return Map.of("success", ok);
    }

    /**
     * DELETE /api/problem/{id}
     * 删除题目
     */
    @DeleteMapping("/api/problem/{id}")
    public Object deleteProblem(@PathVariable("id") Long id, jakarta.servlet.http.HttpSession session) {
        checkAdmin(session);
        boolean ok = problemService.deleteProblem(id);
        return Map.of("success", ok);
    }

    /**
     * GET /api/problem/{id}/tags
     * 获取题目的标签列表
     */
    @GetMapping("/api/problem/{id}/tags")
    public Object getProblemTags(@PathVariable("id") Long id) {
        List<?> tags = problemService.getProblemTags(id);
        return Map.of("success", true, "data", tags);
    }

    /**
     * GET /api/problem/tags
     * 获取所有标签列表
     */
    @GetMapping("/api/problem/tags")
    public Object getAllTags() {
        List<String> tags = problemService.getAllTagNames();
        return Map.of("success", true, "data", tags);
    }

    /**
     * GET /api/problem/{id}/testcases
     * 获取题目的测试用例列表
     */
    @GetMapping("/api/problem/{id}/testcases")
    public Object getTestCases(@PathVariable("id") Long id, jakarta.servlet.http.HttpSession session) {
        checkAdmin(session);
        return Map.of("success", true, "data", problemService.getTestCases(id));
    }

    /**
     * PUT /api/problem/{id}/testcases/{tcId}
     * 更新单个测试用例
     */
    @PutMapping("/api/problem/{id}/testcases/{tcId}")
    public Object updateTestCase(@PathVariable("id") Long id,
            @PathVariable("tcId") Long tcId,
            @RequestBody Map<String, String> body,
            jakarta.servlet.http.HttpSession session) {
        checkAdmin(session);
        try {
            problemService.updateTestCase(id, tcId, body.get("inputContent"), body.get("outputContent"));
            return Map.of("success", true);
        } catch (Exception e) {
            return Map.of("success", false, "error", e.getMessage());
        }
    }

    /**
     * DELETE /api/problem/{id}/testcases/{tcId}
     * 删除单个测试用例
     */
    @DeleteMapping("/api/problem/{id}/testcases/{tcId}")
    public Object deleteTestCase(@PathVariable("id") Long id,
            @PathVariable("tcId") Long tcId,
            jakarta.servlet.http.HttpSession session) {
        checkAdmin(session);
        try {
            problemService.deleteTestCase(id, tcId);
            return Map.of("success", true);
        } catch (Exception e) {
            return Map.of("success", false, "error", e.getMessage());
        }
    }

    private void checkAdmin(jakarta.servlet.http.HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "未登录");
        }
        Long userId = (Long) session.getAttribute("userId");
        com.ssoj.backend.entity.User user = userService.getUserById(userId);
        if (user == null || !"ADMIN".equals(user.getRole())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "无权操作");
        }
    }
}
