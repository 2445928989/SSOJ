package com.ssoj.backend.dao;

import com.ssoj.backend.entity.ProblemTag;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 题目标签关联数据访问接口
 */
@Mapper
public interface ProblemTagMapper {

    /**
     * 根据题目ID查询所有标签关联
     */
    List<ProblemTag> findByProblemId(@Param("problemId") Long problemId);

    /**
     * 根据标签ID查询所有题目关联
     */
    List<ProblemTag> findByTagId(@Param("tagId") Long tagId);

    /**
     * 插入题目标签关联
     */
    int insert(ProblemTag problemTag);

    /**
     * 批量插入题目标签关联
     */
    int batchInsert(@Param("list") List<ProblemTag> problemTags);

    /**
     * 删除题目的所有标签关联
     */
    int deleteByProblemId(@Param("problemId") Long problemId);

    /**
     * 删除指定的题目标签关联
     */
    int delete(@Param("problemId") Long problemId, @Param("tagId") Long tagId);
}
