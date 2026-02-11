package com.kursaddcinar.hms_backend.repository;

import com.kursaddcinar.hms_backend.data.entity.Prescription;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IPrescriptionRepository extends MongoRepository<Prescription, String> {

    // Hastanın tüm reçetelerini getir
    List<Prescription> findByPatientId(String patientId);

    // Belirli bir randevuya ait reçeteyi getir
    Prescription findByAppointmentId(String appointmentId);
}