package com.kursaddcinar.hms_backend.service.impl;

import com.kursaddcinar.hms_backend.data.entity.User;
import com.kursaddcinar.hms_backend.data.enums.Role;
import com.kursaddcinar.hms_backend.dto.DtoUserRegister;
import com.kursaddcinar.hms_backend.repository.IUserRepository;
import com.kursaddcinar.hms_backend.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor // Constructor Injection için (Best Practice)
public class UserServiceImpl implements IUserService {

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
}