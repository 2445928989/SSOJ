package com.ssoj.backend.service;

import com.ssoj.backend.dao.AnnouncementMapper;
import com.ssoj.backend.entity.Announcement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementMapper announcementMapper;

    public List<Announcement> getAllAnnouncements() {
        return announcementMapper.findAll();
    }

    public Announcement getAnnouncementById(Long id) {
        return announcementMapper.findById(id);
    }

    public void createAnnouncement(Announcement announcement) {
        announcementMapper.insert(announcement);
    }

    public void updateAnnouncement(Announcement announcement) {
        announcementMapper.update(announcement);
    }

    public void deleteAnnouncement(Long id) {
        announcementMapper.deleteById(id);
    }
}
