package com.ssoj.backend.dao;

import com.ssoj.backend.entity.TestCase;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 测试用例数据访问接口
 */
@Mapper
public interface TestCaseMapper {

    /**
     * 根据ID查询测试用例
     */
    TestCase findById(@Param("id") Long id);

    /**
     * 根据题目ID查询所有测试用例
     */
    List<TestCase> findByProblemId(@Param("problemId") Long problemId);

    /**
     * 插入测试用例
     */
    int insert(TestCase testCase);

    /**
     * 更新测试用例
     */
    int update(TestCase testCase);

    /**
     * 删除测试用例
     */
    int deleteById(@Param("id") Long id);

    /**
     * 批量删除题目的测试用例
     */
    int deleteByProblemId(@Param("problemId") Long problemId);
}
