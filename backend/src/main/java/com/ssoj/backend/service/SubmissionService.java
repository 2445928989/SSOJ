package com.ssoj.backend.service;

import com.ssoj.backend.entity.Submission;
import com.ssoj.backend.dao.SubmissionMapper;
import com.ssoj.backend.event.SubmissionSubmittedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * 提交记录业务逻辑服务
 */
@Service
public class SubmissionService {

    @Autowired
    private SubmissionMapper submissionMapper;

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private ProblemService problemService;

    // TODO: 实现以下业务逻辑

    /**
     * 提交代码
     * - 保存提交记录（状态为 PENDING）
     * - 异步调用判题服务
     * - 增加题目的提交数
     */
    public Submission submitCode(Long userId, Long problemId, String code, String language) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("用户ID不合法");
        }
        if (problemId == null || problemId <= 0) {
            throw new IllegalArgumentException("题目ID不合法");
        }
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("代码不能为空");
        }
        if (language == null || language.trim().isEmpty()) {
            throw new IllegalArgumentException("编程语言不能为空");
        }

        Submission submission = new Submission();
        submission.setUserId(userId);
        submission.setProblemId(problemId);
        submission.setCode(code);
        submission.setLanguage(language);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setStatus("PENDING");
        submissionMapper.insert(submission);

        // 增加题目的提交数
        try {
            problemService.incrementSubmissionCount(problemId);
        } catch (Exception e) {
            // 记录错误但不阻止提交
            e.printStackTrace();
        }

        // 发送事件，触发异步判题（解耦 SubmissionService 和 JudgeService）
        applicationContext.publishEvent(new SubmissionSubmittedEvent(this, submission.getId()));

        return submissionMapper.findById(submission.getId());
    }

    /**
     * 根据ID查询提交记录
     */
    public Submission getSubmissionById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("提交ID不合法");
        }
        Submission submission = submissionMapper.findById(id);
        if (submission == null) {
            throw new RuntimeException("未找到提交: " + id);
        }
        return submission;
    }

    /**
     * 查询用户的所有提交
     */
    public List<Submission> getUserSubmissions(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("用户ID不合法");
        }
        List<Submission> submissions = submissionMapper.findByUserId(userId);
        return submissions;
    }

    /**
     * 查询用户的提交（分页）
     */
    public List<Submission> getUserSubmissions(Long userId, int page, int size) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("用户ID不合法");
        }
        if (page < 1) {
            throw new IllegalArgumentException("页码必须 >= 1");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("每页数量必须在 1-100 之间");
        }
        int offset = (page - 1) * size;
        return submissionMapper.findByUserIdPaged(userId, offset, size);
    }

    /**
     * 获取用户的提交总数
     */
    public int getUserSubmissionCount(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("用户ID不合法");
        }
        return submissionMapper.countByUserId(userId);
    }

    /**
     * 查询题目的所有提交
     */
    public List<Submission> getProblemSubmissions(Long problemId) {
        if (problemId == null || problemId <= 0) {
            throw new IllegalArgumentException("题目ID不合法");
        }
        List<Submission> submissions = submissionMapper.findByProblemId(problemId);
        return submissions;
    }

    /**
     * 查询题目的提交（分页）
     */
    public List<Submission> getProblemSubmissions(Long problemId, int page, int size) {
        if (problemId == null || problemId <= 0) {
            throw new IllegalArgumentException("题目ID不合法");
        }
        if (page < 1) {
            throw new IllegalArgumentException("页码必须 >= 1");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("每页数量必须在 1-100 之间");
        }
        int offset = (page - 1) * size;
        return submissionMapper.findByProblemIdPaged(problemId, offset, size);
    }

    /**
     * 获取题目的提交总数
     */
    public int getProblemSubmissionCount(Long problemId) {
        if (problemId == null || problemId <= 0) {
            throw new IllegalArgumentException("题目ID不合法");
        }
        return submissionMapper.countByProblemId(problemId);
    }

    /**
     * 查询最近的提交（首页展示）
     */
    public List<Submission> getRecentSubmissions(int page, int size) {
        if (page < 1) {
            throw new IllegalArgumentException("页码必须 >= 1");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("每页数量必须在 1-100 之间");
        }
        int offset = (page - 1) * size;
        return submissionMapper.findRecent(offset, size);
    }

    /**
     * 获取最近提交的总数
     */
    public int getRecentSubmissionCount() {
        return submissionMapper.countAll();
    }

    /**
     * 更新判题结果（由 JudgeService 回调）
     */
    public Boolean updateJudgeResult(Long submissionId, String status,
            int maxTimeUsed, int maxMemoryUsed) {
        if (submissionId == null || submissionId <= 0) {
            throw new IllegalArgumentException("提交ID不合法");
        }
        if (!Set.of("AC", "RE", "WA", "TLE", "MLE", "CE", "RUNNING").contains(status)) {
            throw new IllegalArgumentException("提交状态不合法");
        }

        // 获取提交记录以获取题目ID
        Submission oldSubmission = submissionMapper.findById(submissionId);
        if (oldSubmission == null) {
            throw new RuntimeException("未找到提交: " + submissionId);
        }

        Submission submission = new Submission();
        submission.setId(submissionId);
        submission.setStatus(status);
        submission.setMaxTimeUsed(maxTimeUsed);
        submission.setMaxMemoryUsed(maxMemoryUsed);
        int ret = submissionMapper.updateStatus(submission);
        if (ret == 0) {
            throw new RuntimeException("更新提交状态失败: " + submissionId);
        }

        // 如果判题结果为 AC，增加题目的通过数
        if ("AC".equals(status)) {
            try {
                problemService.incrementAcceptedCount(oldSubmission.getProblemId());
            } catch (Exception e) {
                // 记录错误但不阻止结果更新
                e.printStackTrace();
            }
        }

        return true;
    }
}
