package com.ssoj.backend.service;

import com.ssoj.backend.entity.Problem;
import com.ssoj.backend.entity.ProblemTag;
import com.ssoj.backend.entity.TestCase;
import com.ssoj.backend.dao.ProblemMapper;
import com.ssoj.backend.dao.ProblemTagMapper;
import com.ssoj.backend.dao.TagMapper;
import com.ssoj.backend.dao.TestCaseMapper;
import com.ssoj.backend.util.FileUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * 题目业务逻辑服务
 */
@Service
public class ProblemService {

    @Autowired
    private ProblemMapper problemMapper;

    @Autowired
    private ProblemTagMapper problemTagMapper;

    @Autowired
    private TagMapper tagMapper;

    @Autowired
    private TestCaseMapper testCaseMapper;

    /**
     * 获取题目列表（分页）
     */
    public List<Problem> getProblems(int page, int size) {
        // 参数校验
        if (page < 1) {
            throw new IllegalArgumentException("页码必须 >= 1");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("每页数量必须在 1-100 之间");
        }
        int offset = (page - 1) * size;
        List<Problem> problems = problemMapper.findAll(offset, size);
        // 为每个问题加载标签
        problems.forEach(this::loadProblemCategories);
        return problems;
    }

    /**
     * 根据ID获取题目详情
     */
    public Problem getProblemById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("题目ID无效");
        }
        Problem problem = problemMapper.findById(id);
        if (problem == null) {
            throw new RuntimeException("题目不存在: " + id);
        }
        loadProblemCategories(problem);
        return problem;
    }

    /**
     * 根据难度筛选题目
     */
    public List<Problem> getProblemsByDifficulty(String difficulty) {
        if (difficulty == null || difficulty.trim().isEmpty()) {
            throw new IllegalArgumentException("题目难度不能为空");
        }
        if (!"easy".equals(difficulty) && !"medium".equals(difficulty) && !"hard".equals(difficulty)) {
            throw new IllegalArgumentException("题目难度无效，必须是 easy/medium/hard");
        }
        List<Problem> problems = problemMapper.findByDifficulty(difficulty);
        // 为每个问题加载标签
        problems.forEach(this::loadProblemCategories);
        return problems;
    }

    /**
     * 创建新题目（管理员功能）
     */
    public Problem createProblem(Problem problem) {
        if (problem.getId() != null) {
            throw new IllegalArgumentException("新题目不能指定ID");
        }
        // 校验必填字段
        if (problem.getTitle() == null || problem.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("题目标题不能为空");
        }
        if (problem.getDifficulty() == null || problem.getDifficulty().trim().isEmpty()) {
            throw new IllegalArgumentException("题目难度不能为空");
        }

        if (problem.getTimeLimit() == null) {
            problem.setTimeLimit(1.0);
        }
        if (problem.getMemoryLimit() == null) {
            problem.setMemoryLimit(262144);
        }

        problemMapper.insert(problem);
        saveProblemCategories(problem);
        return problemMapper.findById(problem.getId());
    }

    /**
     * 更新题目（管理员功能）
     */
    public boolean updateProblem(Problem problem) {
        if (problem.getId() == null || problem.getId() <= 0) {
            throw new IllegalArgumentException("更新题目ID无效");
        }
        int ret = problemMapper.update(problem);
        if (ret == 0) {
            throw new RuntimeException("更新题目不存在: " + problem.getId());
        }
        saveProblemCategories(problem);
        return true;
    }

    /**
     * 删除题目（管理员功能）
     */
    public boolean deleteProblem(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("删除题目ID无效");
        }
        int ret = problemMapper.deleteById(id);
        if (ret == 0) {
            throw new RuntimeException("删除题目不存在: " + id);
        }
        return true;
    }

    /**
     * 获取题目总数
     */
    public int getTotalCount() {
        return problemMapper.count();
    }

    /**
     * 搜索题目（按标题或描述）
     */
    public List<Problem> searchProblems(String keyword, int page, int size) {
        if (page < 1) {
            throw new IllegalArgumentException("页码必须 >= 1");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("每页数量必须在 1-100 之间");
        }
        if (keyword == null || keyword.trim().isEmpty()) {
            return getProblems(page, size);
        }
        int offset = (page - 1) * size;
        List<Problem> problems = problemMapper.searchByKeyword(keyword, offset, size);
        // 为每个问题加载标签
        problems.forEach(this::loadProblemCategories);
        return problems;
    }

    /**
     * 获取搜索结果总数
     */
    public int getSearchCount(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getTotalCount();
        }
        return problemMapper.countByKeyword(keyword);
    }

    /**
     * 增加题目的提交数
     */
    public boolean incrementSubmissionCount(Long problemId) {
        if (problemId == null || problemId <= 0) {
            throw new IllegalArgumentException("题目ID无效");
        }
        return problemMapper.incrementSubmissionCount(problemId) > 0;
    }

    /**
     * 增加题目的通过数
     */
    public boolean incrementAcceptedCount(Long problemId) {
        if (problemId == null || problemId <= 0) {
            throw new IllegalArgumentException("题目ID无效");
        }
        return problemMapper.incrementAcceptedCount(problemId) > 0;
    }

    /**
     * * 根据标签获取题目列表
     */
    public List<Problem> getProblemsByTag(String tag, int page, int size) {
        if (page < 1) {
            throw new IllegalArgumentException("页码必须 >= 1");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("每页数量必须在 1-100 之间");
        }
        int offset = (page - 1) * size;
        List<Problem> problems = problemMapper.findByTag(tag, offset, size);
        problems.forEach(this::loadProblemCategories);
        return problems;
    }

    /**
     * 获取标签下的题目总数
     */
    public int getCountByTag(String tag) {
        if (tag == null || tag.trim().isEmpty()) {
            return 0;
        }
        return problemMapper.countByTag(tag);
    }

    /**
     * 获取所有标签名称
     */
    public List<String> getAllTagNames() {
        return tagMapper.findAll().stream()
                .map(com.ssoj.backend.entity.Tag::getName)
                .collect(Collectors.toList());
    }

    /**
     * * 获取题目的标签列表
     */
    public List<?> getProblemTags(Long problemId) {
        if (problemId == null || problemId <= 0) {
            throw new IllegalArgumentException("题目ID无效");
        }
        List<ProblemTag> problemTags = problemTagMapper.findByProblemId(problemId);
        // 获取标签详情
        return problemTags.stream()
                .map(pt -> tagMapper.findById(pt.getTagId()))
                .collect(Collectors.toList());
    }

    /**
     * 获取题目的测试用例列表
     */
    public List<TestCase> getTestCases(Long problemId) {
        if (problemId == null || problemId <= 0) {
            throw new IllegalArgumentException("题目ID无效");
        }
        List<TestCase> testCases = testCaseMapper.findByProblemId(problemId);
        for (TestCase tc : testCases) {
            try {
                String input = FileUtil.readFile(tc.getInputPath());
                String output = FileUtil.readFile(tc.getOutputPath());
                // 限制长度
                if (input.length() > 1000)
                    input = input.substring(0, 1000) + "...";
                if (output.length() > 1000)
                    output = output.substring(0, 1000) + "...";
                tc.setInputContent(input);
                tc.setOutputContent(output);
            } catch (Exception e) {
                tc.setInputContent("Error reading file: " + e.getMessage());
                tc.setOutputContent("Error reading file: " + e.getMessage());
            }
        }
        return testCases;
    }

    /**
     * 为题目加载分类标签
     */
    private void loadProblemCategories(Problem problem) {
        if (problem == null || problem.getId() == null) {
            return;
        }
        List<ProblemTag> problemTags = problemTagMapper.findByProblemId(problem.getId());
        List<String> categories = problemTags.stream()
                .map(pt -> {
                    var tag = tagMapper.findById(pt.getTagId());
                    return tag != null ? tag.getName() : null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        problem.setCategories(categories);
    }

    /**
     * 保存题目的标签
     */
    private void saveProblemCategories(Problem problem) {
        if (problem == null || problem.getId() == null || problem.getCategories() == null) {
            return;
        }
        // 1. 清理旧标签关联
        problemTagMapper.deleteByProblemId(problem.getId());

        // 2. 添加新标签
        for (String catName : problem.getCategories()) {
            if (catName == null || catName.trim().isEmpty())
                continue;
            catName = catName.trim();

            // 查找或创建标签
            var tag = tagMapper.findByName(catName);
            if (tag == null) {
                tag = new com.ssoj.backend.entity.Tag();
                tag.setName(catName);
                tagMapper.insert(tag);
            }

            // 建立关联
            ProblemTag pt = new ProblemTag();
            pt.setProblemId(problem.getId());
            pt.setTagId(tag.getId());
            problemTagMapper.insert(pt);
        }
    }

    /**
     * 上传并处理测试用例 ZIP 文件
     */
    public void uploadTestCases(Long problemId, MultipartFile file) throws IOException {
        // 1. 检查题目是否存在
        Problem problem = problemMapper.findById(problemId);
        if (problem == null) {
            throw new RuntimeException("题目不存在: " + problemId);
        }

        // 2. 清理旧的测试用例
        testCaseMapper.deleteByProblemId(problemId);
        // TODO: 清理物理文件（可选，FileUtil.saveTestCaseFile 会覆盖）

        // 3. 解析 ZIP 文件
        Map<String, byte[]> inputs = new HashMap<>();
        Map<String, byte[]> outputs = new HashMap<>();

        try (ZipInputStream zis = new ZipInputStream(file.getInputStream())) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (entry.isDirectory())
                    continue;
                String name = entry.getName();

                // 只处理根目录下的 .in 和 .out 文件
                if (name.contains("/")) {
                    name = name.substring(name.lastIndexOf("/") + 1);
                }

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                byte[] buffer = new byte[1024];
                int len;
                while ((len = zis.read(buffer)) > 0) {
                    baos.write(buffer, 0, len);
                }
                byte[] content = baos.toByteArray();

                if (name.endsWith(".in")) {
                    inputs.put(name.substring(0, name.length() - 3), content);
                } else if (name.endsWith(".out") || name.endsWith(".ans")) {
                    outputs.put(name.substring(0, name.length() - 4), content);
                }
            }
        }

        // 4. 配对并保存
        for (String baseName : inputs.keySet()) {
            if (outputs.containsKey(baseName)) {
                String inputPath = FileUtil.saveTestCaseFile(problemId, baseName, "in", inputs.get(baseName));
                String outputPath = FileUtil.saveTestCaseFile(problemId, baseName, "out", outputs.get(baseName));

                TestCase tc = new TestCase();
                tc.setProblemId(problemId);
                tc.setInputPath(inputPath);
                tc.setOutputPath(outputPath);
                testCaseMapper.insert(tc);
            }
        }
    }

    /**
     * 更新单个测试用例内容
     */
    public void updateTestCase(Long problemId, Long testCaseId, String inputContent, String outputContent)
            throws IOException {
        TestCase tc = testCaseMapper.findById(testCaseId);
        if (tc == null || !tc.getProblemId().equals(problemId)) {
            throw new RuntimeException("测试用例不存在或不属于该题目");
        }

        // 保存新内容到物理文件
        if (inputContent != null) {
            Files.write(Paths.get(FileUtil.getAbsolutePath(tc.getInputPath())), inputContent.getBytes());
        }
        if (outputContent != null) {
            Files.write(Paths.get(FileUtil.getAbsolutePath(tc.getOutputPath())), outputContent.getBytes());
        }

        tc.setUpdatedAt(java.time.LocalDateTime.now());
        testCaseMapper.update(tc);
    }

    /**
     * 删除单个测试用例
     */
    public void deleteTestCase(Long problemId, Long testCaseId) {
        TestCase tc = testCaseMapper.findById(testCaseId);
        if (tc == null || !tc.getProblemId().equals(problemId)) {
            throw new RuntimeException("测试用例不存在或不属于该题目");
        }

        // 删除物理文件
        FileUtil.deleteFile(tc.getInputPath());
        FileUtil.deleteFile(tc.getOutputPath());

        // 删除数据库记录
        testCaseMapper.deleteById(testCaseId);
    }
}
