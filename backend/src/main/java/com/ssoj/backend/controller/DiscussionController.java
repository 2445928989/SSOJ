package com.ssoj.backend.controller;

import com.ssoj.backend.entity.Discussion;
import com.ssoj.backend.service.DiscussionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/discussion")
public class DiscussionController {

    @Autowired
    private DiscussionService discussionService;

    @GetMapping("/problem/{problemId}")
    public List<Discussion> getDiscussions(@PathVariable Long problemId) {
        return discussionService.getDiscussionsByProblemId(problemId);
    }

    @GetMapping("/list")
    public Object listDiscussions(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        List<Discussion> discussions = discussionService.getAllDiscussions(page, size, keyword);
        int total = discussionService.getTotalDiscussionCount(keyword);
        return Map.of(
                "success", true,
                "data", discussions,
                "total", total,
                "page", page,
                "size", size);
    }

    @GetMapping("/{id}")
    public Object getDiscussion(@PathVariable Long id) {
        Discussion discussion = discussionService.getDiscussionById(id);
        if (discussion == null) {
            return Map.of("success", false, "message", "讨论不存在");
        }
        return Map.of("success", true, "data", discussion);
    }

    @PostMapping("/add")
    public Object addDiscussion(@RequestBody Map<String, Object> request, HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return Map.of("success", false, "message", "未登录");
        }
        Long userId = (Long) session.getAttribute("userId");
        Long problemId = request.get("problemId") != null ? Long.valueOf(request.get("problemId").toString()) : null;
        Long parentId = request.get("parentId") != null ? Long.valueOf(request.get("parentId").toString()) : null;
        String title = (String) request.get("title");
        String content = (String) request.get("content");

        if (content == null || content.trim().isEmpty()) {
            return Map.of("success", false, "message", "内容不能为空");
        }

        Discussion discussion = new Discussion();
        discussion.setProblemId(problemId);
        discussion.setParentId(parentId);
        discussion.setUserId(userId);
        discussion.setTitle(title);
        discussion.setContent(content);
        discussion.setLikes(0);
        discussion.setDislikes(0);
        discussionService.addDiscussion(discussion);

        return Map.of("success", true);
    }

    @DeleteMapping("/{id}")
    public Object deleteDiscussion(@PathVariable Long id, HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return Map.of("success", false, "message", "未登录");
        }
        Long userId = (Long) session.getAttribute("userId");
        String role = (String) session.getAttribute("role");

        Discussion discussion = discussionService.getDiscussionById(id);
        if (discussion == null) {
            return Map.of("success", false, "message", "讨论不存在");
        }

        // 只有作者或管理员可以删除
        if (!discussion.getUserId().equals(userId) && !"ADMIN".equals(role)) {
            return Map.of("success", false, "message", "无权删除此讨论");
        }

        discussionService.deleteDiscussion(id);
        return Map.of("success", true);
    }
}
