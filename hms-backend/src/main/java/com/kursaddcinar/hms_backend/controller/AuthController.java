package com.kursaddcinar.hms_backend.controller;

import com.kursaddcinar.hms_backend.dto.DtoTokenResponse;
import com.kursaddcinar.hms_backend.dto.DtoUserLogin;
import com.kursaddcinar.hms_backend.dto.DtoUserRegister;
import com.kursaddcinar.hms_backend.data.entity.User;
import com.kursaddcinar.hms_backend.service.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth") // Versiyonlama: v1
@RequiredArgsConstructor
public class AuthController {

    private final IUserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody @Valid DtoUserRegister request) {
        // @Valid: DTO içindeki @NotBlank, @Size gibi kuralları kontrol eder.
        // Eğer kurala uymazsa Spring otomatik 400 Bad Request döner.

        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<DtoTokenResponse> login(@RequestBody DtoUserLogin request) {
        return ResponseEntity.ok(userService.login(request));
    }
}