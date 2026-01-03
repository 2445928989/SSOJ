package com.ssoj.backend.service;

import com.ssoj.backend.dao.DiscussionMapper;
import com.ssoj.backend.entity.Discussion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DiscussionService {
    @Autowired
    private DiscussionMapper discussionMapper;

    public List<Discussion> getDiscussionsByProblemId(Long problemId) {
        List<Discussion> allDiscussions = discussionMapper.findByProblemId(problemId);
        return buildTree(allDiscussions);
    }

    public List<Discussion> getAllDiscussions(int page, int size, String keyword) {
        int offset = (page - 1) * size;
        List<Discussion> discussions = discussionMapper.findAllPaged(offset, size, keyword);
        // 列表页通常只显示顶层讨论
        return discussions.stream()
                .filter(d -> d.getParentId() == null)
                .toList();
    }

    public Discussion getDiscussionById(Long id) {
        Discussion discussion = discussionMapper.findById(id);
        if (discussion != null) {
            discussion.setReplies(discussionMapper.findByParentId(id));
        }
        return discussion;
    }

    private List<Discussion> buildTree(List<Discussion> discussions) {
        List<Discussion> rootDiscussions = discussions.stream()
                .filter(d -> d.getParentId() == null)
                .toList();

        for (Discussion root : rootDiscussions) {
            root.setReplies(discussions.stream()
                    .filter(d -> root.getId().equals(d.getParentId()))
                    .toList());
        }
        return rootDiscussions;
    }

    public int getTotalDiscussionCount(String keyword) {
        return discussionMapper.countAll(keyword);
    }

    public void addDiscussion(Discussion discussion) {
        discussionMapper.insert(discussion);
    }

    public void deleteDiscussion(Long id) {
        discussionMapper.deleteById(id);
    }
}
