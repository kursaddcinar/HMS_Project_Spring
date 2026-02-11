package com.kursaddcinar.hms_backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoAppointmentCreate {

    @NotNull
    private String doctorId; // Hangi doktor için saat açılıyor?

    @NotNull
    private LocalDateTime appointmentDate; // Hangi saat?

    @NotNull
    private String patientId;
}