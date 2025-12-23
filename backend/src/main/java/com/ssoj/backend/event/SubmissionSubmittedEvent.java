package com.ssoj.backend.event;

import org.springframework.context.ApplicationEvent;

/**
 * 提交代码事件（用于解耦 SubmissionService 和 JudgeService）
 */
public class SubmissionSubmittedEvent extends ApplicationEvent {

    private final Long submissionId;

    public SubmissionSubmittedEvent(Object source, Long submissionId) {
        super(source);
        this.submissionId = submissionId;
    }

    public Long getSubmissionId() {
        return submissionId;
    }
}
