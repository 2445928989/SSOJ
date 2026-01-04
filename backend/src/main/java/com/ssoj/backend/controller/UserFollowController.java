package com.ssoj.backend.controller;

import com.ssoj.backend.entity.User;
import com.ssoj.backend.service.UserFollowService;
import com.ssoj.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/follow")
public class UserFollowController {

    @Autowired
    private UserFollowService userFollowService;

    @Autowired
    private UserService userService;

    @PostMapping("/{userId}")
    public Object follow(@PathVariable Long userId, HttpSession session) {
        User currentUser = userService.getUserFromSession(session);
        if (currentUser == null)
            return Map.of("success", false, "error", "未登录");

        try {
            userFollowService.follow(currentUser.getId(), userId);
            return Map.of("success", true);
        } catch (Exception e) {
            return Map.of("success", false, "error", e.getMessage());
        }
    }

    @DeleteMapping("/{userId}")
    public Object unfollow(@PathVariable Long userId, HttpSession session) {
        User currentUser = userService.getUserFromSession(session);
        if (currentUser == null)
            return Map.of("success", false, "error", "未登录");

        userFollowService.unfollow(currentUser.getId(), userId);
        return Map.of("success", true);
    }

    @GetMapping("/{userId}/status")
    public Object getStatus(@PathVariable Long userId, HttpSession session) {
        User currentUser = userService.getUserFromSession(session);
        if (currentUser == null)
            return Map.of("success", true, "following", false);

        boolean following = userFollowService.isFollowing(currentUser.getId(), userId);
        return Map.of("success", true, "following", following);
    }

    @GetMapping("/{userId}/followers")
    public Object getFollowers(@PathVariable Long userId) {
        List<User> followers = userFollowService.getFollowers(userId);
        return Map.of("success", true, "data", followers);
    }

    @GetMapping("/{userId}/following")
    public Object getFollowing(@PathVariable Long userId) {
        List<User> following = userFollowService.getFollowing(userId);
        return Map.of("success", true, "data", following);
    }

    @GetMapping("/{userId}/counts")
    public Object getCounts(@PathVariable Long userId) {
        Map<String, Integer> counts = userFollowService.getFollowCounts(userId);
        return Map.of("success", true, "data", counts);
    }
}
