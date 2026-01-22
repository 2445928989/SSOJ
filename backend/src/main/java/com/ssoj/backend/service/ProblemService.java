package com.ssoj.backend.service;

import com.ssoj.backend.entity.Problem;
import com.ssoj.backend.entity.ProblemTag;
import com.ssoj.backend.entity.SampleCase;
import com.ssoj.backend.entity.TestCase;
import com.ssoj.backend.dao.ProblemMapper;
import com.ssoj.backend.dao.ProblemTagMapper;
import com.ssoj.backend.dao.SampleCaseMapper;
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

    @Autowired
    private SampleCaseMapper sampleCaseMapper;

    @Autowired
    private TaskService taskService;

    /**
     * 加载题目内容（处理描述加载、样例加载与旧数据迁移）
     */
    private void loadProblemData(Problem problem) {
        // 1. 描述迁移与加载
        if ((problem.getDescriptionId() == null || problem.getDescriptionId().isEmpty())
                && problem.getDescription() != null && !problem.getDescription().isEmpty()) {
            try {
                String descId = FileUtil.saveDescription(problem.getDescription());
                problem.setDescriptionId(descId);
                problemMapper.update(problem);
            } catch (IOException e) {
                System.err.println(
                        "Auto description migration failed for problem " + problem.getId() + ": " + e.getMessage());
            }
        } else {
            problem.setDescription(FileUtil.readDescription(problem.getDescriptionId()));
        }

        // 2. 样例加载
        List<SampleCase> samples = sampleCaseMapper.findByProblemId(problem.getId());

        // 如果数据库中有关联样例，则直接返回
        if (!samples.isEmpty()) {
            problem.setSamples(samples);
        } else {
            // 兼容性迁移：如果关联表为空，但旧字段有数据
            if (problem.getSampleInput() != null && !problem.getSampleInput().isEmpty()) {
                try {
                    String[] inParts = problem.getSampleInput().split("---");
                    String[] outParts = (problem.getSampleOutput() != null ? problem.getSampleOutput() : "")
                            .split("---");
                    int count = Math.max(inParts.length, outParts.length);
                    List<SampleCase> migrateSamples = new ArrayList<>();
                    for (int i = 0; i < count; i++) {
                        SampleCase sc = new SampleCase();
                        sc.setProblemId(problem.getId());
                        sc.setInputText(i < inParts.length ? inParts[i].trim() : "");
                        sc.setOutputText(i < outParts.length ? outParts[i].trim() : "");
                        sc.setOrderNum(i);
                        sampleCaseMapper.insert(sc);
                        migrateSamples.add(sc);
                    }
                    problem.setSamples(migrateSamples);
                } catch (Exception e) {
                    System.err.println(
                            "Auto samples migration failed for problem " + problem.getId() + ": " + e.getMessage());
                }
            } else {
                problem.setSamples(new ArrayList<>());
            }
        }
    }

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
        // 为每个问题加载标签和描述
        problems.forEach(p -> {
            loadProblemCategories(p);
            loadProblemData(p);
        });
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
        loadProblemData(problem);
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
        // 为每个问题加载标签和描述
        problems.forEach(p -> {
            loadProblemCategories(p);
            loadProblemData(p);
        });
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

        // 保存描述到文件
        try {
            if (problem.getDescription() != null) {
                String descId = FileUtil.saveDescription(problem.getDescription());
                problem.setDescriptionId(descId);
            }
        } catch (IOException e) {
            throw new RuntimeException("保存题目描述失败: " + e.getMessage());
        }

        problemMapper.insert(problem);

        // 保存样例
        if (problem.getSamples() != null && !problem.getSamples().isEmpty()) {
            problem.getSamples().forEach(s -> s.setProblemId(problem.getId()));
            sampleCaseMapper.batchInsert(problem.getSamples());
        }

        saveProblemCategories(problem);
        return getProblemById(problem.getId());
    }

    /**
     * 更新题目（管理员功能）
     */
    public boolean updateProblem(Problem problem) {
        if (problem.getId() == null || problem.getId() <= 0) {
            throw new IllegalArgumentException("更新题目ID无效");
        }

        // 获取原题目状态以判断是否需要更新描述文件
        Problem oldProblem = problemMapper.findById(problem.getId());
        if (oldProblem == null) {
            throw new RuntimeException("更新题目不存在: " + problem.getId());
        }

        try {
            if (problem.getDescription() != null) {
                if (oldProblem.getDescriptionId() != null) {
                    FileUtil.updateDescription(oldProblem.getDescriptionId(), problem.getDescription());
                    problem.setDescriptionId(oldProblem.getDescriptionId());
                } else {
                    String descId = FileUtil.saveDescription(problem.getDescription());
                    problem.setDescriptionId(descId);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("更新题目描述失败: " + e.getMessage());
        }

        int ret = problemMapper.update(problem);
        if (ret == 0) {
            throw new RuntimeException("更新题目失败: " + problem.getId());
        }

        // 更新样例：先删后插
        if (problem.getSamples() != null) {
            sampleCaseMapper.deleteByProblemId(problem.getId());
            if (!problem.getSamples().isEmpty()) {
                problem.getSamples().forEach(s -> s.setProblemId(problem.getId()));
                sampleCaseMapper.batchInsert(problem.getSamples());
            }
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
        // 为每个问题加载标签和描述
        problems.forEach(p -> {
            loadProblemCategories(p);
            loadProblemData(p);
        });
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
        problems.forEach(p -> {
            loadProblemCategories(p);
            loadProblemData(p);
        });
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
     * 获取题目的测试用例列表（内容会被截断以提高性能）
     */
    public List<TestCase> getTestCases(Long problemId) {
        if (problemId == null || problemId <= 0) {
            throw new IllegalArgumentException("题目ID无效");
        }
        List<TestCase> testCases = testCaseMapper.findByProblemId(problemId);
        for (TestCase tc : testCases) {
            tc.setInputContent(FileUtil.readFileContent(tc.getInputPath()));
            tc.setOutputContent(FileUtil.readFileContent(tc.getOutputPath()));
        }
        return testCases;
    }

    /**
     * 获取单个测试用例详情 (不读取内容)
     */
    public TestCase getTestCaseById(Long testCaseId) {
        return testCaseMapper.findById(testCaseId);
    }

    /**
     * 获取单个测试用例的完整内容
     */
    public TestCase getTestCaseDetail(Long problemId, Long testCaseId) {
        TestCase tc = testCaseMapper.findById(testCaseId);
        if (tc == null || !tc.getProblemId().equals(problemId)) {
            throw new RuntimeException("测试用例不存在或不属于该题目");
        }
        try {
            tc.setInputContent(FileUtil.readFile(tc.getInputPath()));
            tc.setOutputContent(FileUtil.readFile(tc.getOutputPath()));
        } catch (Exception e) {
            tc.setInputContent("Error reading file: " + e.getMessage());
            tc.setOutputContent("Error reading file: " + e.getMessage());
        }
        return tc;
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
     * 异步上传并处理测试用例 ZIP 文件
     */
    public String uploadTestCasesAsync(Long problemId, MultipartFile file) throws IOException {
        // 1. 检查题目是否存在
        Problem problem = problemMapper.findById(problemId);
        if (problem == null) {
            throw new RuntimeException("题目不存在: " + problemId);
        }

        String taskId = taskService.createTask();
        // 因为 MultipartFile 的 InputStream 在请求结束后会关闭，
        // 且如果是直接在内存中，读取一次就没了，所以先转成 byte[]
        byte[] bytes = file.getBytes();

        new Thread(() -> {
            try {
                taskService.updateProgress(taskId, 5.0, "running", "正在分析 ZIP 文件...");

                // 1. 先统计文件总数以计算进度
                int totalEntries = 0;
                try (ZipInputStream zis = new ZipInputStream(new java.io.ByteArrayInputStream(bytes))) {
                    while (zis.getNextEntry() != null) {
                        totalEntries++;
                    }
                }

                if (totalEntries == 0) {
                    taskService.failTask(taskId, "ZIP 文件为空");
                    return;
                }

                // 2. 清理旧的测试用例
                testCaseMapper.deleteByProblemId(problemId);

                // 3. 解析 ZIP 文件
                Map<String, byte[]> inputs = new HashMap<>();
                Map<String, byte[]> outputs = new HashMap<>();

                try (ZipInputStream zis = new ZipInputStream(new java.io.ByteArrayInputStream(bytes))) {
                    ZipEntry entry;
                    int processed = 0;
                    while ((entry = zis.getNextEntry()) != null) {
                        processed++;
                        double progress = 5.0 + (processed * 60.0 / totalEntries);
                        taskService.updateProgress(taskId, progress, "running", "正在解压: " + entry.getName());

                        if (entry.isDirectory())
                            continue;
                        String name = entry.getName();

                        // 只处理根目录下或者扁平化后的 .in 和 .out 文件
                        if (name.contains("/")) {
                            name = name.substring(name.lastIndexOf("/") + 1);
                        }
                        if (name.isEmpty())
                            continue;

                        ByteArrayOutputStream baos = new ByteArrayOutputStream();
                        byte[] buffer = new byte[8192];
                        int len;
                        while ((len = zis.read(buffer)) > 0) {
                            baos.write(buffer, 0, len);
                        }
                        byte[] content = baos.toByteArray();

                        if (name.endsWith(".in")) {
                            inputs.put(name.substring(0, name.length() - 3), content);
                        } else if (name.endsWith(".out") || name.endsWith(".ans")) {
                            String base = name.endsWith(".out") ? name.substring(0, name.length() - 4)
                                    : name.substring(0, name.length() - 4);
                            outputs.put(base, content);
                        }
                    }
                }

                // 4. 配对并保存
                int totalToSave = inputs.size();
                int saved = 0;
                for (String baseName : inputs.keySet()) {
                    if (outputs.containsKey(baseName)) {
                        saved++;
                        double progress = 65.0 + (saved * 35.0 / totalToSave);
                        taskService.updateProgress(taskId, progress, "running", "正在保存测试点: " + baseName);

                        String inputPath = FileUtil.saveTestCaseFile(problemId, baseName, "in", inputs.get(baseName));
                        String outputPath = FileUtil.saveTestCaseFile(problemId, baseName, "out",
                                outputs.get(baseName));

                        TestCase tc = new TestCase();
                        tc.setProblemId(problemId);
                        tc.setInputPath(inputPath);
                        tc.setOutputPath(outputPath);
                        testCaseMapper.insert(tc);
                    }
                }

                taskService.completeTask(taskId, Map.of("count", saved));
            } catch (Exception e) {
                e.printStackTrace();
                taskService.failTask(taskId, "解压失败: " + e.getMessage());
            }
        }).start();

        return taskId;
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

    /**
     * 添加单个测试用例
     */
    public void addTestCase(Long problemId, String inputContent, String outputContent) throws IOException {
        Problem problem = problemMapper.findById(problemId);
        if (problem == null) {
            throw new RuntimeException("题目不存在: " + problemId);
        }

        // 生成唯一标识符
        String identifier = "manual_" + System.currentTimeMillis();
        String inputPath = FileUtil.saveTestCaseFile(problemId, identifier, "in",
                (inputContent != null ? inputContent : "").getBytes());
        String outputPath = FileUtil.saveTestCaseFile(problemId, identifier, "out",
                (outputContent != null ? outputContent : "").getBytes());

        TestCase tc = new TestCase();
        tc.setProblemId(problemId);
        tc.setInputPath(inputPath);
        tc.setOutputPath(outputPath);
        testCaseMapper.insert(tc);
    }
}
