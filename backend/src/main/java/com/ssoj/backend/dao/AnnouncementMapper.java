package com.ssoj.backend.dao;

import com.ssoj.backend.entity.Announcement;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 公告数据访问接口
 */
@Mapper
public interface AnnouncementMapper {
    Announcement findById(@Param("id") Long id);

    List<Announcement> findAll();

    int insert(Announcement announcement);

    int update(Announcement announcement);

    int deleteById(@Param("id") Long id);
}
