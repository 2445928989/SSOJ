package com.ssoj.backend.controller;

import com.ssoj.backend.entity.Result;
import com.ssoj.backend.dao.ResultMapper;
import com.ssoj.backend.util.FileUtil;
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
        for (Result r : results) {
            populateResultContent(r);
        }
        return Map.of("data", results);
    }

    /**
     * GET /api/result/{id}
     * 获取单个测试结果
     */
    @GetMapping("/{id}")
    public Result getResult(@PathVariable Long id) {
        Result r = resultMapper.findById(id);
        if (r != null) {
            populateResultContent(r);
        }
        return r;
    }

    private void populateResultContent(Result r) {
        try {
            if (r.getInput() != null) {
                r.setInputContent(FileUtil.readFileContent(r.getInput()));
            }
            if (r.getExpectedOutput() != null) {
                r.setExpectedOutputContent(FileUtil.readFileContent(r.getExpectedOutput()));
            }
            // actualOutputContent 已经由 MyBatis 从数据库加载，无需额外处理
        } catch (Exception e) {
            // Ignore or log
        }
    }
}
