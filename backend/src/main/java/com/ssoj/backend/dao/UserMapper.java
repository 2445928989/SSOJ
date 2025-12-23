package com.ssoj.backend.dao;

import com.ssoj.backend.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 用户数据访问接口
 */
@Mapper
public interface UserMapper {

    /**
     * 根据ID查询用户
     */
    User findById(@Param("id") Long id);

    /**
     * 根据用户名查询用户
     */
    User findByUsername(@Param("username") String username);

    /**
     * 根据昵称查询用户
     */
    User findByNickname(@Param("nickname") String nickname);

    /**
     * 根据邮箱查询用户
     */
    User findByEmail(@Param("email") String email);

    /**
     * 查询所有用户
     */
    List<User> findAll();

    /**
     * 插入新用户
     */
    int insert(User user);

    /**
     * 更新用户信息
     */
    int update(User user);

    /**
     * 只更新用户的个人资料（昵称、电话、个人介绍、头像）
     */
    int updateProfile(@Param("id") Long id, @Param("nickname") String nickname,
            @Param("phone") String phone, @Param("profile") String profile,
            @Param("avatar") String avatar);

    /**
     * 删除用户
     */
    int deleteById(@Param("id") Long id);
}