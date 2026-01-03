package com.ssoj.backend.controller;

import com.ssoj.backend.entity.Submission;
import com.ssoj.backend.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 提交记录相关 REST API
 */
@RestController
@RequestMapping("/api/submission")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    /**
     * POST /api/submission/submit
     * 提交代码
     * Request Body: {problemId, code, language}
     * Response: {submissionId, status}
     */
    @PostMapping("/submit")
    public Object submit(@RequestBody Map<String, Object> request,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        jakarta.servlet.http.HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            throw new RuntimeException("未登录");
        }
        Long userId = (Long) session.getAttribute("userId");

        Long problemId = Long.valueOf((Integer) request.get("problemId"));
        String code = (String) request.get("code");
        String language = (String) request.get("language");

        Submission submission = submissionService.submitCode(userId, problemId, code, language);
        return Map.of("success", true, "submissionId", submission.getId());
    }

    /**
     * GET /api/submission/{id}
     * 查询提交记录详情
     */
    @GetMapping("/{id}")
    public Submission getSubmission(@PathVariable Long id) {
        return submissionService.getSubmissionById(id);
    }

    /**
     * GET /api/submission/user/{userId}
     * 查询用户的所有提交（分页）
     */
    @GetMapping("/user/{userId}")
    public Object getUserSubmissions(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<Submission> submissions = submissionService.getUserSubmissions(userId, page, size);
        int total = submissionService.getUserSubmissionCount(userId);
        return Map.of(
                "success", true,
                "data", submissions,
                "total", total,
                "page", page,
                "size", size);
    }

    /**
     * GET /api/submission/problem/{problemId}
     * 查询题目的所有提交（分页）
     */
    @GetMapping("/problem/{problemId}")
    public Object getProblemSubmissions(
            @PathVariable Long problemId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<Submission> submissions = submissionService.getProblemSubmissions(problemId, page, size);
        int total = submissionService.getProblemSubmissionCount(problemId);
        return Map.of(
                "success", true,
                "data", submissions,
                "total", total,
                "page", page,
                "size", size);
    }

    /**
     * GET /api/submission/recent?page=1&size=20
     * 查询最近提交（首页展示）
     */
    @GetMapping("/recent")
    public Object getRecentSubmissions(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<Submission> submissions = submissionService.getRecentSubmissions(page, size);
        int total = submissionService.getRecentSubmissionCount();
        return Map.of(
                "success", true,
                "data", submissions,
                "total", total,
                "page", page,
                "size", size);
    }

    /**
     * GET /api/submission/latest?problemId=1
     * 获取用户在某题目的最后一次提交
     */
    @GetMapping("/latest")
    public Object getLatestSubmission(
            @RequestParam Long problemId,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        jakarta.servlet.http.HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return Map.of("success", false, "message", "未登录");
        }
        Long userId = (Long) session.getAttribute("userId");
        Submission submission = submissionService.getLatestSubmission(userId, problemId);
        return submission != null ? submission : Map.of();
    }
}
