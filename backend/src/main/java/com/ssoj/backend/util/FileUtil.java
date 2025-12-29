package com.ssoj.backend.util;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

/**
 * 文件工具类（测试用例、提交代码管理）
 */
public class FileUtil {

    private static final String BASE_DIR = "/tmp/ssoj";

    static {
        File dir = new File(BASE_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    /**
     * 保存提交的代码
     * 
     * @return 相对路径 submissions/{submissionId}.{ext}
     */
    public static String saveSubmissionCode(Long submissionId, String code, String language) throws IOException {
        String ext = getLanguageExtension(language);
        String fileName = "submissions/" + submissionId + "." + ext;
        String fullPath = BASE_DIR + "/" + fileName;
        Files.createDirectories(Paths.get(BASE_DIR, "submissions"));
        Files.write(Paths.get(fullPath), code.getBytes());
        return fileName;
    }

    /**
     * 保存测试用例
     * 
     * @return 相对路径 test_cases/problem_{problemId}/{identifier}.{type}
     */
    public static String saveTestCaseFile(Long problemId, String identifier, String type, byte[] data)
            throws IOException {
        String fileName = "test_cases/problem_" + problemId + "/" + identifier + "." + type;
        String fullPath = BASE_DIR + "/" + fileName;
        Files.createDirectories(Paths.get(BASE_DIR, "test_cases", "problem_" + String.valueOf(problemId)));
        Files.write(Paths.get(fullPath), data);
        return fileName;
    }

    /**
     * 读取文件内容
     */
    public static String readFile(String relativePath) throws IOException {
        return new String(Files.readAllBytes(Paths.get(BASE_DIR, relativePath)));
    }

    /**
     * 删除文件
     */
    public static boolean deleteFile(String relativePath) {
        try {
            Files.delete(Paths.get(BASE_DIR, relativePath));
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    /**
     * 获取代码文件完整路径（给判题器使用）
     */
    public static String getAbsolutePath(String relativePath) {
        return BASE_DIR + "/" + relativePath;
    }

    /**
     * 读取文件内容（截断前1000字符）
     */
    public static String readFileContent(String relativePath) {
        try {
            String fullPath = getAbsolutePath(relativePath);
            byte[] bytes = Files.readAllBytes(Paths.get(fullPath));
            String content = new String(bytes);
            if (content.length() > 1000) {
                return content.substring(0, 1000) + "... [truncated]";
            }
            return content;
        } catch (Exception e) {
            return "Error reading file: " + e.getMessage();
        }
    }

    private static String getLanguageExtension(String language) {
        return switch (language) {
            case "cpp", "c++" -> "cpp";
            case "c" -> "c";
            case "python", "python3" -> "py";
            case "java" -> "java";
            default -> "txt";
        };
    }
}
