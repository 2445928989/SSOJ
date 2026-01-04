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
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

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

    @Autowired
    @Qualifier("judgeExecutor")
    private Executor judgeExecutor;

    @Autowired
    @Qualifier("testCaseExecutor")
    private Executor testCaseExecutor;

    /**
     * 监听提交事件，异步触发判题
     */
    @EventListener
    @Async("submissionExecutor")
    public void onSubmissionSubmitted(SubmissionSubmittedEvent event) {
        judge(event.getSubmissionId());
    }

    /**
     * 异步判题
     */
    public void judge(Long submissionId) {
        try {
            // 0. 标记提交为RUNNING状态
            submissionService.updateJudgeResult(submissionId, "RUNNING", 0, 0, null);

            // 1. 获取提交记录和题目信息
            Submission submission = submissionMapper.findById(submissionId);
            if (submission == null) {
                return;
            }

            Problem problem = problemService.getProblemById(submission.getProblemId());

            // 2. 保存代码到临时文件
            String codePath = FileUtil.saveSubmissionCode(submissionId, submission.getCode(), submission.getLanguage());

            // 3. 编译代码（如果是编译型语言）
            String executablePath = null;
            if (submission.getLanguage().equals("cpp") || submission.getLanguage().equals("c")
                    || submission.getLanguage().equals("c++")) {
                String compileResultJson = judgerInvoker.compile(FileUtil.getAbsolutePath(codePath),
                        submission.getLanguage());
                JsonNode compileNode = judgerInvoker.parseResult(compileResultJson);
                if (!compileNode.get("status").asText().equals("OK")) {
                    String compilerMessage = compileNode.has("compiler_message")
                            ? compileNode.get("compiler_message").asText()
                            : "Compilation failed";
                    submissionService.updateJudgeResult(submissionId, "CE", 0, 0, compilerMessage);
                    return;
                }
                executablePath = compileNode.get("executable_path").asText();
            }

            // 4. 获取所有测试用例
            List<TestCase> testCases = testCaseMapper.findByProblemId(submission.getProblemId());

            if (testCases.isEmpty()) {
                submissionService.updateJudgeResult(submissionId, "AC", 0, 0, null);
                return;
            }

            AtomicLong maxTimeUsed = new AtomicLong(0);
            AtomicLong maxMemoryUsed = new AtomicLong(0);
            AtomicReference<String> overallStatus = new AtomicReference<>("AC");
            AtomicReference<String> overallErrorMessage = new AtomicReference<>(null);

            // 5. 并行运行测试用例
            final String finalExePath = executablePath;
            List<CompletableFuture<Result>> futures = testCases.stream()
                    .map(tc -> CompletableFuture.supplyAsync(() -> {
                        String inputPath = FileUtil.getAbsolutePath(tc.getInputPath());
                        String outputPath = FileUtil.getAbsolutePath(tc.getOutputPath());

                        try {
                            String jsonResult = judgerInvoker.judge(
                                    FileUtil.getAbsolutePath(codePath),
                                    submission.getLanguage(),
                                    inputPath,
                                    outputPath,
                                    problem.getTimeLimit(),
                                    problem.getMemoryLimit(),
                                    finalExePath);

                            JsonNode resultNode = judgerInvoker.parseResult(jsonResult);
                            String status = resultNode.get("status").asText();
                            long timeUsed = resultNode.get("time_ms").asLong();
                            long memoryUsed = resultNode.get("memory_kb").asLong();
                            String actualOutput = resultNode.has("actual_output")
                                    ? resultNode.get("actual_output").asText()
                                    : "";

                            maxTimeUsed.updateAndGet(current -> Math.max(current, timeUsed));
                            maxMemoryUsed.updateAndGet(current -> Math.max(current, memoryUsed));

                            // 保存单个测试用例的结果
                            Result caseResult = new Result();
                            caseResult.setSubmissionId(submissionId);
                            caseResult.setTestCaseId(tc.getId());
                            caseResult.setStatus(status);
                            caseResult.setTimeUsed((int) timeUsed);
                            caseResult.setMemoryUsed((int) memoryUsed);
                            caseResult.setActualOutputContent(actualOutput);

                            String errorMessage = "";
                            if (status.equals("CE")) {
                                errorMessage = resultNode.has("compiler_message")
                                        ? resultNode.get("compiler_message").asText()
                                        : "";
                            } else {
                                errorMessage = resultNode.has("error_message")
                                        ? resultNode.get("error_message").asText()
                                        : "";
                            }
                            caseResult.setErrorMessage(errorMessage);

                            // 更新整体状态（第一个非AC状态）
                            if (!status.equals("AC")) {
                                if (overallStatus.compareAndSet("AC", status)) {
                                    overallErrorMessage.set(errorMessage);
                                }
                            }

                            resultMapper.insert(caseResult);
                            return caseResult;
                        } catch (Exception e) {
                            Result errorResult = new Result();
                            errorResult.setSubmissionId(submissionId);
                            errorResult.setTestCaseId(tc.getId());
                            errorResult.setStatus("RE");
                            errorResult.setErrorMessage(e.getMessage());
                            if (overallStatus.compareAndSet("AC", "RE")) {
                                overallErrorMessage.set(e.getMessage());
                            }
                            resultMapper.insert(errorResult);
                            return errorResult;
                        }
                    }, testCaseExecutor))
                    .collect(Collectors.toList());

            // 等待所有测试点完成
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            // 6. 清理编译产生的可执行文件及其目录
            if (finalExePath != null) {
                java.io.File exeFile = new java.io.File(finalExePath);
                java.io.File tempDir = exeFile.getParentFile();
                if (tempDir != null && tempDir.getName().startsWith("ssoj_")) {
                    FileUtil.deleteDir(tempDir);
                }
            }

            // 7. 更新最终结果
            submissionService.updateJudgeResult(submissionId, overallStatus.get(), (int) maxTimeUsed.get(),
                    (int) maxMemoryUsed.get(), overallErrorMessage.get());

        } catch (Exception e) {
            submissionService.updateJudgeResult(submissionId, "RE", 0, 0, e.getMessage());
        }
    }
}
