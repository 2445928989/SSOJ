package com.ssoj.backend.dao;

import com.ssoj.backend.entity.Result;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 测试结果数据访问接口
 */
@Mapper
public interface ResultMapper {

    /**
     * 根据ID查询结果
     */
    Result findById(@Param("id") Long id);

    /**
     * 根据提交ID查询所有结果
     */
    List<Result> findBySubmissionId(@Param("submissionId") Long submissionId);

    /**
     * 插入结果
     */
    int insert(Result result);

    /**
     * 批量插入结果
     */
    int batchInsert(@Param("list") List<Result> results);

    /**
     * 删除提交的所有结果
     */
    int deleteBySubmissionId(@Param("submissionId") Long submissionId);
}
