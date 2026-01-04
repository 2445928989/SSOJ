package com.ssoj.backend.dao;

import com.ssoj.backend.entity.Notification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface NotificationMapper {
    int insert(Notification notification);

    List<Notification> findByReceiverId(Long receiverId);

    int countUnread(Long receiverId);

    int markAsRead(Long id);

    int markAllAsRead(Long receiverId);

    int deleteById(Long id);
}
