package com.ssoj.backend.dao;

import com.ssoj.backend.entity.Vote;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface VoteMapper {
    Vote findByUserAndTarget(@Param("userId") Long userId, @Param("type") String type,
            @Param("targetId") Long targetId);

    int insert(Vote vote);

    int update(Vote vote);

    int delete(@Param("userId") Long userId, @Param("type") String type, @Param("targetId") Long targetId);
}
