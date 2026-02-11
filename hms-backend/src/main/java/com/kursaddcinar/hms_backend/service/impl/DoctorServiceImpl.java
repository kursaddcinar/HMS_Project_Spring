package com.kursaddcinar.hms_backend.service.impl;

import com.kursaddcinar.hms_backend.data.entity.Doctor;
import com.kursaddcinar.hms_backend.data.entity.User;
import com.kursaddcinar.hms_backend.data.enums.Role;
import com.kursaddcinar.hms_backend.dto.DtoDoctorCreate;
import com.kursaddcinar.hms_backend.dto.DtoDoctorList;
import com.kursaddcinar.hms_backend.repository.IDoctorRepository;
import com.kursaddcinar.hms_backend.repository.IUserRepository;
import com.kursaddcinar.hms_backend.service.IDoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements IDoctorService {

    private final IUserRepository userRepository;
    private final IDoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional // Bu işlem atomik olmalı: Ya hepsi, ya hiçbiri.
    public Doctor addDoctor(DtoDoctorCreate input) {

        // 1. Adım: Kullanıcı adı kontrolü
        if (userRepository.existsByUsername(input.getUsername())) {
            throw new RuntimeException("Bu kullanıcı adı zaten mevcut: " + input.getUsername());
        }

        // 2. Adım: Önce User (Kullanıcı) kaydını oluştur
        User newDoctorUser = User.builder()
                .username(input.getUsername())
                .password(passwordEncoder.encode(input.getPassword())) // Şifreyi şifrele
                .firstName(input.getFirstName())
                .lastName(input.getLastName())
                .email(input.getEmail())
                .role(Role.DOCTOR) // Rolünü DOKTOR olarak sabitle
                .isActive(true)
                .build();

        // User'ı kaydet ve ID'sini al
        User savedUser = userRepository.save(newDoctorUser);

        // 3. Adım: Doctor profilini oluştur ve User ID ile bağla
        Doctor newDoctorProfile = Doctor.builder()
                .userId(savedUser.getId()) // İşte ilişki burada kuruluyor (FK mantığı)
                .branch(input.getBranch())
                .title(input.getTitle())
                .diplomaNo(input.getDiplomaNo())
                .biography(input.getBiography())
                .isActive(true)
                .build();

        // 4. Adım: Doktor profilini kaydet
        return doctorRepository.save(newDoctorProfile);
    }

    @Override
    public List<DtoDoctorList> getAllDoctors() {
        List<Doctor> doctors = doctorRepository.findAll();

        return doctors.stream().map(doctor -> {
            // İlişkili User bilgisini çekiyoruz
            User user = userRepository.findById(doctor.getUserId()).orElse(null);

            return DtoDoctorList.builder()
                    .id(doctor.getId())
                    .title(doctor.getTitle().name()) // Enum ise .name()
                    .branch(doctor.getBranch())
                    .firstName(user != null ? user.getFirstName() : "Bilinmiyor") // User boşsa patlamasın
                    .lastName(user != null ? user.getLastName() : "")
                    .availableDays(doctor.getAvailableDays()) // Varsa
                    .build();
        }).collect(Collectors.toList());


        //return doctorRepository.findAll();
    }

    @Override
    public List<Doctor> getDoctorsByBranch(String branch) {
        return doctorRepository.findByBranch(branch);
    }
}