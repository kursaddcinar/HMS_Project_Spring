package com.kursaddcinar.hms_backend.repository;

import com.kursaddcinar.hms_backend.data.entity.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IDoctorRepository extends MongoRepository<Doctor, String> {

    // User ID'sine göre doktor profilini bul
    Optional<Doctor> findByUserId(String userId);

    // Branşa göre doktorları listele (Randevu alırken lazım olacak)
    List<Doctor> findByBranch(String branch);

    // Aktif doktorları listele
    List<Doctor> findByIsActiveTrue();
}