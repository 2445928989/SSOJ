package com.ssoj.backend.service;

import com.ssoj.backend.dao.NotificationMapper;
import com.ssoj.backend.entity.Notification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationMapper notificationMapper;

    public void createNotification(Long receiverId, Long senderId, String type, Long targetId, String content) {
        if (receiverId.equals(senderId)) return; // 不给自己发通知
        
        Notification notification = new Notification();
        notification.setReceiverId(receiverId);
        notification.setSenderId(senderId);
        notification.setType(type);
        notification.setTargetId(targetId);
        notification.setContent(content);
        notificationMapper.insert(notification);
    }

    public List<Notification> getNotifications(Long receiverId) {
        return notificationMapper.findByReceiverId(receiverId);
    }

    public int getUnreadCount(Long receiverId) {
        return notificationMapper.countUnread(receiverId);
    }

    public void markAsRead(Long id) {
        notificationMapper.markAsRead(id);
    }

    public void markAllAsRead(Long receiverId) {
        notificationMapper.markAllAsRead(receiverId);
    }
}
