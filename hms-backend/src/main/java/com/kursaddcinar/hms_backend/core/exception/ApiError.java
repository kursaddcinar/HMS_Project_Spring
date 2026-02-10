package com.kursaddcinar.hms_backend.core.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiError {
    private int status;       // HTTP Durum Kodu (400, 404, 500 vs.)
    private String error;     // Hata Adı
    private String message;   // Kullanıcıya gösterilecek mesaj
    private String path;      // Hatanın oluştuğu URL
    private LocalDateTime timestamp; // Ne zaman oldu?
}