package com.kursaddcinar.hms_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DtoAppointmentResponse {
    private String id;
    private LocalDateTime appointmentDate;
    private String status; // AVAILABLE, BOOKED, COMPLETED

    // Zenginleştirilmiş Veriler
    private String doctorId;
    private String doctorFullName; // Unvan + Ad + Soyad
    private String doctorBranch;
}