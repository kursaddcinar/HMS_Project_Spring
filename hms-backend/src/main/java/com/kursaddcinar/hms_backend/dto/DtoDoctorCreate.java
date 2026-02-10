package com.kursaddcinar.hms_backend.dto;

import com.kursaddcinar.hms_backend.data.enums.Title;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoDoctorCreate {

    // --- User Bilgileri ---
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    @NotBlank
    private String email;
    @NotBlank
    private String username;
    @NotBlank
    private String password;

    // --- Doktor Bilgileri ---
    @NotBlank
    private String branch; // Branş

    @NotNull
    private Title title; // Unvan

    private String diplomaNo;
    private String biography;
}