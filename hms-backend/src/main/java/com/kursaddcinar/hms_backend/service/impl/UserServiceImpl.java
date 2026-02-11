package com.kursaddcinar.hms_backend.service.impl;

import com.kursaddcinar.hms_backend.data.entity.User;
import com.kursaddcinar.hms_backend.data.enums.Role;
import com.kursaddcinar.hms_backend.dto.DtoTokenResponse;
import com.kursaddcinar.hms_backend.dto.DtoUserLogin;
import com.kursaddcinar.hms_backend.dto.DtoUserRegister;
import com.kursaddcinar.hms_backend.repository.IUserRepository;
import com.kursaddcinar.hms_backend.security.JwtService;
import com.kursaddcinar.hms_backend.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor // Constructor Injection için (Best Practice)
public class UserServiceImpl implements IUserService {

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public User register(DtoUserRegister registerDto) {
        // 1. Validasyon: Kullanıcı adı daha önce alınmış mı?
        if (userRepository.existsByUsername(registerDto.getUsername())) {
            throw new RuntimeException("Bu kullanıcı adı zaten kullanılıyor: " + registerDto.getUsername());
        }

        // 2. Mapping: DTO -> Entity Dönüşümü (Builder Pattern)
        User newUser = User.builder()
                .username(registerDto.getUsername())
                .password(passwordEncoder.encode(registerDto.getPassword())) // Şifreyi hashle
                .firstName(registerDto.getFirstName())
                .lastName(registerDto.getLastName())
                .email(registerDto.getEmail())
                .role(Role.PATIENT) // Varsayılan olarak her kayıt olana HASTA rolü verelim.
                .isActive(true)
                .build();

        // 3. Kayıt: Veritabanına yaz
        return userRepository.save(newUser);
    }

    @Override
    public DtoTokenResponse login(DtoUserLogin loginDto) {
        // Spring Security'nin AuthenticationManager'ını kullanarak kimlik doğrula
        // Eğer şifre yanlışsa bu satır otomatik hata fırlatır (BadCredentialsException)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDto.getUsername(),
                        loginDto.getPassword()
                )
        );

        // Kullanıcıyı veritabanından bul (Zaten doğrulandı, var olduğunu biliyoruz)
        var user = userRepository.findByUsername(loginDto.getUsername())
                .orElseThrow();

        String role = user.getRole().name();

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole()); // Örn: "role": "DOCTOR"
        extraClaims.put("userId", user.getId()); // ID'yi de eklemek pratik olur.
        extraClaims.put("role", role);

        // Token üret
        var jwtToken = jwtService.generateToken(extraClaims, user);

        // Token'ı geri dön
        return DtoTokenResponse.builder()
                .token(jwtToken)
                .build();
    }
}