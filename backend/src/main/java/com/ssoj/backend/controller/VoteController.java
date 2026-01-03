package com.ssoj.backend.controller;

import com.ssoj.backend.entity.User;
import com.ssoj.backend.entity.Vote;
import com.ssoj.backend.service.VoteService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/votes")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;

    @PostMapping
    public Object vote(@RequestBody Map<String, Object> params, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return Map.of("success", false, "message", "请先登录");
        }

        String type = (String) params.get("type");
        Long targetId = Long.valueOf(params.get("targetId").toString());
        Integer voteType = (Integer) params.get("voteType");

        voteService.vote(user.getId(), type, targetId, voteType);
        return Map.of("success", true);
    }

    @GetMapping("/status")
    public Object getVoteStatus(@RequestParam String type, @RequestParam Long targetId, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return Map.of("success", true, "data", 0);
        }

        Vote vote = voteService.getVote(user.getId(), type, targetId);
        return Map.of("success", true, "data", vote != null ? vote.getVoteType() : 0);
    }
}
