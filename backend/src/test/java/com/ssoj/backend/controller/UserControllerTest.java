package com.ssoj.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssoj.backend.entity.User;
import com.ssoj.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testRegister_Success() throws Exception {
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");

        when(userService.register(anyString(), anyString(), anyString())).thenReturn(mockUser);

        Map<String, String> request = new HashMap<>();
        request.put("username", "testuser");
        request.put("password", "password123");
        request.put("email", "test@example.com");

        mockMvc.perform(post("/api/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.user.username").value("testuser"));
    }

    @Test
    void testLogin_Success() throws Exception {
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");

        when(userService.login(anyString(), anyString())).thenReturn(mockUser);

        Map<String, String> request = new HashMap<>();
        request.put("username", "testuser");
        request.put("password", "password123");

        mockMvc.perform(post("/api/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.user.username").value("testuser"));
    }

    @Test
    void testProfile_RequiresLogin() throws Exception {
        mockMvc.perform(post("/api/user/profile"))
                .andExpect(status().is5xxServerError());
    }
}
