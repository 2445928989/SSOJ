package com.ssoj.backend.service;

import com.ssoj.backend.dao.DiscussionMapper;
import com.ssoj.backend.dao.ProblemMapper;
import com.ssoj.backend.dao.VoteMapper;
import com.ssoj.backend.entity.Vote;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoteMapper voteMapper;
    private final ProblemMapper problemMapper;
    private final DiscussionMapper discussionMapper;

    @Transactional
    public void vote(Long userId, String type, Long targetId, Integer voteType) {
        Vote existingVote = voteMapper.findByUserAndTarget(userId, type, targetId);

        if (existingVote != null) {
            if (existingVote.getVoteType().equals(voteType)) {
                // 取消点赞/点踩
                voteMapper.delete(userId, type, targetId);
                updateTargetCount(type, targetId, voteType, -1);
            } else {
                // 改变点赞/点踩
                int oldVoteType = existingVote.getVoteType();
                existingVote.setVoteType(voteType);
                voteMapper.update(existingVote);
                updateTargetCount(type, targetId, oldVoteType, -1);
                updateTargetCount(type, targetId, voteType, 1);
            }
        } else {
            // 新增点赞/点踩
            Vote vote = new Vote();
            vote.setUserId(userId);
            vote.setType(type);
            vote.setTargetId(targetId);
            vote.setVoteType(voteType);
            voteMapper.insert(vote);
            updateTargetCount(type, targetId, voteType, 1);
        }
    }

    private void updateTargetCount(String type, Long targetId, Integer voteType, int delta) {
        if ("PROBLEM".equals(type)) {
            if (voteType == 1) {
                problemMapper.updateLikes(targetId, delta);
            } else {
                problemMapper.updateDislikes(targetId, delta);
            }
        } else if ("DISCUSSION".equals(type)) {
            if (voteType == 1) {
                discussionMapper.updateLikes(targetId, delta);
            } else {
                discussionMapper.updateDislikes(targetId, delta);
            }
        }
    }

    public Vote getVote(Long userId, String type, Long targetId) {
        return voteMapper.findByUserAndTarget(userId, type, targetId);
    }
}
