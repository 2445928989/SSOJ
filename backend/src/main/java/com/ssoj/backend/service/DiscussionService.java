package com.ssoj.backend.service;

import com.ssoj.backend.dao.DiscussionMapper;
import com.ssoj.backend.entity.Discussion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DiscussionService {
    @Autowired
    private DiscussionMapper discussionMapper;

    public List<Discussion> getDiscussionsByProblemId(Long problemId) {
        List<Discussion> allDiscussions = discussionMapper.findByProblemId(problemId);
        return buildTwoLevelTree(allDiscussions);
    }

    public List<Discussion> getAllDiscussions(int page, int size, String keyword) {
        int offset = (page - 1) * size;
        return discussionMapper.findAllPaged(offset, size, keyword);
    }

    public Discussion getDiscussionById(Long id) {
        Discussion discussion = discussionMapper.findById(id);
        if (discussion != null) {
            List<Discussion> descendants = discussionMapper.findDescendants(id);
            discussion.setReplies(descendants);
            discussion.setRepliesCount(descendants.size());
        }
        return discussion;
    }

    private List<Discussion> buildTwoLevelTree(List<Discussion> discussions) {
        Map<Long, Discussion> map = discussions.stream()
                .collect(Collectors.toMap(Discussion::getId, d -> d));
        List<Discussion> roots = new ArrayList<>();

        // 首先找出所有根节点
        for (Discussion d : discussions) {
            if (d.getParentId() == null) {
                d.setReplies(new ArrayList<>());
                d.setRepliesCount(0);
                roots.add(d);
            }
        }

        // 将所有非根节点归类到其所属的根节点下
        for (Discussion d : discussions) {
            if (d.getParentId() != null) {
                Discussion root = findRoot(d, map);
                if (root != null) {
                    if (root.getReplies() == null) {
                        root.setReplies(new ArrayList<>());
                    }
                    root.getReplies().add(d);
                    root.setRepliesCount(root.getRepliesCount() + 1);
                }
            }
        }

        // 对每个根讨论的回复列表按时间正序排序
        for (Discussion root : roots) {
            if (root.getReplies() != null && !root.getReplies().isEmpty()) {
                root.getReplies().sort((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()));
            }
        }
        return roots;
    }

    private Discussion findRoot(Discussion d, Map<Long, Discussion> map) {
        Discussion current = d;
        int depth = 0;
        while (current.getParentId() != null && depth < 100) {
            current = map.get(current.getParentId());
            if (current == null)
                return null;
            depth++;
        }
        return current;
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
