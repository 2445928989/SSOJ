package com.ssoj.backend.controller;

import com.ssoj.backend.entity.Result;
import com.ssoj.backend.dao.ResultMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 测试结果相关 REST API
 */
@RestController
@RequestMapping("/api/result")
public class ResultController {

    @Autowired
    private ResultMapper resultMapper;

    /**
     * GET /api/result/submission/{submissionId}
     * 获取提交的所有测试结果
     */
    @GetMapping("/submission/{submissionId}")
    public Object getSubmissionResults(@PathVariable Long submissionId) {
        List<Result> results = resultMapper.findBySubmissionId(submissionId);
        return Map.of("data", results);
    }

    /**
     * GET /api/result/{id}
     * 获取单个测试结果
     */
    @GetMapping("/{id}")
    public Result getResult(@PathVariable Long id) {
        return resultMapper.findById(id);
    }
}
