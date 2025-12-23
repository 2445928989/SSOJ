package com.ssoj.backend.controller;

import com.ssoj.backend.entity.Tag;
import com.ssoj.backend.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
            throw new RuntimeException("标签不存在");
        }
        return tag;
    }

    /**
     * POST /api/tag/create
     * 创建标签（需要管理员权限）
     */
    @PostMapping("/create")
    public Object createTag(@RequestBody Tag tag, jakarta.servlet.http.HttpServletRequest request) {
        // 检查权限
        jakarta.servlet.http.HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            throw new RuntimeException("未登录");
        }

        Tag created = tagService.createTag(tag.getName(), tag.getColor());
        return Map.of(
                "success", true,
                "data", created);
    }

    /**
     * DELETE /api/tag/{id}
     * 删除标签（需要管理员权限）
     */
    @DeleteMapping("/{id}")
    public Object deleteTag(@PathVariable Long id, jakarta.servlet.http.HttpServletRequest request) {
        // 检查权限
        jakarta.servlet.http.HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            throw new RuntimeException("未登录");
        }

        boolean deleted = tagService.deleteTag(id);
        return Map.of(
                "success", deleted);
    }
}
