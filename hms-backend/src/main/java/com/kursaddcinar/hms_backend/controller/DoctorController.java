package com.kursaddcinar.hms_backend.controller;

import com.kursaddcinar.hms_backend.data.entity.Doctor;
import com.kursaddcinar.hms_backend.dto.DtoDoctorCreate;
import com.kursaddcinar.hms_backend.service.IDoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final IDoctorService doctorService;

    // Yeni Doktor Ekleme
    // Normalde sadece ADMIN ekleyebilir: @PreAuthorize("hasAuthority('ADMIN')")
    // Şimdilik test için herkes eklesin diye kapalı tutuyorum.
    @PostMapping("/add")
    public ResponseEntity<Doctor> addDoctor(@RequestBody @Valid DtoDoctorCreate request) {
        return ResponseEntity.ok(doctorService.addDoctor(request));
    }

    // Tüm Doktorları Listeleme (Herkese Açık)
    @GetMapping("/list")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    // Branşa Göre Filtreleme
    @GetMapping("/branch/{branchName}")
    public ResponseEntity<List<Doctor>> getDoctorsByBranch(@PathVariable String branchName) {
        return ResponseEntity.ok(doctorService.getDoctorsByBranch(branchName));
    }
}