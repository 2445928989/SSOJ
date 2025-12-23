package com.ssoj.backend.dao;

import com.ssoj.backend.entity.Tag;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 标签数据访问接口
 */
@Mapper
public interface TagMapper {

    /**
     * 根据ID查询标签
     */
    Tag findById(@Param("id") Long id);

    /**
     * 根据名称查询标签
     */
    Tag findByName(@Param("name") String name);

    /**
     * 查询所有标签
     */
    List<Tag> findAll();

    /**
     * 插入标签
     */
    int insert(Tag tag);

    /**
     * 更新标签
     */
    int update(Tag tag);

    /**
     * 删除标签
     */
    int deleteById(@Param("id") Long id);
}
