package com.kursaddcinar.hms_backend.controller;

import com.kursaddcinar.hms_backend.data.entity.Appointment;
import com.kursaddcinar.hms_backend.dto.DtoAppointmentCreate;
import com.kursaddcinar.hms_backend.dto.DtoAppointmentResponse;
import com.kursaddcinar.hms_backend.service.IAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final IAppointmentService appointmentService;

    // 1. Doktorun Müsaitlik Oluşturması (Slot Açma)
    // Örn: POST /api/v1/appointments/create-slot
    @PostMapping("/create-slot")
    public ResponseEntity<Appointment> createAppointmentSlot(
            @RequestBody DtoAppointmentCreate request,
            Authentication authentication // Spring Security'den gelen kimlik
    ) {
        return ResponseEntity.ok(appointmentService.createAppointmentSlot(request));
    }

    // 2. Hastanın Randevu Alması
    // Örn: POST /api/v1/appointments/book/65f2a... ?patientId=65f2b...
    // Not: Normalde patientId'yi Token'dan çekeriz ama test kolaylığı için parametre alıyoruz.
    @PostMapping("/book/{appointmentId}")
    public ResponseEntity<Appointment> bookAppointment(
            @PathVariable String appointmentId,
            @RequestParam String patientId
    ) {
        return ResponseEntity.ok(appointmentService.bookAppointment(appointmentId, patientId));
    }

    // 3. Doktorun Randevularını Listele
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByDoctor(@PathVariable String doctorId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctor(doctorId));
    }

    // 4. Hastanın Randevularını Listele
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<DtoAppointmentResponse>> getAppointmentsByPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(patientId));
    }
}