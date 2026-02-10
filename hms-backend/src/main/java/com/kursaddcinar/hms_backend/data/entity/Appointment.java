package com.kursaddcinar.hms_backend.data.entity;

import com.kursaddcinar.hms_backend.data.enums.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "appointments")
public class Appointment extends BaseEntity {

    private String doctorId; // Hangi doktor? (Doctor tablosundaki ID)

    private String patientId; // Hangi hasta? (User tablosundaki ID) - Eğer boşsa henüz alınmamış demektir.

    private LocalDateTime appointmentDate; // Randevu zamanı (Örn: 2025-10-20 14:30)

    private AppointmentStatus status; // Müsait mi, dolu mu?
}