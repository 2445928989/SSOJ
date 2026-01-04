package com.ssoj.backend.controller;

import com.ssoj.backend.entity.Notification;
import com.ssoj.backend.entity.User;
import com.ssoj.backend.service.NotificationService;
import com.ssoj.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @GetMapping
    public Object getNotifications(HttpSession session) {
        User user = userService.getUserFromSession(session);
        if (user == null)
            return Map.of("success", false, "error", "未登录");

        List<Notification> list = notificationService.getNotifications(user.getId());
        return Map.of("success", true, "data", list);
    }

    @GetMapping("/unread-count")
    public Object getUnreadCount(HttpSession session) {
        User user = userService.getUserFromSession(session);
        if (user == null)
            return Map.of("success", true, "count", 0);

        int count = notificationService.getUnreadCount(user.getId());
        return Map.of("success", true, "count", count);
    }

    @PostMapping("/{id}/read")
    public Object markAsRead(@PathVariable Long id, HttpSession session) {
        User user = userService.getUserFromSession(session);
        if (user == null)
            return Map.of("success", false, "error", "未登录");

        notificationService.markAsRead(id);
        return Map.of("success", true);
    }

    @PostMapping("/read-all")
    public Object markAllAsRead(HttpSession session) {
        User user = userService.getUserFromSession(session);
        if (user == null)
            return Map.of("success", false, "error", "未登录");

        notificationService.markAllAsRead(user.getId());
        return Map.of("success", true);
    }
}
