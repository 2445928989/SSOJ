package com.ssoj.backend.controller;

import com.ssoj.backend.entity.User;
import com.ssoj.backend.service.ProblemService;
import com.ssoj.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProblemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProblemService problemService;

    @MockBean
    private UserService userService;

    @Test
    void uploadTestCases_success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "testcases.zip", "application/zip", new byte[] { 1, 2, 3 });

        User admin = new User();
        admin.setId(1L);
        admin.setRole("ADMIN");
        when(userService.getUserById(1L)).thenReturn(admin);

        mockMvc.perform(multipart("/api/problem/1/testcases").file(file)
                .sessionAttr("userId", 1L)
                .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk());

        verify(problemService).uploadTestCases(anyLong(), any());
    }
}
