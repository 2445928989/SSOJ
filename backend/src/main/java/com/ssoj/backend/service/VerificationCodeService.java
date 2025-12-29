package com.ssoj.backend.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;

@Service
public class VerificationCodeService {

    private static class CodeInfo {
        String code;
        long expireTime;

        CodeInfo(String code, long expireTime) {
            this.code = code;
            this.expireTime = expireTime;
        }
    }

    // key: email, value: CodeInfo
    private final ConcurrentHashMap<String, CodeInfo> codeMap = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public String generateCode(String email) {
        String code = String.format("%06d", random.nextInt(1000000));
        // 5 minutes expiry
        long expireTime = System.currentTimeMillis() + 5 * 60 * 1000;
        codeMap.put(email, new CodeInfo(code, expireTime));
        return code;
    }

    public boolean verifyCode(String email, String code) {
        CodeInfo info = codeMap.get(email);
        if (info == null)
            return false;
        if (System.currentTimeMillis() > info.expireTime) {
            codeMap.remove(email);
            return false;
        }
        boolean match = info.code.equals(code);
        if (match) {
            codeMap.remove(email);
        }
        return match;
    }
}
