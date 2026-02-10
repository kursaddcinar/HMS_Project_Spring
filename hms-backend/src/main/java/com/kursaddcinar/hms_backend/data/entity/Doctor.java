package com.kursaddcinar.hms_backend.data.entity;

import com.kursaddcinar.hms_backend.data.enums.Title;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "doctors")
public class Doctor extends BaseEntity {

    private String userId; // User collection'ındaki ID ile eşleşecek (Foreign Key mantığı)

    private String branch; // Branş (Kardiyoloji, Nöroloji vs.)

    private Title title; // Unvan

    private String diplomaNo;

    private String biography; // Doktor hakkında kısa bilgi (Hastalar için)

    private List<String> availableDays; // Örn: ["PAZARTESI", "CARSAMBA"] - Basit tutalım şimdilik

    private boolean isActive = true;
}