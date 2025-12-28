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
                String input = com.ssoj.backend.util.FileUtil.readFile(r.getInput());
                if (input.length() > 1000)
                    input = input.substring(0, 1000) + "...";
                r.setInputContent(input);
            }
            if (r.getExpectedOutput() != null) {
                String expected = com.ssoj.backend.util.FileUtil.readFile(r.getExpectedOutput());
                if (expected.length() > 1000)
                    expected = expected.substring(0, 1000) + "...";
                r.setExpectedOutputContent(expected);
            }
        } catch (Exception e) {
            // Ignore or log
        }
    }
}
