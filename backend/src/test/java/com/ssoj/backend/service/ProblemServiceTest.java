package com.ssoj.backend.service;

import com.ssoj.backend.dao.ProblemMapper;
import com.ssoj.backend.dao.ProblemTagMapper;
import com.ssoj.backend.dao.TagMapper;
import com.ssoj.backend.dao.TestCaseMapper;
import com.ssoj.backend.entity.Problem;
import com.ssoj.backend.entity.TestCase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProblemServiceTest {

    @Mock
    private ProblemMapper problemMapper;

    @Mock
    private ProblemTagMapper problemTagMapper;

    @Mock
    private TagMapper tagMapper;

    @Mock
    private TestCaseMapper testCaseMapper;

    @InjectMocks
    private ProblemService problemService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetProblemById_Success() {
        Problem mockProblem = new Problem();
        mockProblem.setId(1L);
        mockProblem.setTitle("Test Problem");

        when(problemMapper.findById(1L)).thenReturn(mockProblem);
        when(problemTagMapper.findByProblemId(1L)).thenReturn(new ArrayList<>());

        Problem result = problemService.getProblemById(1L);

        assertNotNull(result);
        assertEquals("Test Problem", result.getTitle());
        verify(problemMapper, times(1)).findById(1L);
    }

    @Test
    void testGetProblemById_NotFound() {
        when(problemMapper.findById(1L)).thenReturn(null);

        assertThrows(RuntimeException.class, () -> problemService.getProblemById(1L));
    }

    @Test
    void testUploadTestCases_Success() throws IOException {
        Long problemId = 1L;
        Problem mockProblem = new Problem();
        mockProblem.setId(problemId);
        when(problemMapper.findById(problemId)).thenReturn(mockProblem);

        // 创建一个模拟的 ZIP 文件，包含 1.in 和 1.out
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            zos.putNextEntry(new ZipEntry("1.in"));
            zos.write("input data".getBytes());
            zos.closeEntry();
            zos.putNextEntry(new ZipEntry("1.out"));
            zos.write("output data".getBytes());
            zos.closeEntry();
        }
        MockMultipartFile mockFile = new MockMultipartFile("file", "test.zip", "application/zip", baos.toByteArray());

        problemService.uploadTestCases(problemId, mockFile);

        // 验证是否删除了旧的测试用例
        verify(testCaseMapper, times(1)).deleteByProblemId(problemId);
        // 验证是否插入了新的测试用例（1.in 和 1.out 配对成功）
        verify(testCaseMapper, atLeastOnce()).insert(any(TestCase.class));
    }

    @Test
    void testUploadTestCases_SupportAnsAndNested() throws IOException {
        Long problemId = 2L;
        Problem mockProblem = new Problem();
        mockProblem.setId(problemId);
        when(problemMapper.findById(problemId)).thenReturn(mockProblem);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            // 嵌套目录中的 in/out，逻辑会截取文件名
            zos.putNextEntry(new ZipEntry("nested/2.in"));
            zos.write("input2".getBytes());
            zos.closeEntry();

            // 使用 .ans 作为输出文件扩展名
            zos.putNextEntry(new ZipEntry("nested/2.ans"));
            zos.write("output2".getBytes());
            zos.closeEntry();
        }
        MockMultipartFile mockFile = new MockMultipartFile("file", "cases.zip", "application/zip", baos.toByteArray());

        problemService.uploadTestCases(problemId, mockFile);

        // 至少插入一次（2.in 与 2.ans 配对）
        verify(testCaseMapper, atLeastOnce()).insert(any(TestCase.class));
    }

    @Test
    void testUploadTestCases_ProblemNotFound() throws IOException {
        Long problemId = 999L;
        when(problemMapper.findById(problemId)).thenReturn(null);

        MockMultipartFile mockFile = new MockMultipartFile("file", "empty.zip", "application/zip", new byte[] {});

        assertThrows(RuntimeException.class, () -> problemService.uploadTestCases(problemId, mockFile));
        verify(testCaseMapper, never()).deleteByProblemId(anyLong());
    }

    @Test
    void testGetProblems_InvalidPage() {
        assertThrows(IllegalArgumentException.class, () -> problemService.getProblems(0, 10));
        verify(problemMapper, never()).findAll(anyInt(), anyInt());
    }

    @Test
    void testGetProblems_InvalidSize() {
        assertThrows(IllegalArgumentException.class, () -> problemService.getProblems(1, 0));
        assertThrows(IllegalArgumentException.class, () -> problemService.getProblems(1, 101));
        verify(problemMapper, never()).findAll(anyInt(), anyInt());
    }
}
