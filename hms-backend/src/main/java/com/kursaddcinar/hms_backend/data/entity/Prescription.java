package com.kursaddcinar.hms_backend.data.entity;

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
@Document(collection = "prescriptions")
public class Prescription extends BaseEntity {

    private String appointmentId; // Hangi randevuya istinaden yazıldı?

    private String doctorId; // Kim yazdı?

    private String patientId; // Kime yazıldı?

    private String diagnosis; // Tanı (Örn: Akut Farenjit)

    private List<PrescriptionItem> items; // İlaçlar listesi

    // Inner Class: Reçete Kalemi (İlaç)
    // MongoDB bunu ayrı tablo yapmaz, reçetenin içine JSON array olarak gömer.
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrescriptionItem {
        private String drugName;       // İlaç Adı (Örn: Parol 500mg)
        private String dosage;         // Dozaj (Örn: 2x1)
        private String instruction;    // Kullanım Talimatı (Örn: Tok karnına)
    }
}