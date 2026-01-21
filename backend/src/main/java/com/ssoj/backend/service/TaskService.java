package com.ssoj.backend.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TaskService {
    private final Map<String, TaskInfo> tasks = new ConcurrentHashMap<>();

    public static class TaskInfo {
        public double progress;
        public String status; // "running", "completed", "error"
        public String message;
        public Object result;

        public TaskInfo(String status, double progress) {
            this.status = status;
            this.progress = progress;
        }
    }

    public void updateProgress(String taskId, double progress, String status, String message) {
        TaskInfo info = tasks.getOrDefault(taskId, new TaskInfo(status, progress));
        info.progress = progress;
        info.status = status;
        info.message = message;
        tasks.put(taskId, info);
    }

    public void completeTask(String taskId, Object result) {
        TaskInfo info = tasks.get(taskId);
        if (info != null) {
            info.status = "completed";
            info.progress = 100.0;
            info.result = result;
        }
    }

    public void failTask(String taskId, String message) {
        TaskInfo info = tasks.get(taskId);
        if (info != null) {
            info.status = "error";
            info.message = message;
        }
    }

    public TaskInfo getTask(String taskId) {
        return tasks.get(taskId);
    }

    public String createTask() {
        String id = java.util.UUID.randomUUID().toString();
        tasks.put(id, new TaskInfo("running", 0.0));
        return id;
    }
}
