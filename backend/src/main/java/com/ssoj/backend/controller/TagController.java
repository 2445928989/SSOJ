package com.ssoj.backend.controller;

import com.ssoj.backend.entity.Tag;
import com.ssoj.backend.entity.User;
import com.ssoj.backend.service.TagService;
import com.ssoj.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

/**
 * 标签相关 REST API
 */
@RestController
@RequestMapping("/api/tag")
public class TagController {

    @Autowired
    private TagService tagService;

    @Autowired
    private UserService userService;

    private void checkAdmin(HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未登录");
        }
        Long userId = (Long) session.getAttribute("userId");
        User user = userService.getUserById(userId);
        if (user == null || !"ADMIN".equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "无权访问");
        }
    }

    /**
     * GET /api/tag/list
     * 获取所有标签
     */
    @GetMapping("/list")
    public Map<String, Object> listTags() {
        List<Tag> tags = tagService.listAllTags();
        return Map.of(
                "success", true,
                "data", tags,
                "total", tags.size());
    }

    /**
     * GET /api/tag/{id}
     * 获取单个标签
     */
    @GetMapping("/{id}")
    public Tag getTag(@PathVariable Long id) {
        Tag tag = tagService.getTagById(id);
        if (tag == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "标签不存在");
        }
        return tag;
    }

    /**
     * POST /api/tag/create
     * 创建标签（需要管理员权限）
     */
    @PostMapping("/create")
    public Object createTag(@RequestBody Tag tag, HttpSession session) {
        checkAdmin(session);

        Tag created = tagService.createTag(tag.getName());
        return Map.of(
                "success", true,
                "data", created);
    }

    /**
     * DELETE /api/tag/{id}
     * 删除标签（需要管理员权限）
     */
    @DeleteMapping("/{id}")
    public Object deleteTag(@PathVariable Long id, HttpSession session) {
        checkAdmin(session);

        boolean deleted = tagService.deleteTag(id);
        return Map.of(
                "success", deleted);
    }
}
