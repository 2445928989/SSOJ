package com.ssoj.backend.service;

import com.ssoj.backend.entity.Problem;
import com.ssoj.backend.entity.Submission;
import com.ssoj.backend.entity.TestCase;
import com.ssoj.backend.entity.Result;
import com.ssoj.backend.dao.SubmissionMapper;
import com.ssoj.backend.dao.TestCaseMapper;
import com.ssoj.backend.dao.ResultMapper;
import com.ssoj.backend.event.SubmissionSubmittedEvent;
import com.ssoj.backend.util.JudgerInvoker;
import com.ssoj.backend.util.FileUtil;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 判题服务（核心模块）
 */
@Service
public class JudgeService {

    @Autowired
    private JudgerInvoker judgerInvoker;

    @Autowired
    private SubmissionMapper submissionMapper;

    @Autowired
    private SubmissionService submissionService;

    @Autowired
    private ProblemService problemService;

    @Autowired
    private TestCaseMapper testCaseMapper;

    @Autowired
    private ResultMapper resultMapper;

    /**
     * 监听提交事件，异步触发判题
     */
    @EventListener
    @Async
    public void onSubmissionSubmitted(SubmissionSubmittedEvent event) {
        judge(event.getSubmissionId());
    }

    /**
     * 异步判题
     */
    public void judge(Long submissionId) {
        try {
            // 0. 标记提交为RUNNING状态
            submissionService.updateJudgeResult(submissionId, "RUNNING", 0, 0);

            // 1. 获取提交记录和题目信息
            Submission submission = submissionMapper.findById(submissionId);
            if (submission == null) {
                return;
            }

            Problem problem = problemService.getProblemById(submission.getProblemId());

            // 2. 保存代码到临时文件
            String codePath = FileUtil.saveSubmissionCode(submissionId, submission.getCode(), submission.getLanguage());

            // 3. 获取所有测试用例
            List<TestCase> testCases = testCaseMapper.findByProblemId(submission.getProblemId());

            // 4. 逐个运行测试用例，收集结果
            long maxTimeUsed = 0;
            long maxMemoryUsed = 0;
            String overallStatus = "AC"; // 假设全部通过

            for (TestCase tc : testCases) {
                String inputPath = FileUtil.getAbsolutePath(tc.getInputPath());
                String outputPath = FileUtil.getAbsolutePath(tc.getOutputPath());

                try {
                    String jsonResult = judgerInvoker.judge(
                            FileUtil.getAbsolutePath(codePath),
                            submission.getLanguage(),
                            inputPath,
                            outputPath,
                            problem.getTimeLimit(),
                            problem.getMemoryLimit());

                    JsonNode result = judgerInvoker.parseResult(jsonResult);
                    String status = result.get("status").asText();
                    long timeUsed = result.get("time_ms").asLong();
                    long memoryUsed = result.get("memory_kb").asLong();

                    maxTimeUsed = Math.max(maxTimeUsed, timeUsed);
                    maxMemoryUsed = Math.max(maxMemoryUsed, memoryUsed);

                    // 如果有一个测试用例失败，整体状态失败
                    if (!status.equals("AC")) {
                        overallStatus = status;
                    }

                    // 保存单个测试用例的结果
                    Result caseResult = new Result();
                    caseResult.setSubmissionId(submissionId);
                    caseResult.setTestCaseId(tc.getId());
                    caseResult.setStatus(status);
                    caseResult.setTimeUsed((int) timeUsed);
                    caseResult.setMemoryUsed((int) memoryUsed);
                    caseResult.setErrorMessage(result.has("output") ? result.get("output").asText() : "");
                    resultMapper.insert(caseResult);

                } catch (Exception e) {
                    overallStatus = "RE"; // 运行错误
                    // 记录单个测试的错误
                    Result caseResult = new Result();
                    caseResult.setSubmissionId(submissionId);
                    caseResult.setTestCaseId(tc.getId());
                    caseResult.setStatus("RE");
                    caseResult.setErrorMessage(e.getMessage());
                    resultMapper.insert(caseResult);
                }
            }

            // 5. 更新提交记录的最终状态
            submissionService.updateJudgeResult(submissionId, overallStatus, (int) maxTimeUsed, (int) maxMemoryUsed);

        } catch (Exception e) {
            // 记录异常，将提交标记为运行时错误
            submissionService.updateJudgeResult(submissionId, "RE", 0, 0);
        }
    }
}
