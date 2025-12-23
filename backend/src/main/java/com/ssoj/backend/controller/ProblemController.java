package com.ssoj.backend.controller;

import com.ssoj.backend.entity.Problem;
import com.ssoj.backend.service.ProblemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 题目相关 REST API
 */
@RestController
@RequestMapping("/api/problem")
public class ProblemController {

    @Autowired
    private ProblemService problemService;

    // TODO: 实现以下 API

    /**
     * GET /api/problem/list?page=1&size=20&difficulty=easy
     * 获取题目列表（支持分页和难度筛选）
     */
    @GetMapping("/list")
    public Object getProblems(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String difficulty) {
        List<Problem> problems;
        if (difficulty != null && !difficulty.isEmpty()) {
            problems = problemService.getProblemsByDifficulty(difficulty);
        } else {
            problems = problemService.getProblems(page, size);
        }
        return java.util.Map.of("success", true, "data", problems, "total", problemService.getTotalCount());
    }

    /**
     * GET /api/problem/{id}
     * 获取题目详情
     */
    @GetMapping("/{id}")
    public Problem getProblemById(@PathVariable Long id) {
        return problemService.getProblemById(id);
    }

    /**
     * GET /api/problem/count
     * 获取题目总数
     */
    @GetMapping("/count")
    public Object getCount() {
        return java.util.Map.of("success", true, "count", problemService.getTotalCount());
    }

    /**
     * GET /api/problem/search?keyword=xxx&page=1&size=20
     * 搜索题目
     */
    @GetMapping("/search")
    public Object searchProblems(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<Problem> problems = problemService.searchProblems(keyword, page, size);
        int total = problemService.getSearchCount(keyword);
        return java.util.Map.of(
                "success", true,
                "data", problems,
                "total", total,
                "page", page,
                "size", size);
    }

    /**
     * POST /api/problem
     * 创建题目（管理员）
     */
    @PostMapping
    public Object createProblem(@RequestBody Problem problem) {
        Problem created = problemService.createProblem(problem);
        return java.util.Map.of("success", true, "data", created);
    }

    /**
     * PUT /api/problem/{id}
     * 更新题目（管理员）
     */
    @PutMapping("/{id}")
    public Object updateProblem(@PathVariable Long id, @RequestBody Problem problem) {
        problem.setId(id);
        boolean ok = problemService.updateProblem(problem);
        return java.util.Map.of("success", ok);
    }

    /**
     * DELETE /api/problem/{id}
     * 删除题目（管理员）
     */
    @DeleteMapping("/{id}")
    public Object deleteProblem(@PathVariable Long id) {
        boolean ok = problemService.deleteProblem(id);
        return java.util.Map.of("success", ok);
    }

    /**
     * GET /api/problem/{id}/tags
     * 获取题目的标签列表
     */
    @GetMapping("/{id}/tags")
    public Object getProblemTags(@PathVariable Long id) {
        List<?> tags = problemService.getProblemTags(id);
        return java.util.Map.of("success", true, "data", tags);
    }
}
