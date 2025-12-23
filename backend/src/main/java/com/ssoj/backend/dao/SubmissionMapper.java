package com.ssoj.backend.dao;

import com.ssoj.backend.entity.Submission;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 提交记录数据访问接口
 */
@Mapper
public interface SubmissionMapper {

        /**
         * 根据ID查询提交记录
         */
        Submission findById(@Param("id") Long id);

        /**
         * 根据用户ID查询提交记录
         */
        List<Submission> findByUserId(@Param("userId") Long userId);

        /**
         * 根据用户ID查询提交记录（分页）
         */
        List<Submission> findByUserIdPaged(@Param("userId") Long userId, @Param("offset") int offset,
                        @Param("limit") int limit);

        /**
         * 获取用户的提交总数
         */
        int countByUserId(@Param("userId") Long userId);

        /**
         * 根据题目ID查询提交记录
         */
        List<Submission> findByProblemId(@Param("problemId") Long problemId);

        /**
         * 根据题目ID查询提交记录（分页）
         */
        List<Submission> findByProblemIdPaged(@Param("problemId") Long problemId, @Param("offset") int offset,
                        @Param("limit") int limit);

        /**
         * 获取题目的提交总数
         */
        int countByProblemId(@Param("problemId") Long problemId);

        /**
         * 查询用户在某题目的所有提交
         */
        List<Submission> findByUserIdAndProblemId(
                        @Param("userId") Long userId,
                        @Param("problemId") Long problemId);

        /**
         * 插入提交记录
         */
        int insert(Submission submission);

        /**
         * 更新提交状态（判题完成后）
         */
        int updateStatus(Submission submission);

        /**
         * 查询最近提交（分页）
         */
        List<Submission> findRecent(@Param("offset") int offset, @Param("limit") int limit);

        /**
         * 查询所有提交总数
         */
        int countAll();

        /**
         * 获取用户通过（AC）的不同题目数
         */
        int countSolvedProblemsByUserId(@Param("userId") Long userId);

        /**
         * 获取用户已通过的所有题目ID列表
         */
        List<Long> findSolvedProblemsByUserId(@Param("userId") Long userId);

        /**
         * 获取用户在最近N天的每日提交次数
         */
        List<java.util.Map<String, Object>> getDailySubmissionCount(@Param("userId") Long userId,
                        @Param("days") int days);
}
