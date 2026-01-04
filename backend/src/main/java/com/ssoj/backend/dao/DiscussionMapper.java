package com.ssoj.backend.dao;

import com.ssoj.backend.entity.Discussion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface DiscussionMapper {
    List<Discussion> findByProblemId(@Param("problemId") Long problemId);

    List<Discussion> findByParentId(@Param("parentId") Long parentId);

    Discussion findById(@Param("id") Long id);

    List<Discussion> findDescendants(@Param("id") Long id);

    List<Discussion> findAllPaged(@Param("offset") int offset, @Param("limit") int limit,
            @Param("keyword") String keyword, @Param("sort") String sort);

    void updateUpdatedAt(@Param("id") Long id);

    int countAll(@Param("keyword") String keyword);

    int insert(Discussion discussion);

    void updateLikes(@Param("id") Long id, @Param("delta") int delta);

    void updateDislikes(@Param("id") Long id, @Param("delta") int delta);

    int softDeleteById(@Param("id") Long id);

    int deleteById(@Param("id") Long id);
}
