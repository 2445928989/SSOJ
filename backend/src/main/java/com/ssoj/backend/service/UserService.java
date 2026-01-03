package com.ssoj.backend.service;

import com.ssoj.backend.entity.User;
import com.ssoj.backend.dao.UserMapper;
import com.ssoj.backend.dao.SubmissionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 用户业务逻辑服务
 */
@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private SubmissionMapper submissionMapper;

    /**
     * 用户注册
     * - 检查用户名是否已存在
     * - 密码加密（使用 BCrypt）
     * - 保存用户
     */
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public User register(String username, String password, String email) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("用户名不能为空");
        }
        // 校验用户名格式：仅允许字母、数字、下划线，长度 3-20
        if (!username.matches("^[a-zA-Z0-9_]{3,20}$")) {
            throw new IllegalArgumentException("用户名格式不正确（仅允许3-20位字母、数字或下划线）");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("密码不能为空");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("邮箱不能为空");
        }

        if (userMapper.findByUsername(username) != null) {
            throw new IllegalArgumentException("用户名已存在");
        }
        if (userMapper.findByEmail(email) != null) {
            throw new IllegalArgumentException("邮箱已被使用");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setRole("USER");

        userMapper.insert(user);
        // 返回完整对象（包含 id）
        return userMapper.findById(user.getId());
    }

    /**
     * 用户登录
     * - 验证用户名或邮箱
     */
    public User login(String identifier, String password) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new IllegalArgumentException("用户名或邮箱不能为空");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("密码不能为空");
        }

        // 尝试通过用户名查找
        User user = userMapper.findByUsername(identifier);
        // 如果没找到，尝试通过邮箱查找
        if (user == null && identifier.contains("@")) {
            user = userMapper.findByEmail(identifier);
        }

        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }
        return user;
    }

    /**
     * 更新用户头像
     */
    public void updateAvatar(Long userId, String avatarUrl) {
        User user = userMapper.findById(userId);
        if (user != null) {
            user.setAvatar(avatarUrl);
            userMapper.update(user);
        }
    }

    /**
     * 更新用户背景图
     */
    public void updateBackgroundImage(Long userId, String backgroundUrl) {
        User user = userMapper.findById(userId);
        if (user != null) {
            user.setBackgroundImage(backgroundUrl);
            userMapper.update(user);
        }
    }

    /**
     * 根据ID获取用户信息
     */
    public User getUserById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("用户ID不合法");
        }
        User user = userMapper.findById(id);
        if (user != null) {
            // 添加做题统计信息
            user.setSubmissions(submissionMapper.countByUserId(user.getId()));
            user.setSolved(submissionMapper.countSolvedProblemsByUserId(user.getId()));
        }
        return user;
    }

    /**
     * 重置密码
     */
    public void resetPassword(String email, String newPassword) {
        User user = userMapper.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("该邮箱未注册用户");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userMapper.update(user);
    }

    /**
     * 获取所有用户（管理员功能）
     */
    public List<User> getAllUsers() {
        List<User> users = userMapper.findAll();
        // 为每个用户添加solved和submissions统计
        for (User user : users) {
            user.setSubmissions(submissionMapper.countByUserId(user.getId()));
            user.setSolved(submissionMapper.countSolvedProblemsByUserId(user.getId()));
        }
        return users;
    }

    /**
     * 更新用户信息
     */
    public boolean updateUser(User user) {
        if (user.getId() == null || user.getId() <= 0) {
            throw new IllegalArgumentException("用户ID无效");
        }
        int ret = userMapper.update(user);
        return ret > 0;
    }

    /**
     * 更新用户个人资料（仅更新可修改的字段）
     */
    public boolean updateProfile(Long userId, String nickname, String phone, String profile) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("用户ID无效");
        }
        int ret = userMapper.updateProfile(userId, nickname, phone, profile, null);
        return ret > 0;
    }

    /**
     * 修改密码
     */
    public boolean changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("原密码错误");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        return userMapper.update(user) > 0;
    }

    /**
     * 删除用户（管理员功能）
     */
    public boolean deleteUser(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("删除用户ID不合法");
        }

        return true;
    }

    /**
     * 获取用户已通过的题目ID列表
     */
    public List<Long> getSolvedProblems(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("用户ID无效");
        }
        return submissionMapper.findSolvedProblemsByUserId(userId);
    }

    /**
     * 获取用户最近365天的每日提交热力图数据
     */
    public java.util.Map<String, Integer> getSubmissionHeatmap(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("用户ID无效");
        }
        List<java.util.Map<String, Object>> dailyData = submissionMapper.getDailySubmissionCount(userId, 365);
        java.util.Map<String, Integer> heatmap = new java.util.HashMap<>();

        // 初始化最近365天的所有日期（计数为0）
        java.time.LocalDate today = java.time.LocalDate.now();
        for (int i = 364; i >= 0; i--) {
            java.time.LocalDate date = today.minusDays(i);
            heatmap.put(date.toString(), 0);
        }

        // 填充实际的提交数据
        for (java.util.Map<String, Object> day : dailyData) {
            String date = day.get("date").toString();
            Number count = (Number) day.get("count");
            heatmap.put(date, count.intValue());
        }

        return heatmap;
    }
}
