package com.kursaddcinar.hms_backend.service;

import com.kursaddcinar.hms_backend.data.entity.Doctor;
import com.kursaddcinar.hms_backend.dto.DtoDoctorCreate;

import java.util.List;

public interface IDoctorService {

    // Yeni doktor ekleme (Hem User hem Doctor tablosuna yazar)
    Doctor addDoctor(DtoDoctorCreate input);

    // Tüm doktorları listeleme
    List<Doctor> getAllDoctors();

    // Branşa göre doktor getirme
    List<Doctor> getDoctorsByBranch(String branch);
}