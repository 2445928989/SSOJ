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
        return discussionMapper.findByProblemId(problemId);
    }

    public List<Discussion> getAllDiscussions(int page, int size, String keyword) {
        int offset = (page - 1) * size;
        return discussionMapper.findAllPaged(offset, size, keyword);
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
