package com.kursaddcinar.hms_backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. CSRF Korumasını kapat (REST API'ler için gereksizdir, çünkü durumsuzdur)
                .csrf(AbstractHttpConfigurer::disable)

                // 2. İstek İzinlerini Ayarla
                .authorizeHttpRequests(auth -> auth
                        // "/api/v1/auth/" ile başlayan her şeye (Register, Login) izin ver
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        // Geri kalan her şey için kimlik doğrulama iste
                        .anyRequest().authenticated()
                )

                // 3. Session Yönetimi (Stateless)
                // Sunucuda session tutmayacağız, her istekte Token (JWT) kontrol edeceğiz.
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}