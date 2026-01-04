package com.ssoj.backend.service;

import com.ssoj.backend.dao.UserFollowMapper;
import com.ssoj.backend.entity.UserFollow;
import com.ssoj.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class UserFollowService {

    @Autowired
    private UserFollowMapper userFollowMapper;

    @Autowired
    private NotificationService notificationService;

    public void follow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new RuntimeException("不能关注自己");
        }
        if (userFollowMapper.find(followerId, followingId) != null) {
            return;
        }
        UserFollow follow = new UserFollow();
        follow.setFollowerId(followerId);
        follow.setFollowingId(followingId);
        userFollowMapper.insert(follow);

        // 发送通知
        notificationService.createNotification(followingId, followerId, "FOLLOW", null, "关注了你");
    }

    public void unfollow(Long followerId, Long followingId) {
        userFollowMapper.delete(followerId, followingId);
    }

    public boolean isFollowing(Long followerId, Long followingId) {
        return userFollowMapper.find(followerId, followingId) != null;
    }

    public List<User> getFollowers(Long userId) {
        return userFollowMapper.findFollowers(userId);
    }

    public List<User> getFollowing(Long userId) {
        return userFollowMapper.findFollowing(userId);
    }

    public Map<String, Integer> getFollowCounts(Long userId) {
        return Map.of(
                "followers", userFollowMapper.countFollowers(userId),
                "following", userFollowMapper.countFollowing(userId));
    }
}
