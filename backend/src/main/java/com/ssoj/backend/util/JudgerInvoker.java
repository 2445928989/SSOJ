package com.ssoj.backend.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;

/**
 * 判题机调用工具类
 */
@Component
public class JudgerInvoker {

    @Value("${judger.binary:./judger/judger}")
    private String judgerBinary;

    private ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 调用判题机执行判题
     * 
     * @param srcPath    源代码文件路径
     * @param lang       编程语言（cpp/c/python）
     * @param inputPath  输入文件路径
     * @param outputPath 期望输出文件路径
     * @param timeLimit  时间限制（秒）
     * @param memLimit   内存限制（KB）
     * @return JSON 结果字符串
     */
    public String judge(String srcPath, String lang, String inputPath,
            String outputPath, double timeLimit, int memLimit) throws Exception {
        return judge(srcPath, lang, inputPath, outputPath, timeLimit, memLimit, null);
    }

    /**
     * 调用判题机执行判题（支持指定可执行文件）
     */
    public String judge(String srcPath, String lang, String inputPath,
            String outputPath, double timeLimit, int memLimit, String exePath) throws Exception {
        // 解析judgerBinary路径，处理相对路径
        String judgerPath = judgerBinary;
        if (!new File(judgerPath).isAbsolute()) {
            judgerPath = new File(judgerBinary).getCanonicalPath();
        }

        java.util.List<String> commands = new java.util.ArrayList<>();
        commands.add(judgerPath);
        if (srcPath != null && !srcPath.isEmpty()) {
            commands.add("--src");
            commands.add(srcPath);
        }
        commands.add("--lang");
        commands.add(lang);
        commands.add("--input");
        commands.add(inputPath);
        commands.add("--output");
        commands.add(outputPath);
        commands.add("--time");
        commands.add(String.valueOf(timeLimit));
        commands.add("--mem");
        commands.add(String.valueOf(memLimit));
        if (exePath != null && !exePath.isEmpty()) {
            commands.add("--exe");
            commands.add(exePath);
        }

        ProcessBuilder pb = new ProcessBuilder(commands);

        Process process = pb.start();
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        StringBuilder result = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            result.append(line).append("\n");
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("Judger process exited with code: " + exitCode);
        }

        return result.toString().trim();
    }

    /**
     * 编译代码
     */
    public String compile(String srcPath, String lang) throws Exception {
        String judgerPath = judgerBinary;
        if (!new File(judgerPath).isAbsolute()) {
            judgerPath = new File(judgerBinary).getCanonicalPath();
        }

        ProcessBuilder pb = new ProcessBuilder(
                judgerPath,
                "--src", srcPath,
                "--lang", lang,
                "--compile-only");

        Process process = pb.start();
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        StringBuilder result = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            result.append(line).append("\n");
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("Judger compile process exited with code: " + exitCode);
        }

        return result.toString().trim();
    }

    /**
     * 解析判题机返回的 JSON 结果
     */
    public JsonNode parseResult(String jsonResult) throws Exception {
        return objectMapper.readTree(jsonResult);
    }
}
