package com.kursaddcinar.hms_backend.data.enums;

public enum AppointmentStatus {
    AVAILABLE,  // Doktor müsait, randevuya açık
    BOOKED,     // Hasta tarafından alındı
    CANCELLED,  // İptal edildi
    COMPLETED   // Muayene tamamlandı
}