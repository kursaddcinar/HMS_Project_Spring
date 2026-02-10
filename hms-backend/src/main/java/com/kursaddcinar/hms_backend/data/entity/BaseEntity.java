package com.kursaddcinar.hms_backend.data.entity;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import java.time.LocalDateTime;

@Data
public abstract class BaseEntity {

    @Id // MongoDB'nin birincil anahtarı (Primary Key).
    private String id;

    @CreatedDate // Kayıt atıldığında otomatik tarih basar.
    private LocalDateTime createdDate;

    @LastModifiedDate // Güncelleme yapıldığında tarihi günceller.
    private LocalDateTime lastModifiedDate;
}