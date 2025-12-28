package com.ssoj.backend.controller;

import com.ssoj.backend.entity.Announcement;
import com.ssoj.backend.entity.User;
import com.ssoj.backend.service.AnnouncementService;
import com.ssoj.backend.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/announcement")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @Autowired
    private UserService userService;

    @GetMapping("/list")
    public Object list() {
        return Map.of("success", true, "data", announcementService.getAllAnnouncements());
    }

    @PostMapping
    public Object create(@RequestBody Announcement announcement, HttpSession session) {
        checkAdmin(session);
        Long userId = (Long) session.getAttribute("userId");
        announcement.setAuthorId(userId);
        announcementService.createAnnouncement(announcement);
        return Map.of("success", true);
    }

    @PutMapping("/{id}")
    public Object update(@PathVariable Long id, @RequestBody Announcement announcement, HttpSession session) {
        checkAdmin(session);
        announcement.setId(id);
        announcementService.updateAnnouncement(announcement);
        return Map.of("success", true);
    }

    @DeleteMapping("/{id}")
    public Object delete(@PathVariable Long id, HttpSession session) {
        checkAdmin(session);
        announcementService.deleteAnnouncement(id);
        return Map.of("success", true);
    }

    private void checkAdmin(HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "未登录");
        }
        Long userId = (Long) session.getAttribute("userId");
        User user = userService.getUserById(userId);
        if (user == null || !"ADMIN".equals(user.getRole())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "无权操作");
        }
    }
}
