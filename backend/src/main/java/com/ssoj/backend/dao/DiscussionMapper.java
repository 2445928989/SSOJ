package com.ssoj.backend.dao;

import com.ssoj.backend.entity.Discussion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface DiscussionMapper {
    List<Discussion> findByProblemId(@Param("problemId") Long problemId);

    List<Discussion> findAllPaged(@Param("offset") int offset, @Param("limit") int limit,
            @Param("keyword") String keyword);

    int countAll(@Param("keyword") String keyword);

    int insert(Discussion discussion);

    int deleteById(@Param("id") Long id);
}
