package com.ssoj.backend.dao;

import com.ssoj.backend.entity.UserFollow;
import com.ssoj.backend.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface UserFollowMapper {
    int insert(UserFollow follow);

    int delete(@Param("followerId") Long followerId, @Param("followingId") Long followingId);

    UserFollow find(@Param("followerId") Long followerId, @Param("followingId") Long followingId);

    List<User> findFollowers(Long userId);

    List<User> findFollowing(Long userId);

    int countFollowers(Long userId);

    int countFollowing(Long userId);
}
