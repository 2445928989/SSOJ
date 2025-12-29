package com.ssoj.backend.service;

import com.ssoj.backend.dao.ResultMapper;
import com.ssoj.backend.dao.SubmissionMapper;
import com.ssoj.backend.dao.TestCaseMapper;
import com.ssoj.backend.entity.Problem;
import com.ssoj.backend.entity.Submission;
import com.ssoj.backend.entity.TestCase;
import com.ssoj.backend.util.JudgerInvoker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

class JudgeServiceTest {

    @Mock
    private JudgerInvoker judgerInvoker;

    @Mock
    private SubmissionMapper submissionMapper;

    @Mock
    private SubmissionService submissionService;

    @Mock
    private ProblemService problemService;

    @Mock
    private TestCaseMapper testCaseMapper;

    @Mock
    private ResultMapper resultMapper;

    @InjectMocks
    private JudgeService judgeService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testJudge_SubmissionNotFound() {
        when(submissionMapper.findById(1L)).thenReturn(null);

        judgeService.judge(1L);

        verify(submissionService, times(1)).updateJudgeResult(anyLong(), eq("RUNNING"), anyInt(), anyInt(), any());
        verify(problemService, never()).getProblemById(anyLong());
    }

    @Test
    void testJudge_Success() throws Exception {
        Long submissionId = 1L;
        Long problemId = 10L;

        Submission submission = new Submission();
        submission.setId(submissionId);
        submission.setProblemId(problemId);
        submission.setCode("print('hello')");
        submission.setLanguage("python3");

        Problem problem = new Problem();
        problem.setId(problemId);
        problem.setTimeLimit(1.0);
        problem.setMemoryLimit(262144);

        List<TestCase> testCases = new ArrayList<>();
        TestCase tc1 = new TestCase();
        tc1.setId(100L);
        tc1.setInputPath("test_cases/10/100_in.txt");
        tc1.setOutputPath("test_cases/10/100_out.txt");
        testCases.add(tc1);

        TestCase tc2 = new TestCase();
        tc2.setId(101L);
        tc2.setInputPath("test_cases/10/101_in.txt");
        tc2.setOutputPath("test_cases/10/101_out.txt");
        testCases.add(tc2);

        when(submissionMapper.findById(submissionId)).thenReturn(submission);
        when(problemService.getProblemById(problemId)).thenReturn(problem);
        when(testCaseMapper.findByProblemId(problemId)).thenReturn(testCases);

        // 模拟判题器返回结果
        String mockJsonResult = "{\"status\":\"AC\", \"time_ms\":10, \"memory_kb\":1024, \"compiler_message\":\"\", \"error_message\":\"\"}";
        // 两次调用：第一次 AC，第二次 WA，验证整体状态为 WA
        String mockJsonResultWa = "{\"status\":\"WA\", \"time_ms\":20, \"memory_kb\":2048, \"compiler_message\":\"\", \"error_message\":\"\"}";
        when(judgerInvoker.judge(anyString(), anyString(), anyString(), anyString(), anyDouble(), anyInt()))
                .thenReturn(mockJsonResult)
                .thenReturn(mockJsonResultWa);

        // 模拟解析结果
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        when(judgerInvoker.parseResult(mockJsonResult)).thenReturn(mapper.readTree(mockJsonResult));
        when(judgerInvoker.parseResult(mockJsonResultWa)).thenReturn(mapper.readTree(mockJsonResultWa));

        // 执行判题
        try {
            judgeService.judge(submissionId);
        } catch (Exception e) {
            // 忽略文件操作相关的异常
        }

        verify(submissionService, atLeastOnce()).updateJudgeResult(eq(submissionId), eq("WA"), anyInt(), anyInt(),
                any());
    }

    @Test
    void testJudge_JudgerThrows_setsRE() throws Exception {
        Long submissionId = 2L;
        Long problemId = 20L;

        Submission submission = new Submission();
        submission.setId(submissionId);
        submission.setProblemId(problemId);
        submission.setCode("print('x')");
        submission.setLanguage("python3");

        Problem problem = new Problem();
        problem.setId(problemId);
        problem.setTimeLimit(1.0);
        problem.setMemoryLimit(262144);

        List<TestCase> testCases = new ArrayList<>();
        TestCase tc = new TestCase();
        tc.setId(201L);
        tc.setInputPath("test_cases/20/201_in.txt");
        tc.setOutputPath("test_cases/20/201_out.txt");
        testCases.add(tc);

        when(submissionMapper.findById(submissionId)).thenReturn(submission);
        when(problemService.getProblemById(problemId)).thenReturn(problem);
        when(testCaseMapper.findByProblemId(problemId)).thenReturn(testCases);

        when(judgerInvoker.judge(anyString(), anyString(), anyString(), anyString(), anyDouble(), anyInt()))
                .thenThrow(new RuntimeException("judge failed"));

        judgeService.judge(submissionId);

        verify(submissionService, atLeastOnce()).updateJudgeResult(eq(submissionId), eq("RE"), anyInt(), anyInt(),
                any());
    }
}
