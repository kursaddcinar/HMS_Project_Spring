package com.kursaddcinar.hms_backend.repository;

import com.kursaddcinar.hms_backend.data.entity.Appointment;
import com.kursaddcinar.hms_backend.data.enums.AppointmentStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IAppointmentRepository extends MongoRepository<Appointment, String> {

    // 1. Doktorun belirli bir statüdeki randevularını bul (Örn: Dr. Ali'nin BOŞ randevuları)
    List<Appointment> findByDoctorIdAndStatus(String doctorId, AppointmentStatus status);

    // 2. Hastanın randevularını bul
    List<Appointment> findByPatientId(String patientId);

    // 3. Çakışma Kontrolü: Aynı doktora, aynı saatte başka kayıt var mı?
    boolean existsByDoctorIdAndAppointmentDateAndStatus(String doctorId, LocalDateTime date, AppointmentStatus status);

    // 4. İptal edilmemiş, aktif randevuyu bul (Tarih ve Doktor kontrolü için)
    Optional<Appointment> findByDoctorIdAndAppointmentDate(String doctorId, LocalDateTime appointmentDate);

    List<Appointment> findByDoctorId(String doctorId);
}