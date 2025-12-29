package com.ssoj.backend.dao;

import com.ssoj.backend.entity.Problem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 题目数据访问接口
 */
@Mapper
public interface ProblemMapper {
    // TODO: 实现以下方法

    /**
     * 根据ID查询题目
     */
    Problem findById(@Param("id") Long id);

    /**
     * 查询所有题目（分页）
     */
    List<Problem> findAll(@Param("offset") int offset, @Param("limit") int limit);

    /**
     * 根据难度查询题目
     */
    List<Problem> findByDifficulty(@Param("difficulty") String difficulty);

    /**
     * 插入新题目
     */
    int insert(Problem problem);

    /**
     * 更新题目
     */
    int update(Problem problem);

    /**
     * 删除题目
     */
    int deleteById(@Param("id") Long id);

    /**
     * 统计题目总数
     */
    int count();

    /**
     * 搜索题目（按标题或描述）
     */
    List<Problem> searchByKeyword(@Param("keyword") String keyword, @Param("offset") int offset,
            @Param("limit") int limit);

    /**
     * 统计搜索结果数
     */
    int countByKeyword(@Param("keyword") String keyword);

    /**
     * 增加题目的提交数
     */
    int incrementSubmissionCount(@Param("problemId") Long problemId);

    /**
     * 增加题目的通过数
     */
    int incrementAcceptedCount(@Param("problemId") Long problemId);

    /**
     * 根据标签查询题目
     */
    List<Problem> findByTag(@Param("tagName") String tagName, @Param("offset") int offset, @Param("limit") int limit);

    /**
     * 统计标签下的题目总数
     */
    int countByTag(@Param("tagName") String tagName);
}
