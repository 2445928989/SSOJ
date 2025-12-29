package com.ssoj.backend.service;

import com.ssoj.backend.entity.Tag;
import com.ssoj.backend.dao.TagMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 标签业务逻辑服务
 */
@Service
public class TagService {

    @Autowired
    private TagMapper tagMapper;

    /**
     * 获取所有标签
     */
    public List<Tag> listAllTags() {
        return tagMapper.findAll();
    }

    /**
     * 获取单个标签
     */
    public Tag getTagById(Long id) {
        return tagMapper.findById(id);
    }

    /**
     * 创建标签
     */
    public Tag createTag(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("标签名不能为空");
        }

        // 检查名称是否已存在
        Tag existing = tagMapper.findByName(name);
        if (existing != null) {
            throw new IllegalArgumentException("标签名已存在");
        }

        Tag tag = new Tag();
        tag.setName(name);

        tagMapper.insert(tag);
        return tagMapper.findById(tag.getId());
    }

    /**
     * 删除标签
     */
    public boolean deleteTag(Long id) {
        Tag tag = tagMapper.findById(id);
        if (tag == null) {
            throw new IllegalArgumentException("标签不存在");
        }

        tagMapper.deleteById(id);
        return true;
    }

    /**
     * 更新标签
     */
    public Tag updateTag(Long id, String name) {
        Tag tag = tagMapper.findById(id);
        if (tag == null) {
            throw new IllegalArgumentException("标签不存在");
        }

        if (name != null && !name.trim().isEmpty()) {
            // 检查名称是否被其他标签使用
            Tag existing = tagMapper.findByName(name);
            if (existing != null && !existing.getId().equals(id)) {
                throw new IllegalArgumentException("标签名已存在");
            }
            tag.setName(name);
        }

        tagMapper.update(tag);
        return tagMapper.findById(id);
    }
}
